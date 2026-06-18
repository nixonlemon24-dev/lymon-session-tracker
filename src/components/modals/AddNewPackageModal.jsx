import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "../../css/Modal.css";
import "../../css/RatesModal.css";

const TYPES = ["Monthly (days)", "Yearly (months)", "Session-based"];

export default function RatesModal({ onClose, userEmail }) {
  const newPackage    = useMutation(api.packages.newPackage);
  const updatePackage = useMutation(api.packages.updatePackage);
  const deletePackage = useMutation(api.packages.deletePackage);

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors,   setErrors]   = useState({});
  const [packages, setPackages] = useState([]);

  const existingPkgs = useQuery(
    api.packages.getPackages,
    userEmail ? { userEmail } : "skip"
  );

  useEffect(() => {
    if (existingPkgs === undefined) return;

    if (existingPkgs.length > 0) {
      setPackages(existingPkgs.map((pkg, index) => ({
        _id:        pkg._id,
        id:         `PKG-${String(index + 1).padStart(3, "0")}`,
        icon:       pkg.type === "Monthly (days)" ? "📅" : "🔄",
        name:       pkg.packageName,
        price:      pkg.price,
        type:       pkg.type,
        sessions:   pkg.sessions,
        isExisting: true,
      })));
    } else {
      setPackages([{
        id:         "PKG-001",
        icon:       "⚡",
        name:       "",
        price:      "",
        type:       "Monthly (days)",
        sessions:   "",
        isExisting: false,
      }]);
    }
  }, [existingPkgs]);

  const set = (id, field, value) => {
    setPackages(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
    setErrors(prev => ({ ...prev, [`${id}-${field}`]: undefined }));
  };

  // ✅ derives next ID from current packages length — no counter needed
  const addPackage = () => {
    const next = packages.length + 1;
    setPackages(prev => [...prev, {
      id:         `PKG-${String(next).padStart(3, "0")}`,
      icon:       "⚡",
      name:       "",
      price:      "",
      type:       "Monthly (days)",
      sessions:   "",
      isExisting: false,
    }]);
  };

  // const removePackage = (id) => {
  //   const pkg = packages.find(p => p.id === id);
  //   if (pkg?.isExisting) return;
  //   setPackages(prev => prev.filter(p => p.id !== id));
  // };

const handleRemove = async (pkg) => {
  // unsaved package — just remove from local state
  if (!pkg.isExisting) {
    setPackages(prev => prev.filter(p => p.id !== pkg.id));
    return;
  }

  // existing package — delete from DB with validation
  setLoading(true);
  setApiError("");
  try {
    await deletePackage({ id: pkg._id, userEmail });
    setPackages(prev => prev.filter(p => p.id !== pkg.id));
  } catch (err) {
    setApiError(err.message ?? "Could not delete package.");
  } finally {
    setLoading(false);
  }
};

const validate = () => {
  const e = {};
  packages.forEach(pkg => {
    if (!String(pkg.name).trim()) {
      e[`${pkg.id}-name`] = "Package name is required";
    }

    const price = String(pkg.price).trim();
    if (!price) {
      e[`${pkg.id}-price`] = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      e[`${pkg.id}-price`] = "Price must be greater than 0";
    }

    const sessions = String(pkg.sessions).trim();
    if (!sessions) {
      e[`${pkg.id}-sessions`] = pkg.type === "Monthly (days)"
        ? "Duration is required"
        : pkg.type === "Yearly (months)"
        ? "Duration (years) is required"
        : "Number of sessions is required";
    } else if (isNaN(Number(sessions)) || Number(sessions) <= 0) {
      e[`${pkg.id}-sessions`] = pkg.type === "Monthly (days)"
        ? "Duration must be greater than 0"
        : pkg.type === "Yearly (months)"
        ? "Years must be greater than 0"
        : "Sessions must be greater than 0";
    }
  });
  return e;
};

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setApiError("");
    try {
      await Promise.all(
        packages.map(pkg =>
          pkg.isExisting
            ? updatePackage({
                id:          pkg._id,
                packageName: pkg.name.trim(),
                price:       Number(pkg.price),
                type:        pkg.type,
                sessions:    Number(pkg.sessions),
              })
            : newPackage({
                userEmail,
                packageName: pkg.name.trim(),
                price:       Number(pkg.price),
                type:        pkg.type,
                sessions:    Number(pkg.sessions),
              })
        )
      );
      onClose();
    } catch (err) {
      setApiError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="modal-accent-bar" />

        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-badge">RATES</span>
            <h2 className="modal-title">Edit / Add Packages</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {apiError && <div className="modal-api-error">{apiError}</div>}

          {existingPkgs === undefined ? (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--muted)", fontSize: "13px" }}>
              Loading packages…
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="rm-pkg-block">
                <div className="rm-pkg-block-header">
                  <div className="rm-pkg-block-title">
                    <span className="rm-pkg-icon">{pkg.icon}</span>
                    {pkg.name || "New Package"}
                  </div>
                  <div className="rm-pkg-block-right">
                    <span className="rm-pkg-id">{pkg.id}</span>
                    {!pkg.isExisting && (
                      <button
                      className="rm-remove-btn"
                      onClick={() => handleRemove(pkg)}
                      disabled={loading}
                      title={pkg.isExisting ? "Delete package" : "Remove"}
                    >
                      {pkg.isExisting ? "🗑️" : "✕"}
                    </button>
                    )}
                  </div>
                </div>

                <div className="modal-row">
                  <div className={`modal-field ${errors[`${pkg.id}-name`] ? "modal-field--error" : ""}`}>
                    <label className="modal-label">Package Name</label>
                    <input
                      className="modal-input"
                      placeholder="e.g. Monthly Pass"
                      value={pkg.name}
                      onChange={e => set(pkg.id, "name", e.target.value)}
                    />
                    {errors[`${pkg.id}-name`] && <span className="modal-error-msg">{errors[`${pkg.id}-name`]}</span>}
                  </div>
                  <div className={`modal-field ${errors[`${pkg.id}-price`] ? "modal-field--error" : ""}`}>
                    <label className="modal-label">Price (₱)</label>
                    <input
                      className="modal-input"
                      type="number"
                      placeholder="3000"
                      value={pkg.price}
                      onChange={e => set(pkg.id, "price", e.target.value)}
                    />
                    {errors[`${pkg.id}-price`] && <span className="modal-error-msg">{errors[`${pkg.id}-price`]}</span>}
                  </div>
                </div>

                <div className="modal-row">
                  <div className="modal-field">
                    <label className="modal-label">Type</label>
                    <select
                      className="modal-input modal-select"
                      value={pkg.type}
                      onChange={e => set(pkg.id, "type", e.target.value)}
                    >
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className={`modal-field ${errors[`${pkg.id}-sessions`] ? "modal-field--error" : ""}`}>
                    {/* <label className="modal-label">Duration / Sessions</label>
                    <input
                      className="modal-input"
                      type="number"
                      placeholder="30"
                      value={pkg.sessions}
                      onChange={e => set(pkg.id, "sessions", e.target.value)}
                    />
                    {errors[`${pkg.id}-sessions`] && <span className="modal-error-msg">{errors[`${pkg.id}-sessions`]}</span>} */}
                  <label className="modal-label">
                      {pkg.type === "Monthly (days)" ? "Duration (months)" : 
                      pkg.type === "Yearly (months)" ? "Duration (years)" : 
                      "Number of Sessions"}
                    </label>
                    <input
                      className="modal-input"
                      type="number"
                      min="1"
                      placeholder={
                        pkg.type === "Monthly (days)"  ? "1"  :
                        pkg.type === "Yearly (months)" ? "1"  : "15"
                      }
                      value={pkg.sessions}
                      onChange={e => set(pkg.id, "sessions", e.target.value)}
                    />
                  
                  </div>
                </div>
              </div>
            ))
          )}

          <button className="rm-add-pkg-btn" onClick={addPackage}>
            <span>＋</span> Add Another Package
          </button>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="modal-btn modal-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save Package"}
            {!loading && <span className="modal-btn-arrow">→</span>}
          </button>
        </div>

      </div>
    </div>
  );
}