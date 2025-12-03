 
import React, { useState } from "react";
import "../Components/Dashboard.css";
import Sidebar from "../Components/Sidebar";
import { auth } from "../firebase";

export default function SharedTasks() {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageName = "Shared Tasks";

  const userInfo = {
    displayName: auth.currentUser?.displayName || "User",
    email: auth.currentUser?.email || "",
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-container">

      {/* Top Bar */}
      <div className="topbar">
        <div className="top-left">
          <button onClick={toggleSidebar}>☰</button>
        </div>
        <div className="top-center">{pageName}</div>
      </div>

      <div className="content-wrapper">

        {/* Sidebar (Global Component) */}
        <Sidebar
          isOpen={sidebarOpen}
          userInfo={userInfo}
          active="sharedTasks"
        />

        {/* Main Content */}
        <div className="main">
          <h2 style={{ opacity: 0.9 }}>Shared Tasks</h2>

          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              color: "#93a0b4",
              fontSize: "1.1rem",
            }}
          >
            No shared tasks yet.<br />
            <span style={{ fontSize: "0.9rem" }}>
              (This page is currently empty.)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
