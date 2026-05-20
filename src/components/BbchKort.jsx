import { useState } from "react";
import { S } from "../lib/utils";
import { BBCH_GUIDE, BBCH_ALIASES } from "../data/bbch";

/**
 * Inline BBCH-stadiekort med klikk-for-info.
 * Bruk: <BbchKort stadier="Z30–Z32" />
 * Viser en klikkbar badge — trykk for å åpne forklaringskort.
 */
export function BbchKort({ stadier, style }) {
  const [open, setOpen] = useState(false);
  if (!stadier) return null;

  // Finn relevante stadier fra BBCH_GUIDE
  const keys = BBCH_ALIASES[stadier] || [stadier];
  const guider = keys.map(k => BBCH_GUIDE[k]).filter(Boolean);

  if (guider.length === 0) {
    // Ingen guide — vis bare tekst
    return <span style={{ fontSize:11, color:"#7a9e6a", ...style }}>⏱ {stadier}</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ fontSize:10, color:"#78c8f0", background:"#0a1a2a", border:"1px solid #2a4a6a", borderRadius:4, padding:"2px 8px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, ...style }}
      >
        ⏱ {stadier} <span style={{ fontSize:9, opacity:0.7 }}>ℹ</span>
      </button>

      {open && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}
          onClick={() => setOpen(false)}>
          <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:12, padding:20, maxWidth:420, width:"100%", maxHeight:"80vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:13, color:"#78c8f0", fontWeight:"bold", letterSpacing:1 }}>📋 Vekststadier — {stadier}</div>
              <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#5a7a4a", cursor:"pointer", fontSize:18, padding:0 }}>✕</button>
            </div>
            {guider.map((g, i) => (
              <div key={i} style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ fontSize:14, color:"#a8d878", fontWeight:"bold", marginBottom:6 }}>{g.navn}</div>
                <div style={{ fontSize:12, color:"#c8dca8", marginBottom:8, lineHeight:1.5 }}>{g.kort}</div>
                {g.tegn?.length > 0 && (
                  <div style={{ marginBottom:g.tips?8:0 }}>
                    <div style={{ fontSize:10, color:"#5a7a4a", letterSpacing:1, textTransform:"uppercase", marginBottom:5 }}>Slik sjekker du:</div>
                    {g.tegn.map((t, j) => (
                      <div key={j} style={{ display:"flex", gap:8, marginBottom:4 }}>
                        <span style={{ color:"#4a8a40", flexShrink:0 }}>✓</span>
                        <span style={{ fontSize:12, color:"#a8c898", lineHeight:1.4 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
                {g.tips && (
                  <div style={{ background:"#1a2e10", border:"1px solid #3a5a20", borderRadius:5, padding:"7px 10px", marginTop:6 }}>
                    <span style={{ fontSize:11, color:"#f0c878" }}>💡 {g.tips}</span>
                  </div>
                )}
              </div>
            ))}
            <div style={{ fontSize:10, color:"#3a5a30", marginTop:4, textAlign:"center" }}>
              Kilde: BBCH-skalaen (NLR / Bioforsk)
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Wrapper som erstatter tekst som inneholder BBCH-referanser
 * med klikkbare BbchKort-badges.
 * Bruk: <BbchTekst tekst="Brukes Z30–Z32." />
 */
export function BbchTekst({ tekst, style }) {
  if (!tekst) return null;
  const alle = Object.keys(BBCH_ALIASES).concat(
    ["Z10","Z11","Z12","Z13","Z15","Z20","Z21","Z25","Z29",
     "Z30","Z31","Z32","Z37","Z39","Z41","Z51","Z65","Z71","Z83","Z87",
     "blomstring"]
  );
  // Sorter etter lengde (lengst først) for å unngå delvis match
  const sorted = alle.sort((a,b) => b.length - a.length);
  const regex = new RegExp(`(${sorted.map(s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join("|")})`, "g");
  const deler = tekst.split(regex);
  return (
    <span style={style}>
      {deler.map((del, i) =>
        alle.includes(del)
          ? <BbchKort key={i} stadier={del} style={{ marginLeft:2, marginRight:2 }}/>
          : <span key={i}>{del}</span>
      )}
    </span>
  );
}
