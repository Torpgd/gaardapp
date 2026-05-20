import { useState } from "react";
import { S } from "../lib/utils";
import { BBCH_GUIDE } from "../data/bbch";

// ─── Alle BBCH-stadier i rekkefølge ──────────────────────────────────────────
const BBCH_ORDER = [
  "Z0","Z5","Z10","Z11","Z12","Z13","Z15",
  "Z20","Z21","Z25","Z29",
  "Z30","Z31","Z32","Z37","Z39",
  "Z41","Z51","Z65",
  "Z71","Z83","Z87",
  "Å10","Å15","Å51","Å75","Å87",
  "blomstring"
];

// Normaliser BBCH-referanse — håndter lange og korte bindestreker
function normaliser(s) {
  return s.replace(/–/g, "-").replace(/\s/g, "").toUpperCase()
    .replace("Å", "Å"); // behold Å
}

// Parse enkeltstadie fra tekst, f.eks. "Z37" → "Z37", "Z37-Z55" → range
function parseStadie(raw) {
  const n = raw.replace(/–/g, "-");
  // Range: Z37-Z55 eller Z37–Z55
  const rangeMatch = n.match(/^(Z\d+|Å\d+|BLOMSTRING)[-–](Z\d+|Å\d+)$/i);
  if (rangeMatch) return { type:"range", fra:rangeMatch[1].toUpperCase(), til:rangeMatch[2].toUpperCase() };
  // Enkelt
  const enkeltMatch = n.match(/^(Z\d+|Å\d+|BLOMSTRING)$/i);
  if (enkeltMatch) return { type:"enkelt", key:enkeltMatch[1].toUpperCase() };
  return null;
}

// Finn alle BBCH-nøkler mellom fra og til (inklusiv)
function hentRange(fra, til) {
  const fi = BBCH_ORDER.indexOf(fra);
  const ti = BBCH_ORDER.indexOf(til);
  if (fi < 0 || ti < 0) {
    // Prøv bare fra og til direkte
    return [fra, til].filter(k => BBCH_GUIDE[k]);
  }
  return BBCH_ORDER.slice(Math.min(fi,ti), Math.max(fi,ti)+1).filter(k => BBCH_GUIDE[k]);
}

// Hent alle guider for en BBCH-referanse (enkelt eller range)
function hentGuider(stadier) {
  const parsed = parseStadie(stadier);
  if (!parsed) return [];
  if (parsed.type === "enkelt") {
    const g = BBCH_GUIDE[parsed.key];
    return g ? [{ key: parsed.key, ...g }] : [];
  }
  if (parsed.type === "range") {
    return hentRange(parsed.fra, parsed.til)
      .map(k => BBCH_GUIDE[k] ? { key:k, ...BBCH_GUIDE[k] } : null)
      .filter(Boolean);
  }
  return [];
}

// ─── BBCHKORT ─────────────────────────────────────────────────────────────────
export function BbchKort({ stadier, style }) {
  const [open, setOpen] = useState(false);
  if (!stadier) return null;

  const guider = hentGuider(stadier);

  if (guider.length === 0) {
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
          <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:12, padding:20, maxWidth:440, width:"100%", maxHeight:"85vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:13, color:"#78c8f0", fontWeight:"bold" }}>📋 Vekststadier — {stadier}</div>
              <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#5a7a4a", cursor:"pointer", fontSize:18, padding:0 }}>✕</button>
            </div>

            {guider.length > 1 && (
              <div style={{ background:"#0a1a0a", border:"1px solid #2d4a26", borderRadius:6, padding:"8px 12px", marginBottom:12, fontSize:11, color:"#7a9e6a" }}>
                Perioden {stadier} dekker {guider.length} vekststadier — se alle under
              </div>
            )}

            {guider.map((g, i) => (
              <div key={i} style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:11, color:"#5a7a4a", background:"#0a1a0a", border:"1px solid #2d4a26", borderRadius:4, padding:"1px 7px" }}>{g.key}</span>
                  <span style={{ fontSize:14, color:"#a8d878", fontWeight:"bold" }}>{g.navn}</span>
                </div>
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

// ─── BBCHTEKST ────────────────────────────────────────────────────────────────
/**
 * Erstatter alle BBCH-referanser i tekst med klikkbare badges.
 * Støtter: Z30, Z30-Z32, Z30–Z32, blomstring
 */
export function BbchTekst({ tekst, style }) {
  if (!tekst) return null;

  // Regex som matcher:
  // - Range: Z37-Z55, Z37–Z55, Z10-Z15
  // - Enkelt: Z30, Z37, Å15
  // - Blomstring
  const regex = /(Z\d+[–\-]Z\d+|Å\d+[–\-]Å\d+|Z\d+|Å\d+|blomstring)/gi;
  const deler = tekst.split(regex);

  return (
    <span style={style}>
      {deler.map((del, i) => {
        if (!del) return null;
        // Sjekk om denne delen matcher BBCH
        if (regex.test(del) || /^(Z\d+[–\-]Z\d+|Z\d+|Å\d+|blomstring)$/i.test(del)) {
          const guider = hentGuider(del);
          if (guider.length > 0) {
            return <BbchKort key={i} stadier={del} style={{ marginLeft:2, marginRight:2 }}/>;
          }
        }
        return <span key={i}>{del}</span>;
      })}
    </span>
  );
}
