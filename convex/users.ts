import {  action, mutation, query  } from "./_generated/server";
import { api } from "./_generated/api"; // ← add this
import { v } from "convex/values";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAccount = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { email, passwordHash }) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      email,
      passwordHash,
      createdAt: Date.now(),
    });

    return { userId };
  },
});


export const loginUser = mutation({
  args: {
    email:        v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { email, passwordHash }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) throw new Error("No account found with this email");
    if (user.passwordHash !== passwordHash) throw new Error("Invalid email or password.");

    // Generate a session token
    const token     = uuidv4();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      token,
      userId:    user._id,
      email:     user.email,
      expiresAt,
    });

    return { token, email: user.email };
  },
});

export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;

    return { email: session.email, userId: session.userId };
  },
});

export const deleteSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Check if user exists
    const user = await ctx.runQuery(api.users.getUserByEmail, { email });
    if (!user) throw new Error("No account found with this email");

    const otp = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save OTP to DB
    await ctx.runMutation(api.users.saveResetOTP, { email, otp, expiresAt });

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Session Tracker <no-reply@yourdomain.com>",
      to: email,
      subject: "Your password reset code",
      html: `
        <h2>Password Reset</h2>
        <p>Your reset code is:</p>
        <h1 style="letter-spacing: 8px">${otp}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return { sent: true };
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

export const saveResetOTP = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, otp, expiresAt }) => {
    // Remove any existing OTP for this email
    const existing = await ctx.db
      .query("passwordResets")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) await ctx.db.delete(existing._id);

    await ctx.db.insert("passwordResets", { email, otp, expiresAt });
  },
});

export const verifyOTPAndReset = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, { email, otp, newPasswordHash }) => {
    const record = await ctx.db
      .query("passwordResets")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!record) throw new Error("No reset request found. Please try again.");
    if (record.otp !== otp) throw new Error("Invalid code. Please check and try again.");
    if (Date.now() > record.expiresAt) throw new Error("Code expired. Please request a new one.");

    // Update password
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(user._id, { passwordHash: newPasswordHash });
    await ctx.db.delete(record._id);

    return { success: true };
  },
});


export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});