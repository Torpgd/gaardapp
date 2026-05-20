import { useState, useEffect } from "react";
import { Hdr, FileUpload } from "./Shared";
import { S, uid, fmt } from "../lib/utils";
import { BUILDINGS, today } from "../data/constants";

const IKONER_BYGG = ["🏚️","🏠","🏡","🏗️","🏢","🏭","🏬","🌿","🪵","🏛️","⛺","🛖"];
const LT_BYGG = ["Vedlikehold","Reparasjon","Maling","Rørlegger","Elektriker","Inspeksjon","Rengjøring","Oppgradering","Annet"];
const LT_UTE  = ["Vei","Rørgrøft","Kabelgrøft","Drenering","Gjerde","Graving","Inspeksjon","Annet"];

const INIT_LOGS = {
  laan:      [{id:"bl1",date:"2026-03-15",type:"Vedlikehold",description:"Reparert takrenne på sørsiden.",done_by:"Jon",files:[]}],
  garasje:   [{id:"bl2",date:"2025-09-20",type:"Maling",description:"Malt garasjeport.",done_by:"Jon",files:[]}],
  driftsbygg:[],
  bolighus:  [{id:"bl3",date:"2026-01-10",type:"Rørlegger",description:"Skiftet termostat på varmtvannstank.",done_by:"Jon",files:[]}],
  uteareal:  [],
};

// ─── NY / REDIGER BYGNING MODAL ───────────────────────────────────────────────
function BygningModal({ bygning, onSave, onClose }) {
  const isNy = !bygning?.id;
  const [form, setForm] = useState(bygning || {
    id: uid(), name:"", icon:"🏠", desc:""
  });

  function lagre() {
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
      <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:380, width:"100%" }}>
        <div style={{ fontSize:15, color:"#d4e8b0", fontWeight:"bold", marginBottom:16 }}>
          {isNy ? "➕ Ny bygning" : `✏️ Rediger — ${bygning.name}`}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
          <div>
            <label style={S.lbl}>Navn</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))}
              placeholder="F.eks. Kornlager" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={S.lbl}>Beskrivelse</label>
            <input type="text" value={form.desc||""} onChange={e => setForm(p => ({...p, desc:e.target.value}))}
              placeholder="F.eks. Kornlager med tørke" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
          </div>
          <div>
            <label style={S.lbl}>Ikon</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
              {IKONER_BYGG.map(i => (
                <button key={i} onClick={() => setForm(p => ({...p, icon:i}))}
                  style={{ fontSize:22, background:form.icon===i?"#2d5a20":"#0f1a0d", border:`1px solid ${form.icon===i?"#4a8a30":"#2d4a26"}`, borderRadius:6, padding:"4px 8px", cursor:"pointer" }}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forhåndsvisning */}
        <div style={{ background:"#0f1a0d", border:"1px solid #f09878", borderRadius:8, padding:"10px 14px", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26 }}>{form.icon}</span>
          <div>
            <div style={{ fontSize:13, color:"#f09878", fontWeight:"bold" }}>{form.name||"Bygningsnavn"}</div>
            <div style={{ fontSize:11, color:"#5a7a4a" }}>{form.desc||"Beskrivelse"}</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={lagre} style={S.btn}>Lagre</button>
          <button onClick={onClose} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ─── BYGNINGER HOVEDKOMPONENT ─────────────────────────────────────────────────
export default function Bygninger({ user, back, logout, initLogs, onLogsChange }) {
  const [buildings, setBuildings] = useState(BUILDINGS);
  const [sel, setSel]             = useState(null);
  const [logsState, setLogsState] = useState(() => initLogs || INIT_LOGS);
  function setLogs(fn) { setLogsState(p => { const ny=typeof fn==="function"?fn(p):fn; onLogsChange?.(ny); return ny; }); }
  const logs = logsState;
  const [sa, setSa]               = useState(false);
  const [editId, setEditId]       = useState(null);
  const [nl, setNl]               = useState({ date:today, type:"Vedlikehold", description:"", done_by:user.name, files:[] });
  const [bygningModal, setBygningModal] = useState(null); // null | "ny" | bygning-objekt
  const [slettBekreft, setSlettBekreft] = useState(null);

  const ia = user.is_admin;

  function lagreBygning(data) {
    if (buildings.find(b => b.id === data.id)) {
      setBuildings(p => p.map(b => b.id === data.id ? {...b, ...data} : b));
      if (sel?.id === data.id) setSel(prev => ({...prev, ...data}));
    } else {
      setBuildings(p => [...p, data]);
      setLogs(p => ({...p, [data.id]:[]}));
    }
  }

  function slettBygning(id) {
    setBuildings(p => p.filter(b => b.id !== id));
    setLogs(p => { const n = {...p}; delete n[id]; return n; });
    if (sel?.id === id) setSel(null);
    setSlettBekreft(null);
  }

  function save() {
    if (!nl.description.trim()) return;
    if (editId) {
      setLogs(p => ({...p, [sel.id]:p[sel.id].map(l => l.id===editId ? {...l,...nl} : l)}));
      setEditId(null);
    } else {
      setLogs(p => ({...p, [sel.id]:[{id:uid(), building_id:sel.id, ...nl}, ...(p[sel.id]||[])]}));
    }
    setNl(x => ({...x, description:"", files:[]}));
    setSa(false);
  }

  // BYGNINGSDETALJSIDE
  if (sel) {
    const selBygning = buildings.find(b => b.id === sel.id) || sel;
    const bl  = logs[selBygning.id] || [];
    const color = selBygning.id === "uteareal" ? "#78c8a0" : "#f09878";
    const LT  = selBygning.id === "uteareal" ? LT_UTE : LT_BYGG;

    return (
      <div style={S.wrap}>
        {bygningModal && (
          <BygningModal
            bygning={bygningModal === "ny" ? null : bygningModal}
            onSave={lagreBygning}
            onClose={() => setBygningModal(null)}
          />
        )}
        {slettBekreft && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
            <div style={{ background:"#152012", border:"1px solid #7a3a3a", borderRadius:10, padding:28, maxWidth:340, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🗑️</div>
              <div style={{ fontSize:14, color:"#e08080", fontWeight:"bold", marginBottom:8 }}>Slett bygning?</div>
              <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:20 }}>
                {buildings.find(b => b.id===slettBekreft)?.name} — logg slettes også
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                <button onClick={() => slettBygning(slettBekreft)} style={{ ...S.btn, background:"#3a1a1a", borderColor:"#7a3a3a", color:"#e08080" }}>Slett</button>
                <button onClick={() => setSlettBekreft(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
              </div>
            </div>
          </div>
        )}

        <Hdr title={selBygning.name} icon={selBygning.icon} color={color}
          onBack={() => setSel(null)} user={user} onLogout={logout}>
          {ia && (
            <div style={{ display:"flex", gap:6, paddingBottom:8 }}>
              <button onClick={() => setBygningModal(selBygning)}
                style={{ ...S.bsm, fontSize:11, padding:"4px 10px" }}>✏️ Rediger</button>
              <button onClick={() => setSlettBekreft(selBygning.id)}
                style={{ ...S.bsm, fontSize:11, padding:"4px 10px", color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️ Slett</button>
            </div>
          )}
        </Hdr>

        <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
          <div style={{ ...S.card, marginBottom:12 }}>
            <div style={{ fontSize:13, color:"#c8dca8" }}>{selBygning.desc}</div>
            {selBygning.id === "uteareal" && (
              <div style={{ fontSize:11, color:"#5a7a4a", marginTop:8 }}>
                Registrer rørledninger, kabeltraser, dreneringsgrøfter, veier og utvendige installasjoner.
              </div>
            )}
          </div>

          <button onClick={() => { setSa(true); setEditId(null); }}
            style={{ ...S.btn, background:selBygning.id==="uteareal"?"#1a3a2a":"#5a3a1a", borderColor:selBygning.id==="uteareal"?"#2a6a4a":"#8a5a2a", color, marginBottom:12, width:"100%" }}>
            ＋ Ny loggføring
          </button>

          {sa && (
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><label style={S.lbl}>Dato</label><input type="date" value={nl.date} onChange={e => setNl(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Type</label>
                  <select value={nl.type} onChange={e => setNl(p => ({...p,type:e.target.value}))} style={S.inp}>
                    {LT.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Utført av</label><input type="text" value={nl.done_by} onChange={e => setNl(p => ({...p,done_by:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={S.lbl}>Beskrivelse</label>
                <textarea value={nl.description} onChange={e => setNl(p => ({...p,description:e.target.value}))} rows={3}
                  placeholder={selBygning.id==="uteareal" ? "F.eks. Lagt 50m dreneringsrør..." : "Hva ble gjort?"}
                  style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
              </div>
              <div style={{ marginBottom:12 }}><FileUpload files={nl.files} setFiles={f => setNl(p => ({...p,files:typeof f==="function"?f(p.files):f}))}/></div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={{ ...S.btn, background:selBygning.id==="uteareal"?"#1a3a2a":"#5a3a1a", borderColor:selBygning.id==="uteareal"?"#2a6a4a":"#8a5a2a", color }}>Lagre</button>
                <button onClick={() => setSa(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
              </div>
            </div>
          )}

          {bl.length === 0
            ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen loggføringer</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {bl.map(l => (
                  <div key={l.id} style={{ ...S.card, marginBottom:0, borderLeft:`3px solid ${color}` }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(l.date)}</span>
                          <span style={S.tag}>{l.type}</span>
                          <span style={{ fontSize:11, color:"#5a7a4a" }}>{l.done_by}</span>
                        </div>
                        <div style={{ fontSize:13, color:"#c8dca8", lineHeight:1.5 }}>{l.description}</div>
                      </div>
                      {ia && (
                        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                          <button onClick={() => { setNl({...l,files:l.files||[]}); setEditId(l.id); setSa(true); }}
                            style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
                          <button onClick={() => setLogs(p => ({...p,[selBygning.id]:p[selBygning.id].filter(x => x.id!==l.id)}))}
                            style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    );
  }

  // BYGNINGSOVERSIKT
  return (
    <div style={S.wrap}>
      {bygningModal && (
        <BygningModal
          bygning={bygningModal === "ny" ? null : bygningModal}
          onSave={lagreBygning}
          onClose={() => setBygningModal(null)}
        />
      )}
      {slettBekreft && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}>
          <div style={{ background:"#152012", border:"1px solid #7a3a3a", borderRadius:10, padding:28, maxWidth:340, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🗑️</div>
            <div style={{ fontSize:14, color:"#e08080", fontWeight:"bold", marginBottom:8 }}>Slett bygning?</div>
            <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:20 }}>
              {buildings.find(b => b.id===slettBekreft)?.name} — logg slettes også
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => slettBygning(slettBekreft)} style={{ ...S.btn, background:"#3a1a1a", borderColor:"#7a3a3a", color:"#e08080" }}>Slett</button>
              <button onClick={() => setSlettBekreft(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <Hdr title="Bygninger" icon="🏚️" color="#f09878" onBack={back} user={user} onLogout={logout}/>
      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        {ia && (
          <button onClick={() => setBygningModal("ny")} style={{ ...S.btn, marginBottom:14, width:"100%" }}>
            ➕ Legg til ny bygning
          </button>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {buildings.map(b => {
            const c = b.id === "uteareal" ? "#78c8a0" : "#f09878";
            return (
              <div key={b.id} style={{ position:"relative" }}>
                <button onClick={() => setSel(b)}
                  style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:16, cursor:"pointer", textAlign:"left", width:"100%" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.background = "#1a2e16"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2d4a26"; e.currentTarget.style.background = "#152012"; }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{b.icon}</div>
                  <div style={{ fontSize:13, color:c, fontWeight:"bold", marginBottom:3 }}>{b.name}</div>
                  <div style={{ fontSize:11, color:"#5a7a4a" }}>{b.desc}</div>
                </button>
                {ia && (
                  <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:4 }}>
                    <button onClick={e => { e.stopPropagation(); setBygningModal(b); }}
                      style={{ ...S.bsm, padding:"2px 7px", fontSize:10 }}>✏️</button>
                    <button onClick={e => { e.stopPropagation(); setSlettBekreft(b.id); }}
                      style={{ ...S.bsm, padding:"2px 7px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
