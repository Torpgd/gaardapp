import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SETT INN DINE VERDIER HER ───────────────────────────────────────────────
const SUPABASE_URL = "https://zasjbcbkvehhbqydadnz.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_wTSsiXVhL6nPDsdYjRF8Yg_tCYyLzAU";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  "Jordarbeiding", "Såing", "Sprøyting", "Høsting",
  "Skogsarbeid", "Vedlikehold/reparasjon", "Transport",
  "Graving/anlegg", "Administrasjon", "Annet",
];

const WORKER_COLORS = [
  "#a8d878","#78c8f0","#f0c878","#f09878","#c878f0","#78f0c8","#f078b8","#b8d0a0"
];

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}t ${m}m` : `${m}m`;
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("nb-NO", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric"
  });
}
function formatNOK(amount) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency", currency: "NOK", maximumFractionDigits: 0
  }).format(amount);
}
function initials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function App() {
  const [workers, setWorkers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkerId, setActiveWorkerId] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: CATEGORIES[0],
    startTime: "", endTime: "", description: "",
  });
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerWage, setNewWorkerWage] = useState(200);
  const [editingWageId, setEditingWageId] = useState(null);
  const [tempWage, setTempWage] = useState(0);
  const [payoutTarget, setPayoutTarget] = useState(null);
  const [filterWorker, setFilterWorker] = useState("Alle");
  const [filterCategory, setFilterCategory] = useState("Alle");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: w }, { data: e }] = await Promise.all([
      supabase.from("workers").select("*").order("created_at"),
      supabase.from("entries").select("*").order("date", { ascending: false }).order("start_time", { ascending: false }),
    ]);
    if (w) setWorkers(w);
    if (e) setEntries(e);
    setLoading(false);
  }

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3200);
  };

  const activeWorker = workers.find(w => w.id === activeWorkerId);

  async function addWorker() {
    const name = newWorkerName.trim();
    if (!name) return;
    if (workers.find(w => w.name.toLowerCase() === name.toLowerCase())) {
      showNotif("Det finnes allerede en person med dette navnet", "error"); return;
    }
    const color = WORKER_COLORS[workers.length % WORKER_COLORS.length];
    const { data, error } = await supabase.from("workers").insert({
      name, wage: parseFloat(newWorkerWage) || 200, color, paid_minutes: 0
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setWorkers(prev => [...prev, data]);
    setActiveWorkerId(data.id);
    setNewWorkerName(""); setNewWorkerWage(200);
    setShowAddWorker(false);
    showNotif(`${name} er lagt til`);
  }

  async function updateWage(id, wage) {
    await supabase.from("workers").update({ wage }).eq("id", id);
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, wage } : w));
    setEditingWageId(null);
    showNotif("Lønnssats oppdatert");
  }

  async function deleteWorker(id) {
    const w = workers.find(x => x.id === id);
    await supabase.from("entries").delete().eq("worker_id", id);
    await supabase.from("workers").delete().eq("id", id);
    setWorkers(prev => prev.filter(x => x.id !== id));
    setEntries(prev => prev.filter(e => e.worker_id !== id));
    if (activeWorkerId === id) setActiveWorkerId(null);
    showNotif(`${w.name} fjernet`);
  }

  async function handleAdd() {
    if (!activeWorkerId) { showNotif("Velg hvem som jobbet", "error"); return; }
    if (!form.startTime || !form.endTime) { showNotif("Fyll inn start- og sluttid", "error"); return; }
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    const duration = Math.round((end - start) / 60000);
    if (duration <= 0) { showNotif("Sluttid må være etter starttid", "error"); return; }
    const { data, error } = await supabase.from("entries").insert({
      worker_id: activeWorkerId,
      date: form.date,
      category: form.category,
      start_time: form.startTime,
      end_time: form.endTime,
      duration_minutes: duration,
      description: form.description || null,
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setEntries(prev => [data, ...prev]);
    setForm(f => ({ ...f, startTime: "", endTime: "", description: "" }));
    showNotif(`${formatDuration(duration)} registrert for ${activeWorker?.name}`);
  }

  async function handleDelete(id) {
    await supabase.from("entries").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
    showNotif("Registrering slettet", "error");
  }

  async function handlePayout(workerId) {
    const worker = workers.find(w => w.id === workerId);
    const totalMins = entries.filter(e => e.worker_id === workerId).reduce((s, e) => s + e.duration_minutes, 0);
    const unpaid = (totalMins - worker.paid_minutes) / 60 * worker.wage;
    await supabase.from("workers").update({ paid_minutes: totalMins }).eq("id", workerId);
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, paid_minutes: totalMins } : w));
    setPayoutTarget(null);
    showNotif(`Utbetaling registrert for ${worker.name} — ${formatNOK(unpaid)}`);
  }

  const workerStats = workers.map(w => {
    const wEntries = entries.filter(e => e.worker_id === w.id);
    const totalMins = wEntries.reduce((s, e) => s + e.duration_minutes, 0);
    const unpaidMins = totalMins - w.paid_minutes;
    return { ...w, totalMins, unpaidMins, unpaidAmount: (unpaidMins / 60) * w.wage, totalAmount: (totalMins / 60) * w.wage };
  });

  const totalUnpaid = workerStats.reduce((s, w) => s + w.unpaidAmount, 0);

  const filteredEntries = entries.filter(e => {
    const wMatch = filterWorker === "Alle" || e.worker_id === filterWorker;
    const cMatch = filterCategory === "Alle" || e.category === filterCategory;
    return wMatch && cMatch;
  });

  const getWorker = (id) => workers.find(w => w.id === id);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f1a0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#7a9e6a", fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: 2 }}>LASTER…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0d", color: "#e8ead4", fontFamily: "'Georgia', serif" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1a2e16 0%, #0f1a0d 100%)", borderBottom: "1px solid #2d4a26", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7a9e6a", textTransform: "uppercase", marginBottom: 4 }}>Brødenveien 181 · Halden</div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: "normal", color: "#d4e8b0", letterSpacing: 1 }}>Timeregistrering</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#7a9e6a", letterSpacing: 1, textTransform: "uppercase" }}>Totalt utestående</div>
              <div style={{ fontSize: 28, fontWeight: "bold", color: totalUnpaid > 0 ? "#a8d878" : "#5a7a4a", lineHeight: 1.1 }}>{formatNOK(totalUnpaid)}</div>
              <div style={{ fontSize: 11, color: "#5a7a4a" }}>{workers.length} person{workers.length !== 1 ? "er" : ""}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", paddingBottom: 12 }}>
            {workers.map(w => (
              <button key={w.id} onClick={() => setActiveWorkerId(w.id === activeWorkerId ? null : w.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                background: activeWorkerId === w.id ? "#1e3a18" : "#152012",
                border: `1px solid ${activeWorkerId === w.id ? w.color : "#2d4a26"}`,
                borderRadius: 20, padding: "5px 12px 5px 6px", cursor: "pointer",
              }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                <span style={{ fontSize: 12, color: activeWorkerId === w.id ? w.color : "#7a9e6a" }}>{w.name}</span>
              </button>
            ))}
            <button onClick={() => setShowAddWorker(true)} style={{ background: "none", border: "1px dashed #2d4a26", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12, color: "#3a5a30" }}>+ Legg til person</button>
          </div>

          <div style={{ display: "flex" }}>
            {[["register","Registrer"],["logg","Arbeidslogg"],["oversikt","Oversikt"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                background: "none", border: "none",
                borderBottom: activeTab === key ? "2px solid #a8d878" : "2px solid transparent",
                color: activeTab === key ? "#a8d878" : "#5a7a4a",
                padding: "8px 20px", cursor: "pointer", fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px" }}>

        {notification && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: notification.type === "error" ? "#3a1a1a" : "#1a3a1a", border: `1px solid ${notification.type === "error" ? "#7a3a3a" : "#4a7a3a"}`, color: notification.type === "error" ? "#e8a0a0" : "#a8d878", padding: "10px 18px", borderRadius: 6, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{notification.msg}</div>
        )}

        {/* Add worker modal */}
        {showAddWorker && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "#152012", border: "1px solid #2d4a26", borderRadius: 10, padding: 32, minWidth: 300 }}>
              <div style={{ fontSize: 13, color: "#d4e8b0", marginBottom: 20 }}>Legg til person</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Navn</label>
                <input value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} onKeyDown={e => e.key === "Enter" && addWorker()} placeholder="F.eks. Kari Nordmann" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} autoFocus />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Lønnssats (kr/t)</label>
                <input type="number" value={newWorkerWage} onChange={e => setNewWorkerWage(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={addWorker} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, flex: 1 }}>Legg til</button>
                <button onClick={() => { setShowAddWorker(false); setNewWorkerName(""); }} style={{ background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Avbryt</button>
              </div>
            </div>
          </div>
        )}

        {/* Payout modal */}
        {payoutTarget && (() => {
          const ws = workerStats.find(w => w.id === payoutTarget);
          if (!ws) return null;
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
              <div style={{ background: "#152012", border: "1px solid #2d4a26", borderRadius: 10, padding: 32, maxWidth: 360, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: ws.color + "33", border: `1px solid ${ws.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: ws.color, fontWeight: "bold" }}>{initials(ws.name)}</div>
                  <span style={{ color: "#d4e8b0", fontSize: 14 }}>{ws.name}</span>
                </div>
                <div style={{ fontSize: 28, color: "#a8d878", fontWeight: "bold", marginBottom: 4 }}>{formatNOK(ws.unpaidAmount)}</div>
                <div style={{ fontSize: 12, color: "#7a9e6a", marginBottom: 8 }}>{formatDuration(ws.unpaidMins)} · {(ws.unpaidMins / 60).toFixed(1)} timer</div>
                <p style={{ fontSize: 12, color: "#5a7a4a", marginBottom: 24 }}>Utestående lønn nullstilles for {ws.name}. Arbeidsloggen beholdes.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => handlePayout(payoutTarget)} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Bekreft utbetaling</button>
                  <button onClick={() => setPayoutTarget(null)} style={{ background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Avbryt</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* REGISTER */}
        {activeTab === "register" && (
          <div>
            {workers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#3a5a30" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
                <div style={{ fontSize: 14, marginBottom: 20 }}>Legg til en person for å starte registrering</div>
                <button onClick={() => setShowAddWorker(true)} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>+ Legg til person</button>
              </div>
            ) : (
              <>
                {!activeWorkerId && <div style={{ background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#7a9e6a" }}>← Velg hvem som jobbet i toppraden</div>}
                <div style={{ background: "#152012", border: `1px solid ${activeWorker ? activeWorker.color + "55" : "#2d4a26"}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
                  {activeWorker && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: activeWorker.color + "33", border: `1px solid ${activeWorker.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: activeWorker.color, fontWeight: "bold" }}>{initials(activeWorker.name)}</div>
                      <span style={{ fontSize: 13, color: activeWorker.color }}>Registrerer for <strong>{activeWorker.name}</strong></span>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={labelStyle}>Dato</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Kategori</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label style={labelStyle}>Starttid</label><input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Sluttid</label><input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputStyle} /></div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Beskrivelse (valgfritt)</label>
                    <input type="text" value={form.description} placeholder="F.eks. pløyd østre jorde..." onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                  </div>
                  {form.startTime && form.endTime && (() => {
                    const dur = Math.round((new Date(`${form.date}T${form.endTime}`) - new Date(`${form.date}T${form.startTime}`)) / 60000);
                    if (dur > 0 && activeWorker) return <div style={{ fontSize: 12, color: "#7a9e6a", marginBottom: 12 }}>≈ {formatDuration(dur)} · {formatNOK((dur / 60) * activeWorker.wage)}</div>;
                  })()}
                  <button onClick={handleAdd} disabled={!activeWorkerId} style={{ background: activeWorkerId ? "#2d5a20" : "#1a2a16", border: `1px solid ${activeWorkerId ? "#4a8a30" : "#2d4a26"}`, color: activeWorkerId ? "#a8d878" : "#3a5a30", padding: "10px 24px", borderRadius: 6, cursor: activeWorkerId ? "pointer" : "not-allowed", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" }}>＋ Legg til</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* LOGG */}
        {activeTab === "logg" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 8 }}>Person</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {[{ id: "Alle", name: "Alle", color: "#7a9e6a" }, ...workers].map(w => (
                  <button key={w.id} onClick={() => setFilterWorker(w.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: filterWorker === w.id ? "#1e3a18" : "#152012", border: `1px solid ${filterWorker === w.id ? (w.color || "#4a7a3a") : "#2d4a26"}`, borderRadius: 20, padding: "4px 12px 4px 8px", cursor: "pointer", fontSize: 11, color: filterWorker === w.id ? (w.color || "#a8d878") : "#5a7a4a" }}>
                    {w.id !== "Alle" && <div style={{ width: 16, height: 16, borderRadius: "50%", background: w.color + "44", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>}
                    {w.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 8 }}>Kategori</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Alle", ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} style={{ background: filterCategory === cat ? "#2d5a20" : "#152012", border: `1px solid ${filterCategory === cat ? "#4a8a30" : "#2d4a26"}`, color: filterCategory === cat ? "#a8d878" : "#5a7a4a", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{cat}</button>
                ))}
              </div>
            </div>
            {filteredEntries.length === 0 ? (
              <div style={{ textAlign: "center", color: "#3a5a30", padding: "60px 0", fontSize: 14 }}>Ingen registreringer</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredEntries.map(entry => {
                  const w = getWorker(entry.worker_id);
                  if (!w) return null;
                  return (
                    <div key={entry.id} style={{ background: "#152012", border: "1px solid #2d4a26", borderLeft: `3px solid ${w.color}`, borderRadius: 6, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12, color: w.color, fontWeight: "bold" }}>{w.name}</span>
                            <span style={{ fontSize: 11, color: "#5a7a4a" }}>{formatDate(entry.date)}</span>
                            <span style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", background: "#1e3a18", border: "1px solid #2d4a26", color: "#5a7a4a", padding: "1px 6px", borderRadius: 3 }}>{entry.category}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#8a9e78" }}>
                            {entry.start_time}–{entry.end_time}
                            {entry.description && <span style={{ color: "#4a6a38", marginLeft: 8 }}>· {entry.description}</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, color: "#a8d878", fontWeight: "bold" }}>{formatDuration(entry.duration_minutes)}</div>
                        <div style={{ fontSize: 10, color: "#4a6a38" }}>{formatNOK((entry.duration_minutes / 60) * w.wage)}</div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} style={{ background: "none", border: "none", color: "#2d4a26", cursor: "pointer", fontSize: 15, padding: "4px", lineHeight: 1 }} onMouseEnter={e => e.currentTarget.style.color = "#9a4a4a"} onMouseLeave={e => e.currentTarget.style.color = "#2d4a26"}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OVERSIKT */}
        {activeTab === "oversikt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {workers.length === 0 ? (
              <div style={{ textAlign: "center", color: "#3a5a30", padding: "40px 0" }}>Ingen ansatte lagt til</div>
            ) : (
              <>
                {workerStats.map(w => (
                  <div key={w.id} style={{ background: "#152012", border: "1px solid #2d4a26", borderTop: `3px solid ${w.color}`, borderRadius: 8, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                        <div>
                          <div style={{ fontSize: 15, color: "#d4e8b0", marginBottom: 4 }}>{w.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {editingWageId === w.id ? (
                              <>
                                <input type="number" value={tempWage} onChange={e => setTempWage(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width: 70, padding: "2px 6px", fontSize: 11 }} />
                                <span style={{ fontSize: 11, color: "#5a7a4a" }}>kr/t</span>
                                <button onClick={() => updateWage(w.id, tempWage)} style={{ ...smallBtn, background: "#2d5a20", borderColor: "#4a8a30", color: "#a8d878" }}>✓</button>
                                <button onClick={() => setEditingWageId(null)} style={smallBtn}>✕</button>
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: 11, color: "#5a7a4a" }}>{w.wage} kr/t</span>
                                <button onClick={() => { setTempWage(w.wage); setEditingWageId(w.id); }} style={{ ...smallBtn, padding: "1px 8px", fontSize: 10 }}>Endre sats</button>
                                <button onClick={() => deleteWorker(w.id)} style={{ ...smallBtn, padding: "1px 8px", fontSize: 10, color: "#7a4a4a", borderColor: "#4a2a2a" }}>Fjern</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setPayoutTarget(w.id)} disabled={w.unpaidAmount <= 0} style={{ background: w.unpaidAmount > 0 ? "#1a3a5a" : "#1a1a1a", border: `1px solid ${w.unpaidAmount > 0 ? "#3a6a9a" : "#2a2a2a"}`, color: w.unpaidAmount > 0 ? "#80c0f0" : "#2a2a2a", padding: "7px 14px", borderRadius: 6, cursor: w.unpaidAmount > 0 ? "pointer" : "not-allowed", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                        Utbetal {formatNOK(w.unpaidAmount)}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        { label: "Totalt", val: formatDuration(w.totalMins), sub: `${(w.totalMins/60).toFixed(1)}t` },
                        { label: "Total verdi", val: formatNOK(w.totalAmount), sub: `@ ${w.wage} kr/t` },
                        { label: "Utestående", val: formatNOK(w.unpaidAmount), sub: formatDuration(w.unpaidMins), hi: true },
                      ].map(card => (
                        <div key={card.label} style={{ background: "#0f1a0d", borderRadius: 6, padding: 12, textAlign: "center", border: `1px solid ${card.hi ? "#2a4a20" : "#1a2e16"}` }}>
                          <div style={{ fontSize: 9, color: "#4a6a38", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{card.label}</div>
                          <div style={{ fontSize: 15, color: card.hi ? w.color : "#c8dca8", fontWeight: "bold" }}>{card.val}</div>
                          <div style={{ fontSize: 10, color: "#3a5a30", marginTop: 2 }}>{card.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#7a9e6a", letterSpacing: 2, textTransform: "uppercase" }}>Totalt utestående — alle</span>
                  <span style={{ fontSize: 20, color: "#a8d878", fontWeight: "bold" }}>{formatNOK(totalUnpaid)}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 4 };
const inputStyle = { background: "#0f1a0d", border: "1px solid #2d4a26", color: "#d4e8b0", padding: "8px 10px", borderRadius: 5, fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
const smallBtn = { background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, letterSpacing: 1 };
