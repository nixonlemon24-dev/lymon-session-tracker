import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import "../../css/Modal.css";

export default function EditMemberModal({ member, onClose, onSave, loading }) {
  const packagesData = useQuery(api.packages.getPackages, member?.userEmail ? { userEmail: member.userEmail } : "skip") ?? [];

  const PACKAGES = packagesData.map(pkg => ({
    name:  pkg.packageName,
    icon:  pkg.type === "Monthly (days)" ? "📅" : pkg.type === "Yearly (months)" ? "🗓️" : "⚡",
    price: `₱${pkg.price.toLocaleString()}`,
    sessions: pkg.sessions,
  }));

  const [form,   setForm]   = useState({
    firstName: member.firstName,
    lastName:  member.lastName,
    phone:     member.phone,
    email:     member.email ?? "",
    package:   member.package,
    sessionsLeft:   member.sessions,
    startDate: member.startDate,
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    else if (!/^09\d{9}$/.test(form.phone.trim())) e.phone = "Enter a valid PH number";
    if (!form.package)          e.package   = "Please select a package";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="modal-accent-bar" />

        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-badge">EDIT</span>
            <h2 className="modal-title">Edit Member</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">

          <div className="modal-member-id-label">{member.gymId}</div>

          <div className="modal-row">
            <div className={`modal-field ${errors.firstName ? "modal-field--error" : ""}`}>
              <label className="modal-label">First Name</label>
              <input className="modal-input" value={form.firstName} onChange={e => updateField("firstName", e.target.value)} />
              {errors.firstName && <span className="modal-error-msg">{errors.firstName}</span>}
            </div>
            <div className={`modal-field ${errors.lastName ? "modal-field--error" : ""}`}>
              <label className="modal-label">Last Name</label>
              <input className="modal-input" value={form.lastName} onChange={e => updateField("lastName", e.target.value)} />
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
              <input className="modal-input" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} />
              {errors.email && <span className="modal-error-msg">{errors.email}</span>}
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Start Date</label>
              <input className="modal-input" type="date" value={form.startDate} onChange={e => updateField("startDate", e.target.value)} />
            </div>
          </div>

          <div className={`modal-field ${errors.package ? "modal-field--error" : ""}`}>
            <label className="modal-label">Select Package</label>
            <div className="modal-pkg-grid">
              {PACKAGES.map(p => (
                <button
                  key={p.name}
                  className={`modal-pkg ${form.package === p.name ? "modal-pkg--active" : ""}`}
                  onClick={() => updateField("package", p.name)}
                  type="button"
                >
                  <span className="modal-pkg-icon">{p.icon}</span>
                  <span className="modal-pkg-name">{p.name}</span>
                  <span className="modal-pkg-price">{p.price}</span>
                  {form.package === p.name && <span className="modal-pkg-check">✓</span>}
                </button>
              ))}
            </div>
            {errors.package && <span className="modal-error-msg">{errors.package}</span>}
          </div>

        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="modal-btn modal-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save Changes"}
            {!loading && <span className="modal-btn-arrow">→</span>}
          </button>
        </div>

      </div>
    </div>
  );
}