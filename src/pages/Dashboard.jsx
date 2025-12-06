// import React, { useState, useEffect } from "react";
// import { auth, db } from "../firebase";
// import { useNavigate } from "react-router-dom";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import "../Components/Dashboard.css";
// import Sidebar from "../Components/Sidebar";

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [pageName, setPageName] = useState("Dashboard");

//   const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });
//   const [courses, setCourses] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const u = auth.currentUser;
//       if (!u) return;

//       setUserInfo({
//         displayName: u.displayName || "User",
//         email: u.email,
//       });

//       try {
//         const q = query(
//           collection(db, "courses"),
//           where("members", "array-contains", u.uid)
//         );
//         const querySnapshot = await getDocs(q);
//         const fetchedCourses = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setCourses(fetchedCourses);
//       } catch (error) {
//         console.error("Error fetching courses:", error);
//       }
//     };

//     fetchData();
//   }, [navigate]);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   return (
//     <div className="app">
//       <div className="dashboard-container">
//         {/* Top Bar */}
//         <div className="topbar">
//           <div className="top-left">
//             <button onClick={toggleSidebar}>☰</button>
//           </div>
//           <div className="top-center">{pageName}</div>
//           <div className="top-right">
//             <button className="undo">↺</button>
//             <button className="redo">↻</button>
//           </div>
//         </div>

//         {/* Content Wrapper */}
//         <div className="content-wrapper">
//           {/* Sidebar (global component) */}
//           <Sidebar
//             isOpen={sidebarOpen}
//             userInfo={userInfo}
//             active="dashboard"
//           />

//           {/* Main Content */}
//           <div className="main">
//             <h2>Courses this semester</h2>
//             <div className="courses-grid">
//               {courses.length === 0 ? (
//                 <p style={{ padding: "20px", color: "#888" }}>
//                   No courses found. Go to 'Courses' to join or create one.
//                 </p>
//               ) : (
//                 courses.map((course) => (
//                   <div key={course.id} className="course-card">
//                     <h3>{course.name}</h3>
//                     <p>{course.description || "No description provided."}</p>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


 import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../Components/Dashboard.css";
import Sidebar from "../Components/Sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageName = "Dashboard";

  const [userInfo, setUserInfo] = useState({ displayName: "", email: "" });
  const [courses, setCourses] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const u = auth.currentUser;
      if (!u) {
        navigate("/login");
        return;
      }

      setUserInfo({
        displayName: u.displayName || "User",
        email: u.email,
      });

      try {
        // ================================
        // Fetch Courses
        // ================================
        const cq = query(
          collection(db, "courses"),
          where("members", "array-contains", u.uid)
        );
        const coursesSnap = await getDocs(cq);
        const fetchedCourses = coursesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);

        // ================================
        // Fetch Personal Tasks (collection: tasks)
        // ================================
        const tq1 = query(
          collection(db, "tasks"),
          where("userId", "==", u.uid)
        );
        const personalSnap = await getDocs(tq1);
        let personalTasks = personalSnap.docs.map((d) => ({
          id: d.id,
          type: "personal",
          ...d.data(),
        }));

        // ================================
        // Fetch Shared Tasks (collection: generalTasks)
        // ================================
        const tq2 = query(collection(db, "generalTasks"));
        const sharedSnap = await getDocs(tq2);

        let sharedTasks = sharedSnap.docs
          .map((d) => ({
            id: d.id,
            type: "shared",
            ...d.data(),
          }))
          .filter((task) => {
            // Logic copied from SharedTasks.jsx  :contentReference[oaicite:0]{index=0}
            const inSameCourse = fetchedCourses.some(c => c.id === task.courseId);
            const assigned = task.assignedTo?.includes(u.uid);
            const createdByMe = task.createdBy === u.uid;
            return inSameCourse || assigned || createdByMe;
          });

        // ================================
        // Merge + Sort + Limit to 5
        // ================================
        let combined = [...personalTasks, ...sharedTasks];

        combined.sort((a, b) => {
          const da = new Date(a.createdAt || 0);
          const db = new Date(b.createdAt || 0);
          return db - da;
        });

        setRecentTasks(combined.slice(0, 5)); // latest 5 tasks only

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        </div>

        {/* Content Area */}
        <div className="content-wrapper">
          <Sidebar
            isOpen={sidebarOpen}
            userInfo={userInfo}
            active="dashboard"
          />

          <div className="main">

            {/* Courses */}
            <h2>Courses this semester</h2>
            <div className="courses-grid">
              {courses.length === 0 ? (
                <p style={{ padding: "20px", color: "#888" }}>
                  No courses found.
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

            {/* Recent Tasks */}
            <h2 style={{ marginTop: "40px" }}>Recent Tasks</h2>

            <div className="tasks-list">
              {recentTasks.length === 0 ? (
                <p style={{ padding: "10px", color: "#888" }}>
                  No recent tasks.
                </p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    
                    <div className="task-title">
                      {task.title}
                    </div>

                    <div className="task-meta">
                      <div>
                        <strong>
                          {task.type === "shared" ? "Shared Task" : "My Task"}
                        </strong>
                      </div>

                      {task.courseName && (
                        <div style={{ marginBottom: "4px" }}>
                          Course: <strong>{task.courseName}</strong>
                        </div>
                      )}

                      <div>
                        Due: {task.dueDate || "—"}
                      </div>
                    </div>

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
