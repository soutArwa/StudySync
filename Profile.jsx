import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [nav, setNav] = useState("profile");
    
    // حالة لتخزين بيانات المستخدم للعرض فقط
    const [userInfo, setUserInfo] = useState({
        displayName: "",
        email: ""
    });
    const [loading, setLoading] = useState(true);

    // جلب بيانات اليوزر من Firebase (كولكشن users) عند تحميل الصفحة
    useEffect(() => {
        // نستخدم onAuthStateChanged لحل مشكلة التحديث (Refresh)
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // محاولة جلب البيانات من مجموعة users في Firestore باستخدام الـ UID
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        // الأولوية للاسم الموجود في قاعدة البيانات (users collection)
                        setUserInfo({
                            displayName: userData.displayName || user.displayName || "User",
                            email: userData.email || user.email
                        });
                    } else {
                        // في حال لم يوجد ملف للمستخدم في Firestore، نستخدم بيانات Auth الأساسية
                        setUserInfo({
                            displayName: user.displayName || "User",
                            email: user.email
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // في حال الخطأ، نعرض البيانات المتاحة في الـ Auth
                    setUserInfo({
                        displayName: user.displayName || "User",
                        email: user.email
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                // المستخدم غير مسجل دخول
                setLoading(false);
                // يمكن توجيهه لصفحة الدخول إذا أردت: navigate("/login");
            }
        });

        // تنظيف الاشتراك عند الخروج من الصفحة
        return () => unsubscribe();
    }, [navigate]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const logout = () => navigate("/logout");

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="main">
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h3>Loading profile...</h3>
                    </div>
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
                <div className="top-center">Profile</div>
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
                            className={nav === "profile" ? "active" : ""}
                            onClick={() => setNav("profile")}
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
                <h2>Profile</h2>
                <div className="profile-box">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        {/* صورة الرمزية */}
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', marginBottom: '10px' }}>
                            {userInfo.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        
                        {/* عرض الاسم والإيميل */}
                        <h1 style={{ margin: 0 }}>{userInfo.displayName}</h1>
                        <p style={{ color: '#888', margin: 0 }}>{userInfo.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}