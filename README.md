
## Structer 
src/
├─ assets/                           - [UI/UX]
├─ Components/                       - [UI/UX]
├─ pages/                            - صفحات التطبيق 
│   ├─ Login.jsx                     
│   └─ Register.jsx
├─ Services/                         -- Firebase [Backend]  * لا تعدلون  على فنكشن الايميل  * 
│   └─ Authentication_email.service.js
├─ App.jsx                           ← [Routing]
├─ firebase.js                       ← تهيئة Firebase للمشروع [Backend - ثابت]  * لا تعدلون شي فيه 
├─ main.jsx                          ← [Routing - ثابت]
├─ App.css / index.css               ←  [UI/UX]


## workspace ##

## UI  X UX 
ملف الكومبوننت انا قسمته لثلاث اشياء 
login.jsx وهو مرتبط ب 
ممكن انكم تحذفونه وتسوون ملف واحد شامل كل شي اهم شي الهيكل نفسه 

Register.jsx كامل ناقصه بس الواجهة تكون مضبوطه كشكل بتحتاجون تعدلون اماكن و ترفعون وتنزلون بس 

Where the UI/UX Team Should Write Code:
* **`Register.jsx`**: Inside the JSX area marked with
  // TODO: UI Section (Register Form)

* **`Login.jsx`**: Inside the JSX area marked with
  // TODO: UI Section (Login Form)

فيه صفحات زياده بس هذا الي انا خلصته و كيف تكملون الشغل  عليه 

**اي شي قبله لا تغيرون فيه ابدا الا لو بيأثر على شغلكم و احفظوا الملف قبل تعدلونه**
**components لو تحتاجون مكونات منفصله زي الازرار لا تحطونها بالبيج نفسها حطوا با**
**must not call Firebase directly from these components**
**All Firebase interactions must go through the service layer: src/Services/**



## Back-end
─ main.jsx                          ← [Routing - ثابت]
├─ Services/                         -- Firebase [Backend] 
│   └─ Authentication_email.service.js 
