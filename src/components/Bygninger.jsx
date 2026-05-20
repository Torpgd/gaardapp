import { useState } from "react";
import { Hdr, FileUpload } from "./Shared";
import { S, uid, fmt } from "../lib/utils";
import { BUILDINGS, today } from "../data/constants";

const INIT_LOGS = {
  laan:      [{id:"bl1",date:"2026-03-15",type:"Vedlikehold",description:"Reparert takrenne på sørsiden.",done_by:"Jon",files:[]}],
  garasje:   [{id:"bl2",date:"2025-09-20",type:"Maling",description:"Malt garasjeport.",done_by:"Jon",files:[]}],
  driftsbygg:[],
  bolighus:  [{id:"bl3",date:"2026-01-10",type:"Rørlegger",description:"Skiftet termostat på varmtvannstank.",done_by:"Jon",files:[]}],
  uteareal:  [],
};

const LT_BYGG = ["Vedlikehold","Reparasjon","Maling","Rørlegger","Elektriker","Inspeksjon","Rengjøring","Oppgradering","Annet"];
const LT_UTE  = ["Vei","Rørgrøft","Kabelgrøft","Drenering","Gjerde","Graving","Inspeksjon","Annet"];

export default function Bygninger({ user, back, logout }) {
  const [sel, setSel]   = useState(null);
  const [logs, setLogs] = useState(INIT_LOGS);
  const [sa, setSa]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [nl, setNl]     = useState({ date:today, type:"Vedlikehold", description:"", done_by:user.name, files:[] });

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
    const bl = logs[sel.id] || [];
    const color = sel.id === "uteareal" ? "#78c8a0" : "#f09878";
    const LT = sel.id === "uteareal" ? LT_UTE : LT_BYGG;

    return (
      <div style={S.wrap}>
        <Hdr title={sel.name} icon={sel.icon} color={color} onBack={() => setSel(null)} user={user} onLogout={logout}/>
        <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
          <div style={{ ...S.card, marginBottom:12 }}>
            <div style={{ fontSize:13, color:"#c8dca8" }}>{sel.desc}</div>
            {sel.id === "uteareal" && (
              <div style={{ fontSize:11, color:"#5a7a4a", marginTop:8 }}>
                Registrer rørledninger, kabeltraser, dreneringsgrøfter, veier og andre utvendige installasjoner. Nyttig historikk ved fremtidig gravearbeid.
              </div>
            )}
          </div>

          <button onClick={() => { setSa(true); setEditId(null); }}
            style={{ ...S.btn, background:sel.id==="uteareal"?"#1a3a2a":"#5a3a1a", borderColor:sel.id==="uteareal"?"#2a6a4a":"#8a5a2a", color, marginBottom:12, width:"100%" }}>
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
                  placeholder={sel.id==="uteareal" ? "F.eks. Lagt 50m dreneringsrør langs nordre kant av låven, 60cm dybde..." : "Hva ble gjort?"}
                  style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
              </div>
              <div style={{ marginBottom:12 }}><FileUpload files={nl.files} setFiles={f => setNl(p => ({...p,files:typeof f==="function"?f(p.files):f}))}/></div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={save} style={{ ...S.btn, background:sel.id==="uteareal"?"#1a3a2a":"#5a3a1a", borderColor:sel.id==="uteareal"?"#2a6a4a":"#8a5a2a", color }}>Lagre</button>
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
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        <button onClick={() => { setNl({...l, files:l.files||[]}); setEditId(l.id); setSa(true); }} style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
                        <button onClick={() => setLogs(p => ({...p,[sel.id]:p[sel.id].filter(x => x.id !== l.id)}))} style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                      </div>
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
      <Hdr title="Bygninger" icon="🏚️" color="#f09878" onBack={back} user={user} onLogout={logout}/>
      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {BUILDINGS.map(b => {
            const c = b.id === "uteareal" ? "#78c8a0" : "#f09878";
            return (
              <button key={b.id} onClick={() => setSel(b)}
                style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:16, cursor:"pointer", textAlign:"left" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c; e.currentTarget.style.background = "#1a2e16"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2d4a26"; e.currentTarget.style.background = "#152012"; }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{b.icon}</div>
                <div style={{ fontSize:13, color:c, fontWeight:"bold", marginBottom:3 }}>{b.name}</div>
                <div style={{ fontSize:11, color:"#5a7a4a" }}>{b.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
