export type BillingPlan = "pro" | "agency";
export type BillingInterval = "monthly" | "annual";

const PRICE_ENV_MAP: Record<BillingPlan, Record<BillingInterval, string | undefined>> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
  },
  agency: {
    monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
    annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
  },
};

export function getPriceId(plan: BillingPlan, interval: BillingInterval): string {
  const id = PRICE_ENV_MAP[plan][interval];
  if (!id) {
    throw new Error(`Stripe price ID manquant pour ${plan}/${interval} — vérifiez .env.local`);
  }
  return id;
}

/** Reverse lookup used by the webhook to turn a Stripe price ID back into our plan name. */
export function planFromPriceId(priceId: string): BillingPlan | null {
  for (const plan of Object.keys(PRICE_ENV_MAP) as BillingPlan[]) {
    for (const interval of Object.keys(PRICE_ENV_MAP[plan]) as BillingInterval[]) {
      if (PRICE_ENV_MAP[plan][interval] === priceId) return plan;
    }
  }
  return null;
}
