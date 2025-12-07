import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import "../Components/Dashboard.css";
import Sidebar from "../Components/Sidebar";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageName] = useState("Profile");

  const [userInfo, setUserInfo] = useState({
    displayName: "",
    email: "",
  });

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          displayName: user.displayName || user.email || "Unknown",
          email: user.email || "Unknown",
        });
      }
    });

    return () => unsubscribe();
  }, []);

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
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="profile" />

        {/* Main */}
        <div className="main">
          <h2>Your Profile</h2>
          <div className="profile-box">
            <h3 style={{ marginBottom: "10px" }}>Display Name</h3>
            <p style={{ fontSize: "1.1rem", color: "#ffffffb0" }}>
              {userInfo.displayName}
            </p>

            <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Email</h3>
            <p style={{ fontSize: "1.1rem", color: "#ffffffb0" }}>
              {userInfo.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
