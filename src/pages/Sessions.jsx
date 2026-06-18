import TodaysSessions from "../components/TodaysSessions";
import AlertsPanel    from "../components/AlertsPanel";

export default function SessionsPage({ userEmail }) {
  return (
    <div className="content">
      <div className="sessions-row">
        <TodaysSessions userEmail={userEmail} />
        <AlertsPanel    userEmail={userEmail} />
      </div>
    </div>
  );
}