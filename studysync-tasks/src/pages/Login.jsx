import { useState } from "react";
import { loginUser } from "../Services/Authentication_email.service";
import { auth, db } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";



// فحص دومينات مسموحة (اختياري للاختبار)
const domainOK = (email = "") =>
  /^[\w.-]+@(gmail|hotmail|outlook)\.com$/i.test(email.trim().toLowerCase());
const getDomain = (email = "") =>
  (email.match(/@([^@\s]+)$/)?.[1] || "").toLowerCase();

// تطبيع الإيميل
const normalize = (s = "") => s.trim().toLowerCase();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [passTouched, setPassTouched] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [passErr, setPassErr] = useState(false);
  const [hint, setHint] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function onEmailChange(v) {
    setEmail(v);
    setEmailErr(false);
    setMsg("");
    if (emailTouched && !domainOK(v)) {
      setHint(
        `Allowed: gmail.com, hotmail.com, outlook.com. Wrong domain: ${
          getDomain(v) || "invalid"
        }`
      );
    } else setHint("");
  }
  function onPasswordChange(v) { setPassword(v); setPassErr(false); setMsg(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    setEmailTouched(true);
    setPassTouched(true);

    const safeEmail = normalize(email);

    try {
      // 1) فحص الدومين (اختياري)
      if (!domainOK(safeEmail)) {
        setEmailErr(true);
        setHint(
          `Allowed: gmail.com, hotmail.com, outlook.com. Wrong domain: ${
            getDomain(safeEmail) || "invalid"
          }`
        );
        setMsg("Enter a valid email in an allowed domain.");
        setLoading(false);
        return;
      }

      // 2) allow-list (emailLower فقط)
      const q1 = query(collection(db, "users"), where("emailLower", "==", safeEmail), limit(1));
      const preSnap = await getDocs(q1);
      if (preSnap.empty) {
        setEmailErr(true);
        setMsg("This email is not in the allowed users list (Firestore).");
        setLoading(false);
        return;
      }
      if (preSnap.docs[0].data().active !== true) {
        setMsg("Your account is not active/allowed.");
        setLoading(false);
        return;
      }

      // 3) تسجيل الدخول
      await loginUser(safeEmail, password);

      // 4) لو غير مُفعّل: أرسل التفعيل الآن ثم خروج
      const u = auth.currentUser;
      if (!u?.emailVerified) {
        await sendEmailVerification(u, actionCodeSettings);
        setMsg("Verification email sent. Please check your inbox (or spam) then sign in again.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // 5) تحقق نهائي عبر uid + active
      const q2 = query(collection(db, "users"), where("uid", "==", u.uid), limit(1));
      const snap2 = await getDocs(q2);
      if (snap2.empty || snap2.docs[0].data().active !== true) {
        setMsg("Your account is not active/allowed.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // نجاح
      setMsg("Logged in successfully.");
      setEmail(""); setPassword("");
      setEmailErr(false); setPassErr(false);
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setPassErr(true); setMsg("Incorrect password. Try again or reset your password.");
      } else if (code === "auth/user-not-found") {
        setEmailErr(true); setMsg("This email is not registered in Authentication. Please sign up first.");
      } else if (code === "auth/invalid-email") {
        setEmailErr(true); setMsg("Invalid email address.");
      } else {
        setMsg(err?.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }
//-------------------------------------------------------------------------------------------------------//
  const base = "inline-block w-full p-4 leading-6 text-lg font-extrabold placeholder-indigo-900 bg-white shadow border-2 rounded";
  const emailCls = `${base} ${emailErr ? "border-red-600" : "border-indigo-900"}`;
  const passCls  = `${base} ${passErr  ? "border-red-600" : "border-indigo-900"}`;



  return (
    <div className="container px-4 mx-auto">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Sign in</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-extrabold">Email</label>
            <input
              className={emailCls}
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => {
                setEmailTouched(true);
                if (!domainOK(email)) {
                  setEmailErr(true);
                  setHint(`Allowed: gmail.com, hotmail.com, outlook.com. Wrong domain: ${getDomain(email) || "invalid"}`);
                }
              }}
              aria-invalid={emailErr ? "true" : "false"}
              autoComplete="username"
            />
            {emailErr && hint && (
              <p className="mt-2 text-sm font-extrabold">
                Allowed: gmail.com, hotmail.com, outlook.com.{" "}
                <span className="text-red-600">Wrong domain: {getDomain(email) || "invalid"}</span>
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-extrabold">Password</label>
            <input
              className={passCls}
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={() => setPassTouched(true)}
              aria-invalid={passErr ? "true" : "false"}
              autoComplete="current-password"
            />
          </div>

          {msg && <p className="mb-3 font-extrabold">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-block w-full py-4 px-6 mb-6 text-center text-lg leading-6 text-white font-extrabold bg-indigo-800 hover:bg-indigo-900 border-2 border-indigo-900 shadow rounded transition duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
