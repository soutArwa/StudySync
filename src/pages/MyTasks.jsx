
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
    where
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../Components/Sidebar";

const PRIORITIES = ["Low", "Medium", "High"];

export default function MyTasks() {

    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pageName = "My Tasks";

    const [userInfo, setUserInfo] = useState({ displayName: "User", email: "" });
    const [uid, setUid] = useState(null);

    const [courses, setCourses] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        courseId: "",
        courseName: "",
    });

    const [editingId, setEditingId] = useState(null);

    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("none");

    // ==========================
    // Load user + tasks + courses
    // ==========================

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            setUid(user.uid);

            setUserInfo({
                displayName: user.displayName || "User",
                email: user.email,
            });

            const cq = query(
                collection(db, "courses"),
                where("members", "array-contains", user.uid)
            );

            onSnapshot(cq, (snap) => {
                const list = snap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));
                setCourses(list);
            });

            const tq = query(
                collection(db, "tasks"),
                where("userId", "==", user.uid)
            );

            onSnapshot(tq, (snap) => {
                let list = snap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }));

                list.sort((a, b) => {
                    const da = new Date(a.createdAt || 0);
                    const db = new Date(b.createdAt || 0);
                    return db - da;
                });

                setTasks(list);
                setLoading(false);
            });
        });

        return () => unsub();
    }, []);

    // ==========================
    // Filters
    // ==========================

    const filteredTasks = tasks
        .filter(task => {
            if (statusFilter === "complete" && !task.completed) return false;
            if (statusFilter === "incomplete" && task.completed) return false;
            if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "asc") return new Date(a.dueDate) - new Date(b.dueDate);
            if (sortBy === "desc") return new Date(b.dueDate) - new Date(a.dueDate);
            return 0;
        });

    // ==========================
    // Handlers
    // ==========================

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return alert("Title is required!");

        try {
            if (editingId) {
                await updateDoc(doc(db, "tasks", editingId), {
                    ...form,
                    updatedAt: new Date().toISOString(),
                });
                setEditingId(null);
            } else {
                await addDoc(collection(db, "tasks"), {
                    ...form,
                    userId: uid,
                    completed: false,
                    createdAt: new Date().toISOString(),
                });
            }

            setForm({
                title: "",
                description: "",
                dueDate: "",
                priority: "Medium",
                courseId: "",
                courseName: "",
            });

        } catch (err) {
            console.error(err);
            alert("Error saving task");
        }
    };

    const handleEdit = (task) => {
        setEditingId(task.id);
        setForm({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            courseId: task.courseId || "",
            courseName: task.courseName || "",
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        await deleteDoc(doc(db, "tasks", id));
    };

    const toggleComplete = async (task) => {
        await updateDoc(doc(db, "tasks", task.id), {
            completed: !task.completed,
        });
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // ==========================
    // UI
    // ==========================

    if (loading) {
        return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h3>;
    }

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
                <Sidebar
                    isOpen={sidebarOpen}
                    userInfo={userInfo}
                    active="myTasks"
                />

                {/* Main */}
                <div className="main">

                    {/* Filters */}
                    <div className="task-filters">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="complete">Completed</option>
                            <option value="incomplete">Incomplete</option>
                        </select>

                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="all">All Priorities</option>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="none">Sort by Due Date</option>
                            <option value="asc">Due Date ↑</option>
                            <option value="desc">Due Date ↓</option>
                        </select>
                    </div>

                    {/* Form */}
                    <div className="task-form-box">
                        <h2>{editingId ? "Edit Task" : "Create New Task"}</h2>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Title*"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />

                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />

                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                            />

                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>

                            <select
                                value={form.courseId}
                                onChange={(e) => {
                                    const c = courses.find(x => x.id === e.target.value);
                                    setForm({
                                        ...form,
                                        courseId: e.target.value,
                                        courseName: c?.name || "",
                                    });
                                }}
                            >
                                <option value="">No Course</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <button type="submit">{editingId ? "Update" : "Add Task"}</button>
                        </form>
                    </div>

                    {/* Tasks List */}
                    <div className="tasks-list">
                        {filteredTasks.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#93a0b4" }}>No tasks found.</p>
                        ) : (
                            filteredTasks.map(task => (
                                <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`}>

                                    {/* Check */}
                                    <div
                                        className={`task-check ${task.completed ? "completed" : ""}`}
                                        onClick={() => toggleComplete(task)}
                                    ></div>

                                    {/* Content */}
                                    <div className="task-info">
                                        <div className={`task-title ${task.completed ? "completed" : ""}`}>
                                            {task.title}
                                        </div>

                                        {task.courseName && (
                                            <div className="task-meta">
                                                Course: <strong>{task.courseName}</strong>
                                            </div>
                                        )}

                                        {task.description && (
                                            <div className="task-description">{task.description}</div>
                                        )}

                                        <div className="task-meta">
                                            Due: {task.dueDate || "—"}
                                            <span className={`priority-chip priority-${task.priority.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="task-actions">
                                        <button onClick={() => handleEdit(task)}>✎</button>
                                        <button className="delete" onClick={() => handleDelete(task.id)}>🗑</button>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
