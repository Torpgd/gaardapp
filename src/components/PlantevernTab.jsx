import { useState } from "react";
import { S, uid, fmt, fieldName, getEffectiveDaa } from "../lib/utils";
import { WEEDS_DB, DISEASES_DB, PESTICIDES_DB, WEED_NIBIO, DISEASE_NIBIO, today } from "../data/constants";
import { FieldRangeSelector } from "./Shared";
import TiltakBanner from "./TiltakBanner";
import { useTiltak } from "../lib/useSisteTiltak";

const RISK_COLOR = { Lav:"#f0c878", Middels:"#f09878", Høy:"#e06060", "Høy (etter langvarig korn)":"#e06060", "Høy (fuktig)":"#e06060", "Middels (tett bestand)":"#f09878", "Lav (sjelden i Norge)":"#f0c878", "Middels (ensidig dyrking)":"#f09878" };

// ─── UGRAS TAB ────────────────────────────────────────────────────────────────
export function UgrasTab({ user }) {
  const [obs, setObs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date:today, from_skifte:"skifte1", to_skifte:"skifte1", customDaa:"", weed:"", severity:"Lav", notes:"", done_by:user.name });
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [quickReg, setQuickReg] = useState(null);
  const { tiltak, laster:tiltakLaster, feil:tiltakFeil, markerUtfort, markerIkkeAktuelt } = useTiltak();

  function addObs() {
    if (!form.weed) return;
    setObs(p => [{id:uid(), ...form}, ...p]);
    const wd = WEEDS_DB.find(w => w.name === form.weed);
    setSuggestions(wd ? wd.remedy : []);
    setForm(f => ({...f, weed:"", notes:""}));
    setShowForm(false);
    setQuickReg(null);
  }

  function quickRegister(w) {
    setQuickReg(w);
    setForm(f => ({...f, weed:w.name, notes:"", severity:"Lav"}));
  }

  return (
    <div>
      <TiltakBanner tiltak={tiltak} laster={tiltakLaster} feil={tiltakFeil} markerUtfort={markerUtfort} markerIkkeAktuelt={markerIkkeAktuelt} filter="sprøyting" user={user}/>
      <div style={{ ...S.card, marginBottom:12 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
          Ugrasregister — klikk for info og NIBIO-bilde
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {WEEDS_DB.map(w => {
            const ex = expanded === w.id;
            const nibio = WEED_NIBIO[w.id];
            return (
              <div key={w.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:6, overflow:"hidden" }}>
                <button onClick={() => setExpanded(ex ? null : w.id)}
                  style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"8px 12px", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, flexWrap:"wrap" }}>
                    {w.img && !ex && (
                      <img src={w.img} alt={w.name}
                        style={{ width:44, height:44, objectFit:"cover", borderRadius:5, border:"1px solid #2d4a26", flexShrink:0 }}
                        onError={e => e.target.style.display="none"}/>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flex:1 }}>
                      <span style={{ fontSize:13, color:"#d4e8b0", fontWeight:"bold" }}>{w.name}</span>
                      <span style={{ fontSize:10, color:"#5a7a4a", fontStyle:"italic" }}>{w.latin}</span>
                      <span style={{ ...S.tag, color:RISK_COLOR[w.risk]||"#7a9e6a", borderColor:RISK_COLOR[w.risk]||"#2d4a26" }}>{w.risk}</span>
                      <span style={S.tag}>{w.type}</span>
                    </div>
                  </div>
                  <span style={{ color:"#3a5a30", fontSize:11, flexShrink:0 }}>{ex ? "▲" : "▼"}</span>
                </button>
                {ex && (
                  <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #1a2e16" }}>
                    {w.img && <img src={w.img} alt={w.name} style={{ width:"100%", maxHeight:200, objectFit:"cover", borderRadius:6, marginBottom:10, border:"1px solid #2d4a26", display:"block" }} onError={e => e.target.style.display="none"}/>}
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                      {w.remedy.map(r => <span key={r} style={{ fontSize:9, background:"#1a2e3a", border:"1px solid #2a4a5a", borderRadius:3, padding:"2px 7px", color:"#78c8f0" }}>{r}</span>)}
                    </div>
                    {nibio?.url && (
                      <a href={nibio.url} target="_blank" rel="noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"#a8d878", background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:5, padding:"5px 12px", textDecoration:"none" }}>
                        🔗 Mer info og bilder → Plantevernleksikonet (NIBIO)
                      </a>
                    )}
                    <button onClick={() => quickRegister(w)} style={{ ...S.btn, background:"#1a3a2a", borderColor:"#2a7a4a", color:"#78f0a8", padding:"6px 14px", fontSize:11, marginTop:8, display:"block" }}>
                      📍 Registrer funn nå
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {quickReg && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
          <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:380, width:"100%" }}>
            <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold", marginBottom:4 }}>📍 Registrer funn</div>
            <div style={{ fontSize:12, color:"#c8e878", marginBottom:16 }}>{quickReg.name}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div><label style={S.lbl}>Dato</label><input type="date" value={form.date} onChange={e => setForm(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
              <div><label style={S.lbl}>Omfang</label>
                <select value={form.severity} onChange={e => setForm(p => ({...p,severity:e.target.value}))} style={S.inp}>
                  {["Lav","Middels","Høy","Svært høy"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:10 }}><FieldRangeSelector fromId={form.from_skifte} toId={form.to_skifte} onFromChange={v => setForm(p => ({...p,from_skifte:v}))} onToChange={v => setForm(p => ({...p,to_skifte:v}))} customDaa={form.customDaa} onDaaChange={v => setForm(p => ({...p,customDaa:v}))}/></div>
            <div style={{ marginBottom:14 }}><label style={S.lbl}>Notater (valgfritt)</label><input type="text" value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="F.eks. omfang, sted i åkeren..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={addObs} style={{ ...S.btn, background:"#1a3a2a", borderColor:"#2a7a4a", color:"#78f0a8", flex:1 }}>✓ Lagre registrering</button>
              <button onClick={() => { setQuickReg(null); setForm(f => ({...f,weed:"",notes:""})); }} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(true)} style={{ ...S.btn, background:"#3a4a1a", borderColor:"#6a8a2a", color:"#c8e878", marginBottom:12, width:"100%" }}>
        ＋ Registrer ugrasobs.
      </button>

      {showForm && (
        <div style={{ ...S.card, marginBottom:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={S.lbl}>Dato</label><input type="date" value={form.date} onChange={e => setForm(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
            <div><label style={S.lbl}>Ugrasart</label>
              <select value={form.weed} onChange={e => setForm(p => ({...p,weed:e.target.value}))} style={S.inp}>
                <option value="">Velg ugras...</option>
                {WEEDS_DB.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                <option value="Annet">Annet</option>
              </select>
            </div>
            <div><label style={S.lbl}>Omfang</label>
              <select value={form.severity} onChange={e => setForm(p => ({...p,severity:e.target.value}))} style={S.inp}>
                {["Lav","Middels","Høy","Svært høy"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={S.lbl}>Utført av</label><input type="text" value={form.done_by} onChange={e => setForm(p => ({...p,done_by:e.target.value}))} style={S.inp}/></div>
          </div>
          <div style={{ marginBottom:10 }}><FieldRangeSelector fromId={form.from_skifte} toId={form.to_skifte} onFromChange={v => setForm(p => ({...p,from_skifte:v}))} onToChange={v => setForm(p => ({...p,to_skifte:v}))} customDaa={form.customDaa} onDaaChange={v => setForm(p => ({...p,customDaa:v}))}/></div>
          <div style={{ marginBottom:12 }}><label style={S.lbl}>Notater</label><input type="text" value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="Beskrivelse, omfang..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
          <div style={{ display:"flex", gap:8 }}><button onClick={addObs} style={S.btn}>Lagre</button><button onClick={() => setShowForm(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ ...S.card, marginBottom:12, border:"1px solid #2a4a5a" }}>
          <div style={{ fontSize:11, color:"#78c8f0", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>💡 Anbefalte sprøytemidler</div>
          {suggestions.map(s => {
            const p = PESTICIDES_DB.find(x => x.name === s);
            return p ? (
              <div key={s} style={{ background:"#0f1a0d", borderRadius:5, padding:"8px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <span style={{ fontSize:13, color:"#78c8f0", fontWeight:"bold" }}>{p.name}</span>
                  <span style={{ fontSize:11, color:"#f0c878" }}>{p.dose}</span>
                </div>
                <div style={{ fontSize:11, color:"#5a7a4a" }}>{p.info}</div>
              </div>
            ) : null;
          })}
          <button onClick={() => setSuggestions([])} style={{ ...S.bsm, marginTop:6, fontSize:10 }}>Lukk forslag</button>
        </div>
      )}

      {obs.length === 0
        ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen ugrasregistreringer</div>
        : <div>
            <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Registrerte observasjoner ({obs.length})</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {obs.map(o => {
                const wData = WEEDS_DB.find(w => w.name === o.weed);
                const range = o.from_skifte === o.to_skifte ? fieldName(o.from_skifte) : `${fieldName(o.from_skifte)} → ${fieldName(o.to_skifte)}`;
                const daa = o.customDaa && parseFloat(o.customDaa) > 0 ? parseFloat(o.customDaa) : getEffectiveDaa(o);
                const obsExpanded = expanded === ("obs_"+o.id);
                return (
                  <div key={o.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:6, overflow:"hidden", borderLeft:`3px solid ${RISK_COLOR[o.severity]||"#a8d878"}` }}>
                    <button onClick={() => setExpanded(obsExpanded ? null : "obs_"+o.id)}
                      style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"9px 12px", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", flex:1 }}>
                        <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(o.date)}</span>
                        <span style={{ fontSize:12, color:"#c8e878" }}>{o.weed}</span>
                        <span style={{ ...S.tag, color:RISK_COLOR[o.severity]||"#7a9e6a" }}>{o.severity}</span>
                        <span style={{ fontSize:11, color:"#f0c878" }}>{range}</span>
                        {daa > 0 && <span style={{ fontSize:10, color:"#5a7a4a" }}>{daa.toFixed(1)} daa</span>}
                      </div>
                      <span style={{ fontSize:10, color:"#3a6a50", background:"#1a3a28", border:"1px solid #2a5a38", borderRadius:4, padding:"2px 8px", flexShrink:0, whiteSpace:"nowrap" }}>
                        {obsExpanded ? "▲ Lukk" : "💡 Vis anbefaling"}
                      </span>
                    </button>
                    {obsExpanded && (
                      <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #1a2e16" }}>
                        {o.notes && <div style={{ fontSize:11, color:"#7a9e6a", marginBottom:10 }}>📝 {o.notes}</div>}
                        {wData?.remedy?.length > 0
                          ? <div>
                              <div style={{ fontSize:10, color:"#5a7a4a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Anbefalte sprøytemidler</div>
                              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                                {wData.remedy.map(r => {
                                  const p = PESTICIDES_DB.find(x => x.name === r);
                                  return p
                                    ? <div key={r} style={{ background:"#152012", border:"1px solid #2a4a5a", borderRadius:5, padding:"7px 10px" }}>
                                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                                          <span style={{ fontSize:12, color:"#78c8f0", fontWeight:"bold" }}>{p.name}</span>
                                          <span style={{ fontSize:11, color:"#f0c878" }}>{p.dose}</span>
                                        </div>
                                        <div style={{ fontSize:10, color:"#5a7a4a" }}>{p.info}</div>
                                      </div>
                                    : <div key={r} style={{ background:"#152012", border:"1px solid #2a4a5a", borderRadius:5, padding:"6px 10px" }}><span style={{ fontSize:12, color:"#78c8f0" }}>{r}</span></div>;
                                })}
                              </div>
                            </div>
                          : <div style={{ fontSize:11, color:"#3a5a30" }}>Ingen registrerte anbefalinger for {o.weed}</div>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
      }
    </div>
  );
}

// ─── SOPP TAB ─────────────────────────────────────────────────────────────────
export function SoppTab({ user }) {
  const [obs, setObs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [culture, setCulture] = useState("hvete");
  const { tiltak, laster:tiltakLaster, feil:tiltakFeil, markerUtfort, markerIkkeAktuelt } = useTiltak();
  const [form, setForm] = useState({ date:today, from_skifte:"skifte1", to_skifte:"skifte1", customDaa:"", disease:"", severity:"Lav", notes:"", done_by:user.name });
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [quickReg, setQuickReg] = useState(null);

  const CULTURES = [
    {id:"hvete",label:"Hvete",color:"#f0c878"},
    {id:"bygg",label:"Bygg",color:"#78c8f0"},
    {id:"havre",label:"Havre",color:"#a8d878"},
    {id:"åkerbønner",label:"Åkerbønner",color:"#c878f0"},
    {id:"erter",label:"Erter",color:"#78f0c8"},
  ];

  const filteredDiseases = DISEASES_DB.filter(d => d.crops.includes(culture));
  const activeCulture = CULTURES.find(c => c.id === culture);

  function addObs() {
    if (!form.disease) return;
    setObs(p => [{id:uid(), ...form, culture}, ...p]);
    const d = DISEASES_DB.find(x => x.name === form.disease);
    setSuggestions(d ? d.remedy : []);
    setForm(f => ({...f, disease:"", notes:""}));
    setShowForm(false);
  }

  function quickRegister(d) {
    setQuickReg(d);
    setForm(f => ({...f, disease:d.name}));
  }

  function confirmQuickReg() {
    if (!form.disease) return;
    setObs(p => [{id:uid(), ...form, culture}, ...p]);
    const d = DISEASES_DB.find(x => x.name === form.disease);
    setSuggestions(d ? d.remedy : []);
    setForm(f => ({...f, disease:"", notes:"", severity:"Lav"}));
    setQuickReg(null);
  }

  return (
    <div>
      <TiltakBanner tiltak={tiltak} laster={tiltakLaster} feil={tiltakFeil} markerUtfort={markerUtfort} markerIkkeAktuelt={markerIkkeAktuelt} filter="sopp" user={user}/>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
        {CULTURES.map(c => (
          <button key={c.id} onClick={() => { setCulture(c.id); setExpanded(null); }}
            style={{ background:culture===c.id?c.color+"33":"#0f1a0d", border:`2px solid ${culture===c.id?c.color:"#2d4a26"}`, color:culture===c.id?c.color:"#5a7a4a", borderRadius:20, padding:"5px 16px", cursor:"pointer", fontSize:12, fontWeight:culture===c.id?"bold":"normal", transition:"all 0.15s" }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ ...S.card, marginBottom:12, borderTop:`3px solid ${activeCulture?.color||"#2d4a26"}` }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
          Sjukdommer i {activeCulture?.label} — {filteredDiseases.length} aktuelle
        </div>
        {filteredDiseases.length === 0
          ? <div style={{ fontSize:12, color:"#3a5a30" }}>Ingen sjukdommer registrert for denne kulturen</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {filteredDiseases.map(d => {
                const ex = expanded === d.id;
                const nibio = DISEASE_NIBIO[d.id];
                const riskC = RISK_COLOR[d.risk] || "#7a9e6a";
                return (
                  <div key={d.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:6, overflow:"hidden", borderLeft:`3px solid ${riskC}` }}>
                    <button onClick={() => setExpanded(ex ? null : d.id)}
                      style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"9px 12px", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flex:1 }}>
                        <span style={{ fontSize:13, color:"#d4e8b0", fontWeight:"bold" }}>{d.name}</span>
                        <span style={{ fontSize:10, color:"#5a7a4a", fontStyle:"italic" }}>{d.latin}</span>
                        <span style={{ ...S.tag, color:riskC, borderColor:riskC }}>{d.risk}</span>
                        <span style={{ ...S.tag, color:"#5a7a4a" }}>⏱ {d.season}</span>
                      </div>
                      <span style={{ color:"#3a5a30", fontSize:11, flexShrink:0 }}>{ex ? "▲" : "▼"}</span>
                    </button>
                    {ex && (
                      <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #1a2e16" }}>
                        {d.img && <img src={d.img} alt={d.name} style={{ width:"100%", maxHeight:180, objectFit:"cover", borderRadius:6, marginBottom:10, border:"1px solid #2d4a26", display:"block" }} onError={e => e.target.style.display="none"}/>}
                        <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:8 }}>🔍 {d.symptoms}</div>
                        <div style={{ fontSize:11, color:"#5a7a4a", marginBottom:8 }}>Behandlingstidspunkt: {d.season}</div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
                          {d.remedy.map(r => <span key={r} style={{ fontSize:9, background:"#2a1a3a", border:"1px solid #4a2a5a", borderRadius:3, padding:"2px 7px", color:"#c878f0" }}>{r}</span>)}
                        </div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          <button onClick={() => quickRegister(d)} style={{ ...S.btn, background:"#1a3a2a", borderColor:"#2a7a4a", color:"#78f0a8", padding:"6px 14px", fontSize:11 }}>
                            📍 Registrer funn
                          </button>
                          {nibio?.url && (
                            <a href={nibio.url} target="_blank" rel="noreferrer"
                              style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:"#c878f0", background:"#1a1a2e", border:"1px solid #3a2a5a", borderRadius:5, padding:"6px 12px", textDecoration:"none" }}>
                              🔗 NIBIO
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
        }
      </div>

      {quickReg && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
          <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:380, width:"100%" }}>
            <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold", marginBottom:4 }}>📍 Registrer funn</div>
            <div style={{ fontSize:12, color:"#c878f0", marginBottom:16 }}>{quickReg.name}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div><label style={S.lbl}>Dato</label><input type="date" value={form.date} onChange={e => setForm(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
              <div><label style={S.lbl}>Omfang</label>
                <select value={form.severity} onChange={e => setForm(p => ({...p,severity:e.target.value}))} style={S.inp}>
                  {["Lav","Middels","Høy","Svært høy"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:10 }}><FieldRangeSelector fromId={form.from_skifte} toId={form.to_skifte} onFromChange={v => setForm(p => ({...p,from_skifte:v}))} onToChange={v => setForm(p => ({...p,to_skifte:v}))} customDaa={form.customDaa} onDaaChange={v => setForm(p => ({...p,customDaa:v}))}/></div>
            <div style={{ marginBottom:14 }}><label style={S.lbl}>Notater (valgfritt)</label><input type="text" value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="F.eks. omfang, sted i åkeren..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={confirmQuickReg} style={{ ...S.btn, background:"#1a3a2a", borderColor:"#2a7a4a", color:"#78f0a8", flex:1 }}>✓ Lagre registrering</button>
              <button onClick={() => { setQuickReg(null); setForm(f => ({...f,disease:"",notes:""})); }} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(true)} style={{ ...S.btn, background:"#2a1a3a", borderColor:"#5a3a7a", color:"#c878f0", marginBottom:12, width:"100%" }}>
        ＋ Registrer sopp/sjukdomstegn
      </button>

      {showForm && (
        <div style={{ ...S.card, marginBottom:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div><label style={S.lbl}>Dato</label><input type="date" value={form.date} onChange={e => setForm(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
            <div><label style={S.lbl}>Sjukdom/sopp</label>
              <select value={form.disease} onChange={e => setForm(p => ({...p,disease:e.target.value}))} style={S.inp}>
                <option value="">Velg sjukdom...</option>
                {filteredDiseases.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                <option value="Annet">Annet</option>
              </select>
            </div>
            <div><label style={S.lbl}>Omfang</label>
              <select value={form.severity} onChange={e => setForm(p => ({...p,severity:e.target.value}))} style={S.inp}>
                {["Lav","Middels","Høy","Svært høy"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={S.lbl}>Utført av</label><input type="text" value={form.done_by} onChange={e => setForm(p => ({...p,done_by:e.target.value}))} style={S.inp}/></div>
          </div>
          <div style={{ marginBottom:10 }}><FieldRangeSelector fromId={form.from_skifte} toId={form.to_skifte} onFromChange={v => setForm(p => ({...p,from_skifte:v}))} onToChange={v => setForm(p => ({...p,to_skifte:v}))} customDaa={form.customDaa} onDaaChange={v => setForm(p => ({...p,customDaa:v}))}/></div>
          <div style={{ marginBottom:12 }}><label style={S.lbl}>Symptombeskrivelse</label><input type="text" value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} placeholder="Beskriv symptomer, utbredelse..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
          <div style={{ display:"flex", gap:8 }}><button onClick={addObs} style={S.btn}>Lagre</button><button onClick={() => setShowForm(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ ...S.card, marginBottom:12, border:"1px solid #4a2a5a" }}>
          <div style={{ fontSize:11, color:"#c878f0", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>💡 Anbefalte soppmidler</div>
          {suggestions.map(s => {
            const p = PESTICIDES_DB.find(x => x.name === s);
            return p
              ? <div key={s} style={{ background:"#0f1a0d", borderRadius:5, padding:"8px 12px", marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:13, color:"#c878f0", fontWeight:"bold" }}>{p.name}</span>
                    <span style={{ fontSize:11, color:"#f0c878" }}>{p.dose}</span>
                  </div>
                  <div style={{ fontSize:11, color:"#5a7a4a" }}>{p.info}</div>
                </div>
              : <div key={s} style={{ background:"#0f1a0d", borderRadius:5, padding:"8px 12px", marginBottom:6 }}><span style={{ fontSize:13, color:"#c878f0" }}>{s}</span></div>;
          })}
          <button onClick={() => setSuggestions([])} style={{ ...S.bsm, marginTop:6, fontSize:10 }}>Lukk forslag</button>
        </div>
      )}

      {obs.length > 0 && (
        <div>
          <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Registrerte observasjoner ({obs.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {obs.map(o => {
              const dData = DISEASES_DB.find(d => d.name === o.disease);
              const range = o.from_skifte === o.to_skifte ? fieldName(o.from_skifte) : `${fieldName(o.from_skifte)} → ${fieldName(o.to_skifte)}`;
              const daa = o.customDaa && parseFloat(o.customDaa) > 0 ? parseFloat(o.customDaa) : getEffectiveDaa(o);
              const obsExpanded = expanded === ("sobs_"+o.id);
              return (
                <div key={o.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:6, overflow:"hidden", borderLeft:`3px solid ${RISK_COLOR[o.severity]||"#c878f0"}` }}>
                  <button onClick={() => setExpanded(obsExpanded ? null : "sobs_"+o.id)}
                    style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"9px 12px", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", flex:1 }}>
                      <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(o.date)}</span>
                      <span style={{ fontSize:12, color:"#c878f0" }}>{o.disease}</span>
                      <span style={{ ...S.tag, color:RISK_COLOR[o.severity]||"#7a9e6a" }}>{o.severity}</span>
                      <span style={{ fontSize:11, color:"#f0c878" }}>{range}</span>
                      {daa > 0 && <span style={{ fontSize:10, color:"#5a7a4a" }}>{daa.toFixed(1)} daa</span>}
                    </div>
                    <span style={{ fontSize:10, color:"#5a3a7a", background:"#1a1a3a", border:"1px solid #3a2a5a", borderRadius:4, padding:"2px 8px", flexShrink:0, whiteSpace:"nowrap" }}>
                      {obsExpanded ? "▲ Lukk" : "💡 Vis anbefaling"}
                    </span>
                  </button>
                  {obsExpanded && (
                    <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #1a2e16" }}>
                      {o.notes && <div style={{ fontSize:11, color:"#7a9e6a", marginBottom:10 }}>📝 {o.notes}</div>}
                      {dData?.remedy?.length > 0
                        ? <div>
                            <div style={{ fontSize:10, color:"#5a7a4a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Anbefalte soppmidler</div>
                            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                              {dData.remedy.map(r => {
                                const p = PESTICIDES_DB.find(x => x.name === r);
                                return p
                                  ? <div key={r} style={{ background:"#152012", border:"1px solid #3a2a5a", borderRadius:5, padding:"7px 10px" }}>
                                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                                        <span style={{ fontSize:12, color:"#c878f0", fontWeight:"bold" }}>{p.name}</span>
                                        <span style={{ fontSize:11, color:"#f0c878" }}>{p.dose}</span>
                                      </div>
                                      <div style={{ fontSize:10, color:"#5a7a4a" }}>{p.info}</div>
                                    </div>
                                  : <div key={r} style={{ background:"#152012", border:"1px solid #3a2a5a", borderRadius:5, padding:"6px 10px" }}><span style={{ fontSize:12, color:"#c878f0" }}>{r}</span></div>;
                              })}
                            </div>
                          </div>
                        : <div style={{ fontSize:11, color:"#3a5a30" }}>Ingen registrerte anbefalinger for {o.disease}</div>
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
