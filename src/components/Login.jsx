import { useState } from "react";
import { Avatar } from "./Shared";
import { S } from "../lib/utils";

export default function Login({ workers, onLogin }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const s = workers.find(w => w.id === sel);

  function dig(d) {
    if (pin.length >= 4) return;
    const n = pin + d;
    setPin(n);
    setErr("");
    if (n.length === 4) setTimeout(() => {
      if (n === s?.pin) onLogin(s);
      else { setErr("Feil PIN"); setPin(""); }
    }, 120);
  }

  const base = { minHeight:"100vh", background:"#0f1a0d", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"Georgia,serif" };
  const card = { background:"#152012", border:"1px solid #2d4a26", borderRadius:16, padding:"32px 28px", width:"100%", maxWidth:340, display:"flex", flexDirection:"column", alignItems:"center" };

  if (!sel) return (
    <div style={base}>
      <div style={card}>
        <div style={{ fontFamily:"'Dancing Script',cursive", fontSize:36, color:"#a8d878", marginBottom:6 }}>Torp Gårdsrift</div>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:20 }}>Hvem er du?</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
          {workers.map(w => (
            <button key={w.id} onClick={() => setSel(w.id)}
              style={{ display:"flex", alignItems:"center", gap:10, background:"#1a2e16", border:"1px solid #2d4a26", borderRadius:10, padding:"10px 14px", cursor:"pointer", width:"100%" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = w.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#2d4a26"}>
              <Avatar w={w} size={34}/>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:14, color:"#d4e8b0" }}>{w.name}</div>
                <div style={{ fontSize:10, color:"#5a7a4a", letterSpacing:1 }}>{w.is_admin ? "ADMINISTRATOR" : "ARBEIDER"}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop:14, fontSize:10, color:"#2d4a26" }}>PREVIEW · Jon: 1234 · Christian: 3456</div>
      </div>
    </div>
  );

  return (
    <div style={base}>
      <div style={card}>
        <div style={{ fontFamily:"'Dancing Script',cursive", fontSize:36, color:"#a8d878", marginBottom:16 }}>Torp Gårdsrift</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <Avatar w={s} size={32}/>
          <div>
            <div style={{ fontSize:14, color:"#d4e8b0" }}>{s.name}</div>
            <button onClick={() => { setSel(null); setPin(""); setErr(""); }} style={{ background:"none", border:"none", color:"#5a7a4a", cursor:"pointer", fontSize:11, padding:0 }}>← Bytt</button>
          </div>
        </div>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Skriv inn PIN</div>
        <div style={{ display:"flex", gap:12, marginBottom:18 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:15, height:15, borderRadius:"50%", background:pin.length > i ? s.color : "transparent", border:`2px solid ${pin.length > i ? s.color : "#3a5a30"}`, transition:"all 0.15s" }}/>
          ))}
        </div>
        {err && <div style={{ fontSize:12, color:"#e8a0a0", marginBottom:10 }}>{err}</div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, width:190 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i) => (
            <button key={i}
              onClick={() => { if (d === "⌫") { setPin(p => p.slice(0,-1)); setErr(""); } else if (d !== "") dig(String(d)); }}
              disabled={d === ""}
              style={{ background:d === "" ? "transparent" : "#1a2e16", border:d === "" ? "none" : "1px solid #2d4a26", borderRadius:7, padding:"13px 0", color:"#d4e8b0", fontSize:17, cursor:d === "" ? "default" : "pointer" }}
              onMouseEnter={e => { if (d !== "") e.currentTarget.style.background = "#2d4a26"; }}
              onMouseLeave={e => { if (d !== "") e.currentTarget.style.background = "#1a2e16"; }}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
