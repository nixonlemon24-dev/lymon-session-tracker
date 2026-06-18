import { useState } from "react";
import PackagesList       from "../components/PackagesList";
import AddNewPackageModal from "../components/modals/AddNewPackageModal";

export default function PackagesPage({ userEmail }) {
  const [showAddPackage, setShowAddPackage] = useState(false);

  return (
    <div className="content">
      <div className="panel rates-panel">
        <div className="panel-header">
          <div className="panel-title">Packages & Rates</div>
        </div>
        <PackagesList userEmail={userEmail} />
        <button className="add-rate-btn" onClick={() => setShowAddPackage(true)}>
          ＋ Add New Package
        </button>
        {showAddPackage && (
          <AddNewPackageModal onClose={() => setShowAddPackage(false)} userEmail={userEmail} />
        )}
      </div>
    </div>
  );
}