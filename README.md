

## ✨ Features

* **Open registration** (no allow-list)
* **Email verification required** before sign-in
* **Re-send verification on login** if user isn’t verified
* **Firestore user document** on sign-up (`users` collection)

---



* **Frontend:** React (Vite), JSX, Tailwind CSS
* **Backend (BaaS):** Firebase Authentication + Cloud Firestore (via JS SDK)


---

## 📁 Project Structure

```
src/
├─ Components/                  # UI building blocks (optional for the team)
│   ├─ InputField.jsx
│   ├─ PasswordField.jsx
│   └─ MessageBox.jsx
├─ Services/                    # Business logic & Firebase calls (DO NOT call Firebase from pages)
│   └─ Authentication_email.service.js
├─ pages/                       # Screens that wire UI & logic
│   ├─ Login.jsx                # TODO: UI section (visual form)  see comments inside
│   └─ Register.jsx             # TODO: UI section (visual form)  see comments inside
├─ App.jsx                      # Simple routing (choose which page to render)
├─ firebase.js                  # Firebase initialization (stable) / dont change anything on it 
├─ main.jsx                     # App bootstrap (stable) 
└─ index.css / App.css          # Global styles
```

---

## Auth Flow (How it works)

1. **Register** (any email) → create user → **send verification email** → **sign out**.
2. User clicks verification link in email.
3. **Login**:
   * If **not verified**: re-send verification and **block login** with a clear message.
   * If **verified**: login succeeds.

All Firebase interactions (create, login, verification, Firestore writes) are centralized in
`src/Services/Authentication_email.service.js`.


**Firebase Console:**

* Authentication → **Sign-in method** → enable **Email/Password**
* Authentication → Settings → **Authorized domains**: add your domain (e.g., `localhost:5173`, production domain)
* Firestore → create database (Native mode) → collection `users`



### UI/UX
* Implement visual forms **inside the TODO blocks** in:

  * `src/pages/Register.jsx` — “UI/UX TEAM AREA (Register Page)”
  * `src/pages/Login.jsx` — “UI/UX TEAM AREA (Login Page)”
* Use local state & handlers already provided (`setEmail`, `handleSubmit`, etc).
* **Do not** import Firebase directly in pages/components — keep it inside `Services`.

### Backend

* Own `src/Services/Authentication_email.service.js`:

  * `registerUser(...)` — checks duplicate email, creates user, sends verification, writes Firestore, signs out.
  * `loginUser(...)` — blocks non-verified users and re-sends verification.
* Extend Firestore shape if needed (roles, profile fields).
* Add Firestore **Security Rules** later (see “Security Next” below).

### Routing

* `src/App.jsx` currently mounts a single page (switch between Register/Login).
* When ready, introduce `react-router-dom` and add routes like:

  * `/register` `/login` `/dashboard`
* Guard `/dashboard` by `auth.currentUser` + verified email.



Branches:
* `main` — stable, reviewed
* `dev` — integration branch
* `ui` — UI/UX work
* `backend` — service logic & rules

Flow:
1. Create feature branch from `dev` → `feat/ui-register-form`
2. Commit with conventional messages:
   * `feat(ui): register form layout`
   * `fix(auth): resend verification message`


