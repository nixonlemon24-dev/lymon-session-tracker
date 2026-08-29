import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "14 Days",
    badge: null,
    desc: "Perfect for solo coaches just getting started.",
    color: "#888",
    accent: "rgba(255,255,255,0.08)",
    features: [
      { text: "1 coach account",           included: true  },
      { text: "Up to 10 members",          included: true  },
      { text: "Session check-in tracking", included: true  },
      { text: "Basic Dashboard overview",  included: true  },
      { text: "Unlimited members",         included: false },
      { text: "SMS/email reminders",       included: false },
      { text: "Revenue analytics",         included: false },
      // { text: "Priority support",          included: false },
    ],
    cta: "Get Started Free",
    ctaStyle: "ghost",
  },
  {
    name: "Pro",
    price: "$10",
    period: "/ month",
    badge: "MOST POPULAR",
    desc: "For serious coaches ready to scale their business.",
    color: "#ccff00",
    accent: "rgba(204,255,0,0.06)",
    features: [
      { text: "1 coach account",           included: true },
      { text: "Unlimited members",         included: true },
      { text: "Session check-in tracking", included: true },
      { text: "Full Dashboard overview",   included: true },
      { text: "SMS/email reminders",       included: true },
      { text: "Revenue analytics",         included: false },
      // { text: "Export reports (PDF/Excel)",included: true },
      // { text: "Multiple staff accounts",   included: false },
      // { text: "Priority support",          included: false },
    ],
    cta: "Start Pro",
    ctaStyle: "primary",
  },
  {
    name: "Not Yet Available",
    price: "$20",
    period: "/ month",
    badge: "FOR TEAMS",
    desc: "More Functionality Comming Soon",
    color: "#60a5fa",
    accent: "rgba(96,165,250,0.06)",
    features: [
      { text: "Multiple coaches/staff",    included: false },
      { text: "Unlimited members",         included: false },
      { text: "Session check-in tracking", included: false },
      { text: "All Pro features",included: false },
      { text: "SMS/email reminders",        included: false },
      { text: "More Features",        included: false },
      // { text: "",         included: true },
      // { text: "Export reports (PDF/Excel)",included: true },
      // { text: "Multiple staff accounts",   included: true },
      // { text: "Priority support",          included: true },
    ],
    cta: "Not Yet Available",
    ctaStyle: "ghost",
  },
];

export default function PricingPage({ userEmail }) {
  const [hovered, setHovered] = useState(null);

  // fetch user to get their current plan
  const user = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  // default to "free" if no plan stored yet
  const currentPlan = user?.plan ?? "free";

  const isCurrentPlan = (planKey) => currentPlan === planKey;

  const getCtaLabel = (plan) => {
    if (isCurrentPlan(plan.planKey)) return "✓ Current Plan";
    if (plan.planKey === "business") return "Not Yet Available";
    return plan.cta;
  };

  const getCtaStyle = (plan) => {
    if (isCurrentPlan(plan.planKey)) return "current";
    return plan.ctaStyle;
  };

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
      </div>

      <div className="pricing-grid">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.ctaStyle === "primary" ? "pricing-card--featured" : ""} ${isCurrentPlan(plan.planKey) ? "pricing-card--current" : ""}`}
            style={{ background: hovered === i ? plan.accent : "transparent" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {plan.badge && (
              <div className="pricing-badge" style={{ color: plan.color, borderColor: plan.color }}>
                {plan.badge}
              </div>
            )}

            <div className="pricing-plan-name" style={{ color: plan.color }}>
              {plan.name}
            </div>

            <div className="pricing-price-row">
              <span className="pricing-price">{plan.price}</span>
              <span className="pricing-period">{plan.period}</span>
            </div>

            <p className="pricing-desc">{plan.desc}</p>

            <div className="pricing-divider" />

            <ul className="pricing-features">
              {plan.features.map((f, fi) => (
                <li key={fi} className={`pricing-feature ${f.included ? "included" : "excluded"}`}>
                  <span className="feature-icon">
                    {f.included ? "✓" : "✕"}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              className={`pricing-cta pricing-cta--${getCtaStyle(plan)}`}
              style={plan.ctaStyle === "primary" && !isCurrentPlan(plan.planKey)
                ? { background: plan.color, color: "#000" }
                : {}}
              disabled={isCurrentPlan(plan.planKey) || plan.planKey === "business"}
            >
              {getCtaLabel(plan)}
            </button>
          </div>
        ))}
      </div>

      <div className="pricing-footnote">
        All plans include data security and regular updates. Cancel anytime.
      </div>
    </div>
  );
}