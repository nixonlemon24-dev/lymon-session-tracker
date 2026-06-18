import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import MembersTable   from "../components/MembersTable";
import AddMemberModal from "../components/modals/AddMemberModal";

const FREE_MEMBER_LIMIT = 10;

export default function MembersPage({ userEmail }) {
  const members  = useQuery(api.members.getMembers,    userEmail ? { userEmail } : "skip") ?? [];
  const user     = useQuery(api.users.getUserByEmail,  userEmail ? { email: userEmail } : "skip");

  const [activeFilter,  setActiveFilter]  = useState("All");
  const [showAddMember, setShowAddMember] = useState(false);

  const isPro      = user?.plan === "pro" || user?.plan === "business";
  const atLimit    = !isPro && members.length >= FREE_MEMBER_LIMIT;

  const filteredMembers = members.filter(m => {
    if (activeFilter === "All")      return true;
    if (activeFilter === "Active")   return m.status === "active";
    if (activeFilter === "Expiring") return m.status === "expiring";
    if (activeFilter === "Expired")  return m.status === "expired";
    return true;
  });

  return (
    <div className="content">

      {/* Free plan limit banner */}
      {!isPro && (
        <div className="plan-limit-banner">
          <span>
            {atLimit
              ? `⚠️ You've reached the ${FREE_MEMBER_LIMIT}-member limit on the Free plan.`
              : `Free plan: ${members.length} / ${FREE_MEMBER_LIMIT} members used.`}
          </span>
          <button className="btn btn-primary plan-limit-upgrade">
            Upgrade to Pro
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Members</div>
          <div className="filter-tabs">
            {["All", "Active", "Expiring", "Expired"].map(tab => (
              <div
                key={tab}
                className={`filter-tab ${activeFilter === tab ? "active" : ""}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddMember(true)}
            disabled={atLimit}
            title={atLimit ? "Upgrade to Pro to add more members" : ""}
          >
            + Add Member
          </button>
          {showAddMember && (
            <AddMemberModal onClose={() => setShowAddMember(false)} userEmail={userEmail} />
          )}
        </div>

        <table className="members-table">
          <MembersTable members={filteredMembers} userEmail={userEmail} />
        </table>
      </div>
    </div>
  );
}