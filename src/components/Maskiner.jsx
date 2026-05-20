import { useState, useRef } from "react";
import { Hdr, FileUpload, FThumb } from "./Shared";
import { S, uid, fmt } from "../lib/utils";
import { INIT_MACHINES, today } from "../data/constants";

// ─── ENPUNKTS LEKSJON DETALJSIDE ──────────────────────────────────────────────
function TipDetail({ tip, machine, onBack, onSave, onDelete, user, onLogout }) {
  const ref = useRef();
  const [editingTip, setEditingTip] = useState(null);
  const [localFiles, setLocalFiles] = useState(tip?.files || []);
  if (!tip) return null;

  function save() {
    if (!editingTip) return;
    onSave(editingTip.text);
    setEditingTip(null);
  }

  function handleFiles(e) {
    const nf = Array.from(e.target.files).map(f => ({
      id: uid(), name: f.name, type: f.type,
      url: URL.createObjectURL(f),
      isImage: f.type.startsWith("image/"),
      isPdf: f.type === "application/pdf",
    }));
    setLocalFiles(updated => [...updated, ...nf]);
    e.target.value = "";
  }

  return (
    <div style={S.wrap}>
      <Hdr title={machine.name} icon={machine.icon} color={machine.color} onBack={onBack} user={user} onLogout={onLogout}>
        <div style={{ paddingBottom:12 }}>
          <div style={{ fontSize:10, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Enpunkts leksjon</div>
        </div>
      </Hdr>
      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        <div style={{ ...S.card, borderLeft:`4px solid ${machine.color}`, marginBottom:16 }}>
          {editingTip
            ? <div>
                <textarea value={editingTip.text} onChange={e => setEditingTip(x => ({...x, text:e.target.value}))} rows={4}
                  style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit", marginBottom:10 }}/>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={save} style={S.btn}>Lagre</button>
                  <button onClick={() => setEditingTip(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                </div>
              </div>
            : <div>
                <div style={{ fontSize:16, color:"#d4e8b0", lineHeight:1.6, marginBottom:16 }}>{tip.text}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setEditingTip({id:tip.id, text:tip.text})} style={{ ...S.bsm, fontSize:11, padding:"5px 12px" }}>✏️ Rediger tekst</button>
                  <button onClick={() => { onDelete(tip.id); onBack(); }} style={{ ...S.bsm, fontSize:11, padding:"5px 12px", color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️ Slett</button>
                </div>
              </div>
          }
        </div>
        <div style={S.card}>
          <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Vedlegg — bilder og PDF-er</div>
          <input ref={ref} type="file" multiple accept="image/*,.pdf" onChange={handleFiles} style={{ display:"none" }}/>
          <button onClick={() => ref.current.click()} style={{ ...S.btn, marginBottom:localFiles.length ? 12 : 0, fontSize:12, padding:"8px 16px" }}>📎 Last opp bilde / PDF</button>
          {localFiles.length > 0
            ? <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {localFiles.map(f => <FThumb key={f.id} file={f} onRemove={() => setLocalFiles(p => p.filter(x => x.id !== f.id))}/>)}
              </div>
            : <div style={{ fontSize:12, color:"#3a5a30", marginTop:8 }}>Ingen vedlegg ennå. Last opp bilder av prosedyren, PDF-manual eller instruksjoner.</div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── MASKINER HOVEDKOMPONENT ──────────────────────────────────────────────────
export default function Maskiner({ user, back, logout }) {
  const [machines, setMachines] = useState(INIT_MACHINES);
  const [sel, setSel] = useState(null);
  const [machinePage, setMachinePage] = useState("info");
  const [logs, setLogs] = useState({});
  const [sa, setSa] = useState(false);
  const [nl, setNl] = useState({ date:today, type:"Service", description:"", done_by:user.name, files:[] });
  const [newTipText, setNewTipText] = useState("");
  const [newServiceTask, setNewServiceTask] = useState({ interval:"", task:"", spec:"" });
  const [addingService, setAddingService] = useState(false);
  const [serviceConfirm, setServiceConfirm] = useState(null);

  function updateMachine(id, updater) {
    setMachines(p => p.map(m => m.id === id ? updater(m) : m));
  }

  function addTip() {
    if (!newTipText.trim()) return;
    updateMachine(sel.id, m => ({...m, tips:[...m.tips, {id:uid(), text:newTipText.trim(), files:[]}]}));
    setNewTipText("");
  }

  function addServicePoint() {
    if (!newServiceTask.task.trim()) return;
    updateMachine(sel.id, m => ({...m, service:[...m.service, {id:uid(), ...newServiceTask}]}));
    setNewServiceTask({interval:"", task:"", spec:""});
    setAddingService(false);
  }

  function registerService(serviceId) {
    const taskName = machines.find(m => m.id === sel.id)?.service.find(s => s.id === serviceId)?.task || "";
    updateMachine(sel.id, m => ({...m, service:m.service.map(s => s.id===serviceId ? {...s, last:today} : s)}));
    const log = { id:uid(), date:today, type:"Service", description:`Utført: ${taskName}`, done_by:user.name, files:[] };
    setLogs(p => ({...p, [sel.id]:[log, ...(p[sel.id]||[])]}));
    setServiceConfirm(null);
  }

  function addLog() {
    if (!nl.description.trim()) return;
    setLogs(p => ({...p, [sel.id]:[{id:uid(), machine_id:sel.id, ...nl}, ...(p[sel.id]||[])]}));
    setNl(x => ({...x, description:"", files:[]}));
    setSa(false);
  }

  const selMachine = sel ? machines.find(m => m.id === sel.id) || sel : null;

  // Enpunkts leksjon detaljside
  if (selMachine && machinePage.startsWith("tip_")) {
    const tipId = machinePage.replace("tip_","");
    const tip = selMachine.tips.find(t => t.id === tipId);
    return (
      <TipDetail
        tip={tip} machine={selMachine} user={user} onLogout={logout}
        onBack={() => setMachinePage("info")}
        onSave={(newText) => updateMachine(selMachine.id, m => ({...m, tips:m.tips.map(t => t.id===tipId ? {...t,text:newText} : t)}))}
        onDelete={(tId) => updateMachine(selMachine.id, m => ({...m, tips:m.tips.filter(t => t.id!==tId)}))}
      />
    );
  }

  // Maskindetaljside
  if (selMachine) {
    const ml = logs[selMachine.id] || [];
    return (
      <div style={S.wrap}>
        <Hdr title={selMachine.name} icon={selMachine.icon} color={selMachine.color} onBack={() => { setSel(null); setMachinePage("info"); }} user={user} onLogout={logout}>
          <div style={{ display:"flex", marginTop:6 }}>
            {[["info","Info & Tips"],["service","Service"],["logg","Logg"]].map(([k,l]) => (
              <button key={k} onClick={() => setMachinePage(k)}
                style={{ background:"none", border:"none", borderBottom:machinePage===k?`2px solid ${selMachine.color}`:"2px solid transparent", color:machinePage===k?selMachine.color:"#5a7a4a", padding:"7px 14px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase" }}>
                {l}
              </button>
            ))}
          </div>
        </Hdr>
        <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>

          {machinePage === "info" && (
            <div>
              <div style={S.card}>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>Basisinfo</div>
                <div style={{ fontSize:13, color:"#d4e8b0", marginBottom:4 }}>{selMachine.info}</div>
                {selMachine.year && <div style={{ fontSize:12, color:"#7a9e6a" }}>Årsmodell: {selMachine.year} · {selMachine.type}</div>}
              </div>
              <div style={S.card}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Enpunkts leksjoner</div>
                  <div style={{ fontSize:10, color:"#3a5a30" }}>Klikk for full info og vedlegg</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
                  {selMachine.tips.map((t,i) => (
                    <button key={t.id} onClick={() => setMachinePage(`tip_${t.id}`)}
                      style={{ display:"flex", gap:10, padding:"10px 12px", background:"#0f1a0d", borderRadius:6, borderLeft:`3px solid ${selMachine.color}`, cursor:"pointer", textAlign:"left", width:"100%", border:"1px solid #1a2e16", borderLeftWidth:3, borderLeftColor:selMachine.color }}
                      onMouseEnter={e => e.currentTarget.style.background = "#0f2010"}
                      onMouseLeave={e => e.currentTarget.style.background = "#0f1a0d"}>
                      <span style={{ color:selMachine.color, fontWeight:"bold", flexShrink:0, fontSize:13 }}>{i+1}.</span>
                      <span style={{ fontSize:13, color:"#c8dca8", lineHeight:1.5, flex:1 }}>{t.text}</span>
                      <span style={{ color:"#3a5a30", fontSize:12, flexShrink:0, display:"flex", alignItems:"center", gap:4 }}>
                        {t.files?.length > 0 && <span style={{ fontSize:10 }}>📎{t.files.length}</span>}›
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  <div style={{ flex:1 }}>
                    <label style={S.lbl}>Nytt tips</label>
                    <input type="text" value={newTipText} onChange={e => setNewTipText(e.target.value)} onKeyDown={e => e.key === "Enter" && addTip()} placeholder="Skriv nytt tipspunkt..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                  </div>
                  <button onClick={addTip} style={{ ...S.btn, padding:"8px 14px", fontSize:12, marginBottom:0 }}>＋ Legg til</button>
                </div>
              </div>
            </div>
          )}

          {machinePage === "service" && (
            <div>
              <div style={{ ...S.card, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Serviceintervaller</div>
                  <button onClick={() => setAddingService(true)} style={{ ...S.btn, padding:"5px 12px", fontSize:11 }}>＋ Legg til servicepunkt</button>
                </div>
                {addingService && (
                  <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:12, marginBottom:12 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                      <div><label style={S.lbl}>Oppgave</label><input type="text" value={newServiceTask.task} onChange={e => setNewServiceTask(p => ({...p, task:e.target.value}))} placeholder="F.eks. Motorolje og filter" style={S.inp}/></div>
                      <div><label style={S.lbl}>Intervall</label><input type="text" value={newServiceTask.interval} onChange={e => setNewServiceTask(p => ({...p, interval:e.target.value}))} placeholder="F.eks. Hvert 500. time" style={S.inp}/></div>
                      <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Spesifikasjon</label><input type="text" value={newServiceTask.spec} onChange={e => setNewServiceTask(p => ({...p, spec:e.target.value}))} placeholder="F.eks. Valtra 10W-40" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={addServicePoint} style={S.btn}>Lagre</button>
                      <button onClick={() => setAddingService(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {selMachine.service.map(s => (
                    <div key={s.id} style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:6, padding:"12px 14px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                            <span style={{ fontSize:16 }}>🔧</span>
                            <span style={{ fontSize:13, color:"#d4e8b0", fontWeight:"bold" }}>{s.task}</span>
                            <span style={{ ...S.tag, color:"#7a9e6a" }}>{s.interval}</span>
                          </div>
                          {s.spec && <div style={{ fontSize:11, color:"#5a7a4a", marginBottom:4 }}>Spec: {s.spec}</div>}
                          <div style={{ fontSize:11, color:s.last?"#7a9e6a":"#5a4a2a" }}>Sist utført: {s.last ? fmt(s.last) : "Ikke registrert"}</div>
                        </div>
                        <button onClick={() => setServiceConfirm(s.id)} style={{ ...S.btn, padding:"6px 12px", fontSize:11, flexShrink:0, whiteSpace:"nowrap" }}>✓ Registrer utført</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {serviceConfirm && (() => {
                const s = selMachine.service.find(x => x.id === serviceConfirm);
                return (
                  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, padding:16 }}>
                    <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:28, maxWidth:360, textAlign:"center" }}>
                      <div style={{ fontSize:32, marginBottom:10 }}>🔧</div>
                      <div style={{ fontSize:15, color:"#d4e8b0", marginBottom:6 }}>{s?.task}</div>
                      <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:16 }}>{today} · {user.name}</div>
                      <p style={{ fontSize:12, color:"#5a7a4a", marginBottom:20 }}>Bekreft at denne servicen er utført. Dato og navn registreres automatisk.</p>
                      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                        <button onClick={() => registerService(serviceConfirm)} style={S.btn}>Bekreft utført</button>
                        <button onClick={() => setServiceConfirm(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {machinePage === "logg" && (
            <div>
              <button onClick={() => setSa(true)} style={{ ...S.btn, marginBottom:12, width:"100%" }}>＋ Ny loggføring</button>
              {sa && (
                <div style={{ ...S.card, marginBottom:12 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                    <div><label style={S.lbl}>Dato</label><input type="date" value={nl.date} onChange={e => setNl(p => ({...p, date:e.target.value}))} style={S.inp}/></div>
                    <div><label style={S.lbl}>Type</label>
                      <select value={nl.type} onChange={e => setNl(p => ({...p, type:e.target.value}))} style={S.inp}>
                        {["Service","Oljeskift","Reparasjon","Inspeksjon","Feil/stopp","Annet"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Utført av</label><input type="text" value={nl.done_by} onChange={e => setNl(p => ({...p, done_by:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <label style={S.lbl}>Beskrivelse</label>
                    <textarea value={nl.description} onChange={e => setNl(p => ({...p, description:e.target.value}))} rows={3} style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
                  </div>
                  <div style={{ marginBottom:12 }}><FileUpload files={nl.files} setFiles={f => setNl(p => ({...p, files:typeof f==="function"?f(p.files):f}))}/></div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={addLog} style={S.btn}>Lagre</button>
                    <button onClick={() => setSa(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                  </div>
                </div>
              )}
              {ml.length === 0
                ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32, fontSize:13 }}>Ingen loggføringer ennå</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {ml.map(l => (
                      <div key={l.id} style={{ ...S.card, marginBottom:0, borderLeft:`3px solid ${selMachine.color}` }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(l.date)}</span>
                          <span style={S.tag}>{l.type}</span>
                          <span style={{ fontSize:11, color:"#5a7a4a" }}>{l.done_by}</span>
                        </div>
                        <div style={{ fontSize:13, color:"#c8dca8", lineHeight:1.5 }}>{l.description}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  // Maskinkort-oversikt
  return (
    <div style={S.wrap}>
      <Hdr title="Maskiner & utstyr" icon="🚜" color="#78c8f0" onBack={back} user={user} onLogout={logout}/>
      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {machines.map(m => (
            <button key={m.id} onClick={() => { setSel(m); setMachinePage("info"); }}
              style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:14, cursor:"pointer", textAlign:"left" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.background = "#1a2e16"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2d4a26"; e.currentTarget.style.background = "#152012"; }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{m.icon}</div>
              <div style={{ fontSize:13, color:m.color, fontWeight:"bold", marginBottom:3 }}>{m.name}</div>
              <div style={{ fontSize:10, color:"#5a7a4a" }}>{m.type}{m.year ? ` · ${m.year}` : ""}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
