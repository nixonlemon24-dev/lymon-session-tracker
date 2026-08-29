import { useState, useRef, useEffect, useCallback } from "react";
import "../css/Terms.css";
import NavBar from "../components/NavBar";

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    updated: "2026-06-02",
    body: [
      "By creating an account or using the service, you agree to these terms. If you're accepting on behalf of an organization, you're confirming you have authority to bind that organization.",
    ],
  },
  {
    id: "using-service",
    title: "Using the service",
    updated: "2026-06-02",
    body: [
      "You may use the service to build, store, and share your own projects. We grant you a personal, non-exclusive, non-transferable license to do so for as long as your account is active.",
      "We may change or discontinue features. When a change materially affects your usage, we'll give at least 30 days' notice by email.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    updated: "2026-05-09",
    body: [
      "You're responsible for the security of your credentials and for all activity under your account. Tell us right away if you suspect unauthorized access.",
      "You must be at least 16 years old, or the age of digital consent in your country, to create an account.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    updated: "2026-05-09",
    body: [
      "Don't use the service to break the law, infringe someone else's rights, distribute malware, or attempt to access other accounts or infrastructure without authorization.",
      "Don't try to reverse engineer the service or resell access without a written agreement with us.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    updated: "2026-02-20",
    body: [
      "You keep ownership of everything you create with the service. We claim no rights to your content beyond what's needed to host and display it back to you.",
      "The service itself — its code, design, and branding — belongs to us and is protected by copyright and trademark law.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    updated: "2026-02-20",
    body: [
      "You can close your account at any time from Settings. We may suspend or terminate accounts that violate these terms, after notice where practical.",
      "Sections covering intellectual property, liability, and dispute resolution survive termination.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    updated: "2026-01-14",
    body: [
      "The service is provided as is, without warranties of any kind. To the extent permitted by law, we're not liable for indirect, incidental, or consequential damages arising from your use of it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    updated: "2026-01-14",
    body: [
      "We may update these terms as the service evolves. Material changes are announced by email at least 14 days before they take effect. Continued use after that date means you accept the update.",
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

export default function TermsOfService() {
  const [active, setActive] = useState(null);
  const [cookieChoice, setCookieChoice] = useState(null); // null = undecided
  const sectionRefs = useRef({});
  const contentRef = useRef(null);
  const observerRef = useRef(null);

  const sections = TERMS_SECTIONS;

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
          <div className="pt-sidebar-label">Terms of service</div>
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
            <div className="pt-eyebrow pt-mono">§ terms-of-service</div>
            <h1 className="pt-h1">Terms of Service</h1>
            <p className="pt-lede">
              The rules for using the service — what you can do, what we ask you not to do, and where you stand if something goes wrong.
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
