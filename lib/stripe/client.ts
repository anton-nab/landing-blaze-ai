import Stripe from "stripe";

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquant — ajoutez-le dans .env.local");
  }
  if (!cachedClient) cachedClient = new Stripe(key);
  return cachedClient;
}
