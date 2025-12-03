import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Services/Authentication_email.service";
import { auth, db } from "../firebase";
import { signOut, sendEmailVerification } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Global from "../components/global";

const domainOK = (email = "") =>
  /^[\w.-]+@(gmail|hotmail|outlook)\.com$/i.test(email.trim().toLowerCase());
const getDomain = (email = "") =>
  (email.match(/@([^@\s]+)$/)?.[1] || "").toLowerCase();
const normalize = (s = "") => s.trim().toLowerCase();

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // default hidden
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);

  function mapAuthError(code = "") {
    switch (code) {
      case "auth/user-not-found":
        return "This email is not registered. Please sign up.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password.";
      default:
        return "Login failed. Please try again.";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    const safeEmail = normalize(email);

    try {
      if (!domainOK(safeEmail)) {
        setMsg(
          `Allowed domains: gmail.com, hotmail.com, outlook.com. Wrong domain: ${
            getDomain(safeEmail) || "invalid"
          }`
        );
        setLoading(false);
        return;
      }

      // 1) Check if email exists
      const q1 = query(
        collection(db, "users"),
        where("emailLower", "==", safeEmail),
        limit(1)
      );
      const preSnap = await getDocs(q1);
      if (preSnap.empty) {
        setMsg("This email is not registered. Please sign up.");
        setLoading(false);
        return;
      }

      // 2) Sign in
      await loginUser(safeEmail, password);

      // 3) Verified?
      const u = auth.currentUser;
      if (!u) {
        setMsg("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      if (!u.emailVerified) {
        try {
          await sendEmailVerification(u);
        } catch {}
        await signOut(auth);
        setMsg(
          "Your email is not verified. We sent you a verification email. Please verify and try again."
        );
        setLoading(false);
        return;
      }

      // 4) Active?
      const q2 = query(collection(db, "users"), where("uid", "==", u.uid), limit(1));
      const snap2 = await getDocs(q2);
      if (snap2.empty || snap2.docs[0].data().active !== true) {
        await signOut(auth);
        setMsg("Your account is not activated.");
        setLoading(false);
        return;
      }

      setMsg("Logged in successfully.");
      setEmail("");
      setPassword("");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const m = mapAuthError(err?.code);
      setMsg(m);
      try {
        await signOut(auth);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  // ===== Palette-based styles (with fallbacks) =====
  const FIELD_H = 48;
  const baseField = {
    height: FIELD_H,
    borderRadius: 12,
    border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
    background: "var(--glass, rgba(255,255,255,0.06))",
    color: "var(--text-primary, #e6eaf3)",
    fontSize: 14,
  };

  const emailInputStyle = {
    ...baseField,
    width: "100%",
    boxSizing: "border-box",
    padding: "0 14px",
    outline: "none",
  };

  // 🔧 FLUSH eye-button fix (no seam)
  const pwGroupStyle = {
    ...baseField,
    display: "flex",              // was grid
    alignItems: "center",
    width: "100%",
    overflow: "hidden",           // clip children to parent radius
    borderRadius: 12,             // rounding only on the parent
    paddingRight: 0,
  };

  const pwInputStyle = {
    flex: 1,                      // take remaining space
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text-primary, #e6eaf3)",
    padding: "0 14px",
    fontSize: 14,
    borderRadius: 0,              // remove inner rounding
  };

  const eyeBtnStyle = {
    width: 44,
    height: "100%",
    display: "grid",
    placeItems: "center",
    border: "none",
    borderLeft: "1px solid var(--border-color, rgba(255,255,255,0.08))", // subtle divider
    background: "transparent",
    cursor: "pointer",
    color: "var(--text-muted, #93a0b4)",
    borderRadius: 0,              // remove inner rounding
  };

  const primaryBtnStyle = {
    height: 46,
    borderRadius: 12,
    border: "none",
    cursor: loading ? "default" : "pointer",
    background:
      "linear-gradient(135deg, var(--brand-violet, #7c5cff) 0%, var(--brand-violet-light, #9d7fff) 100%)",
    color: "var(--white, #ffffff)",
    fontWeight: 600,
    marginTop: 8,
    width: "100%",
    boxShadow:
      "var(--button-shadow, 0 4px 12px rgba(124, 92, 255, 0.4), 0 2px 4px rgba(0,0,0,0.2))",
  };

  // Message styles: success / verification / danger
  const isSuccess = msg.toLowerCase().includes("successfully");
  const isVerification = msg.toLowerCase().includes("verification");
  const msgBoxStyle = {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 10,
    color: "var(--text-primary, #e6eaf3)",
    background: isSuccess
      ? "var(--success-bg, rgba(52, 211, 153, 0.1))"
      : isVerification
      ? "var(--violet-tint, rgba(124, 92, 255, 0.1))"
      : "transparent",
    border: isSuccess
      ? "1px solid var(--success, #34d399)"
      : isVerification
      ? "1px solid var(--brand-violet, #7c5cff)"
      : "none",
    padding: isSuccess || isVerification ? "10px 12px" : 0,
    borderRadius: isSuccess || isVerification ? 10 : 0,
  };

  return (
    <Global>
      <div style={{ color: "var(--text-primary, #e6eaf3)" }}>
        <h2>Welcome Back!</h2>
        <p style={{ color: "var(--text-muted, #93a0b4)" }}>Please enter your details</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ ...emailInputStyle, marginBottom: 14 }}
        />

        {/* Password */}
        <div style={{ ...pwGroupStyle, marginBottom: 8 }}>
          <input
            ref={pwRef}
            type={showPassword ? "text" : "password"} // default hidden
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={pwInputStyle}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowPassword((v) => !v);
              requestAnimationFrame(() => pwRef.current?.focus());
            }}
            style={eyeBtnStyle}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <AiOutlineEye size={20} />
            ) : (
              <AiOutlineEyeInvisible size={20} />
            )}
          </button>
        </div>

        {/* Message */}
        {msg && <p style={msgBoxStyle}>{msg}</p>}

        {/* Submit */}
        <button type="submit" disabled={loading} style={primaryBtnStyle}>
          {loading ? "Signing in..." : "Log In"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: "var(--text-muted, #93a0b4)",
          }}
        >
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "var(--brand-violet, #7c5cff)" }}>
            Sign Up
          </Link>
        </p>
      </form>
    </Global>
  );
}


