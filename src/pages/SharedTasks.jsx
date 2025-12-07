import React, { useState, useEffect } from "react";
import "../Components/Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase";
import Sidebar from "../Components/Sidebar";

const PRIORITIES = ["Low", "Medium", "High"];

export default function SharedTasks() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [userInfo, setUserInfo] = useState({ displayName: "User", email: "" });
  const [uid, setUid] = useState(null);

  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courseMembers, setCourseMembers] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    courseId: "",
    assignedTo: []
  });

  const [editingId, setEditingId] = useState(null);

  // FILTER STATES (Like MyTasks)
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("none");

  const getUserName = (u) =>
    u?.displayName?.trim() || u?.name?.trim() || u?.email || "Unknown";

  // Load user
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return navigate("/login");

    setUid(u.uid);
    setUserInfo({
      displayName: u.displayName || "User",
      email: u.email
    });
  }, []);

  // Load all users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Load courses
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

  // Load tasks
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "generalTasks"), (snap) => {
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const filtered = raw.filter((task) => {
        const inCourse = courses.some((c) => c.id === task.courseId);
        const assigned = task.assignedTo?.includes(uid);
        const mine = task.createdBy === uid;
        return inCourse || assigned || mine;
      });

      filtered.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setTasks(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, [courses, uid]);

  // Update course members
  useEffect(() => {
    if (!form.courseId) return setCourseMembers([]);
    const c = courses.find((x) => x.id === form.courseId);
    setCourseMembers(c?.members || []);
  }, [form.courseId, courses]);

  // Add student to course
  const addStudentToCourse = async () => {
    if (!newStudentEmail.trim()) return alert("Enter an email!");

    const email = newStudentEmail.toLowerCase();
    const found = allUsers.find((u) => u.email.toLowerCase() === email);

    if (!found) return alert("User not found!");

    const ref = doc(db, "courses", form.courseId);

    await updateDoc(ref, { members: arrayUnion(found.uid) });

    setForm((prev) => ({
      ...prev,
      assignedTo: [...prev.assignedTo, found.uid]
    }));

    setNewStudentEmail("");
    setShowAddModal(false);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return alert("Title required!");
    if (!form.courseId) return alert("Select a course!");
    if (form.assignedTo.length === 0)
      return alert("Assign at least one student!");

    const course = courses.find((c) => c.id === form.courseId);

    const courseRef = doc(db, "courses", form.courseId);
    for (const id of form.assignedTo) {
      await updateDoc(courseRef, { members: arrayUnion(id) });
    }

    const payload = {
      ...form,
      courseName: course?.name || "Unknown Course",
      updatedAt: new Date().toISOString()
    };

    if (editingId) {
      await updateDoc(doc(db, "generalTasks", editingId), payload);
      setEditingId(null);
    } else {
      await addDoc(collection(db, "generalTasks"), {
        ...payload,
        createdBy: uid,
        completed: false,
        createdAt: new Date().toISOString()
      });
    }

    setForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      courseId: "",
      assignedTo: []
    });
  };

  const toggleComplete = async (task) => {
    await updateDoc(doc(db, "generalTasks", task.id), {
      completed: !task.completed
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteDoc(doc(db, "generalTasks", id));
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      courseId: task.courseId,
      assignedTo: task.assignedTo || []
    });
  };

  // FILTER LOGIC (same as MyTasks)
  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter === "complete" && !task.completed) return false;
      if (statusFilter === "incomplete" && task.completed) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "asc") return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === "desc") return new Date(b.dueDate) - new Date(a.dueDate);
      return 0;
    });

  if (loading) return <h3>Loading...</h3>;

  return (
    <div className="dashboard-container">
      
      <div className="topbar">
        <div className="top-left">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
        <div className="top-center">Shared Tasks</div>
      </div>

      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="sharedTasks" />

        <div className="main">

          {/* FILTERS FROM MYTASKS */}
          <div className="task-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="complete">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="none">Sort by Due Date</option>
              <option value="asc">Due Date ↑</option>
              <option value="desc">Due Date ↓</option>
            </select>
          </div>

          {/* FORM */}
          <div className="task-form-box">
            <h2>{editingId ? "Edit Task" : "Create Shared Task"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                className="task-input"
                placeholder="Title*"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                className="task-input"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  className="task-input"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />

                <select
                  className="task-input"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <select
                className="task-input"
                value={form.courseId}
                onChange={(e) =>
                  setForm({ ...form, courseId: e.target.value })
                }
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Students */}
              {form.courseId && (
                <div className="assign-box">
                  <b>Assign to Students:</b>

                  {allUsers
                    .filter((u) => courseMembers.includes(u.uid))
                    .map((u) => (
                      <label key={u.uid} className="student-row">
                        <input
                          type="checkbox"
                          checked={form.assignedTo.includes(u.uid)}
                          onChange={() => {
                            setForm((prev) => ({
                              ...prev,
                              assignedTo: prev.assignedTo.includes(u.uid)
                                ? prev.assignedTo.filter((x) => x !== u.uid)
                                : [...prev.assignedTo, u.uid]
                            }));
                          }}
                        />
                        {getUserName(u)} ({u.email})
                      </label>
                    ))}

                  <button
                    type="button"
                    className="add-student-btn"
                    onClick={() => setShowAddModal(true)}
                  >
                    + Add Student
                  </button>
                </div>
              )}

              <button className="shared-submit-btn">
                {editingId ? "Update Task" : "Add Task"}
              </button>
            </form>
          </div>

          {/* TASKS LIST */}
          <div className="tasks-list">
            {filteredTasks.map((task) => {
              const assignedNames = task.assignedTo
                ?.map((id) => {
                  const u = allUsers.find((x) => x.uid === id);
                  return u ? getUserName(u) : "Unknown";
                })
                .join(", ");

              return (
                <div
                  key={task.id}
                  className={`task-card ${task.completed ? "completed" : ""}`}
                >
                  <div
                    className={`task-check ${task.completed ? "completed" : ""}`}
                    onClick={() => toggleComplete(task)}
                  />

                  <div className="task-info">
                    <div className="task-title">{task.title}</div>

                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}

                    <div className="task-meta">
                      Due: {task.dueDate || "—"}
                      <span
                        className={`priority-chip priority-${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="task-meta">
                      Course: <strong>{task.courseName}</strong>
                    </div>

                    <div className="task-meta">
                      👥 Assigned: {assignedNames}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)}>✎</button>
                    <button className="delete" onClick={() => handleDelete(task.id)}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Add Student</h3>

            <input
              className="task-input"
              placeholder="Student Email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
            />

            <button className="shared-submit-btn" onClick={addStudentToCourse}>
              Add
            </button>

            <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
