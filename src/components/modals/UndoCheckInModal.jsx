import "../../css/Modal.css";

export default function UndoCheckInModal({ member, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
      <div className="modal-accent-bar" />
         <div className="modal-header">
          <div className="modal-header-left">
            <h2 className="modal-title">Undo Check-in?</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <strong>Are you sure that{" "} {member.firstName} {member.lastName}{" "} is not on today's session?</strong>
             This will add 1 session back.
        </div>


        <div className="modal-footer">
          <button className="modal-btn modal-btn--ghost"  onClick={onClose}     disabled={loading}>Cancel</button>
          <button className="modal-btn modal-btn--danger" onClick={onConfirm}   disabled={loading}>
            {loading ? "Undoing…" : "Yes, Undo"}
          </button>
        </div>
      </div>
    </div>
  );
}