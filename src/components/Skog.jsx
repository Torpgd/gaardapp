import { useState } from "react";
import { Hdr, FileUpload } from "./Shared";
import { S, uid, fmt } from "../lib/utils";
import { today } from "../data/constants";

const INIT_RECS = [
  {id:"fo1",date:"2025-12-10",type:"Hogst",description:"Tynningshogst i nordre del. Fjernet ca 30% av bestandet.",volume_m3:45,area_daa:12,done_by:"Jon",files:[]},
  {id:"fo2",date:"2025-11-20",type:"Vedproduksjon",description:"Produsert ved av hogstavfall. Kappet og kløvd, ca 8 favner.",volume_m3:8,area_daa:null,done_by:"Jon",files:[]},
];

const TYPER = ["Hogst","Planting","Rydding","Vedproduksjon","Skogsvei","Merking","Salg tømmer","Observasjon","Annet"];

export default function Skog({ user, back, logout }) {
  const [recs, setRecs] = useState(INIT_RECS);
  const [tab, setTab]   = useState("alle");
  const [sa, setSa]     = useState(false);
  const [editId, setEditId] = useState(null);
  const [nr, setNr]     = useState({ date:today, type:"Hogst", description:"", volume_m3:"", area_daa:"", done_by:user.name, files:[] });

  function save() {
    if (!nr.description.trim()) return;
    if (editId) {
      setRecs(p => p.map(r => r.id===editId ? {...r,...nr, volume_m3:parseFloat(nr.volume_m3)||null, area_daa:parseFloat(nr.area_daa)||null} : r));
      setEditId(null);
    } else {
      setRecs(p => [{id:uid(), ...nr, volume_m3:parseFloat(nr.volume_m3)||null, area_daa:parseFloat(nr.area_daa)||null}, ...p]);
    }
    setNr(x => ({...x, description:"", volume_m3:"", area_daa:"", files:[]}));
    setSa(false);
  }

  const fr = tab === "alle" ? recs : recs.filter(r => r.type === tab);

  return (
    <div style={S.wrap}>
      <Hdr title="Skog" icon="🌲" color="#a8d878" onBack={back} user={user} onLogout={logout}>
        <div style={{ display:"flex", overflowX:"auto", marginTop:6 }}>
          {[["alle","Alle"],["Hogst","Hogst"],["Planting","Planting"],["Vedproduksjon","Ved"],["Salg tømmer","Salg"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background:"none", border:"none", borderBottom:tab===k?"2px solid #a8d878":"2px solid transparent", color:tab===k?"#a8d878":"#5a7a4a", padding:"7px 12px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>
              {l}
            </button>
          ))}
        </div>
      </Hdr>

      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        <div style={{ ...S.card, marginBottom:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[{l:"Total skog",v:"250 daa"},{l:"Skogøy",v:"70 daa"}].map(x => (
              <div key={x.l} style={{ background:"#0f1a0d", borderRadius:6, padding:10, textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>{x.l}</div>
                <div style={{ fontSize:17, color:"#a8d878", fontWeight:"bold" }}>{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => { setSa(true); setEditId(null); }} style={{ ...S.btn, marginBottom:12, width:"100%" }}>＋ Ny registrering</button>

        {sa && (
          <div style={{ ...S.card, marginBottom:12 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div><label style={S.lbl}>Dato</label><input type="date" value={nr.date} onChange={e => setNr(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
              <div><label style={S.lbl}>Type</label>
                <select value={nr.type} onChange={e => setNr(p => ({...p,type:e.target.value}))} style={S.inp}>
                  {TYPER.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={S.lbl}>Volum (m³)</label><input type="number" value={nr.volume_m3} onChange={e => setNr(p => ({...p,volume_m3:e.target.value}))} placeholder="Valgfritt" style={S.inp}/></div>
              <div><label style={S.lbl}>Areal (daa)</label><input type="number" value={nr.area_daa} onChange={e => setNr(p => ({...p,area_daa:e.target.value}))} placeholder="Valgfritt" style={S.inp}/></div>
              <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Utført av</label><input type="text" value={nr.done_by} onChange={e => setNr(p => ({...p,done_by:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={S.lbl}>Beskrivelse</label>
              <textarea value={nr.description} onChange={e => setNr(p => ({...p,description:e.target.value}))} rows={3} style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
            </div>
            <div style={{ marginBottom:12 }}><FileUpload files={nr.files} setFiles={f => setNr(p => ({...p,files:typeof f==="function"?f(p.files):f}))}/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={save} style={S.btn}>Lagre</button>
              <button onClick={() => setSa(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
            </div>
          </div>
        )}

        {fr.length === 0
          ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen registreringer</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {fr.map(r => (
                <div key={r.id} style={{ ...S.card, marginBottom:0, borderLeft:"3px solid #a8d878" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                        <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(r.date)}</span>
                        <span style={S.tag}>{r.type}</span>
                        <span style={{ fontSize:11, color:"#5a7a4a" }}>{r.done_by}</span>
                      </div>
                      <div style={{ fontSize:13, color:"#c8dca8", lineHeight:1.5, marginBottom:4 }}>{r.description}</div>
                      <div style={{ display:"flex", gap:10 }}>
                        {r.volume_m3 && <span style={{ fontSize:11, color:"#7a9e6a" }}>📦 {r.volume_m3} m³</span>}
                        {r.area_daa  && <span style={{ fontSize:11, color:"#7a9e6a" }}>📐 {r.area_daa} daa</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => { setNr({...r, volume_m3:r.volume_m3||"", area_daa:r.area_daa||"", files:r.files||[]}); setEditId(r.id); setSa(true); }} style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
                      <button onClick={() => setRecs(p => p.filter(x => x.id !== r.id))} style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
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
