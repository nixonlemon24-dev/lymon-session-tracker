import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
      plan:         v.optional(v.string()), // "free" | "pro" | "business"
      planStatus:        v.optional(v.string()), // "active" | "trialing" | "past_due" | "canceled"
      stripeCustomerId:  v.optional(v.string()),
  }).index("by_email", ["email"])
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
    createdAt:     v.number(),       // Current Date
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
