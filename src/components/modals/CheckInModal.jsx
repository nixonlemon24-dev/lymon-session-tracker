import "../../css/Modal.css";

export default function CheckInModal({ member, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

         <div className="modal-accent-bar" />

        <div className="modal-header">
          <div className="modal-header-left">
            {/* <span className="modal-badge">✅</span> */}
            <h2 className="modal-title">Confirm Check-in?</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <strong>{member.firstName} {member.lastName}{" "}as attended for today's session? </strong>
          <span style={{ fontSize: "12px" }}>{member.sessionsLeft} session{member.sessionsLeft === 1 ? "" : "s"} remaining. </span>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost"   onClick={onClose}   disabled={loading}>Cancel</button>
          <button className="modal-btn modal-btn--primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Checking in…" : "Yes, Check In"}
          </button>
        </div>
        
      </div>
    </div>
  );
}