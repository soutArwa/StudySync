import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  signOut,
} from "firebase/auth";

import { collection, addDoc, doc, setDoc } from "firebase/firestore";

const normalize = (s = "") => s.trim().toLowerCase();

 export const actionCodeSettings = {
  url: "http://localhost:5173/",
  handleCodeInApp: false,
};

 
export async function registerUser(name, email, password) {
  const safeEmail = normalize(email);

   const existing = await fetchSignInMethodsForEmail(auth, safeEmail);
  if (existing && existing.length > 0) {
    const err = new Error(
      "This email is already registered. Please sign in instead."
    );
    err.code = "auth/email-already-in-use";
    throw err;
  }

   const cred = await createUserWithEmailAndPassword(
    auth,
    safeEmail,
    password
  );

   if (name) {
    await updateProfile(cred.user, { displayName: name });
  }

   await sendEmailVerification(cred.user, actionCodeSettings);

   await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name: name || "",
    email: safeEmail,
    emailLower: safeEmail,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    role: "student",
    active: true,
  });

   await signOut(auth);

  return {
    success: true,
    message:
      "Verification email sent. Please check your inbox before signing in.",
  };
}

 
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(
    auth,
    normalize(email),
    password
  );

  if (!cred.user.emailVerified) {
    await sendEmailVerification(cred.user, actionCodeSettings);
    await signOut(auth);
    throw new Error(
      "Please verify your email before signing in. Verification email re-sent."
    );
  }

  return cred;
}

