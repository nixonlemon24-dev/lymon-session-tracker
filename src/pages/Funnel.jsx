import "../css/Funnel.css";
import NavBar  from "../components/NavBar";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    num: '01',
    title: 'Log a session in seconds',
    body: "Tap through sets, reps, and notes between clients instead of scribbling on paper you'll lose by Friday.",
    icon: (
      <>
        <path d="M9 11l2 2 4-4" stroke="#d7ff3d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="4" width="16" height="17" rx="2" stroke="#d7ff3d" strokeWidth="1.6" />
      </>
    ),
  },
  {
    num: '02',
    title: 'Watch client progress build',
    body: "Every logged session rolls into a trend line, so you can show a client exactly how far they've come.",
    icon: <path d="M4 19V9M11 19V5M18 19v-7" stroke="#d7ff3d" strokeWidth="1.8" strokeLinecap="round" />,
  },
  {
    num: '03',
    title: "Know who's falling behind",
    body: 'Missed-session alerts surface the clients who\u2019ve gone quiet, before they quietly cancel.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" stroke="#d7ff3d" strokeWidth="1.6" />
        <path d="M12 8v4l3 2" stroke="#d7ff3d" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    num: '04',
    title: 'A schedule that stays current',
    body: "Bookings, reschedules, and cancellations sync straight into the day's plan \u2014 no separate calendar app.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#d7ff3d" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="#d7ff3d" strokeWidth="1.6" />
      </>
    ),
  },
  {
    num: '05',
    title: 'Your client data, secured',
    body: 'Session notes and health details are encrypted and scoped to you \u2014 never sold, never shared.',
    icon: <path d="M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6l7-4z" stroke="#d7ff3d" strokeWidth="1.6" strokeLinejoin="round" />,
  },
    {
    num: '',
      title: '',
    body: '',
    icon: <></>,
  },
]

const STEPS = [
{ 
  n: 1, 
  title: 'Create Your Packages', 
  body: 'Set up flexible packages that fit your business, from monthly memberships to session-based plans.' 
},

{ 
  n: 2, 
  title: 'Add Your Clients', 
  body: 'Add your clients and assign the right package to keep their sessions organized from day one.' 
},

{ 
  n: 3, 
  title: 'Track Every Session', 
  body: 'Quickly log each client’s attendance and keep an accurate record of their remaining sessions.' 
},

{ 
  n: 4, 
  title: 'Stay on Top of Renewals', 
  body: 'Monitor attendance, track package usage, and get timely reminders when a client’s package is about to expire.' 
},
]

const PLANS = [
  {
    tag: 'Starter',
    name: 'Free Trial',
    desc: 'For independent trainers just getting off spreadsheets.',
    price: '$0',
    period: '14 Days Free Trial',
    perks: [  { text: "1 coach account",           included: true  },
      { text: "Up to 10 members",          included: true  },
      { text: "Session check-in tracking", included: true  },
      { text: "Basic Dashboard overview",  included: true  },
      { text: "Unlimited members",         included: false },
      { text: "SMS/email reminders",       included: false },
      { text: "Revenue analytics",         included: false },],
    cta: 'Start free',
    featured: false,
  },
  {
    tag: 'Most popular',
    name: 'Pro Coach',
    desc: 'For trainers running a full client roster.',
    price: '$10',
    period: '/month',
    perks: [      { text: "1 coach account",           included: true },
      { text: "Unlimited members",         included: true },
      { text: "Session check-in tracking", included: true },
      { text: "Full Dashboard overview",   included: true },
      { text: "SMS/email reminders",       included: true },
      { text: "Revenue analytics",         included: false },],
  
    cta: 'Start free trial',
    featured: true,
  },
  {
    tag: 'FOR TEAMS',
    name: 'Not Yet Available',
    desc: 'More Functionality Comming Soon',
    price: '$20',
    period: '/month',
    perks: [       { text: "Multiple coaches/staff",    included: false },
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
    cta: 'Not Yet Available',
    featured: false,
  },
]



export default function Funnel() {
  return (
    <div className="funnel">
      <div className="grid-bg" />
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      <NavBar />

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">A smart assistant for trainers &amp; coaches</div>
            <h1>
              Record sessions,
              <br />
              monitor clients,
              <br />
              <span className="accent">track smarter.</span>
            </h1>
            <p className="lede">
              Session Tracker replaces your notebook, spreadsheets, and group chats with one
              dashboard built for trainers who'd rather coach than do paperwork.
            </p>
            <div className="hero-actions">
              <Link to="/create-account" className="btn btn-lime btn-lg">Start your free 14-day trial</Link>
              <a href="#how" className="btn btn-ghost btn-lg">See how it works</a>
            </div>
            <div className="hero-note">No credit card required &middot; Set up your first client in under 5 minutes</div>
            <div className="trust-row">
              <div className="trust-stat"><b>2,400+</b><span>trainers on Session Tracker</span></div>
              <div className="trust-stat"><b>310K</b><span>sessions logged this year</span></div>
              <div className="trust-stat"><b>4.9/5</b><span>average trainer rating</span></div>
            </div>
          </div>

          <div className="mock">
            <div className="mock-head">
              <div className="mock-dots"><span /><span /><span /></div>
              <div className="mock-title">TODAY &middot; 6 SESSIONS</div>
            </div>

            <div className="mock-card">
              <div className="mock-client">
                <div className="avatar">JR</div>
                <div>
                  <div className="mock-client-name">Jordan R.</div>
                  <div className="mock-client-sub">Strength &middot; 6:00 AM</div>
                </div>
              </div>
              <div className="badge badge-done">Logged</div>
            </div>

            <div className="mock-card">
              <div className="mock-client">
                <div className="avatar">MT</div>
                <div>
                  <div className="mock-client-name">Maya T.</div>
                  <div className="mock-client-sub">Mobility &middot; 7:30 AM</div>
                </div>
              </div>
              <div className="badge badge-done">Logged</div>
            </div>

            <div className="mock-card">
              <div className="mock-client">
                <div className="avatar">DK</div>
                <div>
                  <div className="mock-client-name">Devon K.</div>
                  <div className="mock-client-sub">HIIT &middot; 9:00 AM</div>
                </div>
              </div>
              <div className="badge badge-pend">Upcoming</div>
            </div>

            <div className="mock-chart">
              {[35, 55, 40, 72, 60, 90, 48].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><div className="divider" /></div>

      {/* FEATURES */}
      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Why trainers switch</div>
            <h2>Everything a coaching business needs, nothing it doesn't</h2>
            <p>
              Built around the three things that actually eat your week: logging sessions,
              keeping tabs on client progress, and knowing who needs a check-in.
            </p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div className="feat-card" key={f.num}>
                <span className="feat-num">{f.num}</span>
                <div className="feat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    {f.icon}
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="divider" /></div>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Getting started</div>
            <h2>Up and running before your next client walks in</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <div className="step-mark">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="divider" /></div>

      {/* TESTIMONIAL */}
      {/* <section>
        <div className="wrap">
          <div className="quote-block">
            <div className="quote-mark">&ldquo;</div>
            <div>
              <p className="quote">
                I used to lose an hour every Sunday rebuilding my client notes from memory.
                Now it's already done \u2014 I just open the app.
              </p>
              <div className="quote-author">
                <div className="avatar" style={{ width: 40, height: 40 }}>RA</div>
                <div>
                  <b>Rosa Alvarez</b>
                  <span>Strength coach, 34 active clients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* PRICING */}
      <section id="pricing">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Pricing</div>
            <h2>Straightforward plans, no per-client surprise fees</h2>
            <p>Every plan includes unlimited session logging. Upgrade as your roster grows.</p>
          </div>
          <div className="price-grid">
            {PLANS.map((p) => (
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
                <Link to="/create-account" className={`btn btn-block ${p.featured ? 'btn-lime' : 'btn-ghost'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="wrap">
          <div className="cta-band">
            <h2>Your next session is already waiting.</h2>
            <p>Start tracking it properly &mdash; free for 14 days, no card required.</p>
            <div className="hero-actions">
              <Link to="/create-account" className="btn btn-lime btn-lg">Start your free trial</Link>
              <Link to="/book-demo" className="btn btn-ghost btn-lg">Book a demo</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap foot-inner">
          <div className="brand">
            <div className="foot-copy">&copy; 2026 Session Tracker. All rights reserved.</div>
          </div>
          <div className="foot-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/PrivacyTerms">Privacy</Link>
            <Link to="/TermsOfService">Terms</Link>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
