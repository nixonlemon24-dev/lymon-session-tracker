import { useMutation, useQuery  }   from "convex/react";
import { api }           from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import DeleteMemberModal from "./modals/DeleteMemberModal";
import EditMemberModal   from "./modals/EditMemberModal";

const PAGE_SIZE = 5;

export default function MembersTable({ members, userEmail }) {
  const deleteMember = useMutation(api.members.deleteMember);
  const updateMember = useMutation(api.members.updateMember);
  const user = useQuery(api.users.getUserByEmail,  userEmail ? { email: userEmail } : "skip");

  const [confirmMember, setConfirmMember] = useState(null);
  const [editMember,    setEditMember]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [error, setError]       = useState("");
  // filter by name, phone, package, or gymId
  const filtered = members.filter(m => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q)                        ||
      m.package?.toLowerCase().includes(q)                      ||
      m.gymId?.toLowerCase().includes(q)
    );
  });


  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [members.length, search]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMember({ id: confirmMember._id });
      setConfirmMember(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (form) => {
    setLoading(true);
    try {
      await updateMember({
        id:        editMember._id,
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim(),
        email:     form.email.trim() || undefined,
        package:   form.package,
        sessionsLeft:   form.sessionsLeft,
        startDate: form.startDate,
      });
      setEditMember(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {confirmMember && (
        <DeleteMemberModal
          member={confirmMember}
          onClose={() => setConfirmMember(null)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}

      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={handleSaveEdit}
          loading={loading}
        />
      )}

      {/* ── Search ── */}
      <thead>
        <tr>
          <td colSpan={5} style={{ paddingBottom: "12px" }}>
            <input
              className="members-search"
              type="text"
              placeholder="Search by name, phone, package, or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </td>
        </tr>
        <tr>
          <th>Member</th>
          <th>Package</th>
          <th>Sessions</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {paginated.length === 0 ? (
          <tr>
            <td colSpan={5} className="center-message">
              {search ? `No members found for "${search}"` : "No members yet. Add your first member!"}
            </td>
          </tr>
        ) : (
          paginated.map((member, index) => {
            const isTimeBased  = !!member.endDate;
            const total        = isTimeBased ? 30 : (member.sessionsLeft ?? 30);
            const barWidth     = isTimeBased
              ? Math.min((member.sessionsLeft / 30) * 100, 100)
              : Math.min((member.sessionsLeft / total) * 100, 100);
            const barColor     = barWidth > 50 ? "green" : barWidth > 20 ? "orange" : "red";
            const sessionLabel = isTimeBased
              ? `${member.sessionsLeft} day${member.sessionsLeft === 1 ? "" : "s"} left`
              : `${member.sessionsLeft} session${member.sessionsLeft === 1 ? "" : "s"} left`;
            const statusClass  =
              member.status === "active"   ? "status-active"   :
              member.status === "expiring" ? "status-expiring" : "status-expired";
            const memberId = member.gymId ?? `#GYM-${String((page - 1) * PAGE_SIZE + index + 1).padStart(4, "0")}`;

            return (
              <tr key={member._id}>
                <td>
                  <div className="member-info">
                    <div className="member-name">{member.firstName} {member.lastName}</div>
                    <div className="member-id">{memberId}</div>
                    <div className="member-phone">{member.phone}</div>
                  </div>
                </td>
                <td><span className="package-badge pkg-monthly">{member.package}</span></td>
                <td>
                  <div className="session-bar">
                    <div className="bar-track">
                      <div className={`bar-fill ${barColor}`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <div className="bar-label">{sessionLabel}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill ${statusClass}`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setEditMember(member)}    className="action-btn edit-btn"   title="Edit member">✏️</button>
                    <button onClick={() => setConfirmMember(member)} className="action-btn delete-btn" title="Delete member">🗑️</button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <tfoot>
          <tr>
            <td colSpan={5}>
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? "page-btn--active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>

                <span className="page-info">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </>
  );
}