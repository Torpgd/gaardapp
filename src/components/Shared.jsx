import { useState, useRef } from "react";
import { S, uid, ini, getFieldsInRange } from "../lib/utils";
import { FIELDS } from "../data/constants";

// ─── FILVEDLEGG ───────────────────────────────────────────────────────────────
export function FileUpload({ files, setFiles }) {
  const ref = useRef();
  function handle(e) {
    const nf = Array.from(e.target.files).map(f => ({
      id: uid(), name: f.name, type: f.type, size: f.size,
      url: URL.createObjectURL(f),
      isImage: f.type.startsWith("image/"),
      isPdf: f.type === "application/pdf",
    }));
    setFiles(p => [...p, ...nf]);
    e.target.value = "";
  }
  return (
    <div>
      <input ref={ref} type="file" multiple accept="image/*,.pdf" onChange={handle} style={{ display:"none" }}/>
      <button onClick={() => ref.current.click()} style={{ ...S.bsm, display:"flex", alignItems:"center", gap:5, padding:"4px 10px", fontSize:10 }}>
        📎 Legg til fil
      </button>
      {files?.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
          {files.map(f => <FThumb key={f.id} file={f} onRemove={() => setFiles(p => p.filter(x => x.id !== f.id))}/>)}
        </div>
      )}
    </div>
  );
}

export function FThumb({ file, onRemove }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ position:"relative", cursor:"pointer" }} onClick={() => setOpen(true)}>
        {file.isImage
          ? <img src={file.url} alt={file.name} style={{ width:60, height:60, objectFit:"cover", borderRadius:5, border:"1px solid #2d4a26" }}/>
          : <div style={{ width:60, height:60, background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:5, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
              <span style={{ fontSize:20 }}>📄</span>
              <span style={{ fontSize:7, color:"#5a7a4a", textAlign:"center", padding:"0 3px", wordBreak:"break-all" }}>{file.name.slice(0,10)}</span>
            </div>
        }
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ position:"absolute", top:-5, right:-5, background:"#3a1a1a", border:"1px solid #7a3a3a", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:9, color:"#e08080", padding:0 }}>
          ✕
        </button>
      </div>
      {open && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }} onClick={() => setOpen(false)}>
          {file.isImage
            ? <img src={file.url} alt={file.name} style={{ maxWidth:"90vw", maxHeight:"85vh", objectFit:"contain", borderRadius:8 }}/>
            : <div style={{ background:"#152012", borderRadius:8, padding:24, textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>📄</div>
                <div style={{ color:"#d4e8b0", marginBottom:14 }}>{file.name}</div>
                <a href={file.url} target="_blank" rel="noreferrer" style={{ ...S.btn, textDecoration:"none", display:"inline-block" }} onClick={e => e.stopPropagation()}>Åpne PDF</a>
              </div>
          }
        </div>
      )}
    </>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ w, size = 28 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:w.color+"33", border:`1px solid ${w.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, color:w.color, fontWeight:"bold", flexShrink:0 }}>
      {ini(w.name)}
    </div>
  );
}

// ─── TOPPNAVIGASJON ───────────────────────────────────────────────────────────
export function Hdr({ title, icon, color, onBack, user, onLogout, children }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#1a2e16,#0f1a0d)", borderBottom:"1px solid #2d4a26", padding:"14px 16px 0" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:"#5a7a4a", cursor:"pointer", fontSize:22, padding:0 }}>←</button>
            <span style={{ fontSize:20 }}>{icon}</span>
            <span style={{ fontFamily:"'Dancing Script',cursive", fontSize:26, color:color||"#a8d878" }}>{title}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"#4a6a38" }}>{user.name}</span>
            <button onClick={onLogout} style={{ background:"none", border:"none", color:"#3a5a30", cursor:"pointer", fontSize:11 }}>Logg ut</button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── SKIFTEVELGER ─────────────────────────────────────────────────────────────
export function FieldRangeSelector({ fromId, toId, onFromChange, onToChange, customDaa, onDaaChange }) {
  const rangeFields = getFieldsInRange(fromId, toId);
  const calcDaa = rangeFields.reduce((s, f) => s + f.area, 0);
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:6 }}>
        <div style={{ flex:1 }}>
          <label style={S.lbl}>Fra skifte</label>
          <select value={fromId} onChange={e => onFromChange(e.target.value)} style={S.inp}>
            {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <label style={S.lbl}>Til skifte</label>
          <select value={toId} onChange={e => onToChange(e.target.value)} style={S.inp}>
            {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
        <div style={{ flex:1, background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:5, padding:"5px 10px", fontSize:11, color:"#5a7a4a", alignSelf:"stretch", display:"flex", alignItems:"center" }}>
          📐 {calcDaa.toFixed(1)} daa fra skifter
          {customDaa && parseFloat(customDaa) > 0 && (
            <span style={{ color:"#f0c878", marginLeft:6 }}>→ <strong>{parseFloat(customDaa).toFixed(1)} daa</strong> brukes</span>
          )}
        </div>
        {onDaaChange !== undefined && (
          <div style={{ width:105, flexShrink:0 }}>
            <label style={S.lbl}>Overstyr daa</label>
            <input type="number" step="0.1" min="0" value={customDaa||""} onChange={e => onDaaChange(e.target.value)} placeholder={calcDaa.toFixed(1)} style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}/>
          </div>
        )}
      </div>
    </div>
  );
}
