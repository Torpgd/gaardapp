import { useState, useEffect } from "react";
import { Hdr, FileUpload } from "./Shared";
import { S, uid, fmt, fnok } from "../lib/utils";
import { today } from "../data/constants";

const TYPER     = ["Hogst","Planting","Rydding","Skogsvei","Merking","Salg tømmer","Observasjon","Annet"];
const TRESLAG   = ["Bjørk","Furu","Gran","Blanding"];
const STORRELSER = ["60L sekk","1000L storsekk"];

const INIT_PRISER = {
  "Bjørk":    { "60L sekk": 80,  "1000L storsekk": 900 },
  "Furu":     { "60L sekk": 70,  "1000L storsekk": 800 },
  "Gran":     { "60L sekk": 65,  "1000L storsekk": 750 },
  "Blanding": { "60L sekk": 65,  "1000L storsekk": 750 },
};

// Startlager tomt — ingen hardkodede demo-data
const INIT_LAGER = Object.fromEntries(
  TRESLAG.flatMap(t => STORRELSER.map(s => [`${t}_${s}`, 0]))
);

export default function Skog({ user, back, logout, initRecs, onRecsChange, initLager, onLagerChange, initPriser, onPriserChange, initVedLog, onVedLogChange }) {
  // ── Generell skogslogg ────────────────────────────────────────────────────
  const [recs, setRecsState]  = useState(() => initRecs || []);
  const [tab, setTab]         = useState("oversikt");
  const [sa, setSa]           = useState(false);
  const [editId, setEditId]   = useState(null);
  const [nr, setNr]           = useState({ date:today, type:"Hogst", description:"", volume_m3:"", area_daa:"", done_by:user.name, files:[] });

  function setRecs(fn) { setRecsState(p => { const ny = typeof fn==="function"?fn(p):fn; onRecsChange?.(ny); return ny; }); }

  // ── Ved-varelager ─────────────────────────────────────────────────────────
  const [lagerState, setLagerState] = useState(() => initLager || INIT_LAGER);
  const [priserState, setPriserState] = useState(() => initPriser || INIT_PRISER);

  function setLager(fn)  { setLagerState(p  => { const ny=typeof fn==="function"?fn(p):fn;  onLagerChange?.(ny);  return ny; }); }
  function setPriser(fn) { setPriserState(p => { const ny=typeof fn==="function"?fn(p):fn;  onPriserChange?.(ny); return ny; }); }

  const lager  = lagerState;
  const priser = priserState;
  const [redigerPriser, setRedigerPriser] = useState(false);
  const [tmpPriser, setTmpPriser]   = useState({});
  const [vedForm, setVedForm]       = useState({ date:today, type:"inn", treslag:"Bjørk", storrelse:"60L sekk", antall:"", pris_override:"", notat:"" });
  const [vedSa, setVedSa]           = useState(false);
  const [vedLogState, setVedLogState] = useState(() => initVedLog || []);
  function setVedLog(fn) { setVedLogState(p => { const ny=typeof fn==="function"?fn(p):fn; onVedLogChange?.(ny); return ny; }); }
  const vedLog = vedLogState;

  // ── Generell logg ─────────────────────────────────────────────────────────
  function saveRec() {
    if (!nr.description.trim()) return;
    if (editId) {
      setRecs(p => p.map(r => r.id===editId
        ? {...r,...nr, volume_m3:parseFloat(nr.volume_m3)||null, area_daa:parseFloat(nr.area_daa)||null}
        : r));
      setEditId(null);
    } else {
      setRecs(p => [{id:uid(), ...nr, volume_m3:parseFloat(nr.volume_m3)||null, area_daa:parseFloat(nr.area_daa)||null}, ...p]);
    }
    setNr(x => ({...x, description:"", volume_m3:"", area_daa:"", files:[]}));
    setSa(false);
  }

  // ── Ved: legg inn / selg ──────────────────────────────────────────────────
  function lagreVed() {
    const antall = parseInt(vedForm.antall) || 0;
    if (antall <= 0) return;
    const key = `${vedForm.treslag}_${vedForm.storrelse}`;
    const enhetspris = parseFloat(vedForm.pris_override) || priser[vedForm.treslag]?.[vedForm.storrelse] || 0;
    const verdi = antall * enhetspris;

    if (vedForm.type === "inn") {
      setLager(p => ({...p, [key]: (p[key]||0) + antall}));
    } else {
      // salg — trekk fra lager
      setLager(p => ({...p, [key]: Math.max(0, (p[key]||0) - antall)}));
    }

    setVedLog(p => [{
      id: uid(),
      date: vedForm.date,
      type: vedForm.type,
      treslag: vedForm.treslag,
      storrelse: vedForm.storrelse,
      antall,
      enhetspris,
      verdi,
      notat: vedForm.notat,
      done_by: user.name,
    }, ...p]);

    setVedForm(f => ({...f, antall:"", pris_override:"", notat:""}));
    setVedSa(false);
  }

  // ── Priser ────────────────────────────────────────────────────────────────
  function startRedigerPriser() {
    const tmp = {};
    TRESLAG.forEach(t => STORRELSER.forEach(s => { tmp[`${t}_${s}`] = String(priser[t]?.[s]||""); }));
    setTmpPriser(tmp);
    setRedigerPriser(true);
  }
  function lagrePriser() {
    const ny = {...priser};
    TRESLAG.forEach(t => {
      ny[t] = {...ny[t]};
      STORRELSER.forEach(s => { ny[t][s] = parseFloat(tmpPriser[`${t}_${s}`]) || ny[t][s]; });
    });
    setPriser(ny);
    setRedigerPriser(false);
  }

  const totaltLager = Object.values(lager).reduce((s,v) => s+v, 0);
  const totalVerdiLager = TRESLAG.reduce((s,t) =>
    s + STORRELSER.reduce((s2,st) => s2 + (lager[`${t}_${st}`]||0) * (priser[t]?.[st]||0), 0), 0);

  const TABS = [
    ["oversikt","Oversikt"],
    ["ved","Ved & Salg"],
    ["logg","Skogslogg"],
  ];

  return (
    <div style={S.wrap}>
      <Hdr title="Skog" icon="🌲" color="#a8d878" onBack={back} user={user} onLogout={logout}>
        <div style={{ display:"flex", overflowX:"auto", marginTop:6 }}>
          {TABS.map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ background:"none", border:"none", borderBottom:tab===k?"2px solid #a8d878":"2px solid transparent", color:tab===k?"#a8d878":"#5a7a4a", padding:"7px 14px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>
              {l}
            </button>
          ))}
        </div>
      </Hdr>

      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>

        {/* ── OVERSIKT ── */}
        {tab === "oversikt" && (
          <div>
            {/* Arealinfo */}
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

            {/* Lagerstatus sammendrag */}
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Vedlager — oversikt</div>
                <button onClick={() => setTab("ved")} style={{ ...S.bsm, fontSize:10, padding:"3px 10px" }}>→ Administrer</button>
              </div>
              {totaltLager === 0
                ? <div style={{ fontSize:12, color:"#3a5a30" }}>Ingen ved på lager</div>
                : <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6, marginBottom:10 }}>
                      {TRESLAG.map(t => {
                        const sekker = lager[`${t}_60L sekk`] || 0;
                        const store  = lager[`${t}_1000L storsekk`] || 0;
                        if (sekker === 0 && store === 0) return null;
                        return (
                          <div key={t} style={{ background:"#0f1a0d", borderRadius:6, padding:"8px 12px" }}>
                            <div style={{ fontSize:11, color:"#a8d878", fontWeight:"bold", marginBottom:4 }}>🪵 {t}</div>
                            {sekker > 0 && <div style={{ fontSize:11, color:"#c8dca8" }}>60L: <strong>{sekker}</strong> sekker</div>}
                            {store > 0  && <div style={{ fontSize:11, color:"#c8dca8" }}>1000L: <strong>{store}</strong> storsekker</div>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:6, padding:"8px 14px", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:"#7a9e6a" }}>Estimert lagerverdi</span>
                      <span style={{ fontSize:14, color:"#f0c878", fontWeight:"bold" }}>{fnok(totalVerdiLager)}</span>
                    </div>
                  </>
              }
            </div>

            {/* Siste skogslogg */}
            {recs.length > 0 && (
              <div style={S.card}>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Siste skogsregistreringer</div>
                {recs.slice(0,3).map(r => (
                  <div key={r.id} style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #1a2e16", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#5a7a4a", flexShrink:0 }}>{fmt(r.date)}</span>
                    <span style={S.tag}>{r.type}</span>
                    <span style={{ fontSize:11, color:"#c8dca8", flex:1 }}>{r.description.slice(0,60)}{r.description.length>60?"…":""}</span>
                  </div>
                ))}
                <button onClick={() => setTab("logg")} style={{ ...S.bsm, marginTop:8, fontSize:10 }}>Se alle →</button>
              </div>
            )}
          </div>
        )}

        {/* ── VED & SALG ── */}
        {tab === "ved" && (
          <div>
            {/* Priser */}
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Priser per enhet</div>
                {!redigerPriser
                  ? <button onClick={startRedigerPriser} style={{ ...S.bsm, fontSize:10, padding:"3px 10px" }}>✏️ Rediger priser</button>
                  : <div style={{ display:"flex", gap:6 }}>
                      <button onClick={lagrePriser} style={{ ...S.btn, padding:"4px 12px", fontSize:11 }}>Lagre</button>
                      <button onClick={() => setRedigerPriser(false)} style={{ ...S.bsm, padding:"4px 10px" }}>Avbryt</button>
                    </div>
                }
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", color:"#5a7a4a", fontWeight:"normal", padding:"4px 8px 8px 0", fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>Treslag</th>
                      {STORRELSER.map(s => <th key={s} style={{ textAlign:"right", color:"#5a7a4a", fontWeight:"normal", padding:"4px 8px 8px", fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>{s}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {TRESLAG.map(t => (
                      <tr key={t} style={{ borderTop:"1px solid #1a2e16" }}>
                        <td style={{ padding:"7px 8px 7px 0", color:"#a8d878", fontWeight:"bold" }}>🪵 {t}</td>
                        {STORRELSER.map(s => (
                          <td key={s} style={{ padding:"7px 8px", textAlign:"right" }}>
                            {redigerPriser
                              ? <input type="number" value={tmpPriser[`${t}_${s}`]||""} onChange={e => setTmpPriser(p => ({...p,[`${t}_${s}`]:e.target.value}))}
                                  style={{ ...S.inp, width:80, textAlign:"right", padding:"4px 6px" }}/>
                              : <span style={{ color:"#f0c878" }}>{priser[t]?.[s] || 0} kr</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Varelager */}
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Varelager</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign:"left", color:"#5a7a4a", fontWeight:"normal", padding:"4px 8px 8px 0", fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>Treslag</th>
                      {STORRELSER.map(s => <th key={s} style={{ textAlign:"right", color:"#5a7a4a", fontWeight:"normal", padding:"4px 8px 8px", fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>{s}</th>)}
                      <th style={{ textAlign:"right", color:"#5a7a4a", fontWeight:"normal", padding:"4px 0 8px 8px", fontSize:10, letterSpacing:1, textTransform:"uppercase" }}>Verdi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRESLAG.map(t => {
                      const verdi = STORRELSER.reduce((s,st) => s + (lager[`${t}_${st}`]||0)*(priser[t]?.[st]||0), 0);
                      return (
                        <tr key={t} style={{ borderTop:"1px solid #1a2e16" }}>
                          <td style={{ padding:"8px 8px 8px 0", color:"#a8d878", fontWeight:"bold" }}>🪵 {t}</td>
                          {STORRELSER.map(s => (
                            <td key={s} style={{ padding:"8px", textAlign:"right", color: (lager[`${t}_${s}`]||0)>0?"#c8dca8":"#3a5a30", fontWeight:(lager[`${t}_${s}`]||0)>0?"bold":"normal" }}>
                              {lager[`${t}_${s}`]||0}
                            </td>
                          ))}
                          <td style={{ padding:"8px 0 8px 8px", textAlign:"right", color:"#f0c878" }}>{verdi > 0 ? fnok(verdi) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop:"2px solid #2d4a26" }}>
                      <td colSpan={3} style={{ padding:"8px 8px 4px 0", color:"#7a9e6a", fontSize:11 }}>Total lagerverdi</td>
                      <td style={{ padding:"8px 0 4px 8px", textAlign:"right", color:"#f0c878", fontWeight:"bold", fontSize:14 }}>{fnok(totalVerdiLager)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Registrer inn/salg */}
            <button onClick={() => setVedSa(true)} style={{ ...S.btn, marginBottom:12, width:"100%" }}>
              ＋ Registrer ved på lager / salg
            </button>

            {vedSa && (
              <div style={{ ...S.card, marginBottom:12 }}>
                <div style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold", marginBottom:12 }}>Registrer ved</div>

                {/* Inn eller salg */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {[["inn","📦 Legg på lager"],["salg","💰 Salg"]].map(([v,l]) => (
                    <button key={v} onClick={() => setVedForm(p => ({...p, type:v}))}
                      style={{ ...S.btn, flex:1, background:vedForm.type===v?(v==="salg"?"#3a4a1a":"#1a3a18"):"#152012", borderColor:vedForm.type===v?(v==="salg"?"#6a8a2a":"#2a7a4a"):"#2d4a26", color:vedForm.type===v?(v==="salg"?"#c8e878":"#78f0a8"):"#5a7a4a", fontSize:13 }}>
                      {l}
                    </button>
                  ))}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <div><label style={S.lbl}>Dato</label><input type="date" value={vedForm.date} onChange={e => setVedForm(p => ({...p,date:e.target.value}))} style={S.inp}/></div>
                  <div><label style={S.lbl}>Treslag</label>
                    <select value={vedForm.treslag} onChange={e => setVedForm(p => ({...p,treslag:e.target.value}))} style={S.inp}>
                      {TRESLAG.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label style={S.lbl}>Størrelse</label>
                    <select value={vedForm.storrelse} onChange={e => setVedForm(p => ({...p,storrelse:e.target.value}))} style={S.inp}>
                      {STORRELSER.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label style={S.lbl}>Antall</label>
                    <input type="number" min="1" value={vedForm.antall} onChange={e => setVedForm(p => ({...p,antall:e.target.value}))} placeholder="Antall" style={S.inp}/>
                  </div>
                  {vedForm.type === "salg" && (
                    <div>
                      <label style={S.lbl}>Pris/enhet (overstyr)</label>
                      <input type="number" step="1" value={vedForm.pris_override} onChange={e => setVedForm(p => ({...p,pris_override:e.target.value}))}
                        placeholder={String(priser[vedForm.treslag]?.[vedForm.storrelse]||"")} style={S.inp}/>
                    </div>
                  )}
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={S.lbl}>Notat (valgfritt)</label>
                    <input type="text" value={vedForm.notat} onChange={e => setVedForm(p => ({...p,notat:e.target.value}))}
                      placeholder={vedForm.type==="salg"?"F.eks. solgt til Ola Nordmann...":"F.eks. kappet og kløvd bjørk..."} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
                  </div>
                </div>

                {/* Forhåndsvisning */}
                {vedForm.antall > 0 && (
                  <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:5, padding:"8px 12px", marginBottom:12, fontSize:12 }}>
                    {vedForm.type === "inn"
                      ? <span style={{ color:"#78f0a8" }}>📦 Legger til {vedForm.antall} × {vedForm.treslag} {vedForm.storrelse} på lager (totalt: {(lager[`${vedForm.treslag}_${vedForm.storrelse}`]||0) + parseInt(vedForm.antall||0)})</span>
                      : <span style={{ color:"#f0c878" }}>💰 Salg: {vedForm.antall} × {vedForm.treslag} {vedForm.storrelse} à {parseFloat(vedForm.pris_override)||priser[vedForm.treslag]?.[vedForm.storrelse]||0} kr = <strong>{fnok((parseInt(vedForm.antall)||0) * (parseFloat(vedForm.pris_override)||priser[vedForm.treslag]?.[vedForm.storrelse]||0))}</strong></span>
                    }
                  </div>
                )}

                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={lagreVed} style={{ ...S.btn, background:vedForm.type==="salg"?"#3a4a1a":"#1a3a18", borderColor:vedForm.type==="salg"?"#6a8a2a":"#2a7a4a", color:vedForm.type==="salg"?"#c8e878":"#78f0a8" }}>Lagre</button>
                  <button onClick={() => setVedSa(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                </div>
              </div>
            )}

            {/* Ved-logg */}
            {vedLog.length > 0 && (
              <div>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Transaksjonslogg</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {vedLog.map(l => (
                    <div key={l.id} style={{ ...S.card, marginBottom:0, borderLeft:`3px solid ${l.type==="salg"?"#f0c878":"#78f0a8"}` }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, color:"#d4e8b0", fontWeight:"bold" }}>{fmt(l.date)}</span>
                          <span style={{ ...S.tag, color:l.type==="salg"?"#f0c878":"#78f0a8" }}>{l.type==="salg"?"Salg":"Inn på lager"}</span>
                          <span style={{ fontSize:12, color:"#a8d878" }}>🪵 {l.treslag} · {l.storrelse}</span>
                          <span style={{ fontSize:12, color:"#c8dca8" }}>{l.antall} stk</span>
                        </div>
                        {l.type === "salg" && <span style={{ fontSize:13, color:"#f0c878", fontWeight:"bold" }}>{fnok(l.verdi)}</span>}
                      </div>
                      {l.notat && <div style={{ fontSize:11, color:"#5a7a4a", marginTop:4 }}>{l.notat}</div>}
                    </div>
                  ))}
                  {/* Total salg */}
                  {vedLog.filter(l => l.type==="salg").length > 0 && (
                    <div style={{ background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:6, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:11, color:"#7a9e6a", letterSpacing:1, textTransform:"uppercase" }}>Total salgsinntekt</span>
                      <span style={{ fontSize:15, color:"#f0c878", fontWeight:"bold" }}>
                        {fnok(vedLog.filter(l => l.type==="salg").reduce((s,l) => s+l.verdi, 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SKOGSLOGG ── */}
        {tab === "logg" && (
          <div>
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
                  <textarea value={nr.description} onChange={e => setNr(p => ({...p,description:e.target.value}))} rows={3}
                    style={{ ...S.inp, width:"100%", boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}/>
                </div>
                <div style={{ marginBottom:12 }}><FileUpload files={nr.files} setFiles={f => setNr(p => ({...p,files:typeof f==="function"?f(p.files):f}))}/></div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={saveRec} style={S.btn}>Lagre</button>
                  <button onClick={() => setSa(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                </div>
              </div>
            )}

            {recs.length === 0
              ? <div style={{ textAlign:"center", color:"#3a5a30", padding:32 }}>Ingen registreringer</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {recs.map(r => (
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
                          <button onClick={() => { setNr({...r, volume_m3:r.volume_m3||"", area_daa:r.area_daa||"", files:r.files||[]}); setEditId(r.id); setSa(true); }}
                            style={{ ...S.bsm, padding:"2px 8px", fontSize:10 }}>✏️</button>
                          <button onClick={() => setRecs(p => p.filter(x => x.id !== r.id))}
                            style={{ ...S.bsm, padding:"2px 8px", fontSize:10, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
                        </div>
                      </div>
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
