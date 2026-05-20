import { useState } from "react";
import { S, uid, getCompat } from "../lib/utils";
import { BbchTekst } from "./BbchKort";
import { PESTICIDES_DB, COMPAT, today } from "../data/constants";
import { FieldRangeSelector } from "./Shared";

// ─── PESTICIDEINFOPANEL ───────────────────────────────────────────────────────
export function PesticideInfoPanel() {
  const [selected, setSelected] = useState([]);
  const [detailMid, setDetailMid] = useState(null);

  function toggleSelect(name) {
    setSelected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);
  }

  function getComboResult() {
    if (selected.length < 2) return null;
    const issues = [];
    for (let i = 0; i < selected.length; i++) {
      for (let j = i+1; j < selected.length; j++) {
        const c = getCompat(selected[i], selected[j], COMPAT);
        if (c === "X") issues.push({a:selected[i], b:selected[j], status:"X"});
        else if (c === "?") issues.push({a:selected[i], b:selected[j], status:"?"});
      }
    }
    return issues;
  }

  const comboIssues = getComboResult();

  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>
        Sprøytemidler — trykk for info · velg flere for blandingssjekk
      </div>
      <div style={{ fontSize:10, color:"#3a5a30", marginBottom:10 }}>Velg 2+ midler for å sjekke om de kan blandes</div>

      {["Ugras","Sopp","Vekstregulering","Insekt"].map(type => {
        const list = PESTICIDES_DB.filter(p => p.type === type);
        return (
          <div key={type} style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:"#7a9e6a", letterSpacing:1, textTransform:"uppercase", marginBottom:5 }}>{type}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {list.map(p => {
                const isSel = selected.includes(p.name);
                const isDetail = detailMid === p.name;
                return (
                  <button key={p.name}
                    onClick={() => setDetailMid(isDetail ? null : p.name)}
                    onDoubleClick={() => toggleSelect(p.name)}
                    style={{ fontSize:10, padding:"3px 10px", borderRadius:4, cursor:"pointer", background:isSel?"#3a1a5a":isDetail?"#1a1a3a":"#1e3a18", border:`1px solid ${isSel?"#c878f0":isDetail?"#5a3a9a":"#2d4a26"}`, color:isSel?"#c878f0":isDetail?"#a878f0":"#c878f0", fontWeight:isSel||isDetail?"bold":"normal" }}>
                    {p.name}{isSel?" ✓":""}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div style={{ fontSize:10, color:"#4a6a38", marginTop:4 }}>Enkelt trykk = info · Dobbelttrykk = legg til blandingssjekk</div>

      {detailMid && (() => {
        const p = PESTICIDES_DB.find(x => x.name === detailMid);
        if (!p) return null;
        return (
          <div style={{ background:"#0f1a0d", border:"1px solid #3a2a5a", borderRadius:6, padding:12, marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div>
                <div style={{ fontSize:14, color:"#c878f0", fontWeight:"bold" }}>{p.name}</div>
                <div style={{ fontSize:10, color:"#5a7a4a", textTransform:"uppercase", letterSpacing:1 }}>{p.type}</div>
              </div>
              <button onClick={() => setDetailMid(null)} style={{ background:"none", border:"none", color:"#5a7a4a", cursor:"pointer", fontSize:16, padding:0 }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <div><div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", marginBottom:2 }}>Dose</div><div style={{ fontSize:12, color:"#f0c878" }}>{p.dose}</div></div>
              <div><div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", marginBottom:2 }}>Kulturer</div><div style={{ fontSize:11, color:"#a8d878" }}>{p.crop.join(", ")}</div></div>
            </div>
            <div style={{ fontSize:11, color:"#7a9e6a", marginBottom:8 }}><BbchTekst tekst={p.info}/></div>
            <div>
              <div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", marginBottom:4 }}>Virker mot</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {p.target.map(t => <span key={t} style={{ fontSize:9, background:"#1a2e3a", border:"1px solid #2a4a5a", borderRadius:3, padding:"1px 6px", color:"#78c8f0" }}>{t}</span>)}
              </div>
            </div>
            <button onClick={() => toggleSelect(p.name)}
              style={{ ...S.btn, background:selected.includes(p.name)?"#3a1a1a":"#2a1a4a", borderColor:selected.includes(p.name)?"#7a3a3a":"#5a3a9a", color:selected.includes(p.name)?"#e08080":"#c878f0", fontSize:11, padding:"5px 12px", marginTop:10 }}>
              {selected.includes(p.name) ? "✕ Fjern fra blandingssjekk" : "＋ Legg til blandingssjekk"}
            </button>
          </div>
        );
      })()}

      {selected.length > 0 && (
        <div style={{ background:"#0a1a10", border:"1px solid #2d4a26", borderRadius:6, padding:12, marginTop:10 }}>
          <div style={{ fontSize:11, color:"#a8d878", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>
            🧪 Blandingssjekk — {selected.length} midler valgt
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
            {selected.map(n => (
              <span key={n} style={{ fontSize:10, background:"#2a1a4a", border:"1px solid #5a3a9a", borderRadius:4, padding:"2px 8px", color:"#c878f0", display:"flex", alignItems:"center", gap:4 }}>
                {n}
                <button onClick={() => setSelected(p => p.filter(x => x !== n))} style={{ background:"none", border:"none", color:"#7a4a7a", cursor:"pointer", fontSize:10, padding:0, lineHeight:1 }}>✕</button>
              </span>
            ))}
            <button onClick={() => setSelected([])} style={{ ...S.bsm, fontSize:9, padding:"2px 8px" }}>Nullstill</button>
          </div>
          {comboIssues !== null && (
            comboIssues.length === 0
              ? <div style={{ background:"#1a3a1a", border:"1px solid #2a6a2a", borderRadius:5, padding:"8px 12px", color:"#78f0a8", fontSize:12 }}>✅ Alle valgte midler er kompatible — kan blandes</div>
              : <div>
                  {comboIssues.map((issue,i) => (
                    <div key={i} style={{ background:issue.status==="X"?"#3a1a1a":"#3a2a10", border:`1px solid ${issue.status==="X"?"#7a3a3a":"#7a5a20"}`, borderRadius:5, padding:"7px 10px", marginBottom:6, fontSize:11 }}>
                      <span style={{ color:issue.status==="X"?"#e08080":"#f0c878", fontWeight:"bold" }}>{issue.status==="X"?"❌ Skal IKKE blandes":"⚠️ Sjekk etiketten"}: </span>
                      <span style={{ color:"#c8dca8" }}>{issue.a} + {issue.b}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:10, color:"#5a7a4a", marginTop:6 }}>? = mulig å blande, men sjekk alltid etiketten og Mattilsynets blandetabell (pmr.no)</div>
                </div>
          )}
          {comboIssues === null && selected.length >= 2 && (
            <div style={{ fontSize:11, color:"#5a7a4a" }}>Kompatibilitetsdata mangler — sjekk pmr.no</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GJØDSELPLAN EDITOR ───────────────────────────────────────────────────────
const INIT_GJØDSELPLAN = [
  {id:"g1",label:"Grunngjødsel hvete",produkt:"Yara Fullgjødsel 22-3-10",mengde:"52 kg/daa",dato:"2. mai",notat:"11,44 kg N/daa"},
  {id:"g2",label:"Toppgjødsel hvete",produkt:"Opti-NS 27-0-0",mengde:"25 kg/daa",dato:"Ved Z30",notat:"Vurderes etter bestandets utvikling"},
  {id:"g3",label:"Åkerbønner",produkt:"Ingen gjødsel",mengde:"—",dato:"—",notat:"Nitrogenfiksering — absolutt ingen gjødsel"},
  {id:"g4",label:"Kieseritt",produkt:"Ikke aktuelt",mengde:"—",dato:"—",notat:"Mg-AL over NLR-terskel (3 mg/100g)"},
];

export function GjødselplanEditor({ initPlan, onPlanChange }) {
  const [plan, setPlanState] = useState(() => initPlan || INIT_GJØDSELPLAN);
  function setPlan(fn) {
    setPlanState(p => { const ny = typeof fn==="function"?fn(p):fn; onPlanChange?.(ny); return ny; });
  }
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({label:"",produkt:"",mengde:"",dato:"",notat:""});

  function startEdit(row) { setEditId(row.id); setEditRow({...row}); }
  function saveEdit() { setPlan(p => p.map(r => r.id===editId ? {...r,...editRow} : r)); setEditId(null); setEditRow(null); }
  function deleteRow(id) { setPlan(p => p.filter(r => r.id !== id)); }
  function addRow() {
    if (!newRow.label.trim()) return;
    setPlan(p => [...p, {id:uid(), ...newRow}]);
    setNewRow({label:"",produkt:"",mengde:"",dato:"",notat:""});
    setAdding(false);
  }

  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Gjødslingsplan 2026</div>
        <button onClick={() => setAdding(true)} style={{ ...S.btn, padding:"4px 10px", fontSize:10 }}>＋ Legg til</button>
      </div>
      {plan.map(row => editId === row.id
        ? <div key={row.id} style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:10, marginBottom:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <div><label style={S.lbl}>Linje</label><input value={editRow.label} onChange={e => setEditRow(p => ({...p,label:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div><label style={S.lbl}>Produkt</label><input value={editRow.produkt} onChange={e => setEditRow(p => ({...p,produkt:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div><label style={S.lbl}>Mengde</label><input value={editRow.mengde} onChange={e => setEditRow(p => ({...p,mengde:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div><label style={S.lbl}>Dato/tidspunkt</label><input value={editRow.dato} onChange={e => setEditRow(p => ({...p,dato:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Notat</label><input value={editRow.notat} onChange={e => setEditRow(p => ({...p,notat:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ display:"flex", gap:8 }}><button onClick={saveEdit} style={S.btn}>Lagre</button><button onClick={() => setEditId(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
          </div>
        : <div key={row.id} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid #1a2e16", alignItems:"flex-start" }}>
            <div style={{ width:130, flexShrink:0, fontSize:11, color:"#5a7a4a" }}>{row.label}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#c8dca8" }}>{row.produkt}{row.mengde && row.mengde !== "—" ? ` · ${row.mengde}` : ""}</div>
              {row.dato && row.dato !== "—" && <div style={{ fontSize:10, color:"#7a9e6a", marginTop:1, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>📅 <BbchTekst tekst={row.dato}/></div>}
              {row.notat && <div style={{ fontSize:10, color:"#5a7a4a", marginTop:1 }}><BbchTekst tekst={row.notat}/></div>}
            </div>
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={() => startEdit(row)} style={{ ...S.bsm, padding:"2px 7px", fontSize:9 }}>✏️</button>
              <button onClick={() => deleteRow(row.id)} style={{ ...S.bsm, padding:"2px 7px", fontSize:9, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
            </div>
          </div>
      )}
      {adding && (
        <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:10, marginTop:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <div><label style={S.lbl}>Linje</label><input value={newRow.label} onChange={e => setNewRow(p => ({...p,label:e.target.value}))} placeholder="F.eks. Grunngjødsel bygg" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div><label style={S.lbl}>Produkt</label><input value={newRow.produkt} onChange={e => setNewRow(p => ({...p,produkt:e.target.value}))} placeholder="F.eks. Yara 22-3-10" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div><label style={S.lbl}>Mengde</label><input value={newRow.mengde} onChange={e => setNewRow(p => ({...p,mengde:e.target.value}))} placeholder="F.eks. 45 kg/daa" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div><label style={S.lbl}>Dato/tidspunkt</label><input value={newRow.dato} onChange={e => setNewRow(p => ({...p,dato:e.target.value}))} placeholder="F.eks. Ved såing" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Notat</label><input value={newRow.notat} onChange={e => setNewRow(p => ({...p,notat:e.target.value}))} placeholder="Tilleggsinfo..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
          </div>
          <div style={{ display:"flex", gap:8 }}><button onClick={addRow} style={S.btn}>Lagre</button><button onClick={() => setAdding(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
        </div>
      )}
    </div>
  );
}

// ─── SPRØYTEPLAN EDITOR ───────────────────────────────────────────────────────
const INIT_SPRØYTEPLAN = [
  {id:"sp1",kultur:"Hvete",middel:"Atlantis OD",dose:"100-125 ml/daa",tidspunkt:"Z21–Z32",notat:"Mot floghavre og grasugras"},
  {id:"sp2",kultur:"Åkerbønner",middel:"Select 240 EC",dose:"50-75 ml/daa",tidspunkt:"Z10–Z15",notat:"Mot hønsehirse og grasugras"},
  {id:"sp3",kultur:"Hvete",middel:"Proline 250 EC",dose:"40-60 ml/daa",tidspunkt:"Z37–Z55",notat:"Forebyggende soppmiddel ved behov"},
];

export function SprøyteplanEditor({ initPlan, onPlanChange }) {
  const [plan, setPlanState] = useState(() => initPlan || INIT_SPRØYTEPLAN);
  function setPlan(fn) {
    setPlanState(p => { const ny = typeof fn==="function"?fn(p):fn; onPlanChange?.(ny); return ny; });
  }
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState({kultur:"",middel:"",dose:"",tidspunkt:"",notat:""});

  function startEdit(row) { setEditId(row.id); setEditRow({...row}); }
  function saveEdit() { setPlan(p => p.map(r => r.id===editId ? {...r,...editRow} : r)); setEditId(null); setEditRow(null); }
  function deleteRow(id) { setPlan(p => p.filter(r => r.id !== id)); }
  function addRow() {
    if (!newRow.kultur.trim() && !newRow.middel.trim()) return;
    setPlan(p => [...p, {id:uid(), ...newRow}]);
    setNewRow({kultur:"",middel:"",dose:"",tidspunkt:"",notat:""});
    setAdding(false);
  }

  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Sprøyteplan 2026</div>
        <button onClick={() => setAdding(true)} style={{ ...S.btn, padding:"4px 10px", fontSize:10, background:"#3a1a5a", borderColor:"#6a3a9a", color:"#c878f0" }}>＋ Legg til</button>
      </div>
      {plan.map(row => editId === row.id
        ? <div key={row.id} style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:10, marginBottom:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <div><label style={S.lbl}>Kultur</label><input value={editRow.kultur} onChange={e => setEditRow(p => ({...p,kultur:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div><label style={S.lbl}>Middel</label>
                <select value={editRow.middel} onChange={e => setEditRow(p => ({...p, middel:e.target.value, dose:PESTICIDES_DB.find(x => x.name===e.target.value)?.dose||p.dose}))} style={S.inp}>
                  <option value="">Velg eller skriv...</option>
                  {PESTICIDES_DB.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div><label style={S.lbl}>Dose</label><input value={editRow.dose} onChange={e => setEditRow(p => ({...p,dose:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div><label style={S.lbl}>Tidspunkt</label><input value={editRow.tidspunkt} onChange={e => setEditRow(p => ({...p,tidspunkt:e.target.value}))} placeholder="F.eks. Z21–Z32" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
              <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Notat</label><input value={editRow.notat} onChange={e => setEditRow(p => ({...p,notat:e.target.value}))} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            </div>
            <div style={{ display:"flex", gap:8 }}><button onClick={saveEdit} style={S.btn}>Lagre</button><button onClick={() => setEditId(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
          </div>
        : <div key={row.id} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid #1a2e16", alignItems:"flex-start" }}>
            <div style={{ width:90, flexShrink:0 }}><span style={{ ...S.tag, color:"#c878f0", fontSize:9 }}>{row.kultur}</span></div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:"#c8dca8" }}>{row.middel}</div>
              <div style={{ fontSize:10, color:"#7a9e6a", marginTop:1, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                <span>💧 {row.dose}</span>
                {row.tidspunkt && <BbchTekst tekst={` · ${row.tidspunkt}`}/>}
              </div>
              {row.notat && <div style={{ fontSize:10, color:"#5a7a4a", marginTop:1 }}><BbchTekst tekst={row.notat}/></div>}
            </div>
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={() => startEdit(row)} style={{ ...S.bsm, padding:"2px 7px", fontSize:9 }}>✏️</button>
              <button onClick={() => deleteRow(row.id)} style={{ ...S.bsm, padding:"2px 7px", fontSize:9, color:"#7a4a4a", borderColor:"#4a2a2a" }}>🗑️</button>
            </div>
          </div>
      )}
      {adding && (
        <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:10, marginTop:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <div><label style={S.lbl}>Kultur</label><input value={newRow.kultur} onChange={e => setNewRow(p => ({...p,kultur:e.target.value}))} placeholder="F.eks. Hvete" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div><label style={S.lbl}>Middel</label>
              <select value={newRow.middel} onChange={e => setNewRow(p => ({...p, middel:e.target.value, dose:PESTICIDES_DB.find(x => x.name===e.target.value)?.dose||p.dose}))} style={S.inp}>
                <option value="">Velg sprøytemiddel...</option>
                {PESTICIDES_DB.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div><label style={S.lbl}>Dose</label><input value={newRow.dose} onChange={e => setNewRow(p => ({...p,dose:e.target.value}))} placeholder="Fylles fra middel" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div><label style={S.lbl}>Tidspunkt</label><input value={newRow.tidspunkt} onChange={e => setNewRow(p => ({...p,tidspunkt:e.target.value}))} placeholder="F.eks. Z21–Z32" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
            <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Notat</label><input value={newRow.notat} onChange={e => setNewRow(p => ({...p,notat:e.target.value}))} placeholder="Tilleggsinfo..." style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
          </div>
          <div style={{ display:"flex", gap:8 }}><button onClick={addRow} style={S.btn}>Lagre</button><button onClick={() => setAdding(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button></div>
        </div>
      )}
    </div>
  );
}
