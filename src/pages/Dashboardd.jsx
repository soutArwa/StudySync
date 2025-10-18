import React, { useMemo, useState, useEffect } from "react";
const MEMBERS = ["Me", "Noura", "Sara", "Mousa", "Raghad"];
const PRIORITIES = ["Low", "Medium", "High"];

 // مدير العالم
const makeId = () =>
  (crypto?.randomUUID?.() ??
    ("id-" + Math.random().toString(36).slice(2) + Date.now()));

const seed = [
  {
    id: makeId(),
    title: "Review pull requests",
    description: "Check and approve pending PRs in the main repository",
    dueDate: "2025-10-12",
    priority: "Medium",
    assignee: "Mousa",
    completed: false,
  },
  {
    id: makeId(),
    title: "Design new landing page",
    description: "Create mockups for hero, features, and CTA",
    dueDate: "2025-10-15",
    priority: "High",
    assignee: "Sara",
    completed: false,
  },
  {
    id: makeId(),
    title: "Update documentation",
    description: "Add new API endpoints to the docs",
    dueDate: "2025-10-20",
    priority: "Low",
    assignee: "Sara",
    completed: true,
  },
];

// ---- Component ----
export default function TaskManager_NoTailwind() {
  // NAV (same keys so routing stays trivial later)
  const [nav, setNav] = useState("myTasks"); // profile | account | myTasks | sharedTasks

  // Data
  const [tasks, setTasks] = useState(seed);

  // Filters & sort
  const [status, setStatus] = useState("All"); // All | Active | Completedn
  const [assignee, setAssignee] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("Due Date");
  const [search, setSearch] = useState("");

  // Modal form
  const empty = {
    id: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignee: "Me", // default to self (English)
    completed: false,
  };
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  // ---- Inject CSS once (Dark theme) ----
  useEffect(() => {
    const css = `
      :root{
        /* Dark palette */
        --bg:#0b0f16;
        --panel:#121826;
        --border:#1f2937;
        --text:#e6eaf2;
        --muted:#9aa5b1;
        --brand:#3b82f6;
        --brand-d:#2563eb;
        --rose:#ef4444;
        --green:#22c55e;
        --amber:#f59e0b;
        --shadow:0 8px 24px rgba(0,0,0,.35);
      }
      *{box-sizing:border-box}
      body{margin:0; background:var(--bg); color:var(--text)}
      .app{min-height:100vh; display:flex; font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial}

      /* Sidebar */
      .side{
        width:240px; border-right:1px solid var(--border); background:#0f1522;
        display:flex; flex-direction:column; padding:20px
      }
      .user{display:flex; gap:10px; align-items:center; margin-bottom:20px}
      .avatar{
        height:40px; width:40px; border-radius:12px; background:linear-gradient(135deg,#4f46e5,#22c55e);
        color:#fff; display:grid; place-items:center; font-weight:800
      }
      .user .email{color:var(--muted); font-size:12px}
      .menu{display:flex; flex-direction:column; gap:6px}
      .menu button{
        appearance:none; border:1px solid transparent; background:transparent; color:var(--text);
        text-align:left; padding:10px 12px; border-radius:10px; cursor:pointer; transition:.15s ease
      }
      .menu button:hover{background:#121a2a; border-color:#192233}
      .menu .active{background:#121a2a; border-color:#223049; font-weight:600}
      .logout{margin-top:auto}
      .logout button{
        width:100%; appearance:none; border:1px solid #3a1f25; color:#ffb4b7; background:#1a0f12;
        padding:10px 12px; border-radius:10px; cursor:pointer
      }
      .logout button:hover{background:#251216}

      /* Main */
      .main{flex:1; min-width:0; display:flex; flex-direction:column}
      .topbar{
        position:sticky; top:0; background:#0f1522; border-bottom:1px solid var(--border);
        padding:14px 20px; display:flex; align-items:center; justify-content:space-between; z-index:10
      }
      .title{font-weight:800; letter-spacing:.2px}
      .counts{color:var(--muted); font-size:12px}
      .actions{display:flex; gap:8px; align-items:center}
      .search{
        width:260px; padding:8px 10px; border:1px solid var(--border); border-radius:10px;
        background:#0b0f16; color:var(--text)
      }
      .btn{
        appearance:none; border:1px solid #1f3b73; background:var(--brand); color:#fff;
        padding:9px 14px; border-radius:10px; cursor:pointer; font-weight:700
      }
      .btn:hover{background:var(--brand-d)}

      /* Filters */
      .filters{
        margin:14px auto; width:100%; max-width:1100px; background:var(--panel);
        border:1px solid var(--border); border-radius:16px; padding:10px; display:flex; flex-wrap:wrap; gap:8px
      }
      .select,.input{
        padding:8px 10px; border:1px solid var(--border); border-radius:10px; background:#0b0f16; color:var(--text)
      }
      .input{flex:1; min-width:180px}

      /* List */
      .listWrap{
        margin:0 auto 28px; width:100%; max-width:1100px; background:var(--panel);
        border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); overflow:hidden
      }
      .empty{padding:24px; text-align:center; color:var(--muted)}
      .item{display:flex; gap:12px; padding:14px 16px; border-top:1px solid var(--border)}
      .item:first-child{border-top:none}
      .item input[type="checkbox"]{margin-top:4px; accent-color:var(--brand)}
      .itemTitle{font-weight:700}
      .muted{color:var(--muted)}
      .lineThrough{text-decoration:line-through; color:#6b7280}
      .row{display:flex; align-items:center; gap:8px; flex-wrap:wrap}
      .pill{
        display:inline-flex; align-items:center; border:1px solid var(--border);
        border-radius:999px; padding:2px 8px; font-size:12px
      }
      .pill.low{background:#0d1a13; color:#86efac; border-color:#113222}
      .pill.medium{background:#1f1606; color:#fcd34d; border-color:#3a2a10}
      .pill.high{background:#2a0f11; color:#fca5a5; border-color:#4a1a1d}
      .right{margin-left:auto; display:flex; gap:8px}
      .btnGhost{
        appearance:none; border:1px solid var(--border); background:#0b0f16; color:var(--text);
        padding:7px 10px; border-radius:8px; cursor:pointer
      }
      .btnGhost:hover{background:#121a2a}
      .small{font-size:12px}

      /* Modal */
      .modalOverlay{position:fixed; inset:0; background:rgba(0,0,0,.55); display:grid; place-items:center; padding:20px; z-index:50}
      .modal{width:100%; max-width:560px; background:#0f1522; border:1px solid var(--border); border-radius:16px; padding:18px; box-shadow:var(--shadow)}
      .modal h2{margin:0 0 10px}
      .field{margin:8px 0}
      .label{display:block; font-size:13px; font-weight:700; margin-bottom:6px; color:#cbd5e1}
      .control{
        width:100%; padding:8px 10px; border:1px solid var(--border); border-radius:10px;
        background:#0b0f16; color:var(--text)
      }
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      .footer{display:flex; justify-content:flex-end; gap:8px; margin-top:10px}
      .btnSecondary{
        appearance:none; border:1px solid var(--border); background:#0b0f16; color:var(--text);
        padding:9px 14px; border-radius:10px; cursor:pointer
      }
      .btnSecondary:hover{background:#121a2a}

      /* Responsive */
      @media (max-width: 900px){
        .side{display:none}
        .search{display:none}
        .grid2{grid-template-columns:1fr}
      }
    `;
    const style = document.createElement("style");
    style.id = "tm-no-tailwind-css";
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => { const s = document.getElementById("tm-no-tailwind-css"); if (s) s.remove(); };
  }, []);

  // Counts for topbar
  const counts = useMemo(() => {
    const active = tasks.filter((t) => !t.completed).length;
    return { active, completed: tasks.length - active };
  }, [tasks]);

  // Default to "Me" when on My Tasks
  const effectiveAssignee = useMemo(() => {
    if (nav === "myTasks") return assignee === "All" ? "Me" : assignee;
    return assignee;
  }, [nav, assignee]);

  // Filter + sort logic
  const filtered = useMemo(() => {
    const byPriority = { High: 0, Medium: 1, Low: 2 };
    let out = tasks
      .filter((t) => {
        if (status === "Active" && t.completed) return false;
        if (status === "Completed" && !t.completed) return false;
        // In sharedTasks with "All", hide "Me" by default to highlight others
        if (nav === "sharedTasks" && effectiveAssignee === "All") {
          if (t.assignee === "Me") return false;
        }
        if (effectiveAssignee !== "All" && t.assignee !== effectiveAssignee) return false;
        if (priority !== "All" && t.priority !== priority) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!(`${t.title} ${t.description}`.toLowerCase().includes(q))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "Title") return a.title.localeCompare(b.title);
        if (sort === "Priority") return byPriority[a.priority] - byPriority[b.priority];
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return ad - bd; // Due Date
      });
    return out;
  }, [tasks, status, effectiveAssignee, priority, search, sort, nav]);

  // CRUD
  function newTask() { setForm(empty); setOpen(true); }
  function editTask(t) { setForm({ ...t }); setOpen(true); }
  function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (form.id) setTasks((prev) => prev.map((t) => (t.id === form.id ? { ...form } : t)));
    else setTasks((prev) => [{ ...form, id: makeId() }, ...prev]);
    setOpen(false);
  }
  function removeTask(id) { setTasks((prev) => prev.filter((t) => t.id !== id)); }
  function toggleComplete(id) { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))); }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="side">
        <div className="user">
          <div className="avatar">NA</div>
          <div>
            <div style={{fontWeight:800}}>Noura Alharbi</div>
            <div className="email">noura@example.com</div>
          </div>
        </div>
        <div className="menu">
          <button className={nav==='profile'? 'active': ''} onClick={()=> setNav('profile')}>Profile</button>
          <button className={nav==='account'? 'active': ''} onClick={()=> setNav('account')}>My Account</button>
          <button className={nav==='myTasks'? 'active': ''} onClick={()=> setNav('myTasks')}>My Tasks</button>
          <button className={nav==='sharedTasks'? 'active': ''} onClick={()=> setNav('sharedTasks')}>Shared Tasks</button>
        </div>
        <div className="logout"><button>Log out</button></div>
      </aside>

      {/* Main column */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="title">
              {nav === 'myTasks' && 'My Tasks'}
              {nav === 'sharedTasks' && 'Shared Tasks'}
              {nav === 'profile' && 'Profile'}
              {nav === 'account' && 'My Account'}
            </div>
            {(nav==='myTasks'||nav==='sharedTasks') && (
              <div className="counts">{counts.active} active • {counts.completed} completed</div>
            )}
          </div>
          {(nav==='myTasks'||nav==='sharedTasks') && (
            <div className="actions">
              <input className="search" value={search} onChange={(e)=> setSearch(e.target.value)} placeholder="Search…" />
              <button className="btn" onClick={newTask}>+ New Task</button>
            </div>
          )}
        </div>

        {nav === 'profile' && (
          <section style={{maxWidth:720, margin:"18px auto", padding:"14px", background:"var(--panel)", border:"1px solid var(--border)", borderRadius:16}}>
            <h3 style={{marginTop:0}}>Profile</h3>
            <p className="muted">Read-only placeholder — connect to your real profile later.</p>
          </section>
        )}
        {nav === 'account' && (
          <section style={{maxWidth:720, margin:"18px auto", padding:"14px", background:"var(--panel)", border:"1px solid var(--border)", borderRadius:16}}>
            <h3 style={{marginTop:0}}>My Account</h3>
            <p className="muted">Settings placeholder — email, password, preferences…</p>
          </section>
        )}

        {(nav==='myTasks'||nav==='sharedTasks') && (
          <>
            {/* Filters */}
            <div className="filters">
              <select className="select" value={status} onChange={(e)=> setStatus(e.target.value)}>
                {['All','Active','Completed'].map((s)=> <option key={s} value={s}>{s} Tasks</option>)}
              </select>
              <select className="select" value={assignee} onChange={(e)=> setAssignee(e.target.value)}>
                <option value="All">All Assignees</option>
                {MEMBERS.map((m)=> <option key={m} value={m}>{m}</option>)}
              </select>
              <select className="select" value={priority} onChange={(e)=> setPriority(e.target.value)}>
                <option value="All">All Priorities</option>
                {PRIORITIES.map((p)=> <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="select" value={sort} onChange={(e)=> setSort(e.target.value)}>
                {['Due Date','Priority','Title'].map((s)=> <option key={s} value={s}>Sort by {s}</option>)}
              </select>
              <input className="input" value={search} onChange={(e)=> setSearch(e.target.value)} placeholder="Search…" />
            </div>

            {/* List */}
            <div className="listWrap">
              {filtered.length === 0 ? (
                <div className="empty">No tasks match your filters.</div>
              ) : (
                filtered.map((t) => (
                  <div className="item" key={t.id}>
                    <input type="checkbox" checked={t.completed} onChange={()=> toggleComplete(t.id)} />
                    <div style={{flex:1,minWidth:0}}>
                      <div className="row">
                        <div className={`itemTitle ${t.completed ? 'lineThrough' : ''}`}>{t.title}</div>
                        <span className={`pill ${t.priority.toLowerCase()}`}>{t.priority}</span>
                        {t.dueDate && (
                          <span className="small muted">Due {new Date(t.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {t.description && (
                        <div className={`small ${t.completed ? 'lineThrough' : 'muted'}`} style={{marginTop:6}}>{t.description}</div>
                      )}
                      <div className="small muted" style={{marginTop:6}}>Assignee: {t.assignee}</div>
                    </div>
                    <div className="right">
                      <button className="btnGhost" onClick={()=> editTask(t)}>Edit</button>
                      <button className="btnGhost" onClick={()=> removeTask(t.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {open && (
          <div className="modalOverlay" onMouseDown={()=> setOpen(false)}>
            <div className="modal" onMouseDown={(e)=> e.stopPropagation()}>
              <h2>{form.id ? 'Edit Task' : 'New Task'}</h2>
              <form onSubmit={saveTask}>
                <div className="field">
                  <label className="label">Title *</label>
                  <input className="control" required value={form.title} onChange={(e)=> setForm((f)=>({...f, title:e.target.value}))} placeholder="e.g., Prepare sprint slides" />
                </div>
                <div className="field">
                  <label className="label">Description</label>
                  <textarea className="control" rows={3} value={form.description} onChange={(e)=> setForm((f)=>({...f, description:e.target.value}))} placeholder="Optional details…" />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="label">Due Date</label>
                    <input type="date" className="control" value={form.dueDate} onChange={(e)=> setForm((f)=>({...f, dueDate:e.target.value}))} />
                  </div>
                  <div className="field">
                    <label className="label">Priority</label>
                    <select className="control" value={form.priority} onChange={(e)=> setForm((f)=>({...f, priority:e.target.value}))}>
                      {PRIORITIES.map((p)=> <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="label">Assignment</label>
                    <select className="control" value={form.assignee} onChange={(e)=> setForm((f)=>({...f, assignee:e.target.value}))}>
                      {MEMBERS.map((m)=> <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{display:"flex", alignItems:"flex-end", gap:8}}>
                    <input type="checkbox" checked={form.completed} onChange={(e)=> setForm((f)=>({...f, completed:e.target.checked}))} />
                    <span className="small">Mark as completed</span>
                  </div>
                </div>
                <div className="footer">
                  <button type="button" className="btnSecondary" onClick={()=> setOpen(false)}>Cancel</button>
                  <button type="submit" className="btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

         <div style={{padding:"18px 0", textAlign:"center", color:"var(--muted)", fontSize:12}}>Dark Mode • Accurate CRUD • Filters & Sorting</div>
      </div>
    </div>
  );
}
