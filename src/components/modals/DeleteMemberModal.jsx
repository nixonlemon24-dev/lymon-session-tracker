import "../../css/Modal.css";

export default function DeleteMemberModal({ member, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="modal-accent-bar" />

        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-badge">DELETE</span>
            <h2 className="modal-title">Delete Member</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-member-id-label">{member.gymId}</div>


          <div className="modal-desc">
            Are you sure you want to remove{" "}
            <strong>{member.firstName} {member.lastName}</strong>?
            <br /> Important! This action cannot be undone.
          </div>
          <div className="modal-footer">
            <button className="modal-btn modal-btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="modal-btn modal-btn--primary" onClick={onConfirm} disabled={loading}>
              {loading ? "Removing…" : "Yes, Remove"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}