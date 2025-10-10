 import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../Services/Authentication_email.service";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

/* Helpers */
const domainOK = (email = "") =>
  /^[\w.-]+@(gmail|hotmail|outlook)\.com$/i.test(email.trim().toLowerCase());
const getDomain = (email = "") =>
  (email.match(/@([^@\s]+)$/)?.[1] || "").toLowerCase();
const normalize = (s = "") => s.trim().toLowerCase();

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    const safeEmail = normalize(email);

    try {
      if (!domainOK(safeEmail)) {
        setMsg(
          `Allowed: gmail.com, hotmail.com, outlook.com. Wrong domain: ${
            getDomain(safeEmail) || "invalid"
          }`
        );
        setLoading(false);
        return;
      }

      const q1 = query(
        collection(db, "users"),
        where("emailLower", "==", safeEmail),
        limit(1)
      );
      const preSnap = await getDocs(q1);
      if (preSnap.empty) {
        setMsg("This email is not in the allowed users list (Firestore).");
        setLoading(false);
        return;
      }
      if (preSnap.docs[0].data().active !== true) {
        setMsg("Your account is not active/allowed.");
        setLoading(false);
        return;
      }

      await loginUser(safeEmail, password);

      const u = auth.currentUser;
      if (!u) {
        setMsg("Please verify your email before signing in. Verification email re-sent.");
        setLoading(false);
        return;
      }

      const q2 = query(collection(db, "users"), where("uid", "==", u.uid), limit(1));
      const snap2 = await getDocs(q2);
      if (snap2.empty || snap2.docs[0].data().active !== true) {
        await signOut(auth);
        setMsg("Your account is not active/allowed.");
        setLoading(false);
        return;
      }

      setMsg("Logged in successfully.");
      setEmail("");
      setPassword("");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const text = String(err?.message || "").toLowerCase();
      if (text.includes("verify your email"))
        setMsg("Please verify your email before signing in. Verification email re-sent.");
      else setMsg(err?.message || "Login failed.");
      try { await signOut(auth); } catch {}
    } finally {
      setLoading(false);
    }
  }

  /* Styles */
  const page = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f1a2b,#121a2b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins,system-ui",
  };
  const box = {
    background: "#fff",
    padding: "40px 36px",
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    width: "100%",
    maxWidth: 420,
  };
  const inputWrap = { marginBottom: 16, position: "relative" };
  const input = {
    width: "100%",
    padding: "12px 40px 12px 14px",
    borderRadius: 10,
    border: "1.5px solid #cbd5e1",
    fontSize: 14,
  };
  const eyeBtn = {
    position: "absolute",
    right: 10,
    top: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#555",
    fontSize: 18,
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

  return (
    <div style={page}>
      <div style={box}>
        <h2 style={{ color: "#137dc5", marginBottom: 8 }}>Welcome Back!</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>Please enter your details</p>
        <form onSubmit={handleSubmit}>
          <div style={inputWrap}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={input}
            />
          </div>

          <div style={inputWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeBtn}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {msg && (
            <p style={{ textAlign: "center", color: msg.includes("success") ? "green" : "crimson", fontSize: 13 }}>
              {msg}
            </p>
          )}

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Signing in..." : "Log In"}
          </button>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "#137dc5", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
