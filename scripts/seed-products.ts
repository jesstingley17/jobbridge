import { getUncachableStripeClient } from '../server/stripeClient';

async function createSubscriptionProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating subscription products in Stripe...');

  // Check if products already exist
  const existingProducts = await stripe.products.search({ query: "name:'Job Bridge'" });
  if (existingProducts.data.length > 0) {
    console.log('Products already exist in Stripe. Skipping creation.');
    return;
  }

  // Free Tier - Basic access
  const freeProduct = await stripe.products.create({
    name: 'Job Bridge Free',
    description: 'Basic access to job searching and profile creation',
    metadata: {
      tier: 'free',
      features: JSON.stringify([
        'Basic job search',
        'Profile creation',
        'Up to 5 job applications per month',
        'Career DNA assessment'
      ])
    }
  });

  const freePrice = await stripe.prices.create({
    product: freeProduct.id,
    unit_amount: 0,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'free' }
  });

  console.log('Created Free tier:', freeProduct.id, freePrice.id);

  // Pro Tier - Enhanced features
  const proProduct = await stripe.products.create({
    name: 'Job Bridge Pro',
    description: 'Enhanced job search with AI-powered tools and unlimited applications',
    metadata: {
      tier: 'pro',
      features: JSON.stringify([
        'Everything in Free',
        'Unlimited job applications',
        'AI resume builder',
        'AI cover letter generator',
        'Interview practice with AI feedback',
        'Priority support'
      ])
    }
  });

  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1999, // $19.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'pro', billing: 'monthly' }
  });

  const proYearly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 19900, // $199/year (save ~17%)
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { tier: 'pro', billing: 'yearly' }
  });

  console.log('Created Pro tier:', proProduct.id, proMonthly.id, proYearly.id);

  // Enterprise Tier - Full access with premium support
  const enterpriseProduct = await stripe.products.create({
    name: 'Job Bridge Enterprise',
    description: 'Complete access for organizations with dedicated support and team features',
    metadata: {
      tier: 'enterprise',
      features: JSON.stringify([
        'Everything in Pro',
        'Dedicated account manager',
        'Custom accessibility accommodations',
        'Team collaboration tools',
        'Analytics dashboard',
        'API access',
        'White-glove onboarding'
      ])
    }
  });

  const enterpriseMonthly = await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 4999, // $49.99/month
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { tier: 'enterprise', billing: 'monthly' }
  });

  const enterpriseYearly = await stripe.prices.create({
    product: enterpriseProduct.id,
    unit_amount: 49900, // $499/year (save ~17%)
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { tier: 'enterprise', billing: 'yearly' }
  });

  console.log('Created Enterprise tier:', enterpriseProduct.id, enterpriseMonthly.id, enterpriseYearly.id);

  console.log('All subscription products created successfully!');
}

createSubscriptionProducts().catch(console.error);
