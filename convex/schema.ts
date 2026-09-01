import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";


export default defineSchema({
  // Pulls in the tables Convex Auth manages internally: authAccounts
  // (links a Google/OAuth account to a user, incl. the
  // providerAndAccountId index), authSessions, authRefreshTokens,
  // authVerificationCodes, authVerifiers, authRateLimits.
  // We override its default "users" table below with our own, richer one.
  ...authTables,

  users: defineTable({
    email: v.string(),
    // Optional now: Google-authenticated users won't have a password.
    passwordHash: v.optional(v.string()),
    createdAt:  v.optional(v.number()),
      plan:         v.optional(v.string()), // "free" | "pro" | "business"
      planStatus:        v.optional(v.string()), // "active" | "trialing" | "past_due" | "canceled"
      stripeCustomerId:  v.optional(v.string()),

   // Fields Convex Auth's OAuth flow (Google) populates itself
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

  }).index("email", ["email"]) //.index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),
    passwordResets: defineTable({
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
  }).index("by_email", ["email"]),
    members: defineTable({
    userEmail:     v.string(),
    firstName:     v.string(),
    lastName:      v.string(),
    phone:         v.string(),
    email:         v.optional(v.string()),
    package:       v.string(),       // "Monthly" | "15 Sessions" | "5 Sessions"
    price:         v.number(),
    startDate:     v.string(),
    status:        v.string(),       // "active" | "expiring" | "expired"
    sessionsLeft: v.number(),
    createdAt:    v.number(),     // Current Date
    endDate:      v.optional(v.string()), 
     gymId:        v.optional(v.string()), 
     lastCheckIn: v.optional(v.string()),
  }),
  sessions: defineTable({
  token:     v.string(),
  userId:    v.id("users"),
  email:     v.string(),
  expiresAt: v.number(),
}).index("by_token", ["token"]),
packages: defineTable({
  userEmail:   v.string(),
  packageName: v.string(),
  price:       v.number(),
  type:        v.string(),
  sessions:    v.number(),
  createdAt:   v.number(),
  sessionExpiry: v.optional(v.string()),
}),
subscriptions: defineTable({
  userId:                v.id("users"),
  stripeCustomerId:      v.string(),
  stripeSubscriptionId:  v.string(),
  stripePriceId:         v.string(),
  status:                v.string(), // mirrors Stripe's subscription.status
  currentPeriodEnd:      v.number(), // unix seconds
}).index("by_userId", ["userId"])
  .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),
});
