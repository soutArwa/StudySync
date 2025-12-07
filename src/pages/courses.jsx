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
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  getDocs
} from "firebase/firestore";
import Sidebar from "../Components/Sidebar";

export default function Courses() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [userInfo, setUserInfo] = useState(null);
  const [uid, setUid] = useState(null);

  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showModal, setShowModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const getUserName = (u) =>
    u?.displayName?.trim() || u?.name?.trim() || u?.email || "Unknown";

  // Load logged user
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return navigate("/login");

    setUid(u.uid);
    setUserInfo({
      displayName: u.displayName || "User",
      email: u.email || ""
    });
  }, [navigate]);

  // Load all users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Load user courses
  useEffect(() => {
    if (!uid) return;

    const unsub = onSnapshot(
      query(collection(db, "courses"), where("members", "array-contains", uid)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCourses(list);
      }
    );
    return () => unsub();
  }, [uid]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const openAddStudentModal = (courseId) => {
    setSelectedCourse(courseId);
    setShowModal(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Course name required!");
    await addDoc(collection(db, "courses"), {
      name: form.name,
      description: form.description,
      members: [uid],
      createdAt: new Date().toISOString()
    });
    setForm({ name: "", description: "" });
  };

  const addStudent = async () => {
    if (!studentEmail.trim()) return alert("Enter email!");
    const email = studentEmail.toLowerCase();
    const found = allUsers.find((u) => u.email?.toLowerCase() === email);
    if (!found) return alert("User not found!");
    const ref = doc(db, "courses", selectedCourse);
    await updateDoc(ref, { members: arrayUnion(found.uid) });
    setShowModal(false);
    setStudentEmail("");
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    const tasks1 = await getDocs(query(collection(db, "tasks"), where("courseId", "==", courseId)));
    tasks1.forEach((t) => deleteDoc(doc(db, "tasks", t.id)));
    const tasks2 = await getDocs(query(collection(db, "generalTasks"), where("courseId", "==", courseId)));
    tasks2.forEach((t) => deleteDoc(doc(db, "generalTasks", t.id)));
    await deleteDoc(doc(db, "courses", courseId));
  };

  // Wait until userInfo and uid are loaded
  if (!userInfo || !uid) {
    return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h3>;
  }

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <div className="top-left">
          <button onClick={toggleSidebar}>☰</button>
        </div>
        <div className="top-center">Courses</div>
      </div>

      <div className="content-wrapper">
        <Sidebar
          isOpen={sidebarOpen}
          active="courses"
          userInfo={userInfo}
        />

        <div className="main">
          <div className="task-form-box">
            <h2>Create Course</h2>
            <form onSubmit={handleCreateCourse}>
              <input
                className="task-input"
                placeholder="Course Name*"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="task-input"
                placeholder="Course Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <button className="submit-btn">Create</button>
            </form>
          </div>

          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="task-actions">
                  <button className="delete" onClick={() => handleDeleteCourse(course.id)}>🗑</button>
                </div>
                <h3>{course.name}</h3>
                {course.description && <p>{course.description}</p>}
                <strong>Students:</strong>
                {course.members.map((uid) => {
                  const u = allUsers.find((x) => x.uid === uid);
                  return (
                    <div key={uid} style={{ paddingLeft: 10 }}>
                      • {u ? `${getUserName(u)} (${u.email})` : "Unknown"}
                    </div>
                  );
                })}
                <button
                  className="submit-btn"
                  style={{ marginTop: 10 }}
                  onClick={() => openAddStudentModal(course.id)}
                >
                  + Add Student
                </button>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modal-bg">
              <div className="modal">
                <h3>Add Student</h3>
                <p>Course: <strong>{courses.find(c => c.id === selectedCourse)?.name}</strong></p>
                <input
                  className="task-input"
                  placeholder="Student Email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                <button className="submit-btn" onClick={addStudent}>Add</button>
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
