import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "../../css/Modal.css";

const FREE_MEMBER_LIMIT = 10;

export default function AddMemberModal({ onClose, userEmail }) {
  const packagesData = useQuery(api.packages.getPackages, userEmail ? { userEmail } : "skip") ?? [];
  const user         = useQuery(api.users.getUserByEmail,  userEmail ? { email: userEmail } : "skip");
  const memberCount  = useQuery(api.members.getMemberCount, userEmail ? { userEmail } : "skip") ?? 0;

  const isPro   = user?.plan === "pro" || user?.plan === "business";
  const atLimit = !isPro && memberCount >= FREE_MEMBER_LIMIT;

  const PACKAGES = packagesData.map(pkg => ({
    _id:          pkg._id,
    icon:         pkg.type === "Monthly (days)" ? "📅" : pkg.sessions === 15 ? "🔄" : "⚡",
    name:         pkg.packageName,
    price:        `₱${pkg.price.toLocaleString()}`,
    priceNum:     pkg.price,
    sessions:     pkg.sessions,
    sessionsLeft: pkg?.sessions ?? 0,
  }));

  const addMember = useMutation(api.members.addMember);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    userEmail:   userEmail || "",
    firstName:   "",
    lastName:    "",
    phone:       "",
    email:       "",
    package:     "",
    startDate:   new Date().toISOString().split("T")[0],
    sendWelcome: true,
  });

  const updateField = (fieldName, newValue) => {
    setForm(curr => ({ ...curr, [fieldName]: newValue }));
    setErrors(curr => ({ ...curr, [fieldName]: undefined }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    if (!form.package.trim())   e.package   = "Required";
    return e;
  };

  const handleSubmit = async () => {
    if (atLimit) {
      setApiError(`Free plan limit reached (${FREE_MEMBER_LIMIT} members). Upgrade to Pro to add more.`);
      return;
    }

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const pkg = PACKAGES.find(p => p.name === form.package);

    setLoading(true);
    setApiError("");
    try {
      await addMember({
        userEmail:    form.userEmail,
        firstName:    form.firstName.trim(),
        lastName:     form.lastName.trim(),
        phone:        form.phone.trim(),
        email:        form.email.trim() || undefined,
        package:      form.package,
        price:        pkg?.priceNum ?? 0,
        startDate:    form.startDate,
        sessionsLeft: pkg?.sessions ?? 0,
      });
      onClose();
    } catch (err) {
      setApiError(err.message ?? "Something went wrong. Please try again.");
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
            <span className="modal-badge">NEW</span>
            <h2 className="modal-title">Add Member</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">

          {/* Plan limit warning */}
          {!isPro && (
            <div className={`modal-plan-banner ${atLimit ? "modal-plan-banner--danger" : ""}`}>
              {atLimit
                ? `⚠️ Free plan limit reached (${FREE_MEMBER_LIMIT}/${FREE_MEMBER_LIMIT}). Upgrade to Pro to add more members.`
                : `Free plan: ${memberCount} / ${FREE_MEMBER_LIMIT} members used.`}
            </div>
          )}

          {/* API error */}
          {apiError && <div className="modal-api-error">{apiError}</div>}

          <div className="modal-row">
            <div className={`modal-field ${errors.firstName ? "modal-field--error" : ""}`}>
              <label className="modal-label">First Name</label>
              <input className="modal-input" placeholder="Juan" value={form.firstName} onChange={e => updateField("firstName", e.target.value)} />
              {errors.firstName && <span className="modal-error-msg">{errors.firstName}</span>}
            </div>
            <div className={`modal-field ${errors.lastName ? "modal-field--error" : ""}`}>
              <label className="modal-label">Last Name</label>
              <input className="modal-input" placeholder="Dela Cruz" value={form.lastName} onChange={e => updateField("lastName", e.target.value)} />
              {errors.lastName && <span className="modal-error-msg">{errors.lastName}</span>}
            </div>
          </div>

          <div className="modal-row">
            <div className={`modal-field ${errors.phone ? "modal-field--error" : ""}`}>
              <label className="modal-label">Phone Number</label>
              <input className="modal-input" placeholder="09XX XXX XXXX" value={form.phone} onChange={e => updateField("phone", e.target.value)} />
              {errors.phone && <span className="modal-error-msg">{errors.phone}</span>}
            </div>
            <div className={`modal-field ${errors.email ? "modal-field--error" : ""}`}>
              <label className="modal-label">Email <span className="modal-optional">(optional)</span></label>
              <input className="modal-input" type="email" placeholder="juan@email.com" value={form.email} onChange={e => updateField("email", e.target.value)} />
              {errors.email && <span className="modal-error-msg">{errors.email}</span>}
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Start Date</label>
              <input className="modal-input" type="date" value={form.startDate} onChange={e => updateField("startDate", e.target.value)} />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Select Package</label>
            <div className={`modal-pkg-grid ${errors.package ? "modal-field--error" : ""}`}>
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.name}
                  className={`modal-pkg ${form.package === pkg.name ? "modal-pkg--active" : ""}`}
                  onClick={() => updateField("package", pkg.name)}
                  type="button"
                  disabled={atLimit}
                >
                  <span className="modal-pkg-icon">{pkg.icon}</span>
                  <span className="modal-pkg-name">{pkg.name}</span>
                  <span className="modal-pkg-price">{pkg.price}</span>
                  {form.package === pkg.name && <span className="modal-pkg-check">✓</span>}
                </button>
              ))}
            </div>
            {errors.package && <span className="modal-error-msg">Please select a package</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="modal-btn modal-btn--primary"
            onClick={handleSubmit}
            disabled={loading || atLimit}
            title={atLimit ? "Upgrade to Pro to add more members" : ""}
          >
            {loading ? "Saving…" : "Save Member"}
            {!loading && <span className="modal-btn-arrow">→</span>}
          </button>
        </div>

      </div>
    </div>
  );
}