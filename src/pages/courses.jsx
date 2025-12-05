import React, { useState, useEffect } from "react";
import "../Components/Dashboard.css";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";
import Sidebar from "../Components/Sidebar";

export default function Courses() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageName] = useState("Courses");

  const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
  });

  // ==========================
  // Load user + courses
  // ==========================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    setUserInfo({
      displayName: user.displayName || "User",
      email: user.email,
    });

    const q = query(
      collection(db, "courses"),
      where("members", "array-contains", user.uid)
    );

    onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCourses(list);
    });
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ==========================
  // Create Course
  // ==========================
  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (!newCourse.name.trim()) return alert("Course name required!");

    try {
      await addDoc(collection(db, "courses"), {
        ...newCourse,
        members: [auth.currentUser.uid],
        createdAt: new Date().toISOString(),
      });

      setNewCourse({ name: "", description: "" });
      alert("Course created!");

    } catch (err) {
      console.error(err);
      alert("Error creating course");
    }
  };

  // ==========================
  // DELETE COURSE + related tasks
  // ==========================
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      // 1) DELETE MyTasks belonging to this course
      const tasksSnap = await getDocs(
        query(collection(db, "tasks"), where("courseId", "==", courseId))
      );

      for (const task of tasksSnap.docs) {
        await deleteDoc(doc(db, "tasks", task.id));
      }

      // 2) DELETE SharedTasks belonging to this course
      const sharedSnap = await getDocs(
        query(collection(db, "generalTasks"), where("courseId", "==", courseId))
      );

      for (const s of sharedSnap.docs) {
        await deleteDoc(doc(db, "generalTasks", s.id));
      }

      // 3) DELETE the course itself
      await deleteDoc(doc(db, "courses", courseId));

      alert("Course deleted successfully!");

    } catch (err) {
      console.error(err);
      alert("Error deleting course.");
    }
  };

  return (
    <div className="dashboard-container">

      {/* Top Bar */}
      <div className="topbar">
        <button onClick={toggleSidebar}>☰</button>
        <div className="top-center">{pageName}</div>
      </div>

      <div className="content-wrapper">

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="courses" />

        {/* Main */}
        <div className="main">

          <h2>Your Courses</h2>

          {/* Add New Course */}
          <div className="task-form-box">
            <h3>Create New Course</h3>

            <form onSubmit={handleAddCourse}>
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />

              <textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />

              <button type="submit">Create Course</button>
            </form>
          </div>

          {/* Courses List */}
          <div className="courses-grid">
            {courses.length === 0 ? (
              <p style={{ textAlign: "center", color: "#93a0b4" }}>
                No courses found.
              </p>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  style={{ position: "relative" }}
                >

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "transparent",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      color: "#f55"
                    }}
                  >
                    🗑
                  </button>

                  <h3>{course.name}</h3>
                  <p>{course.description || "No description provided."}</p>

                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
