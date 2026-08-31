"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
});

// Map your plan keys to Stripe Price IDs (set these as env vars in the
// Convex dashboard: Settings -> Environment Variables).
const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  // business: process.env.STRIPE_PRICE_BUSINESS!, // wire up when that tier launches
};

/**
 * Creates a Stripe Checkout session for a subscription and returns the
 * URL to redirect the user to.
 */
export const createCheckoutSession = action({
  args: {
    planKey: v.string(), // "pro" | "business"
    email: v.string(),
  },
  handler: async (ctx, { planKey, email }) => {
    const priceId = PRICE_IDS[planKey];
    if (!priceId) {
      throw new Error(`No Stripe price configured for plan "${planKey}"`);
    }

    const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=canceled`,
      // lets the webhook find/attach the right user even before the
      // Stripe customer record is linked in our DB
      metadata: { email, planKey },
      subscription_data: {
        metadata: { email, planKey },
      },
    });

    return { url: session.url };
  },
});

/**
 * Sends an existing customer to the Stripe-hosted billing portal so they
 * can update payment method, cancel, or view invoices.
 */
export const createPortalSession = action({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/pricing`,
    });

    return { url: session.url };
  },
});
