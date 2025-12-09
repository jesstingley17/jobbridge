import Stripe from 'stripe';

function getCredentials() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY environment variables are required');
  }

  return {
    publishableKey,
    secretKey,
  };
}

export function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2025-11-17.clover',
  });
}

export function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
