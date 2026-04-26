import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zasjbcbkvehhbqydadnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wTSsiXVhL6nPDsdYjRF8Yg_tCYyLzAU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  "Jordarbeiding","Såing","Sprøyting","Høsting",
  "Skogsarbeid","Vedlikehold/reparasjon","Transport",
  "Graving/anlegg","Administrasjon","Annet",
];

const WORKER_COLORS = [
  "#a8d878","#78c8f0","#f0c878","#f09878","#c878f0","#78f0c8","#f078b8","#b8d0a0"
];

const AVLOSER_SATSER = [
  { minAar: 0,  maxAar: 15, sats: null,   label: "Under 16 år — fri avtale" },
  { minAar: 16, maxAar: 17, sats: 147.40, label: "Under 18 år — kr 147,40/t" },
  { minAar: 18, maxAar: 99, sats: 177.80, label: "Over 18 år, 0 ans. — kr 177,80/t" },
];

function getSatsForAlder(birthdate, workDate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const work = workDate ? new Date(workDate) : new Date();
  let age = work.getFullYear() - birth.getFullYear();
  const m = work.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && work.getDate() < birth.getDate())) age--;
  if (age < 0) return null;
  return AVLOSER_SATSER.find(s => age >= s.minAar && age <= s.maxAar) || null;
}
function getAgeToday(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
function getWageForDate(worker, date) {
  if (worker.birthdate) {
    const s = getSatsForAlder(worker.birthdate, date);
    if (s && s.sats !== null) return s.sats;
    if (s && s.sats === null) return worker.wage;
  }
  return worker.wage;
}
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ workers, onLogin }) {
  const [selectedId, setSelectedId] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const selected = workers.find(w => w.id === selectedId);

  function handlePinDigit(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError("");
    if (next.length === 4) setTimeout(() => tryLogin(next), 120);
  }

  function tryLogin(code) {
    if (code === selected?.pin) {
      onLogin(selected);
    } else {
      setError("Feil PIN — prøv igjen");
      setPin("");
    }
  }

  if (!selectedId) return (
    <div style={loginWrap}>
      <div style={loginCard}>
        <div style={loginLogo}>Torp Gårdsrift</div>
        <div style={{ fontSize: 11, color: "#5a7a4a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>Hvem er du?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {workers.map(w => (
            <button key={w.id} onClick={() => setSelectedId(w.id)} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#1a2e16", border: "1px solid #2d4a26",
              borderRadius: 10, padding: "12px 16px", cursor: "pointer", width: "100%",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = w.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2d4a26"}
            >
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: w.color, fontWeight: "bold", flexShrink: 0 }}>{initials(w.name)}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 15, color: "#d4e8b0" }}>{w.name}</div>
                <div style={{ fontSize: 10, color: "#5a7a4a", letterSpacing: 1 }}>{w.is_admin ? "ADMINISTRATOR" : "ARBEIDER"}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={loginWrap}>
      <div style={loginCard}>
        <div style={loginLogo}>Torp Gårdsrift</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: selected.color + "33", border: `1px solid ${selected.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: selected.color, fontWeight: "bold" }}>{initials(selected.name)}</div>
          <div>
            <div style={{ fontSize: 14, color: "#d4e8b0" }}>{selected.name}</div>
            <button onClick={() => { setSelectedId(null); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: "#5a7a4a", cursor: "pointer", fontSize: 11, padding: 0 }}>← Bytt bruker</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#5a7a4a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Skriv inn PIN</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: pin.length > i ? selected.color : "transparent", border: `2px solid ${pin.length > i ? selected.color : "#3a5a30"}`, transition: "all 0.15s" }} />
          ))}
        </div>
        {error && <div style={{ fontSize: 12, color: "#e8a0a0", marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: 200 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
            <button key={i} onClick={() => { if (d === "⌫") { setPin(p => p.slice(0,-1)); setError(""); } else if (d !== "") handlePinDigit(String(d)); }} disabled={d === ""} style={{ background: d === "" ? "transparent" : "#1a2e16", border: d === "" ? "none" : "1px solid #2d4a26", borderRadius: 8, padding: "14px 0", color: "#d4e8b0", fontSize: 18, cursor: d === "" ? "default" : "pointer" }}
              onMouseEnter={e => { if (d !== "") e.currentTarget.style.background = "#2d4a26"; }}
              onMouseLeave={e => { if (d !== "") e.currentTarget.style.background = "#1a2e16"; }}
            >{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const loginWrap = { minHeight: "100vh", background: "#0f1a0d", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Georgia', serif" };
const loginCard = { background: "#152012", border: "1px solid #2d4a26", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center" };
const loginLogo = { fontFamily: "'Dancing Script', cursive", fontSize: 38, color: "#a8d878", marginBottom: 8, textAlign: "center" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [workers, setWorkers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("register");
  const [notification, setNotification] = useState(null);
  const [activeWorkerId, setActiveWorkerId] = useState(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: "", birthdate: "", pin: "", pin2: "", wage: 177.80, is_admin: false });
  const [showManualWage, setShowManualWage] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [expandedWorker, setExpandedWorker] = useState(null);
  const [payoutTarget, setPayoutTarget] = useState(null);
  const [filterCategory, setFilterCategory] = useState("Alle");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: CATEGORIES[0], startTime: "", endTime: "", description: "",
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    fetchAll();
  }, []);

  useEffect(() => {
    if (currentUser && !currentUser.is_admin) setActiveWorkerId(currentUser.id);
  }, [currentUser]);

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

  const isAdmin = currentUser?.is_admin;

  const suggestedSats = newWorker.birthdate
    ? getSatsForAlder(newWorker.birthdate, new Date().toISOString().slice(0, 10))
    : null;

  async function addWorker() {
    const name = newWorker.name.trim();
    if (!name) return;
    if (!newWorker.pin || newWorker.pin.length !== 4) { showNotif("PIN må være 4 siffer", "error"); return; }
    if (newWorker.pin !== newWorker.pin2) { showNotif("PIN-kodene er ikke like", "error"); return; }
    if (workers.find(w => w.name.toLowerCase() === name.toLowerCase())) { showNotif("Navnet er allerede i bruk", "error"); return; }
    const wage = (suggestedSats?.sats && !showManualWage) ? suggestedSats.sats : parseFloat(newWorker.wage) || 147.40;
    const color = WORKER_COLORS[workers.length % WORKER_COLORS.length];
    const { data, error } = await supabase.from("workers").insert({
      name, wage, birthdate: newWorker.birthdate || null,
      pin: newWorker.pin, is_admin: newWorker.is_admin, color, paid_minutes: 0,
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setWorkers(prev => [...prev, data]);
    setNewWorker({ name: "", birthdate: "", pin: "", pin2: "", wage: 177.80, is_admin: false });
    setShowManualWage(false); setShowAddWorker(false);
    showNotif(`${name} er lagt til`);
  }

  async function updateWorker(id, updates) {
    await supabase.from("workers").update(updates).eq("id", id);
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, ...updates }));
    setEditingWorker(null);
    showNotif("Oppdatert");
  }

  async function deleteWorker(id) {
    const w = workers.find(x => x.id === id);
    await supabase.from("entries").delete().eq("worker_id", id);
    await supabase.from("workers").delete().eq("id", id);
    setWorkers(prev => prev.filter(x => x.id !== id));
    setEntries(prev => prev.filter(e => e.worker_id !== id));
    showNotif(`${w.name} fjernet`);
  }

  async function handleAdd() {
    const workerId = isAdmin ? activeWorkerId : currentUser?.id;
    if (!workerId) { showNotif("Velg hvem som jobbet", "error"); return; }
    if (!form.startTime || !form.endTime) { showNotif("Fyll inn start- og sluttid", "error"); return; }
    const dur = Math.round((new Date(`${form.date}T${form.endTime}`) - new Date(`${form.date}T${form.startTime}`)) / 60000);
    if (dur <= 0) { showNotif("Sluttid må være etter starttid", "error"); return; }
    const worker = workers.find(w => w.id === workerId);
    const wage_at_date = getWageForDate(worker, form.date);
    const { data, error } = await supabase.from("entries").insert({
      worker_id: workerId, date: form.date, category: form.category,
      start_time: form.startTime, end_time: form.endTime,
      duration_minutes: dur, description: form.description || null, wage_at_date,
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setEntries(prev => [data, ...prev]);
    setForm(f => ({ ...f, startTime: "", endTime: "", description: "" }));
    showNotif(`${formatDuration(dur)} registrert — ${wage_at_date} kr/t`);
  }

  async function handleDelete(id) {
    await supabase.from("entries").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
    showNotif("Slettet", "error");
  }

  async function handlePayout(workerId) {
    const worker = workers.find(w => w.id === workerId);
    const totalMins = entries.filter(e => e.worker_id === workerId).reduce((s, e) => s + e.duration_minutes, 0);
    const ws = workerStats.find(w => w.id === workerId);
    await supabase.from("workers").update({ paid_minutes: totalMins }).eq("id", workerId);
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, paid_minutes: totalMins } : w));
    setPayoutTarget(null);
    showNotif(`Utbetaling registrert for ${worker.name} — ${formatNOK(ws?.unpaidAmount || 0)}`);
  }

  const statsWorkers = isAdmin ? workers : workers.filter(w => w.id === currentUser?.id);

  const workerStats = statsWorkers.map(w => {
    const wEntries = entries.filter(e => e.worker_id === w.id);
    const totalMins = wEntries.reduce((s, e) => s + e.duration_minutes, 0);
    const totalAmount = wEntries.reduce((s, e) => s + (e.duration_minutes / 60) * (e.wage_at_date || getWageForDate(w, e.date)), 0);
    const paidAmount = (() => {
      let minsLeft = w.paid_minutes; let paid = 0;
      const sorted = [...wEntries].sort((a, b) => a.date.localeCompare(b.date));
      for (const e of sorted) {
        if (minsLeft <= 0) break;
        const take = Math.min(minsLeft, e.duration_minutes);
        paid += (take / 60) * (e.wage_at_date || getWageForDate(w, e.date));
        minsLeft -= take;
      }
      return paid;
    })();
    return {
      ...w, totalMins,
      unpaidMins: totalMins - w.paid_minutes,
      unpaidAmount: totalAmount - paidAmount,
      totalAmount,
      age: getAgeToday(w.birthdate),
      currentSats: w.birthdate ? getSatsForAlder(w.birthdate, new Date().toISOString().slice(0, 10)) : null,
    };
  });

  const totalUnpaid = workerStats.reduce((s, w) => s + w.unpaidAmount, 0);

  // Header: admin ser valgt arbeiders lønn, ellers egen
  const headerWorkerId = isAdmin && activeWorkerId ? activeWorkerId : currentUser?.id;
  const headerStats = workerStats.find(w => w.id === headerWorkerId);
  const headerWorker = workers.find(w => w.id === headerWorkerId);
  const myUnpaid = headerStats?.unpaidAmount || 0;

  const getWorker = (id) => workers.find(w => w.id === id);
  const previewWorker = isAdmin ? workers.find(w => w.id === activeWorkerId) : workers.find(w => w.id === currentUser?.id);
  const previewWage = previewWorker ? getWageForDate(previewWorker, form.date) : null;
  const previewDur = form.startTime && form.endTime
    ? Math.round((new Date(`${form.date}T${form.endTime}`) - new Date(`${form.date}T${form.startTime}`)) / 60000)
    : 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f1a0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#7a9e6a", fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: 2 }}>LASTER…</div>
    </div>
  );

  if (!currentUser) return <LoginScreen workers={workers} onLogin={setCurrentUser} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0f1a0d", color: "#e8ead4", fontFamily: "'Georgia', serif" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1a2e16 0%, #0f1a0d 100%)", borderBottom: "1px solid #2d4a26", padding: "20px 24px 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7a9e6a", textTransform: "uppercase", marginBottom: 2 }}>Halden</div>
              <h1 style={{ margin: 0, fontFamily: "'Dancing Script', cursive", fontSize: 38, fontWeight: 600, color: "#a8d878", letterSpacing: 1, lineHeight: 1.1 }}>Torp Gårdsrift</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#7a9e6a", letterSpacing: 1, textTransform: "uppercase" }}>
                {isAdmin && headerWorker && headerWorker.id !== currentUser?.id
                  ? `${headerWorker.name} — utestående`
                  : "Din utestående lønn"}
              </div>
              <div style={{ fontSize: 26, fontWeight: "bold", color: myUnpaid > 0 ? "#a8d878" : "#5a7a4a", lineHeight: 1.1 }}>{formatNOK(myUnpaid)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: currentUser.color + "33", border: `1px solid ${currentUser.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: currentUser.color, fontWeight: "bold" }}>{initials(currentUser.name)}</div>
                  <span style={{ fontSize: 11, color: "#5a7a4a" }}>{currentUser.name}</span>
                  {isAdmin && <span style={{ fontSize: 9, color: "#4a7a34", background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 3, padding: "1px 6px", letterSpacing: 1 }}>ADMIN</span>}
                </div>
                <button onClick={() => { setCurrentUser(null); setActiveWorkerId(null); }} style={{ background: "none", border: "none", color: "#3a5a30", cursor: "pointer", fontSize: 11, padding: 0 }}>Logg ut</button>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", paddingBottom: 8 }}>
              {workers.map(w => (
                <button key={w.id} onClick={() => setActiveWorkerId(w.id === activeWorkerId ? null : w.id)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  background: activeWorkerId === w.id ? "#1e3a18" : "#152012",
                  border: `1px solid ${activeWorkerId === w.id ? w.color : "#2d4a26"}`,
                  borderRadius: 20, padding: "4px 12px 4px 6px", cursor: "pointer",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                  <span style={{ fontSize: 11, color: activeWorkerId === w.id ? w.color : "#7a9e6a" }}>{w.name}</span>
                  {w.birthdate && <span style={{ fontSize: 10, color: "#4a6a38" }}>{getAgeToday(w.birthdate)}å</span>}
                </button>
              ))}
              <button onClick={() => setShowAddWorker(true)} style={{ background: "none", border: "1px dashed #2d4a26", borderRadius: 20, padding: "4px 14px", cursor: "pointer", fontSize: 11, color: "#3a5a30" }}>+ Person</button>
            </div>
          )}

          <div style={{ display: "flex", marginTop: isAdmin ? 4 : 16 }}>
            {[["register","Registrer"],["oversikt","Oversikt"]].map(([key, label]) => (
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

        {/* ADD WORKER MODAL */}
        {showAddWorker && isAdmin && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ background: "#152012", border: "1px solid #2d4a26", borderRadius: 10, padding: 28, width: "100%", maxWidth: 380, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ fontSize: 13, color: "#d4e8b0", marginBottom: 20 }}>Legg til person</div>
              {[
                { label: "Navn", key: "name", type: "text", placeholder: "F.eks. Christian Torp" },
                { label: "Fødselsdato", key: "birthdate", type: "date" },
                { label: "PIN-kode (4 siffer)", key: "pin", type: "password", placeholder: "••••", maxLength: 4 },
                { label: "Gjenta PIN", key: "pin2", type: "password", placeholder: "••••", maxLength: 4 },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{field.label}</label>
                  <input type={field.type} value={newWorker[field.key]} placeholder={field.placeholder} maxLength={field.maxLength}
                    onChange={e => setNewWorker(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              ))}
              {newWorker.birthdate && suggestedSats && (
                <div style={{ background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#5a7a4a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Tariff 2024–2026</div>
                  <div style={{ fontSize: 13, color: "#a8d878" }}>{suggestedSats.label}</div>
                  {suggestedSats.sats === null && <div style={{ fontSize: 11, color: "#f0c878", marginTop: 3 }}>Under 16 år — sett sats manuelt</div>}
                </div>
              )}
              {((!newWorker.birthdate) || suggestedSats?.sats === null || showManualWage) && (
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Lønnssats (kr/t)</label>
                  <input type="number" value={newWorker.wage} onChange={e => setNewWorker(p => ({ ...p, wage: e.target.value }))} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              )}
              {newWorker.birthdate && suggestedSats?.sats !== null && !showManualWage && (
                <button onClick={() => setShowManualWage(true)} style={{ ...smallBtn, fontSize: 10, marginBottom: 12 }}>Overstyr lønnssats</button>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <input type="checkbox" id="isAdminNew" checked={newWorker.is_admin} onChange={e => setNewWorker(p => ({ ...p, is_admin: e.target.checked }))} style={{ accentColor: "#a8d878", width: 16, height: 16 }} />
                <label htmlFor="isAdminNew" style={{ fontSize: 12, color: "#7a9e6a", cursor: "pointer" }}>Administrator (ser alt)</label>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={addWorker} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, flex: 1 }}>Legg til</button>
                <button onClick={() => { setShowAddWorker(false); setNewWorker({ name: "", birthdate: "", pin: "", pin2: "", wage: 177.80, is_admin: false }); }} style={{ background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Avbryt</button>
              </div>
            </div>
          </div>
        )}

        {/* PAYOUT MODAL */}
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
                <div style={{ fontSize: 12, color: "#7a9e6a", marginBottom: 8 }}>{formatDuration(ws.unpaidMins)} · {(ws.unpaidMins/60).toFixed(1)} timer</div>
                <p style={{ fontSize: 12, color: "#5a7a4a", marginBottom: 24 }}>Utestående lønn nullstilles. Arbeidsloggen beholdes.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => handlePayout(payoutTarget)} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Bekreft</button>
                  <button onClick={() => setPayoutTarget(null)} style={{ background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Avbryt</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ===== REGISTER ===== */}
        {activeTab === "register" && (
          <div>
            {isAdmin && !activeWorkerId && (
              <div style={{ background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#7a9e6a" }}>← Velg hvem som jobbet i toppraden</div>
            )}
            <div style={{ background: "#152012", border: `1px solid ${previewWorker ? previewWorker.color + "55" : "#2d4a26"}`, borderRadius: 8, padding: 24, marginBottom: 20 }}>
              {previewWorker && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: previewWorker.color + "33", border: `1px solid ${previewWorker.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: previewWorker.color, fontWeight: "bold" }}>{initials(previewWorker.name)}</div>
                    <span style={{ fontSize: 13, color: previewWorker.color }}>Registrerer for <strong>{previewWorker.name}</strong></span>
                  </div>
                  {previewWage && <div style={{ fontSize: 11, color: "#5a7a4a", background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 4, padding: "3px 10px" }}>{previewWage} kr/t</div>}
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
              {previewDur > 0 && previewWorker && previewWage && (
                <div style={{ fontSize: 12, color: "#7a9e6a", marginBottom: 12 }}>≈ {formatDuration(previewDur)} · {formatNOK((previewDur / 60) * previewWage)}</div>
              )}
              <button onClick={handleAdd} disabled={isAdmin && !activeWorkerId} style={{
                background: (!isAdmin || activeWorkerId) ? "#2d5a20" : "#1a2a16",
                border: `1px solid ${(!isAdmin || activeWorkerId) ? "#4a8a30" : "#2d4a26"}`,
                color: (!isAdmin || activeWorkerId) ? "#a8d878" : "#3a5a30",
                padding: "10px 24px", borderRadius: 6,
                cursor: (!isAdmin || activeWorkerId) ? "pointer" : "not-allowed",
                fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
              }}>＋ Legg til</button>
            </div>
          </div>
        )}

        {/* ===== OVERSIKT med innebygd logg ===== */}
        {activeTab === "oversikt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {workerStats.map(w => {
              const wEntries = entries
                .filter(e => e.worker_id === w.id)
                .filter(e => filterCategory === "Alle" || e.category === filterCategory)
                .sort((a, b) => b.date.localeCompare(a.date) || (b.start_time || "").localeCompare(a.start_time || ""));
              const isExpanded = expandedWorker === w.id;
              return (
                <div key={w.id} style={{
                  background: "#152012",
                  border: `1px solid ${isAdmin && activeWorkerId === w.id ? w.color + "88" : "#2d4a26"}`,
                  borderTop: `3px solid ${w.color}`,
                  borderRadius: 8, padding: 20,
                }}>
                  {/* Topprad */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                      <div>
                        <div style={{ fontSize: 14, color: "#d4e8b0", marginBottom: 2 }}>{w.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {w.birthdate && <span style={{ fontSize: 11, color: "#5a7a4a" }}>{w.age} år</span>}
                          {w.currentSats && <span style={{ fontSize: 10, color: "#4a7a34", background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 3, padding: "1px 7px" }}>{w.currentSats.sats ? `${w.currentSats.sats} kr/t` : "Fri avtale"}</span>}
                          {isAdmin && (
                            <>
                              <button onClick={() => setEditingWorker(w.id === editingWorker ? null : w.id)} style={{ ...smallBtn, padding: "1px 8px", fontSize: 10 }}>Rediger</button>
                              <button onClick={() => deleteWorker(w.id)} style={{ ...smallBtn, padding: "1px 8px", fontSize: 10, color: "#7a4a4a", borderColor: "#4a2a2a" }}>Fjern</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => setPayoutTarget(w.id)} disabled={w.unpaidAmount <= 0} style={{
                        background: w.unpaidAmount > 0 ? "#1a3a5a" : "#1a1a1a",
                        border: `1px solid ${w.unpaidAmount > 0 ? "#3a6a9a" : "#2a2a2a"}`,
                        color: w.unpaidAmount > 0 ? "#80c0f0" : "#2a2a2a",
                        padding: "7px 14px", borderRadius: 6,
                        cursor: w.unpaidAmount > 0 ? "pointer" : "not-allowed",
                        fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
                      }}>Utbetal {formatNOK(w.unpaidAmount)}</button>
                    )}
                  </div>

                  {/* Rediger-panel */}
                  {isAdmin && editingWorker === w.id && (
                    <EditWorkerPanel worker={w} onSave={updateWorker} onClose={() => setEditingWorker(null)} inputStyle={inputStyle} labelStyle={labelStyle} smallBtn={smallBtn} getSatsForAlder={getSatsForAlder} />
                  )}

                  {/* Stats-kort */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Totalt", val: formatDuration(w.totalMins), sub: `${(w.totalMins/60).toFixed(1)}t` },
                      { label: "Total verdi", val: formatNOK(w.totalAmount), sub: "aldersbasert sats" },
                      { label: "Utestående", val: formatNOK(w.unpaidAmount), sub: formatDuration(w.unpaidMins), hi: true },
                    ].map(card => (
                      <div key={card.label} style={{ background: "#0f1a0d", borderRadius: 6, padding: 12, textAlign: "center", border: `1px solid ${card.hi ? "#2a4a20" : "#1a2e16"}` }}>
                        <div style={{ fontSize: 9, color: "#4a6a38", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{card.label}</div>
                        <div style={{ fontSize: 14, color: card.hi ? w.color : "#c8dca8", fontWeight: "bold" }}>{card.val}</div>
                        <div style={{ fontSize: 10, color: "#3a5a30", marginTop: 2 }}>{card.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Kategorifilter + vis/skjul logg */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: isExpanded ? 10 : 0 }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {["Alle", ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setFilterCategory(cat)} style={{
                          background: filterCategory === cat ? "#2d5a20" : "#0f1a0d",
                          border: `1px solid ${filterCategory === cat ? "#4a8a30" : "#1a2e16"}`,
                          color: filterCategory === cat ? "#a8d878" : "#4a6a38",
                          padding: "2px 8px", borderRadius: 3, cursor: "pointer",
                          fontSize: 9, letterSpacing: 1, textTransform: "uppercase",
                        }}>{cat}</button>
                      ))}
                    </div>
                    <button onClick={() => setExpandedWorker(isExpanded ? null : w.id)} style={{
                      background: "none", border: "1px solid #2d4a26", borderRadius: 4,
                      padding: "3px 12px", cursor: "pointer", fontSize: 10, color: "#7a9e6a", letterSpacing: 1,
                    }}>
                      {isExpanded ? "▲ Skjul logg" : `▼ Vis logg (${wEntries.length})`}
                    </button>
                  </div>

                  {/* Innebygd arbeidslogg */}
                  {isExpanded && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                      {wEntries.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#3a5a30", padding: "20px 0", fontSize: 12 }}>Ingen registreringer</div>
                      ) : wEntries.map(entry => {
                        const wage = entry.wage_at_date || getWageForDate(w, entry.date);
                        return (
                          <div key={entry.id} style={{
                            background: "#0f1a0d", border: "1px solid #1a2e16",
                            borderLeft: `2px solid ${w.color}`, borderRadius: 5,
                            padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, color: "#5a7a4a" }}>{formatDate(entry.date)}</span>
                                <span style={{ fontSize: 8, letterSpacing: 1, textTransform: "uppercase", background: "#1a2e16", border: "1px solid #2d4a26", color: "#4a6a38", padding: "1px 5px", borderRadius: 2 }}>{entry.category}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#6a8e68" }}>
                                {entry.start_time}–{entry.end_time}
                                {entry.description && <span style={{ color: "#3a5a30", marginLeft: 8 }}>· {entry.description}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 12, color: "#a8d878", fontWeight: "bold" }}>{formatDuration(entry.duration_minutes)}</div>
                              <div style={{ fontSize: 9, color: "#3a5a30" }}>{formatNOK((entry.duration_minutes / 60) * wage)}</div>
                            </div>
                            {isAdmin && (
                              <button onClick={() => handleDelete(entry.id)} style={{ background: "none", border: "none", color: "#2d4a26", cursor: "pointer", fontSize: 13, padding: "2px", lineHeight: 1 }}
                                onMouseEnter={e => e.currentTarget.style.color = "#9a4a4a"}
                                onMouseLeave={e => e.currentTarget.style.color = "#2d4a26"}>✕</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {isAdmin && (
              <div style={{ background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 8, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#7a9e6a", letterSpacing: 2, textTransform: "uppercase" }}>Totalt utestående — alle ansatte</span>
                <span style={{ fontSize: 20, color: "#a8d878", fontWeight: "bold" }}>{formatNOK(totalUnpaid)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditWorkerPanel({ worker, onSave, onClose, inputStyle, labelStyle, smallBtn, getSatsForAlder }) {
  const [birthdate, setBirthdate] = useState(worker.birthdate || "");
  const [wage, setWage] = useState(worker.wage);
  const [pin, setPin] = useState("");
  const [manualOverride, setManualOverride] = useState(!worker.birthdate);
  const suggestedSats = birthdate ? getSatsForAlder(birthdate, new Date().toISOString().slice(0, 10)) : null;
  const handleSave = () => {
    const updates = { birthdate: birthdate || null, wage: (!manualOverride && suggestedSats?.sats) ? suggestedSats.sats : parseFloat(wage) || worker.wage };
    if (pin.length === 4) updates.pin = pin;
    onSave(worker.id, updates);
  };
  return (
    <div style={{ background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 6, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Fødselsdato</label>
          <input type="date" value={birthdate} onChange={e => { setBirthdate(e.target.value); setManualOverride(false); }} style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }} />
        </div>
        <div>
          {(manualOverride || !birthdate || suggestedSats?.sats === null) ? (
            <><label style={labelStyle}>Lønnssats (kr/t)</label><input type="number" value={wage} onChange={e => setWage(e.target.value)} style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }} /></>
          ) : (
            <div style={{ paddingTop: 16 }}>
              {suggestedSats && <div style={{ fontSize: 11, color: "#a8d878" }}>{suggestedSats.label}</div>}
              <button onClick={() => setManualOverride(true)} style={{ ...smallBtn, fontSize: 10, marginTop: 6, padding: "2px 10px" }}>Overstyr</button>
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>Ny PIN (valgfritt)</label>
          <input type="password" value={pin} maxLength={4} placeholder="••••" onChange={e => setPin(e.target.value)} style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "6px 16px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>Lagre</button>
        <button onClick={onClose} style={{ ...smallBtn, padding: "6px 14px" }}>Avbryt</button>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 4 };
const inputStyle = { background: "#0f1a0d", border: "1px solid #2d4a26", color: "#d4e8b0", padding: "8px 10px", borderRadius: 5, fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
const smallBtn = { background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, letterSpacing: 1 };
