import React, { useEffect, useState } from "react";
import "../Components/Dashboard.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Sidebar from "../Components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageName = "Dashboard";

  const [userInfo, setUserInfo] = useState({
    displayName: "",
    email: "",
    uid: null,
  });

  const [courses, setCourses] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]); // ← NEW

  // ترتيب حسب createdAt
  const sortByCreatedAtDesc = (a, b) => {
    const getTime = (val) => {
      if (!val) return 0;
      if (val.toMillis) return val.toMillis();
      const t = new Date(val).getTime();
      return isNaN(t) ? 0 : t;
    };
    return getTime(b.createdAt) - getTime(a.createdAt);
  };

  // ===========================
  // LOAD USER + COURSES
  // ===========================
  useEffect(() => {
    let unsubCourses = () => {};

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserInfo({ displayName: "", email: "", uid: null });
        setCourses([]);
        setRecentTasks([]);
        navigate("/login");
        return;
      }

      setUserInfo({
        displayName: user.displayName || "User",
        email: user.email,
        uid: user.uid,
      });

      const cq = query(
        collection(db, "courses"),
        where("members", "array-contains", user.uid)
      );

      unsubCourses = onSnapshot(cq, (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setCourses(list);
      });
    });

    return () => {
      unsubAuth();
      unsubCourses();
    };
  }, [navigate]);

  // ===========================
  // LOAD RECENT TASKS
  // ===========================
  useEffect(() => {
    if (!userInfo.uid) return;
    const uid = userInfo.uid;

    // ------- My Tasks -------
    const myQ = query(
      collection(db, "tasks"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsubMy = onSnapshot(myQ, (snap) => {
      const myTasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        _type: "my",
      }));

      const recentMy = myTasks.sort(sortByCreatedAtDesc).slice(0, 2);

      setRecentTasks((prev) => {
        const sharedOnly = prev.filter((t) => t._type === "shared");
        return [...recentMy, ...sharedOnly].sort(sortByCreatedAtDesc);
      });
    });

    // ------- Shared Tasks -------
    const sharedQ = query(
      collection(db, "generalTasks"),
      orderBy("createdAt", "desc")
    );

    const unsubShared = onSnapshot(sharedQ, (snap) => {
      const sharedTasks = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
          _type: "shared",
        }))
        .filter((task) => task.assignedTo?.includes(uid));

      const recentShared = sharedTasks.sort(sortByCreatedAtDesc).slice(0, 2);

      setRecentTasks((prev) => {
        const myOnly = prev.filter((t) => t._type === "my");
        return [...myOnly, ...recentShared].sort(sortByCreatedAtDesc);
      });
    });

    return () => {
      unsubMy();
      unsubShared();
    };
  }, [userInfo.uid]);

  // ===========================
  // TASK CLICK HANDLER
  // ===========================
  const goToTaskSource = (task) => {
    if (task._type === "my") navigate("/myTasks");
    else navigate("/sharedTasks");
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="dashboard-container">
      {/* Top bar */}
      <div className="topbar">
        <div className="top-left">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
        <div className="top-center">{pageName}</div>
      </div>

      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="dashboard" />

        <div className="main">
          {/* COURSES */}
          <h2 className="section-title">Your Courses</h2>

          {courses.length === 0 ? (
            <p style={{ color: "#93a0b4" }}>No courses found.</p>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  style={{
                    cursor: "pointer",
                    padding: "18px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    transition: "0.2s",
                  }}
                  onClick={() => navigate("/courses")}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.03)")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <svg
                      width="18"
                      height="18"
                      fill="#7c5cff"
                      viewBox="0 0 24 24"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M4 4h16v2H4zm0 4h16v12H4z" />
                    </svg>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {course.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#93a0b4",
                      fontSize: 14,
                    }}
                  >
                    {course.description || "No description provided."}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#a9b4c9",
                      fontSize: 13,
                    }}
                  >
                    {course.members?.length || 0} students enrolled
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* RECENT TASKS */}
          <h2 className="section-title" style={{ marginTop: 40 }}>
            Recent Tasks
          </h2>

          {recentTasks.length === 0 ? (
            <p style={{ color: "#93a0b4" }}>No recent tasks.</p>
          ) : (
            <div className="tasks-list">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  onClick={() => goToTaskSource(task)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="task-title">{task.title}</div>

                  <div className="task-meta">
                    {task.priority && (
                      <span
                        className={`priority-chip priority-${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    )}

                    <div
                      style={{
                        color: "#93a0b4",
                        fontSize: "12px",
                      }}
                    >
                      {task._type === "my" ? "My Task" : "Shared Task"}
                    </div>

                    <div>Due: {task.dueDate || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
