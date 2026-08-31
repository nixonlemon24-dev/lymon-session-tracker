import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

const PLANS = [
  {
    tag: 'Starter',
    name: 'Free Trial',
    desc: 'For independent trainers just getting off spreadsheets.',
    price: '$0',
    period: '/ 14 Days',
    planKey: 'free',
    perks: [
      { text: "1 coach account", included: true },
      { text: "Up to 10 members", included: true },
      { text: "Session check-in tracking", included: true },
      { text: "Basic Dashboard overview", included: true },
      { text: "Unlimited members", included: false },
      { text: "SMS/email reminders", included: false },
      { text: "Revenue analytics", included: false },
    ],
    cta: 'Start free',
    featured: false,
  },
  {
    tag: 'Most popular',
    name: 'Pro Coach',
    desc: 'For trainers running a full client roster.',
    price: '$10',
    period: '/month',
    planKey: 'pro',
    perks: [
      { text: "1 coach account", included: true },
      { text: "Unlimited members", included: true },
      { text: "Session check-in tracking", included: true },
      { text: "Full Dashboard overview", included: true },
      { text: "SMS/email reminders", included: true },
      { text: "Revenue analytics", included: false },
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    tag: 'FOR TEAMS',
    name: 'Not Yet Available',
    desc: 'More Functionality Comming Soon',
    price: '$20',
    period: '/month',
    planKey: 'business',
    perks: [
      { text: "Multiple coaches/staff", included: false },
      { text: "Unlimited members", included: false },
      { text: "Session check-in tracking", included: false },
      { text: "All Pro features", included: false },
      { text: "SMS/email reminders", included: false },
      { text: "More Features", included: false },
    ],
    cta: 'Not Yet Available',
    featured: false,
  },
]

export default function PricingPage({ userEmail }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState(null);

  const user = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const createPortalSession = useAction(api.stripe.createPortalSession);

  const currentPlan = user?.plan ?? "free";
  const isCurrentPlan = (planKey) => currentPlan === planKey;

  async function handleCtaClick(plan) {
    setError(null);

    // Business tier isn't live yet
    if (plan.planKey === "business") return;

    // Already on this plan -> send them to the billing portal instead
    if (isCurrentPlan(plan.planKey) && user?.stripeCustomerId) {
      try {
        setLoadingPlan(plan.planKey);
        const { url } = await createPortalSession({
          stripeCustomerId: user.stripeCustomerId,
        });
        if (url) window.location.href = url;
      } catch (err) {
        console.error(err);
        setError("Couldn't open the billing portal. Please try again.");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    // Free plan needs no payment, handle sign-up however you already do
    if (plan.planKey === "free") {
      window.location.href = "/signup";
      return;
    }

    if (!userEmail) {
      setError("Please log in first to start a subscription.");
      return;
    }

    try {
      setLoadingPlan(plan.planKey);
      const { url } = await createCheckoutSession({
        planKey: plan.planKey,
        email: userEmail,
      });
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Couldn't start checkout. Please try again in a moment.");
    } finally {
      setLoadingPlan(null);
    }
  }

  function ctaLabel(plan) {
    if (plan.planKey === "business") return plan.cta;
    if (isCurrentPlan(plan.planKey)) return "Manage plan";
    if (loadingPlan === plan.planKey) return "Loading…";
    return plan.cta;
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <div className="pricing-eyebrow">OUR PRICING</div>
        <h1 className="pricing-title">
          Record Sessions,<br />
          <span className="pricing-title-accent">Track Smarter.</span>
        </h1>
        <p className="pricing-subtitle">
          Start free. Upgrade when you're ready. No hidden fees.
        </p>
        {userEmail && (
          <div className="pricing-user-pill">
            Logged in as <strong>{userEmail}</strong> — {" "}
            <span style={{ color: "#ccff00" }}>
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
            </span>
          </div>
        )}
        {error && (
          <div className="pricing-error" style={{ color: "#ff5c5c", marginTop: 8 }}>
            {error}
          </div>
        )}
      </div>

      <div className="wrap">
        <div className="price-grid">
          {PLANS.map((p) => {
            const disabled = p.planKey === "business" || loadingPlan === p.planKey;
            return (
              <div className={`price-card${p.featured ? ' feat' : ''}`} key={p.name}>
                <div className="price-tag">{p.tag}</div>
                <div className="price-name">{p.name}</div>
                <div className="price-desc">{p.desc}</div>
                <div className="price-amt">
                  {p.price}
                  <span>{p.period}</span>
                </div>
                <ul className="price-list">
                  {p.perks.map((perk, i) => (
                    <li key={i} className={perk.included ? "perk-yes" : "perk-no"}>
                      <span className="perk-icon">{perk.included ? "✓" : "✗"}</span>
                      {perk.text}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCtaClick(p)}
                  className={`btn btn-block ${p.featured ? 'btn-lime' : 'btn-ghost'}`}
                  style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                >
                  {ctaLabel(p)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pricing-footnote">
        All plans include data security and regular updates. Cancel anytime.
      </div>
    </div>
  );
}
