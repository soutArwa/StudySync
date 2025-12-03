import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../Components/Dashboard.css";
import Sidebar from "../Components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageName, setPageName] = useState("Dashboard");

  const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const u = auth.currentUser;
      if (!u) return;

      setUserInfo({
        displayName: u.displayName || "User",
        email: u.email,
      });

      try {
        const q = query(
          collection(db, "courses"),
          where("members", "array-contains", u.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app">
      <div className="dashboard-container">
        {/* Top Bar */}
        <div className="topbar">
          <div className="top-left">
            <button onClick={toggleSidebar}>☰</button>
          </div>
          <div className="top-center">{pageName}</div>
          <div className="top-right">
            <button className="undo">↺</button>
            <button className="redo">↻</button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="content-wrapper">
          {/* Sidebar (global component) */}
          <Sidebar
            isOpen={sidebarOpen}
            userInfo={userInfo}
            active="dashboard"
          />

          {/* Main Content */}
          <div className="main">
            <h2>Courses this semester</h2>
            <div className="courses-grid">
              {courses.length === 0 ? (
                <p style={{ padding: "20px", color: "#888" }}>
                  No courses found. Go to 'Courses' to join or create one.
                </p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <h3>{course.name}</h3>
                    <p>{course.description || "No description provided."}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
