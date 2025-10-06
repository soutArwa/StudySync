import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import InputField from "../Components/InputField";
import PasswordField from "../Components/PasswordField";
import MessageBox from "../Components/MessageBox";
import { registerUser } from "../Services/Authentication_email.service";

export default function Register() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!first.trim()) e.first = "First name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
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
      setMsg(res?.message || "We sent you a verification email. Please verify your email before signing in.");
      setFirst(""); setLast(""); setEmail(""); setPass(""); setConfirm("");
      setErrors({});
    } catch (err) {
      setMsg(err?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  // زر إعادة إرسال التفعيل (يعمل فقط إذا المستخدم ما زال Signed-in بعد التسجيل؛ غالباً سيكون Signed-out اعتماداً على الخدمة)
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

  const btnDisabled = loading || !first.trim() || !email.trim() || !pass || !confirm || pass !== confirm;
 
  // ======== UI/UX TEAM AREA (Register Page) ======== 

  return (
    <div className="h-full bg-gray-400 dark:bg-gray-900 min-h-screen">
      <div className="mx-auto">
        <div className="flex justify-center px-6 py-12">
          <div className="w-full xl:w-3/4 lg:w-11/12 flex">
            <div
              className="w-full h-auto bg-gray-400 dark:bg-gray-800 hidden lg:block lg:w-5/12 bg-cover rounded-l-lg"
              style={{ backgroundImage: "url('https://source.unsplash.com/Mv9hjnEUHR4/600x800')" }}
            />
            <div className="w-full lg:w-7/12 bg-white dark:bg-gray-700 p-5 rounded-lg lg:rounded-l-none">
              <h3 className="py-4 text-2xl text-center text-gray-800 dark:text-white">Create an Account</h3>

              <form className="px-8 pt-6 pb-8 mb-4 bg-white dark:bg-gray-800 rounded" onSubmit={handleSubmit}>
                <div className="mb-4 md:flex md:justify-between">
                  <div className="mb-4 md:mr-2 md:mb-0">
                    <InputField
                      label="First Name"
                      value={first}
                      onChange={(e) => setFirst(e.target.value)}
                      placeholder="First Name"
                      required
                      error={errors.first}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="md:ml-2">
                    <InputField
                      label="Last Name"
                      value={last}
                      onChange={(e) => setLast(e.target.value)}
                      placeholder="Last Name (optional)"
                      error={errors.last}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  error={errors.email}
                  autoComplete="username"
                />

                <div className="mb-4 md:flex md:justify-between">
                  <div className="mb-4 md:mr-2 md:mb-0">
                    <PasswordField
                      label="Password"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="********"
                      error={errors.pass}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="md:ml-2">
                    <PasswordField
                      label="Confirm Password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="********"
                      error={errors.confirm}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <MessageBox
                  message={msg}
                  kind={
                    msg.toLowerCase().includes("failed") || msg.toLowerCase().includes("error") ? "error" : "success"
                  }
                />

                {/* زر إعادة إرسال التفعيل يظهر فقط عندما تحتوي الرسالة على كلمة verification */}
                {msg && msg.toLowerCase().includes("verification") && (
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="mt-2 text-sm underline text-blue-600"
                  >
                    Resend verification email
                  </button>
                )}

                <div className="mb-6 text-center">
                  <button
                    type="submit"
                    disabled={btnDisabled}
                    className={`w-full px-4 py-2 font-bold text-white rounded-full focus:outline-none focus:shadow-outline ${
                      btnDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-800"
                    }`}
                  >
                    {loading ? "Creating..." : "Register Account"}
                  </button>
                </div>

                <hr className="mb-6 border-t" />
                <div className="text-center">
                  <a className="inline-block text-sm text-blue-500 dark:text-blue-500 align-baseline hover:text-blue-800" href="#">
                    Already have an account? Login
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
