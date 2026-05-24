import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLORS = {
  Subat:  ["#dbeafe", "#1d4ed8"],
  Aisha:  ["#ede9fe", "#6d28d9"],
  Fairoos:   ["#fce7f3", "#be185d"],
  Sophia: ["#dcfce7", "#15803d"],
  Sazia:   ["#fef9c3", "#a16207"],
};

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name }) {
  const [bg, col] = COLORS[name] || ["#f3f4f6", "#374151"];
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", background: bg, color: col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flexShrink: 0, border: `1.5px solid ${col}22` }}>
      {getInitials(name)}
    </div>
  );
}

const PRIORITY_STYLES = {
  High:   { background: "#fff1f2", color: "#e11d48", border: "1.5px solid #fecdd3" },
  Medium: { background: "#fffbeb", color: "#d97706", border: "1.5px solid #fde68a" },
  Low:    { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0" },
};

const PRIORITY_STYLES_DARK = {
  High:   { background: "#4c1130", color: "#fb7185", border: "1.5px solid #9f1239" },
  Medium: { background: "#451a03", color: "#fbbf24", border: "1.5px solid #92400e" },
  Low:    { background: "#052e16", color: "#4ade80", border: "1.5px solid #166534" },
};

const TYPE_STYLES = {
  session:  { background: "#eff6ff", color: "#2563eb", border: "1.5px solid #bfdbfe" },
  admin:    { background: "#f9fafb", color: "#6b7280", border: "1.5px solid #e5e7eb" },
  followup: { background: "#faf5ff", color: "#7c3aed", border: "1.5px solid #ddd6fe" },
  resource: { background: "#ecfdf5", color: "#059669", border: "1.5px solid #a7f3d0" },
};

const TYPE_STYLES_DARK = {
  session:  { background: "#1e3a5f", color: "#93c5fd", border: "1.5px solid #1d4ed8" },
  admin:    { background: "#1f2937", color: "#9ca3af", border: "1.5px solid #374151" },
  followup: { background: "#2e1065", color: "#c4b5fd", border: "1.5px solid #6d28d9" },
  resource: { background: "#052e16", color: "#6ee7b7", border: "1.5px solid #065f46" },
};

const TYPE_EMOJI = { session: "📚", admin: "📋", followup: "💬", resource: "🗂️" };
const PRIORITY_EMOJI = { High: "🔴", Medium: "🟡", Low: "🟢" };

const COLUMNS = [
  { key: "todo",       label: "To Do",       emoji: "📝", color: "#6366f1" },
  { key: "inProgress", label: "In Progress", emoji: "⚡", color: "#f59e0b" },
  { key: "done",       label: "Done",        emoji: "✅", color: "#10b981" },
];

const INITIAL_TASKS = {
  todo: [
    { id: "1", title: "Prepare SAT Math practice set for Sazia", priority: "High",   assignee: "Subat",  type: "resource", due: "2026-05-25", description: "Cover algebra, geometry, and word problems." },
    { id: "2", title: "Schedule makeup session for Fairoos",         priority: "High",   assignee: "Sophia", type: "admin",    due: "2026-05-24", description: "Fairoos missed Tuesday, find a slot this week." },
    { id: "3", title: "Create quiz on quadratic equations",       priority: "Medium", assignee: "Subat",  type: "resource", due: "2026-05-28", description: "10 questions, mix of multiple choice and short answer." },
    { id: "4", title: "Send progress report to parents",         priority: "Low",    assignee: "Sazia",   type: "admin",    due: "2026-05-30", description: "Monthly report for all active students." },
  ],
  inProgress: [
    { id: "5", title: "1-on-1 Python tutoring session with Fairoos", priority: "High",   assignee: "Subat",  type: "session",  due: "2026-05-23", description: "Cover loops, functions, and basic OOP." },
    { id: "6", title: "Follow up with Aisha on essay draft",      priority: "Medium", assignee: "Sophia", type: "followup", due: "2026-05-24", description: "Review intro paragraph and thesis statement." },
  ],
  done: [
    { id: "7", title: "Group session — Calculus review",         priority: "High",   assignee: "Subat",  type: "session",  due: "2026-05-20", description: "Covered derivatives and integrals." },
    { id: "8", title: "Update student progress tracker",         priority: "Low",    assignee: "Sazia",   type: "admin",    due: "2026-05-19", description: "Updated all student grades and attendance." },
    { id: "9", title: "Send week 4 homework to all students",    priority: "Medium", assignee: "Sophia", type: "resource", due: "2026-05-18", description: "Homework packet includes reading and practice problems." },
  ],
};

function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function Badge({ label, style, emoji }) {
  return (
    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3, ...style }}>
      {emoji && <span>{emoji}</span>}{label}
    </span>
  );
}

function Modal({ task, dark, onClose, onSave }) {
  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority,    setPriority]    = useState(task.priority);
  const [type,        setType]        = useState(task.type);
  const [assignee,    setAssignee]    = useState(task.assignee);
  const [due,         setDue]         = useState(task.due || "");

  const bg     = dark ? "#1e1e2e" : "#fff";
  const border = dark ? "#2d2d44" : "#e0e7ff";
  const text   = dark ? "#e2e8f0" : "#1f2937";
  const sub    = dark ? "#94a3b8" : "#6b7280";
  const inputS = {
    width: "100%", marginBottom: 10, fontSize: 13, padding: "9px 12px",
    border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`, borderRadius: 10,
    background: dark ? "#111827" : "#f9fafb", color: text, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0007", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: bg, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px #0005", border: `1.5px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: text }}>✏️ Edit Task</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: sub }}>✕</button>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Title</label>
        <input style={inputS} value={title} onChange={e => setTitle(e.target.value)} />

        <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Description</label>
        <textarea style={{ ...inputS, minHeight: 80, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Priority</label>
            <select style={inputS} value={priority} onChange={e => setPriority(e.target.value)}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Type</label>
            <select style={inputS} value={type} onChange={e => setType(e.target.value)}>
              <option value="session">📚 Session</option>
              <option value="admin">📋 Admin</option>
              <option value="followup">💬 Follow Up</option>
              <option value="resource">🗂️ Resource</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Assignee</label>
            <input style={inputS} value={assignee} onChange={e => setAssignee(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: sub, display: "block", marginBottom: 4 }}>Due Date</label>
            <input type="date" style={inputS} value={due} onChange={e => setDue(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => onSave({ ...task, title, description, priority, type, assignee, due })}
            style={{ fontSize: 13, padding: "8px 18px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
            Save ✨
          </button>
          <button onClick={onClose}
            style={{ fontSize: 13, padding: "8px 18px", background: dark ? "#1f2937" : "#f9fafb", border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`, borderRadius: 10, cursor: "pointer", color: sub, fontWeight: 500 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, dark, index, onDelete, onEdit }) {
  const overdue = isOverdue(task.due);
  const ps = (dark ? PRIORITY_STYLES_DARK : PRIORITY_STYLES)[task.priority];
  const ts = (dark ? TYPE_STYLES_DARK    : TYPE_STYLES)[task.type];
  const cardBg     = dark ? "#1e1e2e" : "#fff";
  const cardBorder = dark ? "#2d2d44" : "#f3f4f6";
  const titleColor = dark ? "#e2e8f0" : "#1f2937";
  const subColor   = dark ? "#94a3b8" : "#6b7280";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          style={{
            background: cardBg,
            border: `1.5px solid ${snapshot.isDragging ? "#6366f1" : cardBorder}`,
            borderRadius: 14,
            padding: 14,
            marginBottom: 10,
            boxShadow: snapshot.isDragging ? "0 8px 30px #6366f144" : "0 1px 4px #0001",
            cursor: "grab",
            transform: snapshot.isDragging ? "rotate(2deg)" : "none",
            transition: "box-shadow 0.2s",
            ...provided.draggableProps.style,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, flex: 1, color: titleColor }}>{task.title}</div>
            <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
              style={{ background: "#fff1f2", border: "none", cursor: "pointer", color: "#e11d48", fontSize: 12, padding: "3px 7px", borderRadius: 8, flexShrink: 0 }}>
              ✕
            </button>
          </div>

          {task.description && (
            <div style={{ fontSize: 12, color: subColor, marginBottom: 8, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {task.description}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge label={task.priority} emoji={PRIORITY_EMOJI[task.priority]} style={ps} />
            <Badge label={task.type}     emoji={TYPE_EMOJI[task.type]}         style={ts} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Avatar name={task.assignee} />
              <span style={{ fontSize: 12, color: subColor, fontWeight: 500 }}>{task.assignee}</span>
            </div>
            {task.due && (
              <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? "#e11d48" : subColor, background: overdue ? "#fff1f2" : "transparent", padding: overdue ? "2px 7px" : 0, borderRadius: 8 }}>
                {overdue ? "⚠️ " : "📅 "}{task.due}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

function AddTaskForm({ dark, onAdd, onCancel }) {
  const [title,    setTitle]    = useState("");
  const [priority, setPriority] = useState("Medium");
  const [type,     setType]     = useState("session");
  const [assignee, setAssignee] = useState("");
  const [due,      setDue]      = useState("");

  const inputStyle = {
    width: "100%", marginBottom: 8, fontSize: 13, padding: "8px 12px",
    border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`, borderRadius: 10,
    background: dark ? "#111827" : "#fafafa", color: dark ? "#e2e8f0" : "#111",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ background: dark ? "#1e1e2e" : "#fff", border: "1.5px solid #e0e7ff", borderRadius: 14, padding: 14, marginTop: 10 }}>
      <input style={inputStyle} placeholder="✏️ Task title..." value={title} onChange={e => setTitle(e.target.value)} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <select style={inputStyle} value={priority} onChange={e => setPriority(e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
          <option value="session">📚 Session</option>
          <option value="admin">📋 Admin</option>
          <option value="followup">💬 Follow Up</option>
          <option value="resource">🗂️ Resource</option>
        </select>
      </div>
      <input style={inputStyle} placeholder="👤 Assignee" value={assignee} onChange={e => setAssignee(e.target.value)} />
      <input type="date" style={inputStyle} value={due} onChange={e => setDue(e.target.value)} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => { if (!title.trim()) return; onAdd({ title: title.trim(), priority, type, assignee: assignee.trim() || "Subat", due, description: "" }); }}
          style={{ fontSize: 13, padding: "7px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>
          Add ✨
        </button>
        <button onClick={onCancel}
          style={{ fontSize: 13, padding: "7px 16px", background: "none", border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`, borderRadius: 10, cursor: "pointer", color: dark ? "#94a3b8" : "#6b7280", fontWeight: 500 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Column({ col, tasks, dark, search, activeFilter, onDelete, onEdit, onAdd }) {
  const [adding, setAdding] = useState(false);
  const colBg     = dark ? "#16162a" : "#f8f9ff";
  const colBorder = dark ? "#2d2d44" : "#e0e7ff";

  const filtered = tasks.filter(t => {
    const matchFilter = activeFilter === "all" || (["High","Medium","Low"].includes(activeFilter) ? t.priority === activeFilter : t.type === activeFilter);
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <Droppable droppableId={col.key}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            background: snapshot.isDraggingOver ? (dark ? "#1e1e3a" : "#eef2ff") : colBg,
            borderRadius: 18, padding: 16, minHeight: 440,
            border: `1.5px solid ${snapshot.isDraggingOver ? "#6366f1" : colBorder}`,
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 18 }}>{col.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: col.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{col.label}</span>
            </div>
            <span style={{ fontSize: 12, background: dark ? "#0f0f1a" : "#fff", border: `1.5px solid ${col.color}44`, borderRadius: 999, padding: "2px 10px", color: col.color, fontWeight: 700 }}>
              {tasks.length}
            </span>
          </div>

          {filtered.map((task, index) => (
            <TaskCard key={task.id} task={task} dark={dark} index={index} onDelete={onDelete} onEdit={onEdit} />
          ))}
          {provided.placeholder}

          <div style={{ marginTop: 8 }}>
            {adding ? (
              <AddTaskForm dark={dark} onAdd={task => { onAdd(task); setAdding(false); }} onCancel={() => setAdding(false)} />
            ) : (
              <button onClick={() => setAdding(true)}
                style={{ width: "100%", background: "none", border: `1.5px dashed ${dark ? "#4338ca" : "#c7d2fe"}`, borderRadius: 12, padding: 10, fontSize: 13, color: dark ? "#818cf8" : "#818cf8", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                ＋ Add task
              </button>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default function TutoringBoard() {
  const [tasks,        setTasks]        = useState(INITIAL_TASKS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [dark,         setDark]         = useState(false);
  const [modalTask,    setModalTask]     = useState(null);

  const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
  const total    = allTasks.length;
  const done     = tasks.done.length;
  const pct      = total ? Math.round((done / total) * 100) : 0;
  const high     = allTasks.filter(t => t.priority === "High").length;

  const findTaskColumn = id => Object.keys(tasks).find(col => tasks[col].some(t => t.id === id));

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#e11d48"] });
  };

  const onDragEnd = result => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol  = [...tasks[source.droppableId]];
    const dstCol  = source.droppableId === destination.droppableId ? srcCol : [...tasks[destination.droppableId]];
    const [moved] = srcCol.splice(source.index, 1);
    dstCol.splice(destination.index, 0, moved);

    const updated = { ...tasks, [source.droppableId]: srcCol };
    if (source.droppableId !== destination.droppableId) updated[destination.droppableId] = dstCol;

    setTasks(updated);
    if (destination.droppableId === "done") fireConfetti();
  };

  const deleteTask = id => {
    const col = findTaskColumn(id);
    if (!col) return;
    setTasks({ ...tasks, [col]: tasks[col].filter(t => t.id !== id) });
  };

  const saveTask = updated => {
    const col = findTaskColumn(updated.id);
    if (!col) return;
    setTasks({ ...tasks, [col]: tasks[col].map(t => t.id === updated.id ? updated : t) });
    setModalTask(null);
  };

  const addTask = (col, newTask) => {
    setTasks({ ...tasks, [col]: [...tasks[col], { id: Date.now().toString(), ...newTask }] });
  };

  const filters = [
    { key: "all",      label: "All ✨" },
    { key: "High",     label: "🔴 High" },
    { key: "Medium",   label: "🟡 Medium" },
    { key: "Low",      label: "🟢 Low" },
    { key: "session",  label: "📚 Session" },
    { key: "admin",    label: "📋 Admin" },
    { key: "followup", label: "💬 Follow Up" },
    { key: "resource", label: "🗂️ Resource" },
  ];

  const bg      = dark ? "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)" : "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)";
  const text    = dark ? "#e2e8f0" : "#111";
  const subtext = dark ? "#94a3b8" : "#9ca3af";
  const statBg  = dark ? "#1e1e2e" : "#fff";
  const statBdr = dark ? "#2d2d44" : "#f3f4f6";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "28px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif", color: text, transition: "background 0.3s" }}>
      {modalTask && <Modal task={modalTask} dark={dark} onClose={() => setModalTask(null)} onSave={saveTask} />}

      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              📖 Tutoring Board
            </div>
            <div style={{ fontSize: 13, color: subtext, marginTop: 3 }}>Session & task tracker · May 2026</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6366f1", background: dark ? "#1e1e3a" : "#e0e7ff", borderRadius: 999, padding: "5px 14px", fontWeight: 600, border: "1.5px solid #c7d2fe" }}>
              🗓 Sprint ends May 30
            </span>
            <button onClick={() => setDark(d => !d)}
              style={{ fontSize: 18, background: dark ? "#1e1e2e" : "#e0e7ff", border: "none", borderRadius: 999, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Tasks",   value: total,                   emoji: "📋", color: "#6366f1" },
            { label: "In Progress",   value: tasks.inProgress.length, emoji: "⚡", color: "#f59e0b" },
            { label: "Completed",     value: `${done} (${pct}%)`,     emoji: "✅", color: "#10b981" },
            { label: "High Priority", value: high,                    emoji: "🔴", color: "#e11d48" },
          ].map(s => (
            <div key={s.label} style={{ background: statBg, borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 4px #0001", border: `1.5px solid ${statBdr}`, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: subtext, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 8, background: dark ? "#2d2d44" : "#e0e7ff", borderRadius: 999, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <input
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 13, padding: "7px 14px", borderRadius: 999, border: `1.5px solid ${dark ? "#374151" : "#e5e7eb"}`, background: dark ? "#1e1e2e" : "#fff", color: text, fontFamily: "inherit", outline: "none", width: 200 }}
          />
          {filters.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, border: "1.5px solid", borderColor: activeFilter === f.key ? "#6366f1" : (dark ? "#374151" : "#e5e7eb"), background: activeFilter === f.key ? (dark ? "#1e1e3a" : "#e0e7ff") : "transparent", fontWeight: activeFilter === f.key ? 700 : 500, cursor: "pointer", color: activeFilter === f.key ? "#4338ca" : subtext, transition: "all 0.15s" }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
            {COLUMNS.map(col => (
              <Column key={col.key} col={col} tasks={tasks[col.key]} dark={dark} search={search} activeFilter={activeFilter}
                onDelete={deleteTask} onEdit={setModalTask} onAdd={task => addTask(col.key, task)} />
            ))}
          </div>
        </DragDropContext>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: subtext }}>
          Click any card to edit · Drag cards between columns · Drop into ✅ Done for confetti 🎉
        </div>
      </div>
    </div>
  );
}
