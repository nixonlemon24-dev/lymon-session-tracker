import { useState, useEffect, useCallback } from "react";
import { useMutation  } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../css/Login.css";
import { IconEmail, IconLock, IconEyeOpen, IconEyeClosed, IconAlert, IconGoogle } from '../components/Icons';
import Logo from "../css/images/Logo.png";
import { Link } from "react-router-dom";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";


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


export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { isAuthenticated } = useConvexAuth();

  const loginUser = useMutation(api.users.loginUser);
  const { signIn } = useAuthActions();
  const handleLogin = useCallback(async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      const result = await loginUser({
        email: email.trim().toLowerCase(),
        passwordHash,
      });

      // Save session
      if (remember) {
          localStorage.setItem("sessionToken", result.token);
      } else {
        sessionStorage.setItem("sessionToken", result.token);
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = err.message ?? "";

      if(msg.includes("No account found with this email")) {
        setError("No account found with this email address.");
      } else if (msg.includes("Invalid email or password")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(err.message ?? "Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  }, [email, password, remember, loginUser]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Enter") handleLogin();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleLogin]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn("google");
    } catch (err) {
      setError(err.message ?? "Google sign-in failed. Please try again.");
    }
  }, [signIn]);

    // const handleGoogleSignIn = useCallback(async () => {
    //   try {
    //     sessionStorage.setItem("oauth_redirect_pending", "1");
    //     await signIn("google");
    //   } catch (err) {
    //     sessionStorage.removeItem("oauth_redirect_pending");
    //     setError(err.message ?? "Google sign-in failed. Please try again.");
    //   }
    // }, [signIn]);

    // useEffect(() => {
    //   const pending = sessionStorage.getItem("oauth_redirect_pending");
    //   if (!pending || !isAuthenticated) return;
    //   // No sessionToken bridging needed — Dashboard reads Google users
    //   // directly via the reactive currentUser query (Convex Auth identity).
    //   sessionStorage.removeItem("oauth_redirect_pending");
    //   window.location.href = "/dashboard";
    // }, [isAuthenticated]);
  
  return (
    <div className="login-page">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="login-wrapper">

        {/* ── Brand panel ── */}
        <div className="brand-panel">
          <div className="logo-mark">
            <img src={Logo} alt="Session Tracker Logo" className="logo-img" />
            <div className="logo-container">
              <div className="logo-text"> Session<br/>Tracker</div>
              <div className="logo-sub">A Smart Assistant for Trainers &amp; Coaches</div>
            </div>
          </div>

          <div className="brand-stats">
            <div className="brand-tagline">
              Record Sessions,<br />Monitor Clients,<br />
              <span>Track Smarter.</span>
            </div>
            <div className="stat-row">
            </div>
          </div>

          <div className="brand-footer">
            © 2026 Session Tracker. All rights reserved.
          </div>
        </div>

        {/* ── Login panel ── */}
        <div className="login-panel">

          <div className="login-header">
            <h1>Welcome back!!</h1>
            <p>Sign in to your trainer dashboard</p>
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
                placeholder="your-email@gmail.com"
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
                autoComplete="current-password"
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
          </div>

          {/* Remember / Forgot */}
          <div className="row-between">
            <label className="check-wrap">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
             <Link to="/forgot-password" className="link">Forgot password?</Link>
          </div>

          {/* Sign in button */}
          <button
            className={`btn-login${loading ? " loading" : ""}`}
            type="button"
            disabled={loading}
            onClick={handleLogin}
          >
            <span className="btn-label">Sign In</span>
            <div className="spinner" />
          </button>

          {/* Divider */}
          <div className="divider">or continue with</div>

          {/* Google button */}
          <button className="btn-ghost" type="button" onClick={handleGoogleSignIn}>
            <IconGoogle /> Sign in with Google
          </button>
          
          {/* Footer */}
          <div className="login-footer">
            New to Session Tracker?{" "}
            <Link to="/create-account" className="link">Create account</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
