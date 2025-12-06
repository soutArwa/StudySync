
// import React, { useState, useEffect } from "react";
// import "../Components/Dashboard.css";
// import { useNavigate } from "react-router-dom";
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   query,
//   where,
//   arrayUnion
// } from "firebase/firestore";
// import { db, auth } from "../firebase";
// import Sidebar from "../Components/Sidebar";

// const PRIORITIES = ["Low", "Medium", "High"];

// export default function SharedTasks() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const pageName = "Shared Tasks";

//   // ==========================
//   // User Info
//   // ==========================
//   const [userInfo, setUserInfo] = useState({ displayName: "User", email: "" });
//   const [uid, setUid] = useState(null);

//   // ==========================
//   // Data States
//   // ==========================
//   const [courses, setCourses] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ==========================
//   // Form State
//   // ==========================
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     dueDate: "",
//     priority: "Medium",
//     courseId: "",
//     assignedTo: []
//   });

//   const [editingId, setEditingId] = useState(null);

//   // ==========================
//   // Filters
//   // ==========================
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [priorityFilter, setPriorityFilter] = useState("all");
//   const [sortBy, setSortBy] = useState("none");

//   // ==========================
//   // Load Data
//   // ==========================
//   useEffect(() => {
//     const user = auth.currentUser;
//     if (!user) return navigate("/login");

//     setUid(user.uid);
//     setUserInfo({
//       displayName: user.displayName || "User",
//       email: user.email,
//     });

//     // Load all users
//     const usersQuery = query(collection(db, "users"));
//     const unsubUsers = onSnapshot(usersQuery, (snap) => {
//       const usersList = snap.docs.map(d => ({
//         uid: d.id,
//         ...d.data()
//       }));
//       setAllUsers(usersList);
//     });

//     // Load courses
//     const coursesQuery = query(
//       collection(db, "courses"),
//       where("members", "array-contains", user.uid)
//     );
//     const unsubCourses = onSnapshot(coursesQuery, (snap) => {
//       const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setCourses(list);
//     });

//     // Load tasks
//     const tasksQuery = query(collection(db, "generalTasks"));
//     const unsubTasks = onSnapshot(tasksQuery, (snap) => {
//       const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));

//       const list = raw.filter(task => {
//         const inSameCourse = courses.some(c => c.id === task.courseId);
//         const assigned = task.assignedTo?.includes(user.uid);
//         const createdByMe = task.createdBy === user.uid;
//         return inSameCourse || assigned || createdByMe;
//       });

//       list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

//       setTasks(list);
//       setLoading(false);
//     });

//     return () => {
//       unsubUsers();
//       unsubCourses();
//       unsubTasks();
//     };
//   }, [navigate, courses.length]);

//   // ==========================
//   // Helpers
//   // ==========================
//   const getUserDisplayName = (user) => {
//     if (!user) return "Unknown";

//     if (user.displayName && user.displayName.trim() !== "")
//       return user.displayName;

//     if (user.name && user.name.trim() !== "")
//       return user.name;

//     return user.email || "Unknown";
//   };

//   // ==========================
//   // Handlers
//   // ==========================
//   const toggleAssign = (userId) => {
//     const arr = form.assignedTo.includes(userId)
//       ? form.assignedTo.filter(x => x !== userId)
//       : [...form.assignedTo, userId];

//     setForm({ ...form, assignedTo: arr });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title.trim()) return alert("Title is required!");
//     if (!form.courseId) return alert("Select a course!");
//     if (form.assignedTo.length === 0) return alert("Assign to at least one member!");

//     const courseRef = doc(db, "courses", form.courseId);
//     const course = courses.find(c => c.id === form.courseId);

//     try {
//       // Auto-add users to course
//       for (const userId of form.assignedTo) {
//         await updateDoc(courseRef, {
//           members: arrayUnion(userId)
//         });
//       }

//       const payload = {
//         ...form,
//         courseName: course ? course.name : "Unknown Course",
//         updatedAt: new Date().toISOString(),
//       };

//       if (editingId) {
//         await updateDoc(doc(db, "generalTasks", editingId), payload);
//         setEditingId(null);
//       } else {
//         await addDoc(collection(db, "generalTasks"), {
//           ...payload,
//           createdBy: uid,
//           completed: false,
//           createdAt: new Date().toISOString()
//         });
//       }

//       // Reset
//       setForm({
//         title: "",
//         description: "",
//         dueDate: "",
//         priority: "Medium",
//         courseId: "",
//         assignedTo: []
//       });

//     } catch (err) {
//       console.error(err);
//       alert("Error saving task: " + err.message);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this task?")) return;
//     await deleteDoc(doc(db, "generalTasks", id));
//   };

//   const toggleComplete = async (task) => {
//     await updateDoc(doc(db, "generalTasks", task.id), {
//       completed: !task.completed,
//     });
//   };

//   const handleEdit = (task) => {
//     setEditingId(task.id);
//     setForm({
//       title: task.title,
//       description: task.description,
//       dueDate: task.dueDate,
//       priority: task.priority,
//       courseId: task.courseId || "",
//       assignedTo: task.assignedTo || []
//     });
//   };

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   // ==========================
//   // Sorting + Filters
//   // ==========================
//   const filteredTasks = tasks
//     .filter(task => {
//       if (statusFilter === "complete" && !task.completed) return false;
//       if (statusFilter === "incomplete" && task.completed) return false;
//       if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
//       return true;
//     })
//     .sort((a, b) => {
//       if (sortBy === "asc") return new Date(a.dueDate) - new Date(b.dueDate);
//       if (sortBy === "desc") return new Date(b.dueDate) - new Date(a.dueDate);
//       return 0;
//     });

//   if (loading) return <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h3>;

//   // ==========================
//   // RENDER
//   // ==========================
//   return (
//     <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      
//       <div className="topbar">
//         <div className="top-left">
//           <button onClick={toggleSidebar}>☰</button>
//         </div>
//         <div className="top-center">{pageName}</div>
//       </div>

//       <div className="content-wrapper" style={{ display: "flex", flex: 1, overflow: "hidden" }}>

//         <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="sharedTasks" />

//         <div className="main" style={{ flex: 1, overflowY: "auto", padding: "20px", paddingBottom: "80px" }}>

//           {/* Task Form */}
//           <div className="task-form-box">
//             <h2>{editingId ? "Edit Task" : "Create Shared Task"}</h2>

//             <form onSubmit={handleSubmit}>
//               <input
//                 type="text"
//                 placeholder="Title*"
//                 value={form.title}
//                 onChange={(e) => setForm({ ...form, title: e.target.value })}
//               />

//               <textarea
//                 placeholder="Description"
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//               />

//               <div style={{display:'flex', gap:'10px'}}>
//                 <input
//                   type="date"
//                   style={{flex:1}}
//                   value={form.dueDate}
//                   onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
//                 />
//                 <select
//                   style={{flex:1}}
//                   value={form.priority}
//                   onChange={(e) => setForm({ ...form, priority: e.target.value })}
//                 >
//                   {PRIORITIES.map(p => (
//                     <option key={p} value={p}>{p}</option>
//                   ))}
//                 </select>
//               </div>

//               <select
//                 value={form.courseId}
//                 onChange={(e) => setForm({ ...form, courseId: e.target.value })}
//                 style={{marginTop: '10px'}}
//               >
//                 <option value="">Select Course</option>
//                 {courses.map(c => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>

//               {/* Members Assignment */}
//               <div className="members-box" 
//                 style={{
//                   marginTop: "15px",
//                   maxHeight: "150px",
//                   overflowY: "auto",
//                   border: "1px solid #ddd",
//                   padding: "10px",
//                   borderRadius: "5px",
//                   backgroundColor: "#fff"
//                 }}
//               >
//                 <p style={{fontWeight: "bold", marginBottom: "8px"}}>Assign to Students:</p>

//                 {allUsers.length === 0 ? (
//                   <p style={{color:'#999', fontSize:'0.9rem'}}>No users found.</p>
//                 ) : (
//                   allUsers.map(user => {
//                     const display = getUserDisplayName(user);

//                     return (
//                       <label
//                         key={user.uid}
//                         className="member-item"
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "10px",
//                           marginBottom: "8px",
//                           cursor: "pointer",
//                           borderBottom: "1px solid #f0f0f0",
//                           paddingBottom: "5px"
//                         }}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={form.assignedTo.includes(user.uid)}
//                           onChange={() => toggleAssign(user.uid)}
//                           style={{ width: "auto", margin: 0 }}
//                         />

//                         <div style={{ display: "flex", flexDirection: "column" }}>
//                           <span style={{ fontWeight: "600", color: "#333" }}>
//                             {display}
//                           </span>
//                           <span style={{ fontSize: "0.8rem", color: "#888" }}>
//                             {user.email}
//                           </span>
//                         </div>
//                       </label>
//                     );
//                   })
//                 )}
//               </div>

//               <button type="submit" style={{marginTop: "15px"}}>
//                 {editingId ? "Update Task" : "Add Task"}
//               </button>
//             </form>
//           </div>

//           {/* Tasks List */}
//           <div className="tasks-list-container" style={{ marginTop: "40px" }}>
//             <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "20px" }}>
//               Tasks List
//             </h3>

//             <div className="tasks-list">
//               {filteredTasks.length === 0 ? (
//                 <p style={{ textAlign: "center", color: "#93a0b4", marginTop: "20px" }}>
//                   No tasks found.
//                 </p>
//               ) : (
//                 filteredTasks.map(task => {
//                   const assignedNames = task.assignedTo
//                     ?.map(uid => {
//                       const user = allUsers.find(u => u.uid === uid);
//                       return user ? getUserDisplayName(user) : "Unknown";
//                     })
//                     .join(", ");

//                   return (
//                     <div key={task.id} className={`task-card ${task.completed ? "completed" : ""}`} style={{marginBottom: "15px"}}>
//                       <div onClick={() => toggleComplete(task)} className={`task-check ${task.completed ? "completed" : ""}`} />

//                       <div className="task-info">
//                         <div className={`task-title ${task.completed ? "completed" : ""}`}>
//                           {task.title}
//                         </div>

//                         <div style={{fontSize:'0.85rem', color:'#555', marginBottom:'5px'}}>
//                           Course: <strong>{task.courseName}</strong>
//                         </div>

//                         {task.description && (
//                           <div className="task-description">{task.description}</div>
//                         )}

//                         <div className="task-meta">
//                           Due: {task.dueDate || "—"}
//                           <span className={`priority-chip priority-${task.priority.toLowerCase()}`}>
//                             {task.priority}
//                           </span>
//                         </div>

//                         {/* Display assigned names */}
//                         <div style={{fontSize:'0.8rem', color:'#777', marginTop:'5px'}}>
//                           👥 Assigned to: {assignedNames || "No students"}
//                         </div>
//                       </div>

//                       <div className="task-actions">
//                         <button onClick={() => handleEdit(task)}>✎</button>
//                         <button className="delete" onClick={() => handleDelete(task.id)}>🗑</button>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

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

  const getUserName = (u) =>
    u?.displayName?.trim() || u?.name?.trim() || u?.email || "Unknown";

  // Load user
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return navigate("/login");

    setUid(u.uid);
    setUserInfo({
      displayName: u.displayName || "User",
      email: u.email,
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

  // Update course members when course changes
  useEffect(() => {
    if (!form.courseId) return setCourseMembers([]);
    const c = courses.find((x) => x.id === form.courseId);
    setCourseMembers(c?.members || []);
  }, [form.courseId, courses]);

  // Add Student to Course
  const addStudentToCourse = async () => {
    if (!newStudentEmail.trim()) return alert("Enter an email!");

    const email = newStudentEmail.toLowerCase();
    const found = allUsers.find((u) => u.email.toLowerCase() === email);

    if (!found) return alert("User not found!");

    const ref = doc(db, "courses", form.courseId);

    await updateDoc(ref, {
      members: arrayUnion(found.uid)
    });

    // Also assign immediately
    setForm((prev) => ({
      ...prev,
      assignedTo: [...prev.assignedTo, found.uid]
    }));

    setNewStudentEmail("");
    setShowAddModal(false);
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return alert("Title is required!");
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
    if (!window.confirm("Delete this task?")) return;
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

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <div className="top-center">Shared Tasks</div>
      </div>

      <div className="content-wrapper">
        <Sidebar isOpen={sidebarOpen} userInfo={userInfo} active="sharedTasks" />

        <div className="main">

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

                  {/* ADD STUDENT BUTTON */}
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
            {tasks.map((task) => {
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
                    className={`task-check ${
                      task.completed ? "completed" : ""
                    }`}
                    onClick={() => toggleComplete(task)}
                  />

                  <div className="task-info">
                    <div className="task-title">{task.title}</div>

                    {task.description && (
                      <div className="task-description">
                        {task.description}
                      </div>
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
                    <button
                      className="delete"
                      onClick={() => handleDelete(task.id)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
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

            <button
              className="cancel-btn"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
