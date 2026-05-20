import { AS, FIELDS } from "../data/constants";

// ─── HJELPEFUNKSJONER ─────────────────────────────────────────────────────────

export function gwfd(w, d) {
  if (w?.birthdate) {
    const s = AS.find(x => {
      const b = new Date(w.birthdate), wk = d ? new Date(d) : new Date();
      let a = wk.getFullYear() - b.getFullYear();
      const m = wk.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && wk.getDate() < b.getDate())) a--;
      return a >= x.a && a <= x.b;
    });
    if (s && s.s !== null) return s.s;
    if (s && s.s === null) return w.wage;
  }
  return w?.wage || 177.80;
}

export function fd(m) {
  const h = Math.floor(m / 60), r = m % 60;
  return h > 0 ? `${h}t ${r}m` : `${r}m`;
}

export function fmt(d) {
  return new Date(d).toLocaleDateString("nb-NO", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });
}

export function fnok(a) {
  return new Intl.NumberFormat("nb-NO", { style:"currency", currency:"NOK", maximumFractionDigits:0 }).format(a);
}

export function ini(n) {
  return n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2);
}

export function uid() {
  return String(Date.now() + Math.random());
}

export function fieldName(id) {
  return FIELDS.find(f => f.id === id)?.name || id;
}

export function getFieldsInRange(fromId, toId) {
  const fi = FIELDS.findIndex(f => f.id === fromId);
  const ti = FIELDS.findIndex(f => f.id === toId);
  if (fi < 0 || ti < 0) return [];
  return FIELDS.slice(Math.min(fi, ti), Math.max(fi, ti) + 1);
}

export function getEffectiveDaa(rec) {
  if (rec?.customDaa && parseFloat(rec.customDaa) > 0) return parseFloat(rec.customDaa);
  const fields = getFieldsInRange(rec?.from_skifte, rec?.to_skifte);
  return fields.reduce((s, f) => s + f.area, 0);
}

export function getCompat(a, b, COMPAT) {
  return COMPAT[a]?.[b] || COMPAT[b]?.[a] || null;
}

// ─── FELLES STILOBJEKT ────────────────────────────────────────────────────────
export const S = {
  wrap:  { minHeight:"100vh", background:"#0f1a0d", color:"#e8ead4", fontFamily:"Georgia,serif" },
  card:  { background:"#152012", border:"1px solid #2d4a26", borderRadius:8, padding:16, marginBottom:10 },
  lbl:   { display:"block", fontSize:10, letterSpacing:2, color:"#5a7a4a", textTransform:"uppercase", marginBottom:4 },
  inp:   { background:"#0f1a0d", border:"1px solid #2d4a26", color:"#d4e8b0", padding:"7px 9px", borderRadius:5, fontSize:13, width:"100%", boxSizing:"border-box", outline:"none" },
  btn:   { background:"#2d5a20", border:"1px solid #4a8a30", color:"#a8d878", padding:"9px 18px", borderRadius:6, cursor:"pointer", fontSize:13 },
  bsm:   { background:"#1a2e16", border:"1px solid #2d4a26", color:"#7a9e6a", padding:"4px 10px", borderRadius:4, cursor:"pointer", fontSize:10 },
  tag:   { fontSize:9, letterSpacing:1, textTransform:"uppercase", background:"#1e3a18", border:"1px solid #2d4a26", color:"#5a7a4a", padding:"1px 6px", borderRadius:3 },
};
