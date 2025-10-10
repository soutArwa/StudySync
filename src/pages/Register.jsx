 import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { useState, useMemo } from "react";
import { registerUser } from "../Services/Authentication_email.service";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

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

  // تحقق حي لتطابق الباسوورد
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
        url: "http://localhost:5173/",
        handleCodeInApp: false,
      });
      setMsg("Verification email sent again. Check your inbox/spam.");
    } catch (e) {
      setMsg(e?.message || "Failed to resend verification email.");
    }
  }

  const btnDisabled =
    loading ||
    !first.trim() ||
    !email.trim() ||
    !pass ||
    !confirm ||
    confirmMismatch;

  /* Styles (نفس اللوق إن) */
  const page = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f1a2b,#121a2b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins,system-ui",
    padding: 24,
  };
  const box = {
    background: "#fff",
    padding: "40px 36px",
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    width: "100%",
    maxWidth: 480,
  };
  const inputWrap = { marginBottom: 16, position: "relative" };
  const input = (errored = false) => ({
    width: "100%",
    padding: "12px 44px 12px 14px",
    borderRadius: 10,
    border: `1.5px solid ${errored ? "#ef4444" : "#cbd5e1"}`,
    fontSize: 14,
    outline: "none",
  });
  const eyeBtn = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 28,
    height: 28,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    color: "#6b7280",
  };
  const btn = {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "#137dc5",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  };
  const help = { color: "#ef4444", fontSize: 12, marginTop: 6 };

  return (
    <div style={page}>
      <div style={box}>
        <h2 style={{ color: "#137dc5", marginBottom: 8 }}>Create an Account</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>Please fill in your details</p>

        <form onSubmit={handleSubmit} noValidate>
          <div style={inputWrap}>
            <input
              type="text"
              placeholder="First Name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              required
              style={input(!!errors.first)}
            />
            {errors.first && <div style={help}>{errors.first}</div>}
          </div>

          <div style={inputWrap}>
            <input
              type="text"
              placeholder="Last Name (optional)"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              style={input(false)}
            />
          </div>

          <div style={inputWrap}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={input(!!errors.email)}
            />
            {errors.email && <div style={help}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={inputWrap}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              style={input(!!errors.pass)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={eyeBtn}
              aria-label={showPass ? "Hide password" : "Show password"}
              title={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.pass && <div style={help}>{errors.pass}</div>}
          </div>

          {/* Confirm Password (تحقق حي) */}
          <div style={inputWrap}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={input(confirmMismatch || !!errors.confirm)}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={eyeBtn}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
            {(confirmMismatch || errors.confirm) && (
              <div style={help}>{errors.confirm || "Passwords do not match."}</div>
            )}
          </div>

          {msg && (
            <p style={{ textAlign: "center", color: "crimson", fontSize: 13 }}>
              {msg}{" "}
              {msg.toLowerCase().includes("verification") && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (!auth.currentUser) {
                        setMsg("Please sign in first, then try again.");
                        return;
                      }
                      await sendEmailVerification(auth.currentUser, {
                        url: "http://localhost:5173/",
                        handleCodeInApp: false,
                      });
                      setMsg("Verification email sent again. Check your inbox/spam.");
                    } catch (e) {
                      setMsg(e?.message || "Failed to resend verification email.");
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#137dc5",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Resend verification email
                </button>
              )}
            </p>
          )}

          <button type="submit" disabled={btnDisabled} style={btn}>
            {loading ? "Creating..." : "Register Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#137dc5", textDecoration: "none" }}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
