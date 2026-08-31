import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import Stripe from "stripe";

const http = httpRouter();
auth.addHttpRoutes(http);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
});

// Reverse map of Stripe Price ID -> your internal plan key.
// Keep this in sync with convex/stripe.ts's PRICE_IDS.
function planKeyForPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return "free";
}

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed", err);
      return new Response("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.metadata?.email;
        const stripeCustomerId = session.customer as string;

        if (email) {
          const user = await ctx.runQuery(
            internal.stripeHelpers.getUserByEmailInternal,
            { email }
          );
          if (user) {
            await ctx.runMutation(internal.stripeHelpers.attachStripeCustomerId, {
              userId: user._id,
              stripeCustomerId,
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeCustomerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price.id ?? "";
        const planKey = planKeyForPriceId(priceId);

        let user = await ctx.runQuery(
          internal.stripeHelpers.getUserByStripeCustomerId,
          { stripeCustomerId }
        );

        // Fallback: this event can arrive before checkout.session.completed
        // has attached stripeCustomerId to the user. Use the email we
        // stashed in subscription_data.metadata (see convex/stripe.ts) to
        // find the user instead, then attach the customer ID now.
        if (!user) {
          const email = sub.metadata?.email;
          if (email) {
            user = await ctx.runQuery(
              internal.stripeHelpers.getUserByEmailInternal,
              { email }
            );
            if (user) {
              await ctx.runMutation(internal.stripeHelpers.attachStripeCustomerId, {
                userId: user._id,
                stripeCustomerId,
              });
            }
          }
        }

        if (user) {
          // Newer Stripe API versions moved current_period_end off the
          // subscription object and onto each subscription item instead.
          const currentPeriodEnd =
            sub.items.data[0]?.current_period_end ??
            Math.floor(Date.now() / 1000);

          await ctx.runMutation(internal.stripeHelpers.upsertSubscription, {
            userId: user._id,
            stripeCustomerId,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            status: sub.status,
            currentPeriodEnd,
          });

          const isActive = sub.status === "active" || sub.status === "trialing";
          await ctx.runMutation(internal.stripeHelpers.setUserPlan, {
            userId: user._id,
            plan: isActive ? planKey : "free",
            planStatus: sub.status,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeCustomerId = sub.customer as string;

        const user = await ctx.runQuery(
          internal.stripeHelpers.getUserByStripeCustomerId,
          { stripeCustomerId }
        );

        if (user) {
          await ctx.runMutation(internal.stripeHelpers.setUserPlan, {
            userId: user._id,
            plan: "free",
            planStatus: "canceled",
          });
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
