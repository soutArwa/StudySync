# **StudySync Tasks – Cloud-Based Academic To-Do Application**

StudySync is a cloud-enabled task management system designed for student groups working on shared academic courses.
The application provides real-time synchronized task lists for each course, allowing students to collaboratively create, update, assign, and track academic tasks in a structured and organized interface.

---

## **1. Team Members**

* **Arwa Bilobeid** — Team Leader

  * Firebase Integration
  * Database Structure and Configuration
  * Frontend Integration
  * Testing and Quality Assurance

* **Yara Alsufayan** — Frontend & Database Integration, Testing

  * Connected Firestore data operations with frontend components
  * Implemented task features across course views
  * Contributed to functional testing (with Dana)

* **Dana Alqhtani** — Database Development & Frontend Integration

  * Designed Firestore collections and data relationships
  * Linked CRUD operations with the UI
  * Conducted testing for task functionality

* **Lujain AlTayyarah** — UI & Frontend Design

  * Designed core interface layouts
  * Developed styling and user experience flow
  * Created main page structures for the application

---

## **2. Project Overview**

**Use Case:**
University students working in groups often share deadlines, tasks, and project responsibilities. Standard to-do apps focus on individual users and lack real-time group synchronization.

**StudySync Tasks** addresses this by offering:

* Shared course-specific task lists
* Real-time updates across all users
* A unified academic task management solution per group

---

## **3. Application Features**

### **A. User Authentication**

* Secure account creation and login
* Email and password authentication
* User profile storage (email + display name)
* Email verification
* *Optional:* Password reset capability

### **B. Task Management (CRUD)**

Each task supports:

* Title (required)
* Description (optional)
* Due date (optional)
* Priority (Low / Medium / High)
* Assignment to a group member

Functionalities include:

* Create tasks
* View and filter tasks
* Edit task details
* Mark tasks complete/incomplete
* Delete tasks

### **C. Cloud Storage & Real-Time Synchronization**

* Built using **Firebase Firestore**
* All changes instantly synchronized for users in the same course
* Data hierarchy: **Users → Courses → Tasks**
* Optimized structure for course-based collaboration

### **D. Frontend UI**

* Developed using **React (Vite)**
* Fully responsive single-page application (SPA)
* Includes:

  * Login / Register page
  * Dashboard with user-wide task overview
  * Course-specific task pages
  * Forms for adding and editing tasks
  * Clear distinction between completed and pending tasks

---

## **4. Technology Stack**

* **Frontend:** React (Vite)
* **Authentication:** Firebase Authentication
* **Database:** Firebase Firestore
* **Hosting:** Firebase Hosting
* **Other Tools:** Node.js, npm, Git, GitHub

---

## **5. Setup Instructions (How to Run the Project Locally)**

### **Step 1: Install Dependencies**

```bash
npm install
```

### **Step 2: Add Environment Variables**

Create a `.env` file in the project root and include:

```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

These values are provided in Firebase Project Settings → Web App Configuration.

### **Step 3: Run the Development Server**

```bash
npm run dev
```

Application will run on:

```
http://localhost:5173/
```

---

## **6. Deployment Instructions (Firebase Hosting)**

### **Build the Project**

```bash
npm run build
```

### **Deploy to Firebase**

```bash
firebase deploy
```

The hosting output is served from the `dist` directory.


---

## **7. Live Demo URL**

The deployed version of the project is available at:
**[https://studysync-database.web.app](https://studysync-database.web.app)**

