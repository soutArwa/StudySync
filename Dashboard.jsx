import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  // Side bar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Page name
  const [pageName, setPageName] = useState("Dashboard");
  // User info state
  const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });
  // Courses state (Real data from Firebase)
  const [courses, setCourses] = useState([]);
  // Navigation active state
  const [nav, setNav] = useState("account");

  useEffect(() => {
    const fetchData = async () => {
      const u = auth.currentUser;
      if (!u) {
        // إذا لم يكن مسجلاً، سيتم التعامل معه عبر ProtectedRoute أو التوجيه هنا
        return; 
      }

      // 1. تحديث بيانات المستخدم في السايدبار
      setUserInfo({
        displayName: u.displayName || "User",
        email: u.email
      });

      // 2. جلب الكورسات الخاصة بالمستخدم من Firebase
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

  // زر تسجيل الخروج
  const logout = () => {
    navigate("/logout");
  };

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
          {/* Side Bar */}
          {sidebarOpen && (
            <aside className="side">
              <div className="user">
                <div className="avatar">
                    {userInfo.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>{userInfo.displayName}</div>
                  <div className="email">{userInfo.email}</div>
                </div>
              </div>
              <div className="menu">
                <button
                  className={nav === "account" ? "active" : ""}
                  onClick={() => {
                    setNav("account");
                    navigate("/dashboard");
                  }}
                >
                  Dashboard
                </button>

                <button
                  className={nav === "myTasks" ? "active" : ""}
                  onClick={() => {
                    setNav("myTasks");
                    navigate("/myTasks");
                  }}
                >
                  My Tasks
                </button>
                <button
                  className={nav === "courses" ? "active" : ""}
                  onClick={() => {
                    setNav("courses");
                    navigate("/courses");
                  }}
                >
                  Courses
                </button>
                <button
                  className={nav === "Profile" ? "active" : ""}
                  onClick={() => {
                    setNav("profile");
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
              </div>
              
              <div className="logout">
                <button onClick={logout}>Log out</button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="main">
            <h2>Courses this semester</h2>
            <div className="courses-grid">
              {courses.length === 0 ? (
                <p style={{ padding: '20px', color: '#888' }}>No courses found. Go to 'Courses' to join or create one.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="course-card">
                    <h3>{course.name}</h3>
                    {/* نعرض الوصف بدلاً من اسم الدكتور لأن البيانات المحفوظة تحتوي على الوصف */}
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