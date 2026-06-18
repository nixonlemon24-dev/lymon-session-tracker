import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";


export const addMember = mutation({
  args: {
    firstName:    v.string(),
    lastName:     v.string(),
    phone:        v.string(),
    email:        v.optional(v.string()),
    startDate:    v.string(),
    package:      v.string(),
    price:        v.float64(),
    userEmail:    v.string(),
    sessionsLeft: v.float64(),
    plan:         v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // auto-increment gymId per coach
    const existing = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();
    const gymId = `#GYM-${String(existing.length + 1).padStart(4, "0")}`;


    
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.userEmail))
      .first();

    const isPro = user?.plan === "pro" || user?.plan === "business";

    if (!isPro) {
      const existing = await ctx.db
        .query("members")
        .filter(q => q.eq(q.field("userEmail"), args.userEmail))
        .collect();

      if (existing.length >= 10) {
        throw new Error("Free plan limit reached. Upgrade to Pro to add more members.");
      }
    }

    const packageDoc = await ctx.db
      .query("packages")
      .filter(q => q.eq(q.field("packageName"), args.package))
      .first();

    const endDate = packageDoc?.type === "Monthly (days)"
      ? (() => {
          const d = new Date(args.startDate);
          const day = d.getDate();
          d.setMonth(d.getMonth() + (packageDoc.sessions ?? 1));
          // if day overflowed (e.g. May 31 → July 1), snap back to last day of intended month
          if (d.getDate() !== day) {
            d.setDate(0); // 0 = last day of previous month
          }
          return d.toISOString().split("T")[0];
        })()

      : packageDoc?.type === "Yearly (months)"
      ? (() => {
          const d = new Date(args.startDate);
          const day = d.getDate();
          d.setFullYear(d.getFullYear() + (packageDoc.sessions ?? 1));
          if (d.getDate() !== day) {
            d.setDate(0);
          }
          return d.toISOString().split("T")[0];
        })()
      : undefined;

      const sessionsLeft = packageDoc?.type === "Session-based" ? (packageDoc.sessions ?? args.sessionsLeft)
      : (() => {
          if (!endDate) return 0;
          const start = new Date(args.startDate); // ✅ use startDate instead of today
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          const diffMs = end.getTime() - start.getTime();
          return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        })();


    await ctx.db.insert("members", {
      ...args,
      gymId,
      sessionsLeft,
      status:    "active",
      createdAt: Date.now(),
      endDate,
    });
  },
});

export const getMembers = query({
  args: { userEmail: v.string() },
  handler: async (ctx, { userEmail }) => {
    return await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), userEmail))
      .order("desc")
      .collect();
  },
});


export const checkInMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, { id }) => {
    const member = await ctx.db.get(id);
    if (!member) throw new Error("Member not found.");
    if (member.sessionsLeft <= 0) throw new Error("No sessions left.");

    const today = new Date().toISOString().split("T")[0];

    await ctx.db.patch(id, {
      sessionsLeft: member.sessionsLeft - 1,
      lastCheckIn:  today,
      status: member.sessionsLeft - 1 <= 0 ? "expired" :
              member.sessionsLeft - 1 <= 3 ? "expiring" : "active",
    });
  },
});

export const undoCheckIn = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, { id }) => {
    const member = await ctx.db.get(id);
    if (!member) throw new Error("Member not found.");

    await ctx.db.patch(id, {
      sessionsLeft: member.sessionsLeft + 1,
      lastCheckIn:  undefined,
      status: "active",
    });
  },
});

// Runs daily — decrements sessionsLeft by 1 for all active members
export const decrementDailySessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.gt(q.field("sessionsLeft"), 0))
      .collect();

    await Promise.all(
      members.map(member =>
        ctx.db.patch(member._id, {
          sessionsLeft: member.sessionsLeft - 1,
        })
      )
    );
  },
});

//Total Members
export const getMemberCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    return members.length;
  },
});

export const getMonthlyRevenue = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    const total = members
      .filter(m => m.createdAt >= startOfMonth)
      .reduce((sum, m) => sum + (m.price ?? 0), 0);

    return total;
  },
});

export const getExpiringSoonCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);
    const todayStr   = today.toISOString().split("T")[0];
    const in7DaysStr = in7Days.toISOString().split("T")[0];

    return members.filter(m => {
      // session-based: 5 or fewer sessions left
      if (!m.endDate && m.sessionsLeft > 0 && m.sessionsLeft <= 5) return true;
      // monthly: endDate within next 7 days
      if (m.endDate && m.endDate >= todayStr && m.endDate <= in7DaysStr) return true;
      return false;
    }).length;
  },
});

export const getTotalRevenue = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    return members.reduce((sum, m) => sum + (m.price ?? 0), 0);
  },
});

export const deletePackage = mutation({
  args: { id: v.id("packages"), userEmail: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    const pkg = await ctx.db.get(args.id);
    const inUse = members.some(m => m.package === pkg?.packageName);
    if (inUse) throw new Error(`Cannot delete — this package is assigned to active members.`);

    await ctx.db.delete(args.id);
  },
});

export const updatePackage = mutation({
  args: {
    id:          v.id("packages"),
    packageName: v.string(),
    price:       v.number(),
    type:        v.string(),
    sessions:    v.number(),
    userEmail:   v.string(),
  },
  handler: async (ctx, args) => {
    const pkg = await ctx.db.get(args.id);
    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    const inUse = members.some(m => m.package === pkg?.packageName);
    if (inUse) throw new Error(`Cannot update — this package is assigned to active members.`);

    await ctx.db.patch(args.id, {
      packageName: args.packageName,
      price:       args.price,
      type:        args.type,
      sessions:    args.sessions,
    });
  },
});


export const getStatsChanges = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    const members = await ctx.db
      .query("members")
      .filter(q => q.eq(q.field("userEmail"), args.userEmail))
      .collect();

    // Members joined this month vs last month
    const newThisMonth = members.filter(m => m.createdAt >= startOfThisMonth).length;
    const newLastMonth = members.filter(m => m.createdAt >= startOfLastMonth && m.createdAt < startOfThisMonth).length;

    // Revenue this month vs last month
    const revenueThisMonth = members
      .filter(m => m.createdAt >= startOfThisMonth)
      .reduce((sum, m) => sum + (m.price ?? 0), 0);
    const revenueLastMonth = members
      .filter(m => m.createdAt >= startOfLastMonth && m.createdAt < startOfThisMonth)
      .reduce((sum, m) => sum + (m.price ?? 0), 0);

    const revenuePct = revenueLastMonth === 0
      ? null
      : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

    return {
      newThisMonth,
      newLastMonth,
      revenuePct, // null if no last month data
    };
  },
});



export const deleteMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});



// export const updateMember = mutation({
//   args: {
//     id:        v.id("members"),
//     firstName: v.string(),
//     lastName:  v.string(),
//     phone:     v.string(),
//     email:     v.optional(v.string()),
//     package:   v.string(),
//     sessionsLeft: v.float64(),
//     startDate: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const { id, ...fields } = args;
//     await ctx.db.patch(id, fields);
//   },
// });


export const updateMember = mutation({
  args: {
    id: v.id("members"),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    package: v.string(),
    startDate: v.string(),
  },

  handler: async (ctx, args) => {
    const packageDoc = await ctx.db
      .query("packages")
      .filter(q => q.eq(q.field("packageName"), args.package))
      .first();

    let endDate: string | undefined;

    if (packageDoc?.type === "Monthly (days)") {
      const d = new Date(args.startDate);
      const day = d.getDate();
      d.setMonth(d.getMonth() + (packageDoc.sessions ?? 1));
    if (d.getDate() !== day) d.setDate(0); // snap to last day of month
     endDate = d.toISOString().split("T")[0];
    } else if (packageDoc?.type === "Yearly (months)") {
      const d = new Date(args.startDate);
      const day = d.getDate();
      d.setFullYear(d.getFullYear() + (packageDoc.sessions ?? 1));
    if (d.getDate() !== day) d.setDate(0);
      endDate = d.toISOString().split("T")[0];
    }

    // if (packageDoc?.type === "Monthly (days)") {
    //   const d = new Date(args.startDate);
    //   d.setMonth(d.getMonth() + (packageDoc.sessions ?? 1));
    //   endDate = d.toISOString().split("T")[0];
    // } else if (packageDoc?.type === "Yearly (months)") {
    //   const d = new Date(args.startDate);
    //   d.setFullYear(d.getFullYear() + (packageDoc.sessions ?? 1));
    //   endDate = d.toISOString().split("T")[0];
    // }

    const sessionsLeft =
      packageDoc?.type === "Session-based"
        ? (packageDoc.sessions ?? 0)
        : (() => {
            if (!endDate) return 0;

            const start = new Date(args.startDate);
            const end = new Date(endDate);

            return Math.ceil(
              (end.getTime() - start.getTime()) /
              (1000 * 60 * 60 * 24)
            );
          })();

    await ctx.db.patch(args.id, {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      email: args.email,
      package: args.package,
      startDate: args.startDate,
      sessionsLeft,
      endDate,
    });
  },
});