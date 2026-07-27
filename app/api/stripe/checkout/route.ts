import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getStripeClient } from "@/lib/stripe/client";
import { getPriceId, type BillingPlan, type BillingInterval } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server-client";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connectez-vous avant de choisir un plan." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const plan = body?.plan as BillingPlan | undefined;
  const interval = (body?.interval as BillingInterval | undefined) ?? "annual";

  if (plan !== "pro" && plan !== "agency") {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId = getPriceId(plan, interval);
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "La configuration des paiements n'est pas encore prête. Réessayez plus tard." },
      { status: 500 },
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/#pricing`,
    });

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "checkout_started",
      properties: {
        plan,
        interval,
        price_id: priceId,
      },
    });
    await posthog.flush();

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] Stripe error", err);
    return NextResponse.json({ error: "Impossible de démarrer le paiement. Réessayez." }, { status: 502 });
  }
}
