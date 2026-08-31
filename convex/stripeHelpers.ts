import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * MERGE NOTE: if you already have a convex/users.ts with getUserByEmail
 * etc., feel free to move these functions in there instead. Keeping them
 * separate here just so nothing you already wrote gets overwritten.
 */

export const getUserByStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripeCustomerId", (q) =>
        q.eq("stripeCustomerId", stripeCustomerId)
      )
      .unique();
  },
});

export const getUserByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const attachStripeCustomerId = internalMutation({
  args: { userId: v.id("users"), stripeCustomerId: v.string() },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    await ctx.db.patch(userId, { stripeCustomerId });
  },
});

export const setUserPlan = internalMutation({
  args: {
    userId: v.id("users"),
    plan: v.string(),
    planStatus: v.string(),
  },
  handler: async (ctx, { userId, plan, planStatus }) => {
    await ctx.db.patch(userId, { plan, planStatus });
  },
});

export const upsertSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("subscriptions", args);
    }
  },
});
