import { useState, useEffect } from "react";
import Logo from "../css/images/Logo.png";
import { Link } from "react-router-dom";
import "../css/Funnel.css";
export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Prevent background scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="site-nav">
     <div className="nav-inner">
        <div className="nav-brand">
          <div className="nav-logo">
            <Link to="/"><img src={Logo} alt="Session Tracker Logo" className="logo-img" /></Link>
          </div>
          <div className="brand-name">
            <div className="logo-text"> Session<br/>Tracker</div>
            <div className="logo-sub">A Smart Assistant for Trainers &amp; Coaches</div>
          </div>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="nav-cta nav-cta-desktop">
          <Link to="/login" className="link">Sign in</Link>
          <Link to="/create-account" className="btn btn-lime">Start free trial</Link>
        </div>

        {/* Hamburger menu button for mobile */}
        <button
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Full-screen mobile overlay menu */}
      <div className={`nav-overlay ${menuOpen ? "open" : ""}`}>
        <div className="nav-overlay-header">
          <div className="nav-brand">
            <div className="nav-logo">
              <img src={Logo} alt="Session Tracker Logo" className="logo-img" />
            </div>
            <div className="brand-name">
              <div className="logo-text"> Session<br/>Tracker</div>
              <div className="logo-sub">A Smart Assistant for Trainers &amp; Coaches</div>
            </div>
          </div>
        </div>

        <div className="nav-overlay-links">
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how" onClick={closeMenu}>How it works</a>
          <a href="#pricing" onClick={closeMenu}>Pricing</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
        </div>

        <div className="nav-overlay-cta">
          <Link to="/login" className="link" onClick={closeMenu}>Sign in</Link>
          <Link to="/create-account" className="btn btn-lime" onClick={closeMenu}>Start free trial</Link>
        </div>
      </div>
    </nav>
  );
}