import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const newPackage = mutation({
  args: {
    userEmail:   v.string(),
    packageName: v.string(),
    price:       v.number(),
    type:        v.string(),
    sessions:    v.number(),
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