import { useState } from "react";
import { Avatar, Hdr } from "./Shared";
import { S, gwfd, fd, fmt, fnok, uid } from "../lib/utils";
import { WC, today } from "../data/constants";

const FARGER = ["#a8d878","#78c8f0","#f0c878","#f09878","#c878f0","#78f0c8","#f0e878","#e08080"];

export default function Timer({ user, workers, setWorkers, entries, setEntries, back, logout }) {
  const [tab, setTab]   = useState("reg");
  const [awid, setAwid] = useState(user.is_admin ? null : user.id);
  const [notif, setNotif] = useState(null);
  const [form, setForm] = useState({ date:today, cat:WC[0], st:"", et:"", desc:"" });
  const [exp, setExp]   = useState(null);
  const [pot, setPot]   = useState(null);
  const [editEntry, setEditEntry] = useState(null); // { entry } — rediger timeoppføring
  const [editWorker, setEditWorker] = useState(null); // { worker } — rediger person

  const sn = (m, t="ok") => { setNotif({m,t}); setTimeout(() => setNotif(null), 2800); };
  const ia = user.is_admin;

  // ── Legg til time ──────────────────────────────────────────────────────────
  function hadd() {
    const wid = ia ? awid : user.id;
    if (!wid) { sn("Velg person","er"); return; }
    if (!form.st || !form.et) { sn("Fyll inn tider","er"); return; }
    const dur = Math.round((new Date(`${form.date}T${form.et}`) - new Date(`${form.date}T${form.st}`)) / 60000);
    if (dur <= 0) { sn("Sluttid må være etter starttid","er"); return; }
    const w = workers.find(x => x.id === wid);
    setEntries(p => [{ id:uid(), worker_id:wid, date:form.date, category:form.cat, start_time:form.st, end_time:form.et, duration_minutes:dur, description:form.desc, wage_at_date:gwfd(w, form.date) }, ...p]);
    setForm(f => ({...f, st:"", et:"", desc:""}));
    sn(`${fd(dur)} registrert`);
  }

  // ── Lagre redigert timeoppføring ───────────────────────────────────────────
  function saveEntry() {
    if (!editEntry) return;
    const dur = Math.round((new Date(`${editEntry.date}T${editEntry.end_time}`) - new Date(`${editEntry.date}T${editEntry.start_time}`)) / 60000);
    if (dur <= 0) { sn("Sluttid må være etter starttid","er"); return; }
    setEntries(p => p.map(e => e.id === editEntry.id
      ? { ...e, date:editEntry.date, category:editEntry.category, start_time:editEntry.start_time, end_time:editEntry.end_time, duration_minutes:dur, description:editEntry.description, wage_at_date:parseFloat(editEntry.wage_at_date)||e.wage_at_date }
      : e
    ));
    setEditEntry(null);
    sn("Oppføring oppdatert");
  }

  // ── Lagre redigert person ──────────────────────────────────────────────────
  function saveWorker() {
    if (!editWorker) return;
    setWorkers(p => p.map(w => w.id === editWorker.id
      ? { ...w, name:editWorker.name, birthdate:editWorker.birthdate, wage:parseFloat(editWorker.wage)||w.wage, pin:editWorker.pin, color:editWorker.color, is_admin:editWorker.is_admin }
      : w
    ));
    setEditWorker(null);
    sn("Person oppdatert");
  }

  // ── Beregn lønn ────────────────────────────────────────────────────────────
  const sw = ia ? workers : workers.filter(w => w.id === user.id);
  const ws = sw.map(w => {
    const we = entries.filter(e => e.worker_id === w.id);
    const tm = we.reduce((s,e) => s + e.duration_minutes, 0);
    const ta = we.reduce((s,e) => s + (e.duration_minutes/60)*(e.wage_at_date||gwfd(w,e.date)), 0);
    let ml = w.paid_minutes, pa = 0;
    for (const e of [...we].sort((a,b) => a.date.localeCompare(b.date))) {
      if (ml <= 0) break;
      const tk = Math.min(ml, e.duration_minutes);
      pa += (tk/60)*(e.wage_at_date||gwfd(w,e.date));
      ml -= tk;
    }
    return {...w, tm, um:tm-w.paid_minutes, ua:ta-pa, ta};
  });

  const tu   = ws.reduce((s,w) => s + w.ua, 0);
  const hwid = ia && awid ? awid : user.id;
  const hs   = ws.find(w => w.id === hwid);
  const hw   = workers.find(w => w.id === hwid);
  const pw   = ia ? workers.find(w => w.id === awid) : workers.find(w => w.id === user.id);
  const pwage = pw ? gwfd(pw, form.date) : null;
  const pdur  = form.st && form.et ? Math.round((new Date(`${form.date}T${form.et}`) - new Date(`${form.date}T${form.st}`)) / 60000) : 0;

  return (
    <div style={S.wrap}>
      <Hdr title="Timeregistrering" icon="⏱️" color="#a8d878" onBack={back} user={user} onLogout={logout}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:11, color:"#7a9e6a", textTransform:"uppercase", letterSpacing:1 }}>
              {ia && hw && hw.id !== user.id ? `${hw.name} — utestående` : "Din utestående lønn"}
            </div>
            <div style={{ fontSize:22, fontWeight:"bold", color:(hs?.ua||0) > 0 ? "#a8d878" : "#5a7a4a" }}>{fnok(hs?.ua||0)}</div>
          </div>
          {ia && (
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", paddingBottom:8 }}>
              {workers.map(w => (
                <button key={w.id} onClick={() => setAwid(w.id === awid ? null : w.id)}
                  style={{ display:"flex", alignItems:"center", gap:5, background:awid===w.id?"#1e3a18":"#152012", border:`1px solid ${awid===w.id?w.color:"#2d4a26"}`, borderRadius:20, padding:"3px 10px 3px 5px", cursor:"pointer" }}>
                  <Avatar w={w} size={18}/>
                  <span style={{ fontSize:11, color:awid===w.id?w.color:"#7a9e6a" }}>{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:"flex" }}>
          {[["reg","Registrer"],["ov","Oversikt"],...( ia ? [["admin","Administrer"]] : [])].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background:"none", border:"none", borderBottom:tab===k?"2px solid #a8d878":"2px solid transparent", color:tab===k?"#a8d878":"#5a7a4a", padding:"7px 16px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase" }}>
              {l}
            </button>
          ))}
        </div>
      </Hdr>

      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        {notif && (
          <div style={{ position:"fixed", top:16, right:16, zIndex:100, background:notif.t==="er"?"#3a1a1a":"#1a3a1a", border:`1px solid ${notif.t==="er"?"#7a3a3a":"#4a7a3a"}`, color:notif.t==="er"?"#e8a0a0":"#a8d878", padding:"9px 16px", borderRadius:6, fontSize:13 }}>
            {notif.m}
          </div>
        )}

        {/* ── REGISTRER ── */}
        {tab === "reg" && (
          <div>
            {ia && !awid && (
              <div style={{ background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#7a9e6a" }}>
                ← Velg hvem som jobbet
              </div>
            )}
            <div style={{ ...S.card, border:`1px solid ${pw ? pw.color+"55" : "#2d4a26"}` }}>
              {pw && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Avatar w={pw} size={24}/>
                    <span style={{ fontSize:13, color:pw.color }}>Registrerer for <strong>{pw.name}</strong></span>
                  </div>
                  {pwage && <span style={{ fontSize:11, color:"#5a7a4a", background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:4, padding:"2px 8px" }}>{pwage} kr/t</span>}
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><label style={S.lbl}>Dato</label><input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Kategori</label>
                  <select value={form.cat} onChange={e => setForm(f => ({...f, cat:e.target.value}))} style={S.inp}>
                    {WC.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Starttid</label><input type="time" value={form.st} onChange={e => setForm(f => ({...f, st:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Sluttid</label><input type="time" value={form.et} onChange={e => setForm(f => ({...f, et:e.target.value}))} style={S.inp}/></div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={S.lbl}>Beskrivelse</label>
                <input type="text" value={form.desc} placeholder="F.eks. pløyd østre jorde..." onChange={e => setForm(f => ({...f, desc:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
              </div>
              {pdur > 0 && pwage && <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:10 }}>≈ {fd(pdur)} · {fnok((pdur/60)*pwage)}</div>}
              <button onClick={hadd} disabled={ia && !awid} style={{ ...S.btn, opacity:ia && !awid ? 0.4 : 1 }}>＋ Legg til</button>
            </div>
          </div>
        )}

        {/* ── OVERSIKT ── */}
        {tab === "ov" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {ws.map(w => {
              const we = entries.filter(e => e.worker_id === w.id).sort((a,b) => b.date.localeCompare(a.date));
              const ex = exp === w.id;
              return (
                <div key={w.id} style={{ ...S.card, borderTop:`3px solid ${w.color}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Avatar w={w} size={30}/>
                      <div>
                        <div style={{ fontSize:13, color:"#d4e8b0" }}>{w.name}</div>
                        <div style={{ fontSize:10, color:"#5a7a4a" }}>{gwfd(w, today)} kr/t</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {ia && (
                        <button onClick={() => setEditWorker({...w, wage:String(w.wage), pin:w.pin||""})}
                          style={{ ...S.bsm, padding:"5px 10px", fontSize:11 }}>✏️ Rediger</button>
                      )}
                      {ia && (
                        <button onClick={() => setPot(w.id)} disabled={w.ua <= 0}
                          style={{ background:w.ua>0?"#1a3a5a":"#1a1a1a", border:`1px solid ${w.ua>0?"#3a6a9a":"#2a2a2a"}`, color:w.ua>0?"#80c0f0":"#2a2a2a", padding:"6px 12px", borderRadius:6, cursor:w.ua>0?"pointer":"not-allowed", fontSize:11, textTransform:"uppercase" }}>
                          Utbetal {fnok(w.ua)}
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                    {[{l:"Totalt",v:fd(w.tm)},{l:"Verdi",v:fnok(w.ta)},{l:"Utestående",v:fnok(w.ua),hi:true}].map(c => (
                      <div key={c.l} style={{ background:"#0f1a0d", borderRadius:5, padding:8, textAlign:"center", border:`1px solid ${c.hi?"#2a4a20":"#1a2e16"}` }}>
                        <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>{c.l}</div>
                        <div style={{ fontSize:13, color:c.hi?w.color:"#c8dca8", fontWeight:"bold" }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setExp(ex ? null : w.id)} style={{ ...S.bsm, padding:"2px 10px", marginBottom:ex?8:0 }}>
                    {ex ? "▲ Skjul" : `▼ Logg (${we.length})`}
                  </button>
                  {ex && (
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {we.map(e => (
                        <div key={e.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderLeft:`2px solid ${w.color}`, borderRadius:5, padding:"6px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:11, color:"#5a7a4a" }}>{fmt(e.date)}</span>
                              <span style={S.tag}>{e.category}</span>
                            </div>
                            <div style={{ fontSize:11, color:"#6a8e68" }}>
                              {e.start_time}–{e.end_time}
                              {e.description && <span style={{ color:"#3a5a30", marginLeft:6 }}>· {e.description}</span>}
                            </div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:12, color:"#a8d878", fontWeight:"bold" }}>{fd(e.duration_minutes)}</div>
                              <div style={{ fontSize:9, color:"#3a5a30" }}>{fnok((e.duration_minutes/60)*(e.wage_at_date||gwfd(w,e.date)))}</div>
                            </div>
                            {ia && (
                              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                                <button onClick={() => setEditEntry({...e, wage_at_date:String(e.wage_at_date||gwfd(w,e.date))})}
                                  style={{ ...S.bsm, padding:"2px 6px", fontSize:9 }}>✏️</button>
                                <button onClick={() => { if(window.confirm("Slett denne oppføringen?")) setEntries(p => p.filter(x => x.id !== e.id)); }}
                                  style={{ ...S.bsm, padding:"2px 6px", fontSize:9, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {ia && (
              <div style={{ background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:8, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#7a9e6a", letterSpacing:2, textTransform:"uppercase" }}>Totalt utestående</span>
                <span style={{ fontSize:18, color:"#a8d878", fontWeight:"bold" }}>{fnok(tu)}</span>
              </div>
            )}
          </div>
        )}

        {/* ── ADMINISTRER (kun admin) ── */}
        {tab === "admin" && ia && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>
              Administrer personer
            </div>
            {workers.map(w => (
              <div key={w.id} style={{ ...S.card, borderLeft:`3px solid ${w.color}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar w={w} size={36}/>
                    <div>
                      <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold" }}>{w.name}</div>
                      <div style={{ fontSize:11, color:"#5a7a4a" }}>
                        {w.is_admin ? "Administrator" : "Arbeider"} · {gwfd(w, today)} kr/t · PIN: {w.pin}
                      </div>
                      <div style={{ fontSize:10, color:"#3a5a30" }}>
                        Født: {w.birthdate} · Tariff-lønn: {gwfd(w, today)} kr/t
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditWorker({...w, wage:String(w.wage), pin:w.pin||""})}
                    style={{ ...S.btn, padding:"7px 14px", fontSize:12 }}>✏️ Rediger</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── UTBETAL MODAL ── */}
        {pot && (() => {
          const w = ws.find(x => x.id === pot);
          if (!w) return null;
          return (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
              <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:28, maxWidth:340, textAlign:"center" }}>
                <div style={{ fontSize:26, color:"#a8d878", fontWeight:"bold", marginBottom:4 }}>{fnok(w.ua)}</div>
                <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:6 }}>{w.name}</div>
                <p style={{ fontSize:12, color:"#5a7a4a", marginBottom:20 }}>Marker som utbetalt — nullstiller utestående beløp</p>
                <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                  <button onClick={() => {
                    const tm = entries.filter(e => e.worker_id === w.id).reduce((s,e) => s+e.duration_minutes, 0);
                    setWorkers(p => p.map(x => x.id === w.id ? {...x, paid_minutes:tm} : x));
                    setPot(null);
                    sn(`${w.name} markert som utbetalt`);
                  }} style={S.btn}>Bekreft</button>
                  <button onClick={() => setPot(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── REDIGER TIMEOPPFØRING MODAL ── */}
        {editEntry && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
            <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:380, width:"100%" }}>
              <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold", marginBottom:16 }}>✏️ Rediger timeoppføring</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><label style={S.lbl}>Dato</label><input type="date" value={editEntry.date} onChange={e => setEditEntry(p => ({...p, date:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Kategori</label>
                  <select value={editEntry.category} onChange={e => setEditEntry(p => ({...p, category:e.target.value}))} style={S.inp}>
                    {WC.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={S.lbl}>Starttid</label><input type="time" value={editEntry.start_time} onChange={e => setEditEntry(p => ({...p, start_time:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Sluttid</label><input type="time" value={editEntry.end_time} onChange={e => setEditEntry(p => ({...p, end_time:e.target.value}))} style={S.inp}/></div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Timelønn (kr/t) — overstyr</label>
                  <input type="number" step="0.1" value={editEntry.wage_at_date} onChange={e => setEditEntry(p => ({...p, wage_at_date:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Beskrivelse</label>
                  <input type="text" value={editEntry.description||""} onChange={e => setEditEntry(p => ({...p, description:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={saveEntry} style={S.btn}>Lagre</button>
                <button onClick={() => setEditEntry(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
              </div>
            </div>
          </div>
        )}

        {/* ── REDIGER PERSON MODAL ── */}
        {editWorker && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
            <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:400, width:"100%" }}>
              <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold", marginBottom:16 }}>✏️ Rediger person — {editWorker.name}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Navn</label>
                  <input type="text" value={editWorker.name} onChange={e => setEditWorker(p => ({...p, name:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                </div>
                <div>
                  <label style={S.lbl}>Fødselsdato</label>
                  <input type="date" value={editWorker.birthdate} onChange={e => setEditWorker(p => ({...p, birthdate:e.target.value}))} style={S.inp}/>
                </div>
                <div>
                  <label style={S.lbl}>PIN-kode</label>
                  <input type="text" maxLength={4} value={editWorker.pin} onChange={e => setEditWorker(p => ({...p, pin:e.target.value}))} style={S.inp}/>
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Timelønn (kr/t) — overstyrer tariff</label>
                  <input type="number" step="0.1" value={editWorker.wage} onChange={e => setEditWorker(p => ({...p, wage:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                  <div style={{ fontSize:10, color:"#5a7a4a", marginTop:4 }}>
                    Tariff-beregnet: {gwfd(editWorker, today)} kr/t (basert på fødselsdato)
                  </div>
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Farge</label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:4 }}>
                    {FARGER.map(f => (
                      <button key={f} onClick={() => setEditWorker(p => ({...p, color:f}))}
                        style={{ width:28, height:28, borderRadius:"50%", background:f, border:editWorker.color===f?"3px solid #fff":"2px solid transparent", cursor:"pointer", padding:0 }}/>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn:"span 2" }}>
                  <label style={S.lbl}>Rolle</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {[{v:false,l:"Arbeider"},{v:true,l:"Administrator"}].map(r => (
                      <button key={String(r.v)} onClick={() => setEditWorker(p => ({...p, is_admin:r.v}))}
                        style={{ ...S.bsm, background:editWorker.is_admin===r.v?"#2d5a20":"#1a2e16", borderColor:editWorker.is_admin===r.v?"#4a8a30":"#2d4a26", color:editWorker.is_admin===r.v?"#a8d878":"#5a7a4a", padding:"7px 16px", fontSize:12 }}>
                        {r.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={saveWorker} style={S.btn}>Lagre</button>
                <button onClick={() => setEditWorker(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
