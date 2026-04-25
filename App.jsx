import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SETT INN DINE VERDIER HER ───────────────────────────────────────────────
const SUPABASE_URL = "https://zasjbcbkvehhbqydadnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wTSsiXVhL6nPDsdYjRF8Yg_tCYyLzAU";
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = [
  "Jordarbeiding","Såing","Sprøyting","Høsting",
  "Skogsarbeid","Vedlikehold/reparasjon","Transport",
  "Graving/anlegg","Administrasjon","Annet",
];

const WORKER_COLORS = [
  "#a8d878","#78c8f0","#f0c878","#f09878","#c878f0","#78f0c8","#f078b8","#b8d0a0"
];

// ─── AVLØSERSATSER — Overenskomst jordbruks- og gartnerinæringene 2024-2026 ──
// § 3-2 Avløsere
const AVLOSER_SATSER = [
  { minAar: 0,  maxAar: 15, sats: null,   label: "Under 16 år — fri avtale" },
  { minAar: 16, maxAar: 17, sats: 147.40, label: "Under 18 år — kr 147,40/t" },
  { minAar: 18, maxAar: 99, sats: 177.80, label: "Over 18 år, 0 ans. — kr 177,80/t" },
];

// Returnerer anbefalt sats basert på alder på en gitt dato
function getSatsForAlder(birthdate, workDate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const work = workDate ? new Date(workDate) : new Date();
  let age = work.getFullYear() - birth.getFullYear();
  const m = work.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && work.getDate() < birth.getDate())) age--;
  if (age < 0) return null;
  const satsObj = AVLOSER_SATSER.find(s => age >= s.minAar && age <= s.maxAar);
  return satsObj || null;
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

// Hent korrekt timelønn for en arbeider på en gitt dato
function getWageForDate(worker, date) {
  if (worker.birthdate) {
    const satsObj = getSatsForAlder(worker.birthdate, date);
    if (satsObj && satsObj.sats !== null) return satsObj.sats;
    if (satsObj && satsObj.sats === null) return worker.wage; // under 16 — bruk manuell sats
  }
  return worker.wage;
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
  const [newWorkerBirthdate, setNewWorkerBirthdate] = useState("");
  const [newWorkerWage, setNewWorkerWage] = useState(177.80);
  const [showManualWage, setShowManualWage] = useState(false);

  const [editingWorker, setEditingWorker] = useState(null);
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

  // Beregn anbefalt sats basert på fødselsdato ved opprettelse
  const suggestedSats = newWorkerBirthdate
    ? getSatsForAlder(newWorkerBirthdate, new Date().toISOString().slice(0, 10))
    : null;

  async function addWorker() {
    const name = newWorkerName.trim();
    if (!name) return;
    if (workers.find(w => w.name.toLowerCase() === name.toLowerCase())) {
      showNotif("Det finnes allerede en person med dette navnet", "error"); return;
    }
    // Bruk tariff-sats automatisk om tilgjengelig, ellers manuell sats
    const wage = (suggestedSats && suggestedSats.sats !== null && !showManualWage)
      ? suggestedSats.sats
      : parseFloat(newWorkerWage) || 147.40;

    const color = WORKER_COLORS[workers.length % WORKER_COLORS.length];
    const { data, error } = await supabase.from("workers").insert({
      name,
      wage,
      birthdate: newWorkerBirthdate || null,
      color,
      paid_minutes: 0,
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setWorkers(prev => [...prev, data]);
    setActiveWorkerId(data.id);
    setNewWorkerName(""); setNewWorkerBirthdate(""); setNewWorkerWage(177.80); setShowManualWage(false);
    setShowAddWorker(false);
    showNotif(`${name} er lagt til — ${wage} kr/t`);
  }

  async function updateWorker(id, updates) {
    await supabase.from("workers").update(updates).eq("id", id);
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    setEditingWorker(null);
    showNotif("Oppdatert");
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

    // Beregn lønn basert på alder på arbeidsdatoen
    const wage_at_date = getWageForDate(activeWorker, form.date);

    const { data, error } = await supabase.from("entries").insert({
      worker_id: activeWorkerId,
      date: form.date,
      category: form.category,
      start_time: form.startTime,
      end_time: form.endTime,
      duration_minutes: duration,
      description: form.description || null,
      wage_at_date,
    }).select().single();
    if (error) { showNotif("Feil ved lagring", "error"); return; }
    setEntries(prev => [data, ...prev]);
    setForm(f => ({ ...f, startTime: "", endTime: "", description: "" }));
    showNotif(`${formatDuration(duration)} registrert — ${wage_at_date} kr/t`);
  }

  async function handleDelete(id) {
    await supabase.from("entries").delete().eq("id", id);
    setEntries(prev => prev.filter(e => e.id !== id));
    showNotif("Registrering slettet", "error");
  }

  async function handlePayout(workerId) {
    const worker = workers.find(w => w.id === workerId);
    const totalMins = entries.filter(e => e.worker_id === workerId).reduce((s, e) => s + e.duration_minutes, 0);
    const unpaid = workerStats.find(w => w.id === workerId)?.unpaidAmount || 0;
    await supabase.from("workers").update({ paid_minutes: totalMins }).eq("id", workerId);
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, paid_minutes: totalMins } : w));
    setPayoutTarget(null);
    showNotif(`Utbetaling registrert for ${worker.name} — ${formatNOK(unpaid)}`);
  }

  // Beregn stats — bruk wage_at_date per rad om den finnes
  const workerStats = workers.map(w => {
    const wEntries = entries.filter(e => e.worker_id === w.id);
    const totalMins = wEntries.reduce((s, e) => s + e.duration_minutes, 0);
    const totalAmount = wEntries.reduce((s, e) => {
      const wage = e.wage_at_date || getWageForDate(w, e.date);
      return s + (e.duration_minutes / 60) * wage;
    }, 0);
    const paidAmount = (() => {
      // Beregn betalt beløp basert på paid_minutes fra eldste entries
      let minsLeft = w.paid_minutes;
      let paid = 0;
      const sorted = [...wEntries].sort((a, b) => a.date.localeCompare(b.date) || a.start_time?.localeCompare(b.start_time));
      for (const e of sorted) {
        if (minsLeft <= 0) break;
        const take = Math.min(minsLeft, e.duration_minutes);
        const wage = e.wage_at_date || getWageForDate(w, e.date);
        paid += (take / 60) * wage;
        minsLeft -= take;
      }
      return paid;
    })();
    const unpaidMins = totalMins - w.paid_minutes;
    const unpaidAmount = totalAmount - paidAmount;
    const age = getAgeToday(w.birthdate);
    const currentSats = w.birthdate ? getSatsForAlder(w.birthdate, new Date().toISOString().slice(0, 10)) : null;
    return { ...w, totalMins, unpaidMins, unpaidAmount, totalAmount, age, currentSats };
  });

  const totalUnpaid = workerStats.reduce((s, w) => s + w.unpaidAmount, 0);

  const filteredEntries = entries.filter(e => {
    const wMatch = filterWorker === "Alle" || e.worker_id === filterWorker;
    const cMatch = filterCategory === "Alle" || e.category === filterCategory;
    return wMatch && cMatch;
  });

  const getWorker = (id) => workers.find(w => w.id === id);

  // Forhåndsvis lønn for skjemaet
  const previewWage = activeWorker ? getWageForDate(activeWorker, form.date) : null;
  const previewDur = form.startTime && form.endTime
    ? Math.round((new Date(`${form.date}T${form.endTime}`) - new Date(`${form.date}T${form.startTime}`)) / 60000)
    : 0;

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

          {/* Worker pills */}
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
                {w.birthdate && (
                  <span style={{ fontSize: 10, color: "#4a6a38" }}>{getAgeToday(w.birthdate)} år</span>
                )}
              </button>
            ))}
            <button onClick={() => setShowAddWorker(true)} style={{ background: "none", border: "1px dashed #2d4a26", borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12, color: "#3a5a30" }}>+ Legg til person</button>
          </div>

          {/* Tabs */}
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

        {/* Notification */}
        {notification && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: notification.type === "error" ? "#3a1a1a" : "#1a3a1a", border: `1px solid ${notification.type === "error" ? "#7a3a3a" : "#4a7a3a"}`, color: notification.type === "error" ? "#e8a0a0" : "#a8d878", padding: "10px 18px", borderRadius: 6, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{notification.msg}</div>
        )}

        {/* ADD WORKER MODAL */}
        {showAddWorker && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "#152012", border: "1px solid #2d4a26", borderRadius: 10, padding: 32, minWidth: 320, maxWidth: 400 }}>
              <div style={{ fontSize: 13, color: "#d4e8b0", marginBottom: 20, letterSpacing: 1 }}>Legg til person</div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Navn</label>
                <input value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addWorker()}
                  placeholder="F.eks. Kari Nordmann"
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} autoFocus />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Fødselsdato</label>
                <input type="date" value={newWorkerBirthdate}
                  onChange={e => { setNewWorkerBirthdate(e.target.value); setShowManualWage(false); }}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
              </div>

              {/* Vis anbefalt tariff-sats */}
              {newWorkerBirthdate && suggestedSats && (
                <div style={{
                  background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 6,
                  padding: "10px 14px", marginBottom: 14,
                }}>
                  <div style={{ fontSize: 10, color: "#5a7a4a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
                    Tariff — overenskomsten 2024–2026
                  </div>
                  <div style={{ fontSize: 13, color: "#a8d878" }}>
                    {suggestedSats.label}
                  </div>
                  {suggestedSats.sats === null && (
                    <div style={{ fontSize: 11, color: "#f0c878", marginTop: 4 }}>
                      Under 16 år — lønn avtales fritt (§ 3-2). Sett sats manuelt.
                    </div>
                  )}
                  {suggestedSats.sats !== null && (
                    <div style={{ fontSize: 11, color: "#5a7a4a", marginTop: 4 }}>
                      Lønn beregnes automatisk basert på alder på arbeidsdato
                    </div>
                  )}
                </div>
              )}

              {/* Manuell sats — alltid synlig for under-16, valgfritt ellers */}
              {newWorkerBirthdate && (suggestedSats?.sats === null || showManualWage) && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Lønnssats (kr/t)</label>
                  <input type="number" value={newWorkerWage}
                    onChange={e => setNewWorkerWage(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              )}

              {newWorkerBirthdate && suggestedSats?.sats !== null && !showManualWage && (
                <button onClick={() => setShowManualWage(true)} style={{ ...smallBtn, fontSize: 10, marginBottom: 14, padding: "3px 12px" }}>
                  Overstyr lønnssats manuelt
                </button>
              )}

              {!newWorkerBirthdate && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Lønnssats (kr/t)</label>
                  <input type="number" value={newWorkerWage}
                    onChange={e => setNewWorkerWage(e.target.value)}
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={addWorker} style={{ background: "#2d5a20", border: "1px solid #4a8a30", color: "#a8d878", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, flex: 1 }}>Legg til</button>
                <button onClick={() => { setShowAddWorker(false); setNewWorkerName(""); setNewWorkerBirthdate(""); setShowManualWage(false); }} style={{ background: "#1a2e16", border: "1px solid #2d4a26", color: "#7a9e6a", padding: "9px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Avbryt</button>
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

        {/* ===== REGISTER ===== */}
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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: activeWorker.color + "33", border: `1px solid ${activeWorker.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: activeWorker.color, fontWeight: "bold" }}>{initials(activeWorker.name)}</div>
                        <span style={{ fontSize: 13, color: activeWorker.color }}>Registrerer for <strong>{activeWorker.name}</strong></span>
                      </div>
                      {/* Vis gjeldende sats for valgt dato */}
                      {previewWage && (
                        <div style={{ fontSize: 11, color: "#5a7a4a", background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 4, padding: "3px 10px" }}>
                          {previewWage} kr/t
                          {activeWorker.birthdate && (
                            <span style={{ color: "#3a5a30", marginLeft: 4 }}>
                              (alder {getSatsForAlder(activeWorker.birthdate, form.date) ? getAgeToday(activeWorker.birthdate) : "?"} år)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={labelStyle}>Dato</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Kategori</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label style={labelStyle}>Starttid</label>
                      <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Sluttid</label>
                      <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={inputStyle} /></div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Beskrivelse (valgfritt)</label>
                    <input type="text" value={form.description} placeholder="F.eks. pløyd østre jorde..."
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                  </div>

                  {previewDur > 0 && activeWorker && (
                    <div style={{ fontSize: 12, color: "#7a9e6a", marginBottom: 12 }}>
                      ≈ {formatDuration(previewDur)} · {formatNOK((previewDur / 60) * previewWage)}
                    </div>
                  )}

                  <button onClick={handleAdd} disabled={!activeWorkerId} style={{
                    background: activeWorkerId ? "#2d5a20" : "#1a2a16",
                    border: `1px solid ${activeWorkerId ? "#4a8a30" : "#2d4a26"}`,
                    color: activeWorkerId ? "#a8d878" : "#3a5a30",
                    padding: "10px 24px", borderRadius: 6,
                    cursor: activeWorkerId ? "pointer" : "not-allowed",
                    fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
                  }}>＋ Legg til</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== LOGG ===== */}
        {activeTab === "logg" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 8 }}>Person</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {[{ id: "Alle", name: "Alle", color: "#7a9e6a" }, ...workers].map(w => (
                  <button key={w.id} onClick={() => setFilterWorker(w.id)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: filterWorker === w.id ? "#1e3a18" : "#152012",
                    border: `1px solid ${filterWorker === w.id ? (w.color || "#4a7a3a") : "#2d4a26"}`,
                    borderRadius: 20, padding: "4px 12px 4px 8px", cursor: "pointer", fontSize: 11,
                    color: filterWorker === w.id ? (w.color || "#a8d878") : "#5a7a4a",
                  }}>
                    {w.id !== "Alle" && <div style={{ width: 16, height: 16, borderRadius: "50%", background: w.color + "44", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>}
                    {w.name}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a7a4a", textTransform: "uppercase", marginBottom: 8 }}>Kategori</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Alle", ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} style={{
                    background: filterCategory === cat ? "#2d5a20" : "#152012",
                    border: `1px solid ${filterCategory === cat ? "#4a8a30" : "#2d4a26"}`,
                    color: filterCategory === cat ? "#a8d878" : "#5a7a4a",
                    padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                  }}>{cat}</button>
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
                  const wage = entry.wage_at_date || getWageForDate(w, entry.date);
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
                        <div style={{ fontSize: 10, color: "#4a6a38" }}>{formatNOK((entry.duration_minutes / 60) * wage)} · {wage} kr/t</div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} style={{ background: "none", border: "none", color: "#2d4a26", cursor: "pointer", fontSize: 15, padding: "4px", lineHeight: 1 }}
                        onMouseEnter={e => e.currentTarget.style.color = "#9a4a4a"}
                        onMouseLeave={e => e.currentTarget.style.color = "#2d4a26"}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== OVERSIKT ===== */}
        {activeTab === "oversikt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {workers.length === 0 ? (
              <div style={{ textAlign: "center", color: "#3a5a30", padding: "40px 0" }}>Ingen ansatte lagt til</div>
            ) : (
              <>
                {workerStats.map(w => (
                  <div key={w.id} style={{ background: "#152012", border: "1px solid #2d4a26", borderTop: `3px solid ${w.color}`, borderRadius: 8, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: w.color + "33", border: `1px solid ${w.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: w.color, fontWeight: "bold" }}>{initials(w.name)}</div>
                        <div>
                          <div style={{ fontSize: 15, color: "#d4e8b0", marginBottom: 2 }}>{w.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {w.birthdate && (
                              <span style={{ fontSize: 11, color: "#5a7a4a" }}>{w.age} år</span>
                            )}
                            {w.currentSats && (
                              <span style={{ fontSize: 10, color: "#4a7a34", background: "#1a2e16", border: "1px solid #2d4a26", borderRadius: 3, padding: "1px 7px" }}>
                                {w.currentSats.sats ? `${w.currentSats.sats} kr/t` : "Fri avtale"}
                              </span>
                            )}
                            <button onClick={() => setEditingWorker(w.id === editingWorker ? null : w.id)}
                              style={{ ...smallBtn, padding: "1px 8px", fontSize: 10 }}>Rediger</button>
                            <button onClick={() => deleteWorker(w.id)}
                              style={{ ...smallBtn, padding: "1px 8px", fontSize: 10, color: "#7a4a4a", borderColor: "#4a2a2a" }}>Fjern</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setPayoutTarget(w.id)} disabled={w.unpaidAmount <= 0} style={{
                        background: w.unpaidAmount > 0 ? "#1a3a5a" : "#1a1a1a",
                        border: `1px solid ${w.unpaidAmount > 0 ? "#3a6a9a" : "#2a2a2a"}`,
                        color: w.unpaidAmount > 0 ? "#80c0f0" : "#2a2a2a",
                        padding: "7px 14px", borderRadius: 6,
                        cursor: w.unpaidAmount > 0 ? "pointer" : "not-allowed",
                        fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
                      }}>Utbetal {formatNOK(w.unpaidAmount)}</button>
                    </div>

                    {/* Rediger-panel */}
                    {editingWorker === w.id && (
                      <EditWorkerPanel worker={w} onSave={updateWorker} onClose={() => setEditingWorker(null)} inputStyle={inputStyle} labelStyle={labelStyle} smallBtn={smallBtn} getSatsForAlder={getSatsForAlder} />
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[
                        { label: "Totalt", val: formatDuration(w.totalMins), sub: `${(w.totalMins/60).toFixed(1)}t` },
                        { label: "Total verdi", val: formatNOK(w.totalAmount), sub: "inkl. aldersbasert sats" },
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

// ─── Rediger arbeider-panel ───────────────────────────────────────────────────
function EditWorkerPanel({ worker, onSave, onClose, inputStyle, labelStyle, smallBtn, getSatsForAlder }) {
  const [birthdate, setBirthdate] = useState(worker.birthdate || "");
  const [wage, setWage] = useState(worker.wage);
  const [manualOverride, setManualOverride] = useState(!worker.birthdate);

  const suggestedSats = birthdate
    ? getSatsForAlder(birthdate, new Date().toISOString().slice(0, 10))
    : null;

  const handleSave = () => {
    const finalWage = (!manualOverride && suggestedSats?.sats)
      ? suggestedSats.sats
      : parseFloat(wage) || worker.wage;
    onSave(worker.id, { birthdate: birthdate || null, wage: finalWage });
  };

  return (
    <div style={{ background: "#0f1a0d", border: "1px solid #2d4a26", borderRadius: 6, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Fødselsdato</label>
          <input type="date" value={birthdate}
            onChange={e => { setBirthdate(e.target.value); setManualOverride(false); }}
            style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }} />
        </div>
        <div>
          {(manualOverride || !birthdate || suggestedSats?.sats === null) ? (
            <>
              <label style={labelStyle}>Lønnssats (kr/t)</label>
              <input type="number" value={wage}
                onChange={e => setWage(e.target.value)}
                style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }} />
            </>
          ) : (
            <div style={{ paddingTop: 16 }}>
              {suggestedSats && (
                <div style={{ fontSize: 11, color: "#a8d878" }}>{suggestedSats.label}</div>
              )}
              <button onClick={() => setManualOverride(true)}
                style={{ ...smallBtn, fontSize: 10, marginTop: 6, padding: "2px 10px" }}>
                Overstyr
              </button>
            </div>
          )}
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
