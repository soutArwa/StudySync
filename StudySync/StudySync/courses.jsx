import React, { useState, useEffect } from "react";
import "../Dashboard.css";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Courses() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [nav, setNav] = useState("courses");

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseForm, setCourseForm] = useState({
        name: "",
        description: ""
    });
    const [userInfo, setUserInfo] = useState({
        displayName: "",
        email: ""
    });

    useEffect(() => {
        // استخدم onAuthStateChanged بدل currentUser مباشرة
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // المستخدم مسجل - جلب البيانات
                setUserInfo({
                    displayName: user.displayName || "User",
                    email: user.email || ""
                });

                const unsubscribeFirestore = onSnapshot(
                    collection(db, 'courses'),
                    (snapshot) => {
                        const coursesData = [];
                        snapshot.forEach(doc => {
                            const courseData = doc.data();
                            if (courseData.members && courseData.members.includes(user.uid)) {
                                coursesData.push({ id: doc.id, ...courseData });
                            }
                        });
                        setCourses(coursesData);
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error fetching courses:", error);
                        setLoading(false);
                    }
                );

                return () => unsubscribeFirestore();
            } else {
                // لا يوجد مستخدم مسجل
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

   const handleChange = (e) => {
       setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
   };

   const handleAddCourse = async (e) => {
       e.preventDefault();
       if (!courseForm.name) return alert("Course name is required!");

       try {
           await addDoc(collection(db, 'courses'), {
               name: courseForm.name,
               description: courseForm.description,
               createdBy: auth.currentUser.uid,
               createdAt: new Date(),
               members: [auth.currentUser.uid]
           });

           setCourseForm({ name: "", description: "" });
           alert("Course added successfully! ");
       } catch (error) {
           console.error("Error adding course:", error);
           alert("Failed to add course");
       }
   };

   const handleDeleteCourse = async (courseId) => {
       if (window.confirm('Are you sure you want to delete this course?')) {
           try {
               await deleteDoc(doc(db, 'courses', courseId));
           } catch (error) {
               console.error("Error deleting course:", error);
           }
       }
   };

   if (loading) {
       return (
           <div className="dashboard-container">
               <div className="main">
                   <div style={{ textAlign: 'center', padding: '50px' }}>
                       <h3>Loading courses...</h3>
                   </div>
               </div>
           </div>
       );
   }

   return (
       <div className="dashboard-container">
           {/* Topbar */}
           <div className="topbar">
               <button onClick={toggleSidebar}>☰</button>
               <div className="top-center">Courses</div>
           </div>

           {/* Sidebar */}
           {sidebarOpen && (
               <aside className="side">
                   <div className="user">
                       <div className="avatar">
                           {userInfo.displayName?.[0]?.toUpperCase() || 'U'}
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
                       <button onClick={() => navigate("/logout")}>Log out</button>
                   </div>
               </aside>
           )}

           {/* Main Content */}
           <div className="main">
               <div className="task-form-box">
                   <h2>Add Course</h2>
                   <form onSubmit={handleAddCourse}>
                       <input
                           type="text"
                           name="name"
                           placeholder="Course Name"
                           value={courseForm.name}
                           onChange={handleChange}
                       />
                       <textarea
                           name="description"
                           placeholder="Description (optional)"
                           value={courseForm.description}
                           onChange={handleChange}
                       />
                       <button type="submit">Add Course</button>
                   </form>
               </div>

               <div className="tasks-list">
                   {courses.length === 0 ? (
                       <p>No courses yet. Add your first course!</p>
                   ) : (
                       courses.map((c) => (
                           <div key={c.id} className="task-card">
                               <h3>{c.name}</h3>
                               {c.description && <p>{c.description}</p>}
                               <button onClick={() => navigate(`/myTasks?course=${c.id}`)}>
                                   View Tasks
                               </button>
                               <button onClick={() => handleDeleteCourse(c.id)}>
                                   Delete Course
                               </button>
                           </div>
                       ))
                   )}
               </div>
           </div>
       </div>
   );
}