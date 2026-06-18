import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
      plan:         v.optional(v.string()), // "free" | "pro" | "business"
  }).index("by_email", ["email"]),
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
}),
});

