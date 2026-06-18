import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

const getIcon      = (type) => type === "Monthly (days)" ? "📅" : type === "Yearly (months)" ? "🗓️" : "⚡";
const getIconClass = (type) => type === "Monthly (days)" ? "icon-monthly" : type === "Yearly (months)" ? "icon-yearly" : "icon-session";
const getUnit      = (type) => type === "Monthly (days)" ? "/ MONTH" : type === "Yearly (months)" ? "/ YEAR" : "/ PACK";
const getDesc      = (pkg)  =>


  pkg.type === "Monthly (days)"  ? `Unlimited visits • ${pkg.sessions} ${pkg.sessions === 1 ? "month" : "months"}` :
  pkg.type === "Yearly (months)" ? `Unlimited visits • ${pkg.sessions} ${pkg.sessions === 1 ? "year" : "years"}` :
  `Flexible use • ${pkg.sessions} sessions`;

export default function PackagesList({ userEmail }) {
  const packages    = useQuery(api.packages.getPackages, userEmail ? { userEmail } : "skip") ?? [];
  const deletePackage = useMutation(api.packages.deletePackage);
  const [error, setError] = useState("");

  const handleDelete = async (pkg) => {
    setError("");
    try {
      await deletePackage({ id: pkg._id, userEmail });
    } catch (err) {
      // setError(err.message);
          const msg = err.message ?? "";
       setError(msg.includes("Cannot delete") 
      ? "Cannot delete — this package is assigned to active members." 
      : msg);
    }
  };

  if (packages.length === 0) {
    return (
      <div className="rates-list">
        <div className="empty-state">
          No packages yet. Add your first package!
        </div>
      </div>
    );
  }
// style={{ color: "red", fontSize: "13px", padding: "8px 16px", marginBottom: "8px" }}
  return (
    <div className="rates-list">
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      {packages.map((pkg, index) => (
        <div key={pkg._id} className={`rate-card ${index === 0 ? "featured" : ""}`}>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="rate-edit" title="Edit package">✏️</button>
            <button
              className="rate-edit"
              title="Delete package"
              onClick={() => handleDelete(pkg)}
            >
              🗑️
            </button>
          </div>
          <div className={`rate-icon ${getIconClass(pkg.type)}`}>
            {getIcon(pkg.type)}
          </div>
          <div className="rate-info">
            <div className="rate-name">{pkg.packageName}</div>
            <div className="rate-desc">{getDesc(pkg)}</div>
          </div>
          <div className="rate-price">
            <div className="rate-amount">₱{pkg.price.toLocaleString()}</div>
            <div className="rate-unit">{getUnit(pkg.type)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}