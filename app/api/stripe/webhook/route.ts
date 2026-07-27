import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { planFromPriceId } from "@/lib/stripe/plans";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getPosthogServerClient } from "@/lib/posthog/server";

function customerIdOf(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature invalide", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    console.error("[stripe/webhook] Supabase non configuré — événement ignoré", event.type);
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = customerIdOf(session.customer);
      if (userId && customerId) {
        const { error } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
        if (error) console.error("[stripe/webhook] échec liaison stripe_customer_id", error);
      }
      if (userId) {
        // client_reference_id is the Supabase user id — same id posthog-js used for
        // identify() client-side, so this event joins the same funnel person.
        getPosthogServerClient()?.capture({
          distinctId: userId,
          event: "payment_completed",
          properties: { amount_total: session.amount_total, currency: session.currency },
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceId ? planFromPriceId(priceId) : null;
      const customerId = customerIdOf(subscription.customer);

      if (plan && customerId && (subscription.status === "active" || subscription.status === "trialing")) {
        const { error } = await supabase.from("profiles").update({ plan }).eq("stripe_customer_id", customerId);
        if (error) console.error("[stripe/webhook] échec mise à jour plan", error);
      } else if (customerId && ["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
        const { error } = await supabase.from("profiles").update({ plan: "free" }).eq("stripe_customer_id", customerId);
        if (error) console.error("[stripe/webhook] échec downgrade plan", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = customerIdOf(subscription.customer);
      if (customerId) {
        const { error } = await supabase.from("profiles").update({ plan: "free" }).eq("stripe_customer_id", customerId);
        if (error) console.error("[stripe/webhook] échec downgrade à l'annulation", error);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
