import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AlertsPanel({ userEmail }) {
  const members = useQuery(
    api.members.getMembers,
    userEmail ? { userEmail } : "skip"
  ) ?? [];

  const user  = useQuery(api.users.getUserByEmail, userEmail ? { email: userEmail } : "skip");
  const isPro = user?.plan === "pro" || user?.plan === "business";

  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);
  const todayStr   = today.toISOString().split("T")[0];
  const in7DaysStr = in7Days.toISOString().split("T")[0];

  const alerts = [];

  members.forEach(m => {
    const name = `${m.firstName} ${m.lastName}`;

    if (!m.endDate && m.sessionsLeft === 0) {
      alerts.push({ type: "danger", icon: "🚫", title: `${name} — Session Exhausted`, desc: `${m.package} pack used up. Renew needed.` });
    } else if (!m.endDate && m.sessionsLeft > 0 && m.sessionsLeft <= 5) {
      alerts.push({ type: "warn", icon: "⚠️", title: `${name} — ${m.sessionsLeft} session${m.sessionsLeft === 1 ? "" : "s"} left`, desc: `Remind to renew ${m.package}.` });
    } else if (m.endDate && m.endDate < todayStr) {
      alerts.push({ type: "danger", icon: "🚫", title: `${name} — Package Expired`, desc: `${m.package} ended on ${m.endDate}. Renew needed.` });
    } else if (m.endDate && m.endDate >= todayStr && m.endDate <= in7DaysStr) {
      alerts.push({ type: "warn", icon: "⚠️", title: `${name} — Expiring Soon`, desc: `${m.package} expires on ${m.endDate}.` });
    }
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="alerts-header">⚠ ALERTS</div>
        {!isPro && (
          <span className="alerts-pro-badge">PRO</span>
        )}
      </div>

      {/* Free plan locked state */}
      {!isPro ? (
        <div className="alerts-locked">
          <div className="alerts-locked-icon">🔒</div>
          <div className="alerts-locked-title">Alerts is a Pro Feature</div>
          <div className="alerts-locked-desc">
            Upgrade to Pro to get notified when members are expiring or running low on sessions.
          </div>

          {/* blurred preview */}
          <div className="alerts-locked-preview">
            {[
              { type: "danger", icon: "🚫", title: "Member — Session Exhausted",  desc: "Pack used up. Renew needed."     },
              { type: "warn",   icon: "⚠️",  title: "Member — 3 sessions left",    desc: "Remind to renew package."       },
              { type: "warn",   icon: "⚠️",  title: "Member — Expiring Soon",      desc: "Package expires in 5 days."     },
            ].map((alert, i) => (
              <div key={i} className={`alert-item ${alert.type}`}>
                <span className="alert-icon">{alert.icon}</span>
                <div className="alert-text">
                  <strong>{alert.title}</strong>
                  <span>{alert.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">No alerts. All members are active.</div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert, i) => (
            <div key={i} className={`alert-item ${alert.type}`}>
              <span className="alert-icon">{alert.icon}</span>
              <div className="alert-text">
                <strong>{alert.title}</strong>
                <span>{alert.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}