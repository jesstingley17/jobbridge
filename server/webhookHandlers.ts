import { getStripeSync, getUncachableStripeClient } from './stripeClient.js';
import { storage } from './storage.js';
import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const PRODUCT_TIER_MAP: Record<string, string> = {
  'prod_TZWVJrD6jxxm6x': 'free',
  'prod_TZWVzbNABVbfkU': 'pro',
  'prod_TZWVKJGKPIDFVE': 'enterprise',
};

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);

    const stripe = getUncachableStripeClient();
    const event = JSON.parse(payload.toString());

    console.log(`Processing Stripe event: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await WebhookHandlers.handleSubscriptionChange(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await WebhookHandlers.handleSubscriptionDeleted(event.data.object);
          break;

        case 'checkout.session.completed':
          await WebhookHandlers.handleCheckoutCompleted(event.data.object);
          break;
      }
    } catch (error) {
      console.error(`Error handling event ${event.type}:`, error);
    }
  }

  static async handleSubscriptionChange(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    console.log(`Subscription ${subscriptionId} for customer ${customerId}: status=${status}`);

    if (status !== 'active' && status !== 'trialing') {
      console.log(`Subscription not active, skipping tier update`);
      return;
    }

    const productId = subscription.items?.data?.[0]?.price?.product;
    if (!productId) {
      console.log('No product ID found in subscription');
      return;
    }

    const tier = PRODUCT_TIER_MAP[productId] || 'free';
    console.log(`Mapping product ${productId} to tier: ${tier}`);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));

    if (user) {
      await db
        .update(users)
        .set({ 
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: tier,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      console.log(`Updated user ${user.id} to tier: ${tier}`);
    } else {
      console.log(`No user found with stripeCustomerId: ${customerId}`);
    }
  }

  static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;

    console.log(`Subscription ${subscriptionId} deleted for customer ${customerId}`);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));

    if (user) {
      await db
        .update(users)
        .set({ 
          stripeSubscriptionId: null,
          subscriptionTier: 'free',
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      console.log(`Reset user ${user.id} to free tier`);
    }
  }

  static async handleCheckoutCompleted(session: any): Promise<void> {
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (!subscriptionId) {
      console.log('Checkout completed but no subscription ID');
      return;
    }

    console.log(`Checkout completed: customer=${customerId}, subscription=${subscriptionId}`);

    const stripe = getUncachableStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await WebhookHandlers.handleSubscriptionChange(subscription);
  }
}
