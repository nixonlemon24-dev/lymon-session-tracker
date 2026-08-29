import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

// export const newPackage = mutation({
//   args: {
//     userEmail:   v.string(),
//     packageName: v.string(),
//     price:       v.number(),
//     type:        v.string(),
//     sessions:    v.number(), // duration value OR session count, depending on type
//   },
//   handler: async (ctx, args) => {
//     const sessionExpiry = computeExpiryDate(args.type, args.sessions);

//     const id = await ctx.db.insert("packages", {
//       ...args,
//       sessionExpiry, // "" for Session-based, a real date for Monthly/Yearly
//       createdAt: Date.now(),
//     });
//     return id;
//   },
// });

export const newPackage = mutation({
  args: {
    userEmail:   v.string(),
    packageName: v.string(),
    price:       v.number(),
    type:        v.string(),
    sessions:    v.number(),
    sessionExpiry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
  const id = await ctx.db.insert("packages", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getPackages = query({
  args: { userEmail: v.string() },
  handler: async (ctx, { userEmail }) => {
    return await ctx.db
      .query("packages")
      .filter(q => q.eq(q.field("userEmail"), userEmail))
      .order("desc")
      .collect();
  },
});

export const updatePackage = mutation({
  args: {
    id:          v.id("packages"),
    packageName: v.string(),
    price:       v.number(),
    type:        v.string(),
    sessions:    v.number(),
    sessionExpiry: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await ctx.db.patch(id, { ...rest });
  },
});


export const getMembersByPackage = query({
  args: { packageName: v.string(), userEmail: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    return members.filter(m => m.package === args.packageName).length;
  },
});


export const deletePackage = mutation({
  args: { id: v.id("packages"), userEmail: v.string() },
  handler: async (ctx, args) => {
    const pkg = await ctx.db.get(args.id);
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    const inUse = members.some(m => m.package === pkg?.packageName);
    if (inUse) throw new Error("Cannot delete — this package is assigned to active members.");

    await ctx.db.delete(args.id);
  },
});

// function computeExpiryDate(type: string, value: number): string {
//   const today = new Date();

//   if (type === "Monthly (days)") {
//     today.setMonth(today.getMonth() + value);
//   } else if (type === "Yearly (months)") {
//     today.setFullYear(today.getFullYear() + value);
//   } else {
//     // Session-based — no calendar expiry, sessions run out based on usage
//     return "";
//   }

//   return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
// }


// export const removeSessionExpiryField = internalMutation({
//   handler: async (ctx) => {
//     const packages = await ctx.db.query("packages").collect();
//     for (const pkg of packages) {
//       if ("sessionExpiry" in pkg) {
//         await ctx.db.patch(pkg._id, { sessionExpiry: undefined });
//       }
//     }
//   },
// });