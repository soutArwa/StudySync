import React, { useState, useEffect } from "react";
import "../Dashboard.css";
import { useNavigate } from "react-router-dom";
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDoc, // تم إضافة getDoc لجلب بيانات المستخدم
    onSnapshot, 
    query, 
    orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";

const MEMBERS = ["Me", "Noura", "Sara", "Mousa", "Raghad"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function MyTasks() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [nav, setNav] = useState("myTasks");
    const pageName = "My Tasks";

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    // حالة لتخزين بيانات المستخدم (الاسم والإيميل)
    const [userInfo, setUserInfo] = useState({ displayName: "User", email: "" });
    const [currentUserUid, setCurrentUserUid] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignee: "Me",
    });
    const [editingTaskId, setEditingTaskId] = useState(null);

    const [statusFilter, setStatusFilter] = useState("all");
    const [assigneeFilter, setAssigneeFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("none");

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setCurrentUserUid(currentUser.uid);
                
                // 1. جلب الاسم من Firestore لضمان ظهور الاسم الصحيح
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userDocRef);
                    
                    if (userSnap.exists()) {
                        setUserInfo({
                            displayName: userSnap.data().displayName || currentUser.displayName || "User",
                            email: currentUser.email
                        });
                    } else {
                        setUserInfo({
                            displayName: currentUser.displayName || "User",
                            email: currentUser.email
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUserInfo({
                        displayName: currentUser.displayName || "User",
                        email: currentUser.email
                    });
                }

                // 2. جلب المهام
                const q = query(
                    collection(db, 'users', currentUser.uid, 'personalTasks'),
                    orderBy('createdAt', 'desc')
                );

                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const tasksData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setTasks(tasksData);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching tasks:", error);
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setCurrentUserUid(null);
                setTasks([]);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    // باقي المنطق كما هو...
    const filteredAndSortedTasks = tasks
        .filter((task) => {
            if (statusFilter === "complete" && !task.completed) return false;
            if (statusFilter === "incomplete" && task.completed) return false;
            if (assigneeFilter !== "all" && task.assignee !== assigneeFilter) return false;
            if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "asc") return new Date(a.dueDate) - new Date(b.dueDate);
            if (sortBy === "desc") return new Date(b.dueDate) - new Date(a.dueDate);
            return 0;
        });

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const logout = () => navigate("/logout");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return alert("Title is required!");
        if (!currentUserUid) return alert("You must be logged in");

        try {
            if (editingTaskId) {
                const taskRef = doc(db, 'users', currentUserUid, 'personalTasks', editingTaskId);
                await updateDoc(taskRef, {
                    ...form,
                    updatedAt: new Date().toISOString()
                });
                setEditingTaskId(null);
            } else {
                await addDoc(collection(db, 'users', currentUserUid, 'personalTasks'), {
                    ...form,
                    completed: false,
                    createdAt: new Date().toISOString()
                });
            }
            setForm({
                title: "",
                description: "",
                dueDate: "",
                priority: "Medium",
                assignee: "Me",
            });
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task");
        }
    };

    const handleEdit = (task) => {
        setForm({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            assignee: task.assignee
        });
        setEditingTaskId(task.id);
    };

    const handleDelete = async (id) => {
        if (!currentUserUid) return;
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteDoc(doc(db, 'users', currentUserUid, 'personalTasks', id));
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const toggleComplete = async (task) => {
        if (!currentUserUid) return;
        try {
            const taskRef = doc(db, 'users', currentUserUid, 'personalTasks', task.id);
            await updateDoc(taskRef, {
                completed: !task.completed
            });
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="main" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <h3>Loading tasks...</h3>
                </div>
            </div>
        );
    }

    return (
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

            {/* Sidebar */}
            {sidebarOpen && (
                <aside className="side">
                    <div className="user">
                        <div className="avatar">
                            {userInfo.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800 }}>
                                {userInfo.displayName}
                            </div>
                            <div className="email">{userInfo.email}</div>
                        </div>
                    </div>

                    <div className="menu">
                        <button
                            className={nav === "account" ? "active" : ""}
                            onClick={() => navigate("/dashboard")}
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
                            className={nav === "profile" ? "active" : ""}
                            onClick={() => navigate("/profile")}
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
                <div className="task-filters">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="complete">Completed</option>
                        <option value="incomplete">Incomplete</option>
                    </select>
                    <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
                        <option value="all">All Assignees</option>
                        {MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="all">All Priorities</option>
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="none">Sort by Due Date</option>
                        <option value="asc">Due Date ↑</option>
                        <option value="desc">Due Date ↓</option>
                    </select>
                </div>

                <div className="task-form-box">
                    <h2>{editingTaskId ? "Edit Task" : "Create New Task"}</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="title" placeholder="Title*" value={form.title} onChange={handleChange} required />
                        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
                        <select name="priority" value={form.priority} onChange={handleChange}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select name="assignee" value={form.assignee} onChange={handleChange}>
                            {MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <button type="submit">{editingTaskId ? "Update" : "Add Task"}</button>
                    </form>
                </div>

                <div className="tasks-list">
                    {filteredAndSortedTasks.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#888'}}>No tasks found.</p>
                    ) : (
                        filteredAndSortedTasks.map((task) => (
                            <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`}>
                                <h3>{task.title}</h3>
                                {task.description && <p>{task.description}</p>}
                                {task.dueDate && <p>Due: {task.dueDate}</p>}
                                <p>Priority: {task.priority}</p>
                                <p>Assignee: {task.assignee}</p>
                                <div className="task-actions">
                                    <button onClick={() => toggleComplete(task)}>
                                        {task.completed ? "Mark Incomplete" : "Mark Complete"}
                                    </button>
                                    <button onClick={() => handleEdit(task)}>Edit</button>
                                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}