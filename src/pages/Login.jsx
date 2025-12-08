import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Services/Authentication_email.service";
import { auth, db } from "../firebase";
import { signOut, sendEmailVerification } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Global from "../components/global";

// ===== Helpers =====
const domainOK = (email = "") =>
  /^[\w.-]+@(gmail|hotmail|outlook)\.com$/i.test(email.trim().toLowerCase());

const getDomain = (email = "") =>
  (email.match(/@([^@\s]+)$/)?.[1] || "").toLowerCase();

const normalize = (s = "") => s.trim().toLowerCase();

function mapAuthError(code = "") {
  switch (code) {
    case "auth/user-not-found":
      return "This email is not registered. Please sign up.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password.";
    case "auth/invalid-email":
      return "Invalid email format.";
    default:
      return "Login failed. Please try again.";
  }
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const pwRef = useRef(null);

  // Determine if message is an error
  const isError =
    msg.toLowerCase().includes("not") ||
    msg.toLowerCase().includes("incorrect") ||
    msg.toLowerCase().includes("invalid") ||
    msg.toLowerCase().includes("failed");

  // =====================
  // ERROR STYLES
  // =====================
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

  // =====================
  // SUBMIT HANDLER
  // =====================
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

      // Check Firestore user existence
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

      await loginUser(safeEmail, password);

      // Check verification
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

      // Check activation
      const q2 = query(collection(db, "users"), where("uid", "==", u.uid), limit(1));
      const snap2 = await getDocs(q2);

      if (snap2.empty || snap2.docs[0].data().active !== true) {
        await signOut(auth);
        setMsg("Your account is not activated.");
        setLoading(false);
        return;
      }

      // SUCCESS
      setMsg("Logged in successfully.");
      setEmail("");
      setPassword("");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      const mapped = mapAuthError(err?.code);
      setMsg(mapped);
      try {
        await signOut(auth);
      } catch {}
    } finally {
      setLoading(false);
    }
  }
 
  const FIELD_H = 48;

  const baseField = {
    height: FIELD_H,
    borderRadius: 12,
    border: errorBorder,
    background: "var(--glass, rgba(255,255,255,0.06))",
    color: "var(--text-primary, #e6eaf3)",
    fontSize: 14,
  };

  const emailInputStyle = {
    ...baseField,
    width: "100%",
    padding: "0 14px",
    outline: "none",
  };

  const pwGroupStyle = {
    ...baseField,
    display: "flex",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
    paddingRight: 0,
  };

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

  const primaryBtnStyle = {
    height: 46,
    borderRadius: 12,
    border: "none",
    cursor: loading ? "default" : "pointer",
    background:
      "linear-gradient(135deg, #7c5cff 0%, #9d7fff 100%)",
    color: "white",
    fontWeight: 600,
    marginTop: 8,
    width: "100%",
    boxShadow:
      "0 4px 12px rgba(124, 92, 255, 0.4), 0 2px 4px rgba(0,0,0,0.2)",
  };

  return (
    <Global>
      <div style={{ color: "var(--text-primary, #e6eaf3)" }}>
        <h2>Welcome Back!</h2>
        <p style={{ color: "var(--text-muted, #93a0b4)" }}>
          Please enter your details
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            ...emailInputStyle,
            marginBottom: 14,
            border: errorBorder,
            "::placeholder": { color: placeholderColor },
          }}
        />

        {/* PASSWORD */}
        <div style={{ ...pwGroupStyle, marginBottom: 8 }}>
          <input
            ref={pwRef}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={pwInputStyle}
          />

          <button
            type="button"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowPassword((v) => !v);
              requestAnimationFrame(() => pwRef.current?.focus());
            }}
            style={eyeBtnStyle}
          >
            {showPassword ? (
              <AiOutlineEye size={20} />
            ) : (
              <AiOutlineEyeInvisible size={20} />
            )}
          </button>
        </div>

        {/* MESSAGE */}
        {msg && <p style={msgBoxStyle}>{msg}</p>}

        {/* SUBMIT */}
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
          <Link to="/register" style={{ color: "#7c5cff" }}>
            Sign Up
          </Link>
        </p>
      </form>
    </Global>
  );
}
