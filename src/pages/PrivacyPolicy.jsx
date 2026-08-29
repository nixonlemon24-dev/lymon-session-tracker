import { useState, useRef, useEffect, useCallback } from "react";
import "../css/Terms.css";
import NavBar from "../components/NavBar";

const PRIVACY_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    updated: "2026-06-02",
    body: [
      "This policy explains what data we collect when you use the service, why we collect it, and the choices you have. It applies to the web app, the API, and any CLI tools that authenticate against your account, wherever in the world you're using them from.",
      "We collect the minimum data needed to run the service, secure your account, and fix things when they break. We do not sell personal data, and we do not share it with advertisers.",
      "Depending on where you live, this policy is supplemented by regional terms — including the GDPR for the EU and UK, the CCPA/CPRA for California, and the LGPD for Brazil — summarized in the Your rights section below.",
    ],
  },
  {
    id: "data-collection",
    title: "Information we collect",
    updated: "2026-06-02",
    body: [
      "Account data: your name, email address, and a hashed password, or an identifier from your chosen single sign-on provider.",
      "Usage data: request logs, feature interactions, and performance metrics, retained for 90 days to debug issues and improve reliability.",
      "Content you provide: files, prompts, and project data you upload or create are stored so the product can display them back to you. You control deletion at any time from project settings.",
    ],
  },
  {
    id: "data-use",
    title: "How we use data",
    updated: "2026-05-18",
    body: [
      "We use account and usage data to operate the service, respond to support requests, detect abuse, and understand which features are worth investing in.",
      "We do not use the content of your private projects to train models unless you explicitly opt in from workspace settings.",
      "Where the GDPR applies, we process account and usage data under a contractual-necessity basis, and product-analytics data under consent, which you can withdraw at any time.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies & tracking",
    updated: "2026-04-11",
    body: [
      "We set a session cookie to keep you signed in and a preferences cookie to remember your theme and layout choices. Neither is used for cross-site tracking.",
      "A small number of first-party analytics events (page views, feature clicks) help us see what's confusing in the product. You can disable this in Settings → Privacy → Product analytics.",
      "If you're visiting from the EU, UK, or another region with a consent requirement, non-essential cookies stay off until you accept them in the banner shown on your first visit.",
    ],
  },
  {
    id: "sharing",
    title: "Data sharing",
    updated: "2026-04-11",
    body: [
      "We share data with a short list of infrastructure vendors — hosting, email delivery, and error monitoring — each bound by a data processing agreement.",
      "We disclose data when required by valid legal process, and we notify affected account holders unless we're legally prohibited from doing so.",
      "When data crosses borders — for example, EU data processed on US infrastructure — we rely on Standard Contractual Clauses or an equivalent approved transfer mechanism.",
      "We do not sell personal data, and we do not share it for cross-context behavioral advertising. If that ever changes, you'll be able to opt out from the control below before it applies to you.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    updated: "2026-06-02",
    interactive: true,
    body: [
      "You can export a full copy of your account data at any time. Exports include content, usage history, and account metadata.",
      "You can request deletion of your account and associated data. Deletion is permanent after a 14-day recovery window and completes within 30 days.",
      "If the GDPR applies to you, this also covers the right to rectification, the right to restrict processing, and the right to lodge a complaint with your local supervisory authority.",
      "If the CCPA/CPRA applies to you, this also covers the right to know, the right to correct, and the right to opt out of sale or sharing — the toggle below sets that choice, and we honor Global Privacy Control signals automatically.",
      "The age of consent for creating an account without a parent or guardian varies by country — 16 across most of the EU, 13 in the US under COPPA. We ask for a birthdate at signup to apply the right threshold.",
      "Use the controls below to act on any of these rights directly — no email required.",
    ],
  },
  {
    id: "security",
    title: "Data security",
    updated: "2026-03-02",
    body: [
      "Data is encrypted in transit with TLS 1.3 and at rest with AES-256. Access to production data is limited to on-call engineers and logged.",
      "We run a public bug bounty and undergo an independent security review annually. Summaries are posted to our trust page.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    updated: "2026-01-14",
    body: [
      "Questions about this policy can go to privacy@example.com. For data subject requests, use the export and deletion tools in Settings — they're faster than email.",
    ],
  },
];

function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Toggle({ checked, onChange, label, id }) {
  return (
    <label className="pt-toggle-row" htmlFor={id}>
      <span className="pt-toggle-label">{label}</span>
      <span className={`pt-toggle ${checked ? "pt-on" : ""}`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="pt-toggle-input"
        />
        <span className="pt-toggle-knob" />
      </span>
    </label>
  );
}

function PrivacyControls() {
  const [analytics, setAnalytics] = useState(true);
  const [doNotSell, setDoNotSell] = useState(false);
  const [exportState, setExportState] = useState("idle");
  const [deleteState, setDeleteState] = useState("idle");

  const runExport = () => {
    setExportState("working");
    setTimeout(() => setExportState("done"), 1100);
  };
  const runDelete = () => {
    if (deleteState === "idle") {
      setDeleteState("confirm");
      return;
    }
    setDeleteState("scheduled");
  };

  return (
    <div className="pt-controls" role="group" aria-label="Privacy controls">
      <div className="pt-controls-head pt-mono">Manage your data</div>

      <Toggle
        id="ctl-analytics"
        checked={analytics}
        onChange={setAnalytics}
        label="Product analytics"
      />
      <Toggle
        id="ctl-dns"
        checked={doNotSell}
        onChange={setDoNotSell}
        label="Do Not Sell or Share my data"
      />

      <div className="pt-controls-divider" />

      <div className="pt-controls-actions">
        <button className="pt-action-btn pt-mono" onClick={runExport} disabled={exportState === "working"}>
          {exportState === "idle" && "Export my data"}
          {exportState === "working" && "Preparing export…"}
          {exportState === "done" && "✓ Export ready"}
        </button>

        <button
          className={`pt-action-btn pt-mono ${deleteState !== "idle" ? "pt-danger" : ""}`}
          onClick={runDelete}
          disabled={deleteState === "scheduled"}
        >
          {deleteState === "idle" && "Delete my account"}
          {deleteState === "confirm" && "Click again to confirm"}
          {deleteState === "scheduled" && "✓ Deletion scheduled"}
        </button>
      </div>
      {deleteState === "scheduled" && (
        <p className="pt-controls-note">
          Your account is scheduled for deletion in 14 days. Sign back in before then to cancel.
        </p>
      )}
    </div>
  );
}

function CookieConsent({ onDecision }) {
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  return (
    <div className="pt-cookie" role="dialog" aria-label="Cookie preferences">
      <div className="pt-cookie-inner">
        <div className="pt-cookie-text">
          <div className="pt-cookie-title pt-mono">§ cookie-consent</div>
          <p>
            We use essential cookies to run the service. With your consent, we'd also like to
            set analytics cookies to see what's confusing in the product.
          </p>
        </div>

        {expanded && (
          <div className="pt-cookie-expanded">
            <Toggle id="cc-essential" checked={true} onChange={() => {}} label="Essential (always on)" />
            <Toggle id="cc-analytics" checked={analytics} onChange={setAnalytics} label="Analytics" />
          </div>
        )}

        <div className="pt-cookie-actions">
          {!expanded && (
            <button className="pt-cookie-btn pt-mono" onClick={() => setExpanded(true)}>
              Customize
            </button>
          )}
          <button
            className="pt-cookie-btn pt-mono"
            onClick={() => onDecision(false)}
          >
            Reject non-essential
          </button>
          <button
            className="pt-cookie-btn pt-mono pt-primary"
            onClick={() => onDecision(expanded ? analytics : true)}
          >
            {expanded ? "Save choices" : "Accept all"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  const [active, setActive] = useState(null);
  const [cookieChoice, setCookieChoice] = useState(null); // null = undecided
  const sectionRefs = useRef({});
  const contentRef = useRef(null);
  const observerRef = useRef(null);

  const sections = PRIVACY_SECTIONS;

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTo({ top: 0 });

    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.dataset.id);
      },
      { root: contentRef.current, rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );
    observerRef.current = observer;

    const t = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    }, 0);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollTo = useCallback((id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="pt-app">
        <NavBar />
      <div className="pt-layout">
        <nav className="pt-sidebar pt-mono" aria-label="Sections">
          <div className="pt-sidebar-label">Privacy policy</div>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`pt-sidebar-item ${active === s.id ? "pt-active" : ""}`}
              onClick={() => scrollTo(s.id)}
            >
              <span className="pt-dot" />
              {s.title}
            </button>
          ))}
        </nav>

        <main className="pt-content" ref={contentRef}>
          <div className="pt-content-head">
            <div className="pt-eyebrow pt-mono">§ privacy-policy</div>
            <h1 className="pt-h1">Privacy Policy</h1>
            <p className="pt-lede">
              What we collect, why we collect it, and how to control it. Plain language, no fine-print surprises.
            </p>
          </div>

          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              data-id={s.id}
              className="pt-section"
              ref={(el) => (sectionRefs.current[s.id] = el)}
            >
              <div className="pt-section-head">
                <h2 className="pt-section-title">
                  <span className="pt-sym pt-mono">§</span>
                  {s.title}
                </h2>
                <span className="pt-updated pt-mono">
                  updated {formatDate(s.updated)}
                </span>
              </div>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.interactive && <PrivacyControls />}
            </section>
          ))}

          <div className="pt-footer-note pt-mono">
            This document is provided as a template for review and does not
            constitute legal advice. Have counsel review before publishing.
          </div>
        </main>
      </div>

      {cookieChoice === null && (
        <CookieConsent onDecision={(analyticsAllowed) => setCookieChoice(analyticsAllowed)} />
      )}
    </div>
  );
}
