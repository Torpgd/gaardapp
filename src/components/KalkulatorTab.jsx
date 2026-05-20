import { useState } from "react";
import { S, uid, getFieldsInRange } from "../lib/utils";
import { SEED_DB as SEED_DB_INIT, FERTILIZER_DB } from "../data/constants";
import { FieldRangeSelector } from "./Shared";

export default function KalkulatorTab() {
  const [mode, setMode] = useState("sakorn");

  // Såkorn
  const [sk, setSk] = useState({ sort:"Betong vårhvete", fraDaa:"skifte16", tilDaa:"skifte18", tkv:"", spirepct:"", maalDaa:350, customDaa:"" });
  const [seedDB, setSeedDB] = useState(SEED_DB_INIT);
  const [newSortForm, setNewSortForm] = useState({ name:"", tkv:"", spirepct:"", anbDaa:"" });
  const [showNewSort, setShowNewSort] = useState(false);

  // Gjødsel
  const [gj, setGj] = useState({ produkt:"Yara Fullgjødsel 22-3-10", fraDaa:"skifte16", tilDaa:"skifte18", nBehov:12, kgPerDaa:"", customDaa:"" });

  const skData = seedDB[sk.sort] || {};
  const skFields = getFieldsInRange(sk.fraDaa, sk.tilDaa);
  const skTotDaa = sk.customDaa && parseFloat(sk.customDaa) > 0 ? parseFloat(sk.customDaa) : skFields.reduce((s,f) => s+f.area, 0);
  const skTkv = parseFloat(sk.tkv) || skData.tkv || 0;
  const skSpire = parseFloat(sk.spirepct) || skData.spirepct || 97;
  const skMaal = parseFloat(sk.maalDaa) || skData.anbDaa || 350;
  const skKgDaa = skTkv > 0 ? ((skMaal * skTkv) / (skSpire/100 * 1000000) * 1000).toFixed(2) : null;
  const skKgTot = skKgDaa && skTotDaa > 0 ? (parseFloat(skKgDaa) * skTotDaa).toFixed(0) : null;

  const gjData = FERTILIZER_DB[gj.produkt] || {};
  const gjFields = getFieldsInRange(gj.fraDaa, gj.tilDaa);
  const gjTotDaa = gj.customDaa && parseFloat(gj.customDaa) > 0 ? parseFloat(gj.customDaa) : gjFields.reduce((s,f) => s+f.area, 0);
  const gjKgDaa = gjData.N > 0 ? (gj.nBehov / gjData.N * 100).toFixed(1) : null;
  const gjKgTot = gjKgDaa && gjTotDaa > 0 ? (parseFloat(gjKgDaa) * gjTotDaa).toFixed(0) : null;
  const gjN = gjKgDaa ? (parseFloat(gjKgDaa) * gjData.N / 100).toFixed(2) : null;
  const gjP = gjKgDaa && gjData.P ? (parseFloat(gjKgDaa) * gjData.P / 100).toFixed(2) : null;
  const gjK = gjKgDaa && gjData.K ? (parseFloat(gjKgDaa) * gjData.K / 100).toFixed(2) : null;

  return (
    <div>
      <div style={{ display:"flex", gap:0, marginBottom:16, background:"#0f1a0d", borderRadius:6, border:"1px solid #2d4a26", overflow:"hidden" }}>
        {[["sakorn","🌱 Såkorn"],["gjodsel","🌿 Gjødsel"]].map(([k,l]) => (
          <button key={k} onClick={() => setMode(k)}
            style={{ flex:1, background:mode===k?"#2d5a20":"transparent", border:"none", color:mode===k?"#a8d878":"#5a7a4a", padding:"10px 0", cursor:"pointer", fontSize:13, fontWeight:mode===k?"bold":"normal" }}>
            {l}
          </button>
        ))}
      </div>

      {mode === "sakorn" && (
        <div>
          <div style={S.card}>
            <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Såkornkalkulator</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div style={{ gridColumn:"span 2" }}>
                <label style={S.lbl}>Sort</label>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <select value={sk.sort} onChange={e => {
                    const d = seedDB[e.target.value] || {};
                    setSk(p => ({...p, sort:e.target.value, tkv:d.tkv||"", spirepct:d.spirepct||"", maalDaa:d.anbDaa||350}));
                  }} style={{ ...S.inp, flex:1 }}>
                    {Object.keys(seedDB).filter(s => s !== "Annet").map(s => <option key={s}>{s}</option>)}
                    <option value="Annet">+ Legg til ny sort...</option>
                  </select>
                  {sk.sort !== "Annet" && Object.keys(SEED_DB_INIT).indexOf(sk.sort) === -1 && (
                    <button onClick={() => {
                      const next = Object.keys(seedDB).filter(s => s !== sk.sort && s !== "Annet")[0] || "Betong vårhvete";
                      setSeedDB(p => { const n = {...p}; delete n[sk.sort]; return n; });
                      setSk(p => ({...p, sort:next}));
                    }} title="Slett denne sorten" style={{ ...S.bsm, padding:"7px 10px", color:"#7a4a4a", borderColor:"#4a2a2a", flexShrink:0 }}>🗑️</button>
                  )}
                </div>
                {sk.sort === "Annet" && !showNewSort && (
                  <button onClick={() => setShowNewSort(true)} style={{ ...S.btn, marginTop:8, fontSize:11, padding:"6px 14px" }}>＋ Registrer ny sort</button>
                )}
                {showNewSort && (
                  <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:12, marginTop:8 }}>
                    <div style={{ fontSize:11, color:"#a8d878", marginBottom:10 }}>Ny sort</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
                      <div style={{ gridColumn:"span 2" }}><label style={S.lbl}>Sortnavn</label><input type="text" value={newSortForm.name} onChange={e => setNewSortForm(p => ({...p,name:e.target.value}))} placeholder="F.eks. Brage bygg" style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/></div>
                      <div><label style={S.lbl}>TKV (g)</label><input type="number" step="0.1" value={newSortForm.tkv} onChange={e => setNewSortForm(p => ({...p,tkv:e.target.value}))} placeholder="Tusenkornvekt" style={S.inp}/></div>
                      <div><label style={S.lbl}>Spire-%</label><input type="number" step="0.1" value={newSortForm.spirepct} onChange={e => setNewSortForm(p => ({...p,spirepct:e.target.value}))} placeholder="F.eks. 97" style={S.inp}/></div>
                      <div><label style={S.lbl}>Anbefalt frø/m²</label><input type="number" value={newSortForm.anbDaa} onChange={e => setNewSortForm(p => ({...p,anbDaa:e.target.value}))} placeholder="F.eks. 400" style={S.inp}/></div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => {
                        if (!newSortForm.name.trim()) return;
                        const entry = {tkv:parseFloat(newSortForm.tkv)||null, spirepct:parseFloat(newSortForm.spirepct)||97, anbDaa:parseFloat(newSortForm.anbDaa)||350, unit:"frø/m²", kgPerDaa:null};
                        setSeedDB(p => ({...p, [newSortForm.name]:entry}));
                        setSk(p => ({...p, sort:newSortForm.name, tkv:newSortForm.tkv, spirepct:newSortForm.spirepct, maalDaa:newSortForm.anbDaa||350}));
                        setNewSortForm({name:"",tkv:"",spirepct:"",anbDaa:""});
                        setShowNewSort(false);
                      }} style={S.btn}>Lagre sort</button>
                      <button onClick={() => setShowNewSort(false)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
                    </div>
                  </div>
                )}
              </div>
              <div><label style={S.lbl}>Ønsket planteantall (/m²)</label><input type="number" value={sk.maalDaa} onChange={e => setSk(p => ({...p, maalDaa:e.target.value}))} style={S.inp}/></div>
              <div><label style={S.lbl}>TKV (g) {skData.tkv ? `· Std: ${skData.tkv}` : ""}</label><input type="number" step="0.1" value={sk.tkv} onChange={e => setSk(p => ({...p,tkv:e.target.value}))} placeholder={skData.tkv||"Tusenkornvekt"} style={S.inp}/></div>
              <div><label style={S.lbl}>Spire-% {skData.spirepct ? `· Std: ${skData.spirepct}%` : ""}</label><input type="number" step="0.1" value={sk.spirepct} onChange={e => setSk(p => ({...p,spirepct:e.target.value}))} placeholder={skData.spirepct||"Spireprosent"} style={S.inp}/></div>
              <div>
                <label style={S.lbl}>Areal</label>
                <FieldRangeSelector fromId={sk.fraDaa} toId={sk.tilDaa} onFromChange={v => setSk(p => ({...p,fraDaa:v}))} onToChange={v => setSk(p => ({...p,tilDaa:v}))} customDaa={sk.customDaa} onDaaChange={v => setSk(p => ({...p,customDaa:v}))}/>
              </div>
            </div>
            <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:14 }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Resultat</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {[
                  {l:"Areal", v:skTotDaa>0?`${skTotDaa.toFixed(1)} daa`:"—"},
                  {l:"Såmengde/daa", v:skKgDaa?`${skKgDaa} kg`:"—", hi:true},
                  {l:"Total såmengde", v:skKgTot?`${parseFloat(skKgTot).toLocaleString("nb-NO")} kg`:"—", hi:true},
                ].map(x => (
                  <div key={x.l} style={{ textAlign:"center", background:"#152012", borderRadius:5, padding:10 }}>
                    <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{x.l}</div>
                    <div style={{ fontSize:16, color:x.hi?"#a8d878":"#c8dca8", fontWeight:"bold" }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {skKgDaa && <div style={{ fontSize:11, color:"#5a7a4a", marginTop:10 }}>Formel: ({skMaal} frø/m² × {skTkv||skData.tkv} g TKV) ÷ ({skSpire}% spireprosent × 1000 m²/daa) = {skKgDaa} kg/daa</div>}
            </div>
          </div>
        </div>
      )}

      {mode === "gjodsel" && (
        <div>
          <div style={S.card}>
            <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Gjødselkalkulator</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div style={{ gridColumn:"span 2" }}>
                <label style={S.lbl}>Gjødselprodukt</label>
                <select value={gj.produkt} onChange={e => setGj(p => ({...p,produkt:e.target.value}))} style={S.inp}>
                  {Object.keys(FERTILIZER_DB).map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              {gjData.N > 0 && (
                <div style={{ gridColumn:"span 2", background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:5, padding:"8px 12px", fontSize:11, color:"#7a9e6a" }}>
                  Innhold: {gjData.N}% N · {gjData.P||0}% P · {gjData.K||0}% K{gjData.S ? ` · ${gjData.S}% S` : ""}
                </div>
              )}
              <div><label style={S.lbl}>N-behov (kg/daa)</label><input type="number" step="0.5" value={gj.nBehov} onChange={e => setGj(p => ({...p,nBehov:e.target.value}))} style={S.inp}/></div>
              <div>
                <label style={S.lbl}>Areal</label>
                <FieldRangeSelector fromId={gj.fraDaa} toId={gj.tilDaa} onFromChange={v => setGj(p => ({...p,fraDaa:v}))} onToChange={v => setGj(p => ({...p,tilDaa:v}))} customDaa={gj.customDaa} onDaaChange={v => setGj(p => ({...p,customDaa:v}))}/>
              </div>
            </div>
            <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:6, padding:14 }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Resultat</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                {[
                  {l:"Areal", v:gjTotDaa>0?`${gjTotDaa.toFixed(1)} daa`:"—"},
                  {l:"Gjødsel/daa", v:gjKgDaa?`${gjKgDaa} kg`:"—", hi:true},
                  {l:"Total mengde", v:gjKgTot?`${parseFloat(gjKgTot).toLocaleString("nb-NO")} kg`:"—", hi:true},
                ].map(x => (
                  <div key={x.l} style={{ textAlign:"center", background:"#152012", borderRadius:5, padding:10 }}>
                    <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{x.l}</div>
                    <div style={{ fontSize:16, color:x.hi?"#a8d878":"#c8dca8", fontWeight:"bold" }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {gjKgDaa && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[{l:"N/daa",v:`${gjN} kg`,c:"#a8d878"},{l:"P/daa",v:`${gjP} kg`,c:"#f0c878"},{l:"K/daa",v:`${gjK} kg`,c:"#78c8f0"}].map(x => (
                    <div key={x.l} style={{ background:"#152012", borderRadius:5, padding:"6px 10px", textAlign:"center" }}>
                      <div style={{ fontSize:9, color:"#4a6a38", textTransform:"uppercase", marginBottom:2 }}>{x.l}</div>
                      <div style={{ fontSize:13, color:x.c, fontWeight:"bold" }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {gjKgDaa && <div style={{ fontSize:11, color:"#5a7a4a", marginTop:10 }}>Formel: {gj.nBehov} kg N ÷ {gjData.N}% N × 100 = {gjKgDaa} kg {gj.produkt}/daa</div>}
            </div>
            <div style={{ ...S.card, marginTop:12, background:"#0f1a0d" }}>
              <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>NLR-normer N-behov (kg/daa)</div>
              {[
                {v:"Hvete (avling 500 kg/daa)", n:"11-14"},
                {v:"Bygg (avling 500 kg/daa)",  n:"11-13"},
                {v:"Havre (avling 500 kg/daa)", n:"11-13"},
                {v:"Åkerbønner",                n:"0 — nitrogen fikseres"},
              ].map(x => (
                <div key={x.v} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:"1px solid #1a2e16", fontSize:12 }}>
                  <span style={{ color:"#7a9e6a" }}>{x.v}</span>
                  <span style={{ color:"#a8d878", fontWeight:"bold" }}>{x.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
