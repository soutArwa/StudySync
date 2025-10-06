import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  signOut,
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

const normalize = (s = "") => s.trim().toLowerCase();

// رابط التفعيل (بدّل الدومين حسب موقعك)
const actionCodeSettings = {
  url: "http://localhost:5173/",
  handleCodeInApp: false,
};

// تسجيل حساب جديد
export async function registerUser(name, email, password) {
  const safeEmail = normalize(email);

  // ✅ فحص مسبق: هل هذا الإيميل موجود بالفعل في Firebase Auth؟
  const existing = await fetchSignInMethodsForEmail(auth, safeEmail);
  if (existing && existing.length > 0) {
    const err = new Error("This email is already registered. Please sign in instead.");
    err.code = "auth/email-already-in-use";
    throw err;
  }

  // إنشاء المستخدم
  const cred = await createUserWithEmailAndPassword(auth, safeEmail, password);

  // تحديث الاسم في الحساب
  if (name) await updateProfile(cred.user, { displayName: name });

  // إرسال رسالة التفعيل
  await sendEmailVerification(cred.user, actionCodeSettings);

  // إنشاء سجل جديد في Firestore
  await addDoc(collection(db, "users"), {
    uid: cred.user.uid,
    name: name || "",
    email: safeEmail,
    emailLower: safeEmail,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    role: "student",
    active: true,
  });

  // تسجيل خروج مؤقت حتى يفعّل البريد
  await signOut(auth);

  return {
    success: true,
    message: "Verification email sent. Please check your inbox before signing in.",
  };
}

// تسجيل الدخول: يمنع غير المفعّلين ويرسل لهم التفعيل
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, normalize(email), password);

  if (!cred.user.emailVerified) {
    await sendEmailVerification(cred.user, actionCodeSettings);
    await signOut(auth);
    throw new Error("Please verify your email before signing in. Verification email re-sent.");
  }

  return cred;
}
