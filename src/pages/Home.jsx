//NPM useRef, useCallback, useMemo
import { useState,  useEffect } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


//Components
import Logo from "../css/images/Logo.png";
import AddMemberModal from "../components/modals/AddMemberModal";
import AddNewPackageModal from "../components/modals/AddNewPackageModal";
import { IconUser, IconDashboard, IconMembers, IconSessions, IconPackages} from "../components/Icons";
import MembersTable from "../components/MembersTable";
import PackagesList from "../components/PackagesList";
import TodaysSessions from "../components/TodaysSessions";
import AlertsPanel from "../components/AlertsPanel";
import MembersPage  from "../pages/Members";
import SessionsPage from "../pages/Sessions";
import PackagesPage from "../pages/Packages";
import PricingPage from "../pages/Pricing";

export default function Home() {
  // Query states
  // const [userEmail, setUserEmail] = useState('');
  // const [members, setMembers] = useState([]);
  // const [status, setStatus] = useState([]);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [activeFilter,   setActiveFilter]   = useState("All");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  //Session 
  const token =localStorage.getItem("sessionToken") || sessionStorage.getItem("sessionToken");

  // Redirect if no token
  useEffect(() => {if (!token) window.location.href = "/"; }, [token]);



  // Get session from Convex (reactive)
  const session = useQuery(api.users.getSession, token ? { token } : "skip");
  const userEmail = session?.email ?? "";
  const members = useQuery(api.members.getMembers,userEmail ? { userEmail } : "skip") ?? [];

  //Total members
  const memberCount = useQuery(api.members.getMemberCount, userEmail ? { userEmail } : "skip") ?? 0;
  const expiringSoon  = useQuery(api.members.getExpiringSoonCount, userEmail ? { userEmail } : "skip") ?? 0;
  const monthlyRevenue = useQuery(api.members.getMonthlyRevenue,   userEmail ? { userEmail } : "skip") ?? 0;
  const totalRevenue   = useQuery(api.members.getTotalRevenue,     userEmail ? { userEmail } : "skip") ?? 0;
  const statsChanges = useQuery(api.members.getStatsChanges, userEmail ? { userEmail } : "skip");


  const filteredMembers = members.filter(m => {
    if (activeFilter === "All")      return true;
    if (activeFilter === "Active")   return m.status === "active";
    if (activeFilter === "Expiring") return m.status === "expiring";
    if (activeFilter === "Expired")  return m.status === "expired";
    return true;
  });

  const memberChangeLabel = statsChanges
    ? statsChanges.newThisMonth === 0
      ? "No new members this month"
      : `↑ ${statsChanges.newThisMonth} new this month`
    : "—";

  const revenueChangeLabel = statsChanges?.revenuePct == null
    ? "No data last month"
    : statsChanges.revenuePct === 0
    ? "Same as last month"
    : statsChanges.revenuePct > 0
    ? `↑ ${statsChanges.revenuePct}% vs last mo.`
    : `↓ ${Math.abs(statsChanges.revenuePct)}% vs last mo.`;

  const revenueChangeClass = statsChanges?.revenuePct == null || statsChanges?.revenuePct === 0
    ? ""
    : statsChanges.revenuePct > 0 ? "up" : "down";


const formatRevenue = (amount) =>
  amount >= 1000 ? `$${(amount / 1000).toFixed(0)}K` : `$${amount.toLocaleString()}`;

  return (
    <div>
      <aside className="sidebar">
        <div className="logo">
             <img src={Logo} alt="Session Tracker Logo" className="logo-img" />
          <div className="logo-mark">Session Tracker</div> —
          <div className="logo-sub">A smart assistant for trainers/coaches to manage sessions, client progress, and package tracking</div>
        </div>

     <nav className="nav">
          <div className="nav-label">Menu</div>
          {[
            { icon: <IconDashboard />, label: "Dashboard"      },
            { icon: <IconMembers />,   label: "Members"        },
            { icon: <IconSessions />,  label: "Sessions"       },
            { icon: <IconPackages />,  label: "Packages & Rates" },
            { icon: <IconPackages />,  label: "Pricing" }
          ].map(({ icon, label }) => (
            <div
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => { setActivePage(label); setSidebarOpen(false); }}
            >
              <span className="nav-icon">{icon}</span> {label}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main">
      <div className="content">
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="page-title">{activePage}</div>
        </header>

        {activePage === "Dashboard"       && (
          <div className="content">
            {/* stats grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Members</div>
                <div className="stat-value">{memberCount}</div>
                <div className={`stat-change ${statsChanges?.newThisMonth > 0 ? "up" : ""}`}>{memberChangeLabel}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Expiring Soon</div>
                <div className="stat-value">{expiringSoon}</div>
                <div className={`stat-change ${expiringSoon > 0 ? "down" : "up"}`}>{expiringSoon > 0 ? "Needs renewal" : "All good"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Monthly Revenue</div>
                <div className="stat-value">{formatRevenue(monthlyRevenue)}</div>
                <div className={`stat-change ${revenueChangeClass}`}>{revenueChangeLabel}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{formatRevenue(totalRevenue)}</div>
                <div className="stat-change up">All time earnings</div>
              </div>
            </div>

            <div className="two-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Members</div>
                  <div className="filter-tabs">
                    {["All", "Active", "Expiring", "Expired"].map(tab => (
                      <div key={tab} className={`filter-tab ${activeFilter === tab ? "active" : ""}`} onClick={() => setActiveFilter(tab)}>{tab}</div>
                    ))}
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowAddMember(true)}>+ Add Member</button>
                  {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} userEmail={userEmail} />}
                </div>
                <table className="members-table">
                  <MembersTable members={filteredMembers} userEmail={userEmail} />
                </table>
              </div>
              <div className="panel rates-panel">
                <div className="panel-header">
                  <div className="panel-title">Packages & Rates</div>
                </div>
                <PackagesList userEmail={userEmail} />
                <button className="add-rate-btn" onClick={() => setShowAddPackage(true)}>＋ Add New Package</button>
                {showAddPackage && <AddNewPackageModal onClose={() => setShowAddPackage(false)} userEmail={userEmail} />}
              </div>
            </div>

            <div className="sessions-row">
              <TodaysSessions userEmail={userEmail} />
              <AlertsPanel    userEmail={userEmail} />
            </div>
          </div>
        )}

        {activePage === "Members"         && <MembersPage  userEmail={userEmail} />}
        {activePage === "Sessions"        && <SessionsPage userEmail={userEmail} />}
        {activePage === "Packages & Rates" && <PackagesPage userEmail={userEmail} />}
        {activePage === "Pricing" && <PricingPage userEmail={userEmail} />}

        
      </div>
  
      </main>



    {/* Mobile Responsive */}
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
    <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
      {/* Logo */}
      <div className="logo">
        <img src={Logo} alt="Session Tracker Logo" className="logo-img" />
        <div className="logo-mark">Session Tracker</div>
        <div className="logo-sub">A smart assistant for trainers/coaches to manage sessions, client progress, and package tracking</div>
      </div>

      {/* User pill */}
      <div className="sb-user">
        <div className="sb-avatar">
          <IconUser />
        </div>
        <span className="sb-email">{userEmail}</span>
      </div>
      
      {/* Nav */}
      <nav className="nav">
        <div className="nav-label">Menu</div>
            {[
                { icon: <IconDashboard />, label: "Dashboard"      },
                { icon: <IconMembers />,   label: "Members"        },
                { icon: <IconSessions />,  label: "Sessions"       },
                { icon: <IconPackages />,  label: "Packages & Rates" },
                { icon: <IconPackages />,  label: "Pricing" }

              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className={`nav-item ${activePage === label ? "active" : ""}`}
                  onClick={() => { setActivePage(label); setSidebarOpen(false); }}
                >
                  <span className="nav-icon">{icon}</span> {label}
                </div>
              ))}
      </nav>

          {/* Footer */}
          <div className="sb-footer">
            <button
              className="btn-logout"
              onClick={() => {
                localStorage.removeItem("userId");
                localStorage.removeItem("userEmail");
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("userEmail");
                window.location.href = "/";
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /> <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
    </aside>
    </div>
</div>
  );
}
