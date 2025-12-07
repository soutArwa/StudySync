import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import React, { useState, useMemo, useRef } from "react";
import { registerUser } from "../Services/Authentication_email.service";
import { Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Global from "../components/global";

export default function Register() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const passRef = useRef(null);
  const confirmRef = useRef(null);

 
  const analysis = useMemo(() => analyzePasswordSimple(pass), [pass]);

  const confirmMismatch = useMemo(
    () => confirm.length > 0 && pass !== confirm,
    [pass, confirm]
  );

  const validate = () => {
    const e = {};
    if (!first.trim()) e.first = "First name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Enter a valid email address.";
    if (!pass) e.pass = "Password is required.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (pass !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMsg("");
    if (!validate()) return;
    setLoading(true);
    try {
      const fullName = `${first.trim()}${last.trim() ? " " + last.trim() : ""}`;
      const res = await registerUser(fullName, email.trim(), pass);
      setMsg(res?.message || "Verification email sent.");
      setFirst(""); setLast(""); setEmail(""); setPass(""); setConfirm("");
      setErrors({});
    } catch (err) {
      setMsg(err?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    try {
      if (!auth.currentUser) {
        setMsg("Please sign in first, then try again.");
        return;
      }
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + "/",
        handleCodeInApp: false,
      });
      setMsg("Verification email sent again. Check your inbox/spam.");
    } catch (e) {
      setMsg(e?.message || "Failed to resend verification email.");
    }
  }

  const btnDisabled =
    loading || !first.trim() || !email.trim() || !pass || !confirm || confirmMismatch;

 
  const FIELD_H = 48;
  const baseField = {
    height: FIELD_H,
    borderRadius: 12,
    border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
    background: "var(--glass, rgba(255,255,255,0.06))",
    color: "var(--text-primary, #e6eaf3)",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  };
  const textInputStyle = {
    ...baseField,
    padding: "0 14px",
    outline: "none",
  };

  // fixed: flush eye icon — no inner rounding
  const pwGroupStyle = (customBorder) => ({
    ...baseField,
    ...(customBorder ? { border: customBorder } : {}),
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 12,
    paddingRight: 0,
  });
  const pwInputStyle = {
    flex: 1,
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text-primary, #e6eaf3)",
    padding: "0 14px",
    fontSize: 14,
    borderRadius: 0,
  };
  const eyeBtnStyle = {
    width: 44,
    height: "100%",
    display: "grid",
    placeItems: "center",
    border: "none",
    borderLeft: "1px solid var(--border-color, rgba(255,255,255,0.08))",
    background: "transparent",
    cursor: "pointer",
    color: "var(--text-muted, #93a0b4)",
    borderRadius: 0,
  };

 
  const confirmBorder =
    confirm.length === 0
      ? "1px solid var(--border-color, rgba(255,255,255,0.08))"
      : confirmMismatch
      ? "1px solid var(--danger, #ff6b6b)"
      : "1px solid var(--success, #34d399)";

  const errorText = (t) => (
    <span style={{ color: "var(--danger, #ff6b6b)", fontSize: 12, marginTop: 6, display: "block" }}>
      {t}
    </span>
  );

  const primaryBtnStyle = {
    height: 46,
    borderRadius: 12,
    border: "none",
    cursor: btnDisabled ? "not-allowed" : "pointer",
    background:
      "linear-gradient(135deg, var(--brand-violet, #7c5cff) 0%, var(--brand-violet-light, #9d7fff) 100%)",
    color: "var(--white, #ffffff)",
    fontWeight: 600,
    width: "100%",
    boxShadow:
      "var(--button-shadow, 0 4px 12px rgba(124, 92, 255, 0.4), 0 2px 4px rgba(0,0,0,0.2))",
  };

  // CapsLock detection
  const handleKeyDown = (e) => setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  const handleKeyUp = (e) => setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));

 
  const strengthColor =
    analysis.score === 1
      ? "var(--danger, #ff6b6b)"
      : analysis.score === 2
      ? "var(--warning, #f59e0b)"
      : "var(--success, #34d399)";

  return (
    <Global>
      <div style={{ color: "var(--text-primary, #e6eaf3)" }}>
        <h2>Create an Account</h2>
        <p style={{ color: "var(--text-muted, #93a0b4)" }}>Please fill in your details</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="First Name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            required
            style={textInputStyle}
          />
          {errors.first && errorText(errors.first)}
        </div>

        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Last Name (optional)"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            style={textInputStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={textInputStyle}
            autoComplete="email"
          />
          {errors.email && errorText(errors.email)}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <div style={pwGroupStyle()}>
            <input
              ref={passRef}
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              required
              style={pwInputStyle}
              autoComplete="new-password"
            />
            <button
              type="button"
              aria-label={showPass ? "Hide password" : "Show password"}
              aria-pressed={showPass}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowPass((v) => !v);
                requestAnimationFrame(() => passRef.current?.focus());
              }}
              style={eyeBtnStyle}
              title={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
          </div>

          {/* Caps Lock warning */}
          {capsLockOn && (
            <div style={{ color: "var(--warning, #f59e0b)", fontSize: 12, marginTop: 6 }}>
              Caps Lock is on
            </div>
          )}
          {errors.pass && errorText(errors.pass)}
        </div>

        {/* Strength Meter */}
        {pass && analysis.score > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    height: 6,
                    borderRadius: 999,
                    flex: 1,
                    transition: "all .25s ease",
                    background:
                      n <= analysis.score
                        ? strengthColor
                        : "var(--border-color, rgba(255,255,255,0.08))",
                    boxShadow: n <= analysis.score ? "0 0 0 1px rgba(0,0,0,0.08) inset" : "none",
                  }}
                />
              ))}
              <span style={{ fontSize: 12, color: strengthColor, marginLeft: 6 }}>
                {analysis.label}
              </span>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div style={{ marginBottom: 8 }}>
          <div style={pwGroupStyle(confirmBorder)}>
            <input
              ref={confirmRef}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              required
              style={pwInputStyle}
              autoComplete="new-password"
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              aria-pressed={showConfirm}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowConfirm((v) => !v);
                requestAnimationFrame(() => confirmRef.current?.focus());
              }}
              style={eyeBtnStyle}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
          </div>
          {(errors.confirm || confirmMismatch) &&
            errorText(errors.confirm || "Passwords do not match.")}
        </div>

        {/* Message */}
        {msg && (
          <p style={{
            textAlign: "center",
            fontSize: 13,
            marginBottom: 10,
            color: "var(--text-primary, #e6eaf3)",
            background: /sent|success/i.test(msg) ? "rgba(52, 211, 153, 0.1)" : "transparent",
            border: /sent|success/i.test(msg) ? "1px solid var(--success, #34d399)" : "none",
            padding: /sent|success/i.test(msg) ? "10px 12px" : 0,
            borderRadius: /sent|success/i.test(msg) ? 10 : 0,
          }}>
            {msg}
            {msg.toLowerCase().includes("verification") && (
              <button
                type="button"
                onClick={resendVerification}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--brand-violet, #7c5cff)",
                  cursor: "pointer",
                  marginLeft: 6,
                  textDecoration: "underline",
                }}
              >
                Resend verification
              </button>
            )}
          </p>
        )}

        <button type="submit" disabled={btnDisabled} style={primaryBtnStyle}>
          {loading ? "Creating..." : "Register Account"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 13,
          color: "var(--text-muted, #93a0b4)"
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--brand-violet, #7c5cff)" }}>
            Login
          </Link>
        </p>
      </form>
    </Global>
  );
}

/* --------- helper for 3-step password strength --------- */
function analyzePasswordSimple(pwd) {
  if (!pwd) return { score: 0, label: "" };

  let score = 1; // Weak
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (pwd.length >= 8 || classes >= 2) score = 2; // Fair
  if (pwd.length >= 12 && classes >= 3) score = 3; // Good

  const label = score === 1 ? "Weak" : score === 2 ? "Fair" : "Good";
  return { score, label };
}

