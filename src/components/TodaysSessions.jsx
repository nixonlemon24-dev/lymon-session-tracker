import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import UndoCheckInModal from "./modals/UndoCheckInModal";
import CheckInModal     from "./modals/CheckInModal";
import "../css/App.css";

const PAGE_SIZE = 5;

export default function TodaysSessions({ userEmail }) {
  const members     = useQuery(api.members.getMembers,   userEmail ? { userEmail } : "skip") ?? [];
  const packages    = useQuery(api.packages.getPackages, userEmail ? { userEmail } : "skip") ?? [];
  const checkIn     = useMutation(api.members.checkInMember);
  const undoCheckIn = useMutation(api.members.undoCheckIn);

  const [confirmUndo,    setConfirmUndo]    = useState(null);
  const [confirmCheckIn, setConfirmCheckIn] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [search,         setSearch]         = useState("");
  const [page,           setPage]           = useState(1);

  const today      = new Date().toISOString().split("T")[0];
  const todayLabel = new Date().toLocaleDateString("en-PH", {
    month: "long", day: "numeric", year: "numeric"
  });

  const sessionPkgNames = new Set(packages.filter(p => p.type === "Session-based").map(p => p.packageName));
  const active = members.filter(m =>sessionPkgNames.has(m.package) && (m.sessionsLeft > 0 || m.lastCheckIn === today));

  const filtered = active.filter(m => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.package?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, members.length]);

  const handleClickCheckIn = (member) => {
    if (member.lastCheckIn === today) {
      setConfirmUndo(member);
    } else {
      setConfirmCheckIn(member);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn({ id: confirmCheckIn._id });
      setConfirmCheckIn(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      await undoCheckIn({ id: confirmUndo._id });
      setConfirmUndo(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {confirmCheckIn && (
        <CheckInModal
          member={confirmCheckIn}
          onClose={() => setConfirmCheckIn(null)}
          onConfirm={handleCheckIn}
          loading={loading}
        />
      )}

      {confirmUndo && (
        <UndoCheckInModal
          member={confirmUndo}
          onClose={() => setConfirmUndo(null)}
          onConfirm={handleUndo}
          loading={loading}
        />
      )}

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Today's Sessions</div>
            <div className="panel-desc">Session-based members only</div>
          </div>
          <div className="sessions-date-label">{todayLabel}</div>
        </div>

        <div className="sessions-search-wrap">
          <input
            className="members-search"
            type="text"
            placeholder="Search by name or package…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {paginated.length === 0 ? (
          <div className="empty-state">
            {search ? `No members found for "${search}"` : "No active members with sessions today."}
          </div>
        ) : (
          paginated.map(member => {
            const checkedInToday = member.lastCheckIn === today;
            return (
              <div key={member._id} className="session-item">
                <div className="session-member">
                  <div className="session-name">{member.firstName} {member.lastName}</div>
                  <div className="session-pkg">
                    {member.package} • {member.sessionsLeft} left
                    {checkedInToday && (
                      <span className="checked-in-badge">✓ Checked in</span>
                    )}
                  </div>
                </div>
                <div
                  className={`check-btn ${checkedInToday ? "check-btn--done" : ""}`}
                  title={checkedInToday ? "Click to undo check-in" : "Mark as attended"}
                  onClick={() => handleClickCheckIn(member)}
                >
                  {checkedInToday ? "↩" : "✓"}
                </div>
              </div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${page === p ? "page-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            <span className="page-info">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          </div>
        )}
      </div>
    </>
  );
}