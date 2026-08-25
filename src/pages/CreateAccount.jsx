import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../css/Login.css";
import { IconEmail, IconLock, IconEyeOpen, IconEyeClosed, IconAlert} from "../components/Icons";
import Logo from "../css/images/Logo.png";

// Lightweight client-side hash (swap for bcrypt on a Node action for production)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export default function CreateAccount() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const createAccountMutation = useMutation(api.users.createAccount);

  const handleCreateAccount = useCallback(async () => {
    setError("");

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      await createAccountMutation({ email: email.trim().toLowerCase(), passwordHash });
      setSuccess(true);
      // TODO: redirect to dashboard or login
      // navigate("/dashboard");
    } catch (err) {
      const msg = err.message ?? "";
      if(msg.includes("An account with this email already exists")) {
        setError("An account with this email already exists.");
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  }, [email, password, createAccountMutation]);

  // Enter key support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Enter") handleCreateAccount();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleCreateAccount]);

  if (success) {
    return (
      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-panel" style={{ textAlign: "center" }}>
            <h1>Account Created! 🎉</h1>
            <p>Welcome to Session Tracker. You can now sign in.</p>
            <button className="btn-login" onClick={() => window.location.href = "/login"}>
              <span className="btn-label">Go to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="login-wrapper">
        {/* ── Brand panel ── */}
        <div className="brand-panel">
          <div className="logo-mark">
            <img src={Logo} alt="Session Tracker Logo" className="logo-img" />
            <div className="logo-container">
              <div className="logo-text">Session<br />Tracker</div>
              <div className="logo-sub">A Smart Assistant for Trainers &amp; Coaches</div>
            </div>
          </div>
          <div className="brand-stats">
            <div className="brand-tagline">
              Manage sessions,<br />track progress,<br />
              <span>grow your gym.</span>
            </div>
          </div>
          <div className="brand-footer">
            © 2026 Session Tracker. All rights reserved.
          </div>
        </div>

        {/* ── Login panel ── */}
        <div className="login-panel">
          <div className="login-header">
            <h1>Create Account</h1>
            <p>Sign up for your trainer dashboard</p>
          </div>

          {/* Error message */}
          <div className={`error-msg${error ? " show" : ""}`}>
            <IconAlert />
            <span>{error}</span>
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <IconEmail />
              <input
                id="email"
                type="email"
                placeholder="trainer@gymname.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <IconLock />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="toggle-pw"
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPw((prev) => !prev)}
              >
                {showPw ? <IconEyeClosed /> : <IconEyeOpen />}
              </button>
            </div>
            <span className="field-hint">Minimum 8 characters</span>
          </div>

          {/* Submit button */}
          <button
            className={`btn-login${loading ? " loading" : ""}`}
            type="button"
            disabled={loading}
            onClick={handleCreateAccount}
          >
            <span className="btn-label">Create account</span>
            <div className="spinner" />
          </button>

          <p className="login-footer-link">
            Already have an account? <a href="/">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}