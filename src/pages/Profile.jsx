 import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";
import "../Components/Dashboard.css";
import Sidebar from "../Components/Sidebar";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageName] = useState("Profile");

  const [userInfo, setUserInfo] = useState({
    displayName: "",
    email: "",
  });

  const [newName, setNewName] = useState("");

  // Load user info
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserInfo({
        displayName: user.displayName || "User",
        email: user.email,
      });
      setNewName(user.displayName || "");
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleUpdateName = async () => {
    const user = auth.currentUser;
    if (!newName.trim()) return alert("Name cannot be empty!");

    try {
      await updateProfile(user, { displayName: newName });
      alert("Name updated!");
      setUserInfo((prev) => ({ ...prev, displayName: newName }));
    } catch (err) {
      console.error(err);
      alert("Failed to update name");
    }
  };

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

          <h2>Profile Information</h2>

          <div className="profile-box">
            <label>Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <label>Email</label>
            <input
              type="text"
              value={userInfo.email}
              disabled
            />

            <button onClick={handleUpdateName}>Update Name</button>
          </div>

        </div>

      </div>
    </div>
  );
}
