import React from "react";
import { useNavigate } from "react-router-dom";
import "../Components/Dashboard.css";

export default function Sidebar({ isOpen, userInfo, active }) {
  const navigate = useNavigate();

  const displayName = userInfo?.displayName || "User";
  const email = userInfo?.email || "";

  return (
    <aside className={`side ${isOpen ? "open" : "closed"}`}>
      {/* User Info */}
      <div className="user">
        <div className="avatar">
          {displayName?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div style={{ fontWeight: 800 }}>{displayName}</div>
          <div className="email">{email}</div>
        </div>
      </div>

      {/* Menu */}
      <div className="menu">
        <button
          className={active === "dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        <button
          className={active === "myTasks" ? "active" : ""}
          onClick={() => navigate("/myTasks")}
        >
          My Tasks
        </button>

        <button
          className={active === "sharedTasks" ? "active" : ""}
          onClick={() => navigate("/sharedTasks")}
        >
          Shared Tasks
        </button>

        <button
          className={active === "courses" ? "active" : ""}
          onClick={() => navigate("/courses")}
        >
          Courses
        </button>

        <button
          className={active === "profile" ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          Profile
        </button>
      </div>

      {/* Logout */}
      <div className="logout">
        <button onClick={() => navigate("/logout")}>Log out</button>
      </div>
    </aside>
  );
}