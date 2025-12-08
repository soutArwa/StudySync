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

   function mapRegisterError(code = "") {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak.";
      default:
        return "Sign up failed. Please try again.";
    }
  }

  // ---------- Password Strength Helper ----------
  function analyzePasswordSimple(pwd) {
    if (!pwd) return { score: 0, label: "" };

    let score = 1;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

    if (pwd.length >= 8 || classes >= 2) score = 2;
    if (pwd.length >= 12 && classes >= 3) score = 3;

    const label = score === 1 ? "Weak" : score === 2 ? "Fair" : "Good";
    return { score, label };
  }

  const analysis = useMemo(() => analyzePasswordSimple(pass), [pass]);

  const confirmMismatch = useMemo(
    () => confirm.length > 0 && pass !== confirm,
    [pass, confirm]
  );

  // ---------- Validation ----------
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

  // ---------- ERROR STATE ----------
  const isError =
    msg.toLowerCase().includes("failed") ||
    msg.toLowerCase().includes("invalid") ||
    msg.toLowerCase().includes("already") ||
    msg.toLowerCase().includes("match") ||
    Object.keys(errors).length > 0;

  const errorBorder = isError
    ? "1px solid #ff4d4d"
    : "1px solid var(--border-color, rgba(255,255,255,0.08))";

  const placeholderColor = isError ? "#ff5c5c" : "var(--text-muted, #93a0b4)";

  const msgBoxStyle = {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 10,
    padding: isError ? "10px 12px" : 0,
    borderRadius: isError ? 10 : 0,
    background: isError ? "rgba(255, 60, 60, 0.12)" : "transparent",
    border: isError ? "1px solid #ff4d4d" : "none",
    color: isError ? "#ff4d4d" : "var(--text-primary, #e6eaf3)",
  };

  // ---------- Submit ----------
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
      setMsg(mapRegisterError(err?.code));
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI Styles ----------
  const FIELD_H = 48;
  const baseField = {
    height: FIELD_H,
    borderRadius: 12,
    border: errorBorder,
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
    "::placeholder": { color: placeholderColor },
  };

  const pwGroupStyle = (customBorder) => ({
    ...baseField,
    ...(customBorder ? { border: customBorder } : {}),
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 12,
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
  };

  const confirmBorder =
    confirm.length === 0
      ? errorBorder
      : confirmMismatch
      ? "1px solid #ff6b6b"
      : "1px solid #34d399";

  const errorText = (t) => (
    <span style={{ color: "#ff6b6b", fontSize: 12, marginTop: 6, display: "block" }}>
      {t}
    </span>
  );

  const primaryBtnStyle = {
    height: 46,
    borderRadius: 12,
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    background: "linear-gradient(135deg, #7c5cff 0%, #9d7fff 100%)",
    color: "#fff",
    fontWeight: 600,
    width: "100%",
    boxShadow: "0 4px 12px rgba(124, 92, 255, 0.4)",
  };

  return (
    <Global>
      <div style={{ color: "var(--text-primary, #e6eaf3)" }}>
        <h2>Create an Account</h2>
        <p style={{ color: "var(--text-muted, #93a0b4)" }}>
          Please fill in your details
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        
        {/* First Name */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="First Name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            style={textInputStyle}
          />
          {errors.first && errorText(errors.first)}
        </div>

        {/* Last Name */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Last Name (optional)"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            style={textInputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={textInputStyle}
          />
          {errors.email && errorText(errors.email)}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <div style={pwGroupStyle(errorBorder)}>
            <input
              ref={passRef}
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              style={pwInputStyle}
            />
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowPass((v) => !v);
                requestAnimationFrame(() => passRef.current?.focus());
              }}
              style={eyeBtnStyle}
            >
              {showPass ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
          </div>
          {errors.pass && errorText(errors.pass)}
        </div>

        {/* Strength Meter */}
        {pass && analysis.score > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    height: 6,
                    flex: 1,
                    borderRadius: 999,
                    background:
                      n <= analysis.score
                        ? (analysis.score === 1 ? "#ff6b6b" : analysis.score === 2 ? "#f59e0b" : "#34d399")
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
              <span
                style={{
                  color:
                    analysis.score === 1
                      ? "#ff6b6b"
                      : analysis.score === 2
                      ? "#f59e0b"
                      : "#34d399",
                  fontSize: 12,
                  marginLeft: 6,
                }}
              >
                {analysis.label}
              </span>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={pwGroupStyle(confirmBorder)}>
            <input
              ref={confirmRef}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={pwInputStyle}
            />
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowConfirm((v) => !v);
                requestAnimationFrame(() => confirmRef.current?.focus());
              }}
              style={eyeBtnStyle}
            >
              {showConfirm ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
          </div>

          {(errors.confirm || confirmMismatch) &&
            errorText(errors.confirm || "Passwords do not match.")}
        </div>

        {/* Message */}
        {msg && <p style={msgBoxStyle}>{msg}</p>}

        {/* Submit */}
        <button type="submit" disabled={loading} style={primaryBtnStyle}>
          {loading ? "Creating..." : "Register Account"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: "var(--text-muted, #93a0b4)",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7c5cff" }}>
            Login
          </Link>
        </p>
      </form>
    </Global>
  );
}
