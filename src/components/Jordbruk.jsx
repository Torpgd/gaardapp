import { useState, useEffect } from "react";
import { Hdr, FieldRangeSelector, FileUpload, FThumb } from "./Shared";
import { GjødselplanEditor, SprøyteplanEditor, PesticideInfoPanel } from "./SproyteModul";
import TiltakBanner from "./TiltakBanner";
import { useTiltak } from "../lib/useSisteTiltak";
import { UgrasTab, SoppTab } from "./PlantevernTab";
import KalkulatorTab from "./KalkulatorTab";
import { S, uid, fmt, fieldName, getFieldsInRange, getEffectiveDaa } from "../lib/utils";
import { FIELDS, SOIL, PESTICIDES_DB, today } from "../data/constants";

const INIT_CROP_RECS = [
  {id:"fr1",date:"2026-05-02",from_skifte:"skifte16",to_skifte:"skifte18",type:"Såing",crop:"Betong vårhvete",amount_per_daa:"23 kg",notes:"350 frø/m², 3-4 cm dybde. Yara 22-3-10 52 kg/daa",done_by:"Jon",files:[]},
  {id:"fr2",date:"2026-04-28",from_skifte:"skifte1",to_skifte:"skifte14",type:"Såing",crop:"Stella åkerbønner",amount_per_daa:"90 frø/m²",notes:"10 cm radavstand, 5-6 cm dybde. Ingen gjødsel.",done_by:"Jon",files:[]},
  {id:"fr3",date:"2026-05-02",from_skifte:"skifte16",to_skifte:"skifte18",type:"Gjødsling",crop:"Yara Fullgjødsel 22-3-10",amount_per_daa:"52 kg",notes:"Grunngjødsel i Rapid ved såing",done_by:"Jon",files:[]},
];

const RT = ["Såing","Gjødsling","Sprøyting","Høsting","Jordarbeiding","Observasjon","Annet"];

function RecCard({ r, onEdit, onDelete }) {
  const fromIdx = FIELDS.findIndex(f => f.id === r.from_skifte);
  const toIdx   = FIELDS.findIndex(f => f.id === r.to_skifte);
  const range   = fromIdx === toIdx ? fieldName(r.from_skifte) : `${fieldName(r.from_skifte)} → ${fieldName(r.to_skifte)}`;
  const color   = r.type==="Gjødsling"?"#f0c878":r.type==="Sprøyting"?"#c878f0":r.type==="Såing"?"#a8d878":"#78c8f0";
  return (
    <div style={{ ...S.card, marginBottom:0, borderLeft:`3px solid ${color}` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(r.date)}</span>
            <span style={S.tag}>{r.type}</span>
            <span style={{ fontSize:11, color }}>{range}</span>
            <span style={{ fontSize:11, color:"#5a7a4a" }}>{r.done_by}</span>
          </div>
          {r.crop && <div style={{ fontSize:13, color:"#c8dca8", marginBottom:2 }}>🌱 {r.crop}{r.amount_per_daa ? ` · ${r.amount_per_daa}` : ""}</div>}
          {r.sprøytemiddel && <div style={{ fontSize:12, color:"#c878f0", marginBottom:2 }}>💧 {r.sprøytemiddel}{r.sprøytemengde ? ` · ${r.sprøytemengde}/daa` : ""}</div>}
          {r.notes && <div style={{ fontSize:11, color:"#7a9e6a", marginTop:2 }}>{r.notes}</div>}
          {r.files?.length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
              {r.files.map(f => <FThumb key={f.id} file={f} onRemove={() => {}}/>)}
            </div>
          )}
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button onClick={() => onEdit(r)} style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
          <button onClick={() => onDelete(r.id)} style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
        </div>
      </div>
    </div>
  );
}

function RecForm({ nr, setNr, onSave, onCancel, editRec, user }) {
  const isSprøyting = nr.type === "Sprøyting";
  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ fontSize:12, color:"#d4e8b0", marginBottom:12 }}>{editRec ? "Rediger registrering" : "Ny registrering"}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div><label style={S.lbl}>Dato</label><input type="date" value={nr.date} onChange={e => setNr(p => ({...p, date:e.target.value}))} style={S.inp}/></div>
        <div><label style={S.lbl}>Type</label>
          <select value={nr.type} onChange={e => setNr(p => ({...p, type:e.target.value}))} style={S.inp}>
            {RT.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <FieldRangeSelector fromId={nr.from_skifte} toId={nr.to_skifte} onFromChange={v => setNr(p => ({...p,from_skifte:v}))} onToChange={v => setNr(p => ({...p,to_skifte:v}))} customDaa={nr.customDaa} onDaaChange={v => setNr(p => ({...p,customDaa:v}))}/>
      </div>
      {nr.from_skifte !== nr.to_skifte && (
        <div style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:5, padding:"6px 10px", marginBottom:10, fontSize:11, color:"#7a9e6a" }}>
          Gjelder: {getFieldsInRange(nr.from_skifte, nr.to_skifte).map(f => f.name).join(", ")} · {nr.customDaa && parseFloat(nr.customDaa) > 0 ? parseFloat(nr.customDaa).toFixed(1) : getFieldsInRange(nr.from_skifte, nr.to_skifte).reduce((s,f) => s+f.area, 0).toFixed(1)} daa totalt
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <div>
          <label style={S.lbl}>{isSprøyting ? "Middel" : "Vekst/produkt"}</label>
          {isSprøyting
            ? <select value={nr.sprøytemiddel||""} onChange={e => setNr(p => ({...p, sprøytemiddel:e.target.value}))} style={S.inp}>
                <option value="">Velg sprøytemiddel...</option>
                {["Ugras","Sopp","Vekstregulering","Insekt"].map(type => [
                  <option key={type} disabled style={{ color:"#5a7a4a", fontWeight:"bold" }}>── {type} ──</option>,
                  ...PESTICIDES_DB.filter(p => p.type===type).map(p => <option key={p.name} value={p.name}>{p.name} ({p.dose})</option>)
                ])}
              </select>
            : <input type="text" value={nr.crop} onChange={e => setNr(p => ({...p, crop:e.target.value}))} placeholder="F.eks. Betong hvete" style={S.inp}/>
          }
        </div>
        <div>
          <label style={S.lbl}>{isSprøyting ? "Mengde (ml/daa)" : "Mengde/daa"}</label>
          <input type="text" value={isSprøyting ? (nr.sprøytemengde||"") : nr.amount_per_daa} onChange={e => setNr(p => isSprøyting ? ({...p, sprøytemengde:e.target.value}) : ({...p, amount_per_daa:e.target.value}))} placeholder={isSprøyting ? "F.eks. 50" : "F.eks. 23 kg"} style={S.inp}/>
        </div>
        <div><label style={S.lbl}>Utført av</label><input type="text" value={nr.done_by} onChange={e => setNr(p => ({...p,done_by:e.target.value}))} style={S.inp}/></div>
        <div><label style={S.lbl}>Notater</label><input type="text" value={nr.notes} onChange={e => setNr(p => ({...p,notes:e.target.value}))} style={S.inp}/></div>
      </div>
      <div style={{ marginBottom:12 }}>
        <FileUpload files={nr.files||[]} setFiles={f => setNr(p => ({...p, files:typeof f==="function"?f(p.files||[]):f}))}/>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onSave} style={{ ...S.btn, background:"#5a4a1a", borderColor:"#8a7a2a", color:"#f0c878" }}>Lagre</button>
        <button onClick={onCancel} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
      </div>
    </div>
  );
}

export default function Jordbruk({ user, back, logout, onRecsChange }) {
  const [tab, setTab] = useState("alle");
  const [recs, setRecs] = useState(INIT_CROP_RECS);
  const { tiltak, laster:tiltakLaster, feil:tiltakFeil, markerUtfort, markerIkkeAktuelt } = useTiltak();

  // Varsle App.jsx når recs endres så VærSesong kan synkronisere
  useEffect(() => {
    onRecsChange?.(recs);
  }, [recs]);
  const [sa, setSa] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [nr, setNr] = useState({ date:today, from_skifte:"skifte1", to_skifte:"skifte1", customDaa:"", type:"Såing", crop:"", amount_per_daa:"", notes:"", done_by:user.name, files:[] });

  function addRec() {
    if (!nr.crop.trim() && !nr.notes.trim()) return;
    if (editRec) {
      setRecs(p => p.map(r => r.id===editRec ? {...r,...nr} : r));
      setEditRec(null);
    } else {
      setRecs(p => [{id:uid(), ...nr}, ...p]);
    }
    setNr(x => ({...x, crop:"", amount_per_daa:"", notes:"", files:[]}));
    setSa(false);
  }

  function startEdit(r) { setNr({...r}); setEditRec(r.id); setSa(true); }
  function deleteRec(id) { setRecs(p => p.filter(r => r.id !== id)); }

  function cancelForm() {
    setSa(false); setEditRec(null);
    setNr(x => ({...x, crop:"", amount_per_daa:"", notes:"", files:[]}));
  }

  // Utled hva som er sådd per skifte fra Såing-registreringer
  const fieldCrops = {};
  recs.filter(r => r.type === "Såing").forEach(r => {
    getFieldsInRange(r.from_skifte, r.to_skifte).forEach(f => { fieldCrops[f.id] = r.crop; });
  });

  const TABS = [
    ["alle","Oversikt"],["skifter","Skifter"],["Såing","Såing"],
    ["Gjødsling","Gjødsling"],["Sprøyting","Sprøyting"],
    ["ugras","Ugras"],["sopp","Sopp/Sjukdom"],
    ["Høsting","Høsting"],["kalkulator","Kalkulator"],
  ];

  return (
    <div style={S.wrap}>
      <Hdr title="Jordbruk" icon="🌱" color="#f0c878" onBack={back} user={user} onLogout={logout}>
        <div style={{ display:"flex", overflowX:"auto", marginTop:6 }}>
          {TABS.map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background:"none", border:"none", borderBottom:tab===k?"2px solid #f0c878":"2px solid transparent", color:tab===k?"#f0c878":"#5a7a4a", padding:"7px 12px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>
              {l}
            </button>
          ))}
        </div>
      </Hdr>

      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>

        {/* OVERSIKT */}
        {tab === "alle" && (
          <div>
            <div style={{ ...S.card, marginBottom:12, padding:0, overflow:"hidden" }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", padding:"10px 14px 8px" }}>Kart — Brødenveien 181, Halden</div>
              <iframe src="https://maps.google.com/maps?q=Br%C3%B8denveien+181,+Halden,+Norway&t=k&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="200" style={{ border:0, display:"block" }} allowFullScreen loading="lazy" title="Gårdskart"/>
              <div style={{ fontSize:10, color:"#3a5a30", padding:"5px 14px 8px" }}>Satelittvisning · Klikk for å åpne i Google Maps</div>
            </div>
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Sesong 2026</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                {[{l:"Åkerbønner",v:"92 daa",s:"Stella · Skifte 1–14",c:"#a8d878"},{l:"Hvete",v:"46 daa",s:"Betong · Skifte 16–20",c:"#f0c878"}].map(x => (
                  <div key={x.l} style={{ background:"#0f1a0d", borderRadius:6, padding:10, textAlign:"center" }}>
                    <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>{x.l}</div>
                    <div style={{ fontSize:18, color:x.c, fontWeight:"bold" }}>{x.v}</div>
                    <div style={{ fontSize:10, color:"#3a5a30", marginTop:2 }}>{x.s}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Siste registreringer</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {recs.slice(0,5).map(r => {
                  const fromIdx = FIELDS.findIndex(f => f.id===r.from_skifte);
                  const toIdx   = FIELDS.findIndex(f => f.id===r.to_skifte);
                  const range   = fromIdx===toIdx ? fieldName(r.from_skifte) : `${fieldName(r.from_skifte)} → ${fieldName(r.to_skifte)}`;
                  const color   = r.type==="Gjødsling"?"#f0c878":r.type==="Sprøyting"?"#c878f0":r.type==="Såing"?"#a8d878":r.type==="Høsting"?"#c8e878":"#78c8f0";
                  return (
                    <div key={r.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderLeft:`3px solid ${color}`, borderRadius:5, padding:"7px 10px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:"#5a7a4a" }}>{fmt(r.date)}</span>
                      <span style={S.tag}>{r.type}</span>
                      <span style={{ fontSize:11, color }}>{range}</span>
                      {r.crop && <span style={{ fontSize:11, color:"#c8dca8" }}>· {r.crop}</span>}
                      {r.total_kg && <span style={{ fontSize:11, color:"#c8e878" }}>· {parseFloat(r.total_kg).toLocaleString("nb-NO")} kg</span>}
                    </div>
                  );
                })}
                {recs.length===0 && <div style={{ fontSize:12, color:"#3a5a30", textAlign:"center", padding:12 }}>Ingen registreringer ennå</div>}
              </div>
            </div>
          </div>
        )}

        {/* SKIFTER */}
        {tab === "skifter" && (
          <div>
            <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Alle skifter · Jordprøver 2024</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {FIELDS.map(f => {
                const soil = SOIL[f.id];
                const crop = fieldCrops[f.id];
                const isBonner = crop?.includes("bønner");
                const hRec = recs.find(r => r.type==="Høsting" && getFieldsInRange(r.from_skifte, r.to_skifte).some(x => x.id===f.id));
                return (
                  <div key={f.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:13, color:"#d4e8b0", fontWeight:"bold" }}>{f.name}</span>
                      <span style={{ fontSize:12, color:"#a8d878" }}>{f.area} daa</span>
                    </div>
                    <div style={{ fontSize:10, color:"#5a7a4a", marginBottom:5 }}>{f.soil}</div>
                    {crop ? <div style={{ fontSize:11, color:isBonner?"#a8d878":"#f0c878", marginBottom:4 }}>🌱 {crop}</div> : <div style={{ fontSize:10, color:"#2d4a26", marginBottom:4 }}>Ikke sådd</div>}
                    {hRec && <div style={{ fontSize:10, color:"#c8e878", marginBottom:4 }}>🌾 Høstet</div>}
                    {soil && (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {[{k:"pH",v:soil.ph},{k:"P-AL",v:soil.pal},{k:"K-AL",v:soil.kal},{k:"Mg",v:soil.mg}].map(x => (
                          <span key={x.k} style={{ fontSize:9, background:"#152012", border:"1px solid #2d4a26", borderRadius:3, padding:"1px 5px", color:"#5a7a4a" }}>{x.k} {x.v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={S.card}><div style={{ fontSize:10, color:"#5a7a4a" }}>ℹ️ Vekst hentes automatisk fra Såing-fanen. Jordprøver 2024.</div></div>
          </div>
        )}

        {/* GJØDSLING */}
        {tab === "Gjødsling" && (
          <div>
            <GjødselplanEditor/>
            <button onClick={() => setSa(true)} style={{ ...S.btn, background:"#5a4a1a", borderColor:"#8a7a2a", color:"#f0c878", marginBottom:12, width:"100%" }}>＋ Ny gjødslingsregistrering</button>
            {sa && <RecForm nr={nr} setNr={setNr} onSave={addRec} onCancel={cancelForm} editRec={editRec} user={user}/>}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {recs.filter(r => r.type==="Gjødsling").map(r => <RecCard key={r.id} r={r} onEdit={startEdit} onDelete={deleteRec}/>)}
            </div>
          </div>
        )}

        {/* SÅING */}
        {tab === "Såing" && (
          <div>
            <button onClick={() => setSa(true)} style={{ ...S.btn, background:"#5a4a1a", borderColor:"#8a7a2a", color:"#f0c878", marginBottom:12, width:"100%" }}>＋ Ny registrering</button>
            {sa && <RecForm nr={nr} setNr={setNr} onSave={addRec} onCancel={cancelForm} editRec={editRec} user={user}/>}
            {recs.filter(r => r.type==="Såing").length === 0
              ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen registreringer</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{recs.filter(r => r.type==="Såing").map(r => <RecCard key={r.id} r={r} onEdit={startEdit} onDelete={deleteRec}/>)}</div>
            }
          </div>
        )}

        {/* HØSTING */}
        {tab === "Høsting" && (
          <HighstingTab recs={recs} setRecs={setRecs} user={user} sa={sa} setSa={setSa} editRec={editRec} setEditRec={setEditRec} nr={nr} setNr={setNr}/>
        )}

        {/* SPRØYTING */}
        {tab === "Sprøyting" && (
          <div>
            <TiltakBanner tiltak={tiltak} laster={tiltakLaster} feil={tiltakFeil} markerUtfort={markerUtfort} markerIkkeAktuelt={markerIkkeAktuelt} filter="sprøyting" user={user}/>
            <SprøyteplanEditor/>
            <PesticideInfoPanel/>
            <button onClick={() => { setNr(p => ({...p, type:"Sprøyting"})); setSa(true); }} style={{ ...S.btn, background:"#3a1a5a", borderColor:"#6a3a9a", color:"#c878f0", marginBottom:12, width:"100%" }}>＋ Ny sprøytingsregistrering</button>
            {sa && <RecForm nr={nr} setNr={setNr} onSave={addRec} onCancel={cancelForm} editRec={editRec} user={user}/>}
            {recs.filter(r => r.type==="Sprøyting").length === 0
              ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen registreringer</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{recs.filter(r => r.type==="Sprøyting").map(r => <RecCard key={r.id} r={r} onEdit={startEdit} onDelete={deleteRec}/>)}</div>
            }
          </div>
        )}

        {tab === "ugras" && <UgrasTab user={user}/>}
        {tab === "sopp" && <SoppTab user={user}/>}
        {tab === "kalkulator" && <KalkulatorTab/>}
      </div>
    </div>
  );
}

// ─── HØSTING TAB (separat for å holde Jordbruk lesbar) ────────────────────────
function HighstingTab({ recs, setRecs, user, sa, setSa, editRec, setEditRec, nr, setNr }) {
  const høstRecs = recs.filter(r => r.type === "Høsting");

  function addRec() {
    if (!nr.crop) return;
    if (editRec) {
      setRecs(p => p.map(r => r.id===editRec ? {...r,...nr} : r));
      setEditRec(null);
    } else {
      setRecs(p => [{id:uid(), ...nr}, ...p]);
    }
    setNr(x => ({...x, crop:"", total_kg:"", moisture:"", notes:"", files:[]}));
    setSa(false);
  }

  function startEdit(r) { setNr({...r}); setEditRec(r.id); setSa(true); }
  function deleteRec(id) { setRecs(p => p.filter(r => r.id !== id)); }

  return (
    <div>
      <div style={{ ...S.card, marginBottom:12 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Avlingsresultater 2026</div>
        {høstRecs.length === 0
          ? <div style={{ fontSize:12, color:"#3a5a30" }}>Ingen høsting registrert ennå</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {["Betong vårhvete","Stella åkerbønner"].map(sort => {
                const hRecs = høstRecs.filter(r => r.crop === sort);
                if (!hRecs.length) return null;
                const totKg = hRecs.reduce((s,r) => s+(parseFloat(r.total_kg)||0), 0);
                const totDaa = hRecs.reduce((s,r) => s+getEffectiveDaa(r), 0);
                const avgYield = totDaa > 0 ? (totKg/totDaa).toFixed(1) : "-";
                return (
                  <div key={sort} style={{ background:"#0f1a0d", borderRadius:6, padding:"10px 14px" }}>
                    <div style={{ fontSize:13, color:"#c8e878", fontWeight:"bold", marginBottom:6 }}>🌾 {sort}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      {[{l:"Total",v:`${parseFloat(totKg).toLocaleString("nb-NO")} kg`},{l:"Avling/daa",v:`${avgYield} kg`},{l:"Reg.",v:hRecs.length}].map(x => (
                        <div key={x.l} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>{x.l}</div>
                          <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold" }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>

      <button onClick={() => { setNr(p => ({...p, type:"Høsting", crop:"", total_kg:"", moisture:""})); setSa(true); }} style={{ ...S.btn, background:"#3a4a1a", borderColor:"#6a8a2a", color:"#c8e878", marginBottom:12, width:"100%" }}>
        ＋ Registrer høsting
      </button>

      {sa && (
        <div style={{ ...S.card, marginBottom:12 }}>
          <div style={{ fontSize:12, color:"#d4e8b0", marginBottom:12 }}>{editRec ? "Rediger høsting" : "Ny høstingsregistrering"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={S.lbl}>Innhøstingsdato</label><input type="date" value={nr.date} onChange={e => setNr(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
            <div><label style={S.lbl}>Sort</label>
              <select value={nr.crop||""} onChange={e => setNr(p => ({...p,crop:e.target.value}))} style={S.inp}>
                <option value="">Velg sort...</option>
                <option>Betong vårhvete</option>
                <option>Stella åkerbønner</option>
                <option>Annet</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <FieldRangeSelector fromId={nr.from_skifte} toId={nr.to_skifte} onFromChange={v => setNr(p => ({...p,from_skifte:v}))} onToChange={v => setNr(p => ({...p,to_skifte:v}))} customDaa={nr.customDaa} onDaaChange={v => setNr(p => ({...p,customDaa:v}))}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={S.lbl}>Total mengde (kg)</label><input type="number" value={nr.total_kg||""} onChange={e => setNr(p => ({...p,total_kg:e.target.value}))} placeholder="F.eks. 15000" style={S.inp}/></div>
            <div><label style={S.lbl}>Fuktprosent (%)</label><input type="number" step="0.1" value={nr.moisture||""} onChange={e => setNr(p => ({...p,moisture:e.target.value}))} placeholder="F.eks. 14.5" style={S.inp}/></div>
            <div><label style={S.lbl}>Utført av</label><input type="text" value={nr.done_by} onChange={e => setNr(p => ({...p,done_by:e.target.value}))} style={S.inp}/></div>
          </div>
          <div style={{ marginBottom:10 }}><label style={S.lbl}>Notater</label><input type="text" value={nr.notes||""} onChange={e => setNr(p => ({...p,notes:e.target.value}))} placeholder="F.eks. god kvalitet, lite ugras..." style={S.inp}/></div>
          <div style={{ marginBottom:12 }}><FileUpload files={nr.files||[]} setFiles={f => setNr(p => ({...p,files:typeof f==="function"?f(p.files||[]):f}))}/></div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addRec} style={{ ...S.btn, background:"#3a4a1a", borderColor:"#6a8a2a", color:"#c8e878" }}>Lagre</button>
            <button onClick={() => { setSa(false); setEditRec(null); }} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
          </div>
        </div>
      )}

      {høstRecs.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {høstRecs.map(r => {
            const fields  = getFieldsInRange(r.from_skifte, r.to_skifte);
            const totDaa  = getEffectiveDaa(r);
            const fromIdx = FIELDS.findIndex(f => f.id===r.from_skifte);
            const toIdx   = FIELDS.findIndex(f => f.id===r.to_skifte);
            const range   = fromIdx===toIdx ? fieldName(r.from_skifte) : `${fieldName(r.from_skifte)} → ${fieldName(r.to_skifte)}`;
            const yieldPerDaa = totDaa > 0 && r.total_kg ? (parseFloat(r.total_kg)/totDaa).toFixed(1) : null;
            return (
              <div key={r.id} style={{ ...S.card, marginBottom:0, borderLeft:"3px solid #c8e878" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(r.date)}</span>
                      <span style={S.tag}>Høsting</span>
                      <span style={{ fontSize:11, color:"#c8e878" }}>{range}</span>
                      <span style={{ fontSize:11, color:"#5a7a4a" }}>{r.done_by}</span>
                    </div>
                    {r.crop && <div style={{ fontSize:13, color:"#c8dca8", marginBottom:8 }}>🌾 {r.crop}</div>}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:r.notes?6:0 }}>
                      {r.total_kg && <div style={{ background:"#0f1a0d", borderRadius:5, padding:"5px 10px", textAlign:"center" }}><div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Total</div><div style={{ fontSize:14, color:"#c8e878", fontWeight:"bold" }}>{parseFloat(r.total_kg).toLocaleString("nb-NO")} kg</div></div>}
                      {yieldPerDaa && <div style={{ background:"#0f1a0d", borderRadius:5, padding:"5px 10px", textAlign:"center" }}><div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Avling/daa</div><div style={{ fontSize:14, color:"#a8d878", fontWeight:"bold" }}>{yieldPerDaa} kg</div></div>}
                      {r.moisture && <div style={{ background:"#0f1a0d", borderRadius:5, padding:"5px 10px", textAlign:"center" }}><div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Fukt</div><div style={{ fontSize:14, color:"#78c8f0", fontWeight:"bold" }}>{r.moisture}%</div></div>}
                    </div>
                    {r.notes && <div style={{ fontSize:11, color:"#7a9e6a" }}>{r.notes}</div>}
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => startEdit(r)} style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
                    <button onClick={() => deleteRec(r.id)} style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
