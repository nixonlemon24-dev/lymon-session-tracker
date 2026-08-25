import { useState, useEffect, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../css/Login.css";
import { IconEmail, IconLock, IconAlert } from "../components/Icons";
import Logo from "../css/images/Logo.png";

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

// Step 1: Enter email
// Step 2: Enter OTP
// Step 3: Enter new password
export default function ForgotPassword() {
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  const sendReset   = useAction(api.users.sendPasswordReset);
  const verifyReset = useMutation(api.users.verifyOTPAndReset);

  // Step 1 — Send OTP
  const handleSendReset = useCallback(async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      await sendReset({ email: email.trim().toLowerCase() });
      setStep(2);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, sendReset]);

  // Step 2+3 — Verify OTP & reset password
  const handleVerifyAndReset = useCallback(async () => {
    setError("");
    if (!otp.trim()) { setError("Please enter the code sent to your email."); return; }
    if (!newPassword) { setError("Please enter a new password."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const newPasswordHash = await hashPassword(newPassword);
      await verifyReset({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPasswordHash,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, otp, newPassword, verifyReset]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Enter") return;
      if (step === 1) handleSendReset();
      else handleVerifyAndReset();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [step, handleSendReset, handleVerifyAndReset]);

  if (success) {
    return (
      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-panel" style={{ textAlign: "center" }}>
            <h1>Password Reset! 🎉</h1>
            <p>Your password has been updated. You can now sign in.</p>
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

        {/* ── Form panel ── */}
        <div className="login-panel">

          {/* Error message */}
          <div className={`error-msg${error ? " show" : ""}`}>
            <IconAlert />
            <span>{error}</span>
          </div>

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <>
              <div className="login-header">
                <h1>Forgot Password</h1>
                <p>Enter your email and we'll send you a reset code</p>
              </div>

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

              <button
                className={`btn-login${loading ? " loading" : ""}`}
                type="button"
                disabled={loading}
                onClick={handleSendReset}
              >
                <span className="btn-label">Send reset code</span>
                <div className="spinner" />
              </button>

              <p className="login-footer-link">
                Remembered it? <a href="/login" className="link">Sign in</a>
              </p>
            </>
          )}

          {/* ── Step 2: OTP + New Password ── */}
          {step === 2 && (
            <>
              <div className="login-header">
                <h1>Enter Reset Code</h1>
                <p>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              <div className="form-group">
                <label htmlFor="otp">Reset code</label>
                <div className="input-wrap">
                  <input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New password</label>
                <div className="input-wrap">
                  <IconLock />
                  <input
                    id="new-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    className="toggle-pw"
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="field-hint">Minimum 8 characters</span>
              </div>

              <button
                className={`btn-login${loading ? " loading" : ""}`}
                type="button"
                disabled={loading}
                onClick={handleVerifyAndReset}
              >
                <span className="btn-label">Reset password</span>
                <div className="spinner" />
              </button>

              <p className="login-footer-link">
                Didn't get a code?{" "}
                <button className="link" style={{ background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => { setStep(1); setError(""); setOtp(""); }}>
                  Resend
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}