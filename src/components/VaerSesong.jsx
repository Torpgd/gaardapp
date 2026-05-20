import { useState, useEffect } from "react";
import { Hdr } from "./Shared";
import { S } from "../lib/utils";

const SUPABASE_URL      = "https://zasjbcbkvehhbqydadnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wTSsiXVhL6nPDsdYjRF8Yg_tCYyLzAU";
const VAER_API_URL      = "http://localhost:8765"; // vaer_agent.py på gårds-PC

// ─── SUPABASE HJELPEFUNKSJONER ────────────────────────────────────────────────
async function sbSelect(tabell, params = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabell}?${params}`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return r.ok ? r.json() : [];
}

async function sbInsert(tabell, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabell}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify(data)
  });
  return r.ok ? r.json() : null;
}

async function sbUpdate(tabell, matchParams, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabell}?${matchParams}`, {
    method: "PATCH",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return r.ok;
}

// ─── HJELPKOMPONENTER ─────────────────────────────────────────────────────────
function fmtTid(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("nb-NO", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:20, color:"#7a9e6a" }}>
      <div style={{ width:18, height:18, border:"2px solid #2d4a26", borderTop:"2px solid #a8d878", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <span style={{ fontSize:13 }}>Henter data fra Claude...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RapportVisning({ tekst, tittel, timestamp }) {
  if (!tekst) return null;
  const linjer = tekst.split("\n");
  const elementer = linjer.map((l, i) => {
    if (l.startsWith("## ") || l.startsWith("# ")) {
      const lvl = l.startsWith("## ") ? 2 : 1;
      return (
        <div key={i} style={{ fontSize:lvl===1?16:14, color:lvl===1?"#a8d878":"#f0c878", fontWeight:"bold", marginTop:lvl===1?20:14, marginBottom:6, borderBottom:lvl===1?"1px solid #2d4a26":"none", paddingBottom:lvl===1?4:0 }}>
          {l.replace(/^#{1,2} /, "")}
        </div>
      );
    }
    if (l.startsWith("- ") || l.startsWith("* ")) {
      return (
        <div key={i} style={{ fontSize:13, color:"#c8dca8", paddingLeft:16, marginBottom:3, display:"flex", gap:6 }}>
          <span style={{ color:"#4a7a38", flexShrink:0 }}>·</span>
          <span>{l.replace(/^[-*] /, "")}</span>
        </div>
      );
    }
    if (l.match(/^[🟢🟡🔴]/)) {
      const color = l.startsWith("🟢") ? "#78f0a8" : l.startsWith("🟡") ? "#f0c878" : "#e08080";
      return (
        <div key={i} style={{ fontSize:13, color, background:color+"15", border:`1px solid ${color}44`, borderRadius:5, padding:"6px 12px", marginBottom:4 }}>
          {l}
        </div>
      );
    }
    if (l.trim()) {
      return <p key={i} style={{ fontSize:13, color:"#c8dca8", lineHeight:1.6, margin:"0 0 6px 0" }}>{l}</p>;
    }
    return <div key={i} style={{ height:6 }}/>;
  });

  return (
    <div style={{ background:"#0f1a0d", border:"1px solid #2d4a26", borderRadius:8, padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:6 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>{tittel}</div>
        {timestamp && <div style={{ fontSize:10, color:"#3a5a30" }}>Oppdatert {fmtTid(timestamp)}</div>}
      </div>
      {elementer}
    </div>
  );
}

function SisteMaalingKort({ maaling }) {
  if (!maaling) return null;
  const felt = [
    { l:"Lufttemp",   v:maaling.temp_c       != null ? `${maaling.temp_c}°C`                         : null, c:"#f0c878" },
    { l:"Fuktighet",  v:maaling.fuktighet_pst != null ? `${maaling.fuktighet_pst}%`                   : null, c:"#78c8f0" },
    { l:"Jordtemp",   v:maaling.jordtemp1_c   != null ? `${maaling.jordtemp1_c}°C`                    : null, c:"#a8d878" },
    { l:"Jordfukt",   v:maaling.jordfukt1_pst != null ? `${maaling.jordfukt1_pst}%`                   : null, c:"#c878f0" },
    { l:"Nedbør/dag", v:maaling.nedbor_dag_mm != null ? `${maaling.nedbor_dag_mm} mm`                 : null, c:"#78f0c8" },
    { l:"Vind",       v:maaling.vindstyrke_ms != null ? `${maaling.vindstyrke_ms} m/s`                : null, c:"#f09878" },
    { l:"Sol",        v:maaling.solstraling_wm2 != null ? `${Math.round(maaling.solstraling_wm2)} W/m²` : null, c:"#f0e878" },
  ].filter(f => f.v != null);

  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase" }}>Siste måling</div>
        <div style={{ fontSize:10, color:"#3a5a30" }}>{fmtTid(maaling.timestamp)}</div>
      </div>
      {felt.length > 0
        ? <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
            {felt.map(f => (
              <div key={f.l} style={{ background:"#0f1a0d", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{f.l}</div>
                <div style={{ fontSize:15, color:f.c, fontWeight:"bold" }}>{f.v}</div>
              </div>
            ))}
          </div>
        : <div style={{ fontSize:12, color:"#3a5a30" }}>Ingen måledata tilgjengelig — sjekk at vaer_agent.py kjører</div>
      }
    </div>
  );
}

function JordklarTrafikklys({ tekst }) {
  if (!tekst) return null;
  const linjer = tekst.split("\n").filter(l => l.includes("🟢") || l.includes("🟡") || l.includes("🔴"));
  if (!linjer.length) return null;
  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Jordklar status</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {linjer.map((l, i) => {
          const farge = l.includes("🟢") ? "#78f0a8" : l.includes("🟡") ? "#f0c878" : "#e08080";
          return (
            <div key={i} style={{ fontSize:13, color:farge, background:farge+"15", border:`1px solid ${farge}44`, borderRadius:6, padding:"8px 12px" }}>
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOVEDDKOMPONENT ──────────────────────────────────────────────────────────
export default function VærSesong({ user, back, logout, jordbrukRecs }) {
  const [sesong, setSesong]         = useState(null);
  const [kulturer, setKulturer]     = useState([]);
  const [maaling, setMaaling]       = useState(null);
  const [rapport, setRapport]       = useState(null);
  const [prognose, setPrognose]     = useState(null);
  const [laster, setLaster]         = useState(false);
  const [lasterType, setLasterType] = useState("");
  const [feil, setFeil]             = useState("");
  const [tab, setTab]               = useState("oversikt");
  const [aktiverer, setAktiverer]   = useState(false);

  useEffect(() => { lastData(); }, []);

  useEffect(() => {
    if (sesong) synkKulturer();
  }, [sesong, jordbrukRecs]);

  async function lastData() {
    const sesonger = await sbSelect("vekstsesong", "aktiv=eq.true&order=id.desc&limit=1");
    const aktivSesong = sesonger?.[0] || null;
    setSesong(aktivSesong);

    if (aktivSesong) {
      const k = await sbSelect("sesong_kulturer", `sesong_id=eq.${aktivSesong.id}&aktiv=eq.true`);
      setKulturer(k || []);
    }

    // Siste måling fra vaer_agent.py
    try {
      const r = await fetch(`${VAER_API_URL}/api/siste_maaling`);
      if (r.ok) setMaaling(await r.json());
    } catch {
      // vaer_agent.py ikke tilgjengelig — viser melding i kortvisning
    }

    // Siste ukesrapport fra Supabase
    const rapporter = await sbSelect("vekstrapporter", "order=rapport_dato.desc&limit=1");
    if (rapporter?.[0]) setRapport(rapporter[0]);
  }

  async function synkKulturer() {
    if (!sesong) return;
    const saainger = jordbrukRecs?.filter(r => r.type === "Såing") || [];
    for (const s of saainger) {
      const eksisterende = kulturer.find(k => k.kultur === s.crop);
      if (!eksisterende) {
        await sbInsert("sesong_kulturer", {
          sesong_id:   sesong.id,
          kultur:      s.crop,
          from_skifte: s.from_skifte,
          to_skifte:   s.to_skifte,
          areal_daa:   s.customDaa ? parseFloat(s.customDaa) : null,
          saato:       s.date,
          aktiv:       true
        });
      } else if (!eksisterende.saato) {
        await sbUpdate("sesong_kulturer", `id=eq.${eksisterende.id}`, { saato: s.date });
      }
    }
    const hostinger = jordbrukRecs?.filter(r => r.type === "Høsting") || [];
    for (const h of hostinger) {
      const k = kulturer.find(x => x.kultur === h.crop);
      if (k && !k.hostedato) {
        await sbUpdate("sesong_kulturer", `id=eq.${k.id}`, { hostedato: h.date, aktiv: false });
      }
    }
    const oppdatert = await sbSelect("sesong_kulturer", `sesong_id=eq.${sesong.id}&aktiv=eq.true`);
    if (oppdatert?.length === 0 && kulturer.length > 0) {
      await sbUpdate("vekstsesong", `id=eq.${sesong.id}`, {
        aktiv: false, deaktivert_dato: new Date().toISOString().slice(0, 10)
      });
      setSesong(null);
      setKulturer([]);
    }
  }

  async function aktiverSesong() {
    setAktiverer(true);
    const ny = await sbInsert("vekstsesong", {
      ar:            new Date().getFullYear(),
      aktiv:         true,
      aktivert_dato: new Date().toISOString().slice(0, 10),
      aktivert_av:   user.name
    });
    if (ny?.[0]) { setSesong(ny[0]); setKulturer([]); }
    setAktiverer(false);
  }

  async function hentPrognose(type) {
    setLaster(true); setLasterType(type); setFeil("");
    try {
      const r = await fetch(`${VAER_API_URL}/api/prognose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      if (r.ok) {
        const data = await r.json();
        setPrognose({ ...data, type });
        setTab("prognose");
      } else {
        setFeil("Kunne ikke hente prognose — sjekk at vaer_agent.py kjører");
      }
    } catch {
      setFeil("Tilkoblingsfeil — sjekk at vaer_agent.py kjører på port 8765");
    }
    setLaster(false);
  }

  const saaddeKulturer = kulturer.filter(k => k.saato);
  const alleHostet     = kulturer.length > 0 && kulturer.every(k => k.hostedato);

  return (
    <div style={S.wrap}>
      <Hdr title="Vær & Vekstsesong" icon="🌤️" color="#78c8f0" onBack={back} user={user} onLogout={logout}>
        <div style={{ display:"flex", overflowX:"auto", marginTop:6 }}>
          {[["oversikt","Oversikt"],["prognose","Prognose"],["rapport","Ukesrapport"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background:"none", border:"none", borderBottom:tab===k?"2px solid #78c8f0":"2px solid transparent", color:tab===k?"#78c8f0":"#5a7a4a", padding:"7px 14px", cursor:"pointer", fontSize:12, letterSpacing:1, textTransform:"uppercase", whiteSpace:"nowrap" }}>
              {l}
            </button>
          ))}
        </div>
      </Hdr>

      <div style={{ maxWidth:820, margin:"0 auto", padding:16 }}>
        {feil && (
          <div style={{ background:"#3a1a1a", border:"1px solid #7a3a3a", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#e08080" }}>
            ⚠️ {feil}
          </div>
        )}

        {/* ── OVERSIKT ── */}
        {tab === "oversikt" && (
          <div>
            {/* Sesongstyring */}
            <div style={{ ...S.card, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>
                    Vekstsesong {new Date().getFullYear()}
                  </div>
                  <div style={{ fontSize:14, color:sesong?"#a8d878":"#5a4a2a" }}>
                    {sesong
                      ? `🌱 Aktiv siden ${sesong.aktivert_dato}`
                      : alleHostet
                        ? "✅ Avsluttet — all innhøsting registrert"
                        : "⏸ Ikke aktivert"
                    }
                  </div>
                </div>
                {!sesong && (
                  <button onClick={aktiverSesong} disabled={aktiverer}
                    style={{ ...S.btn, background:"#1a4a2a", borderColor:"#2a8a4a", color:"#78f0a8", padding:"10px 20px", fontSize:13, opacity:aktiverer?0.6:1 }}>
                    {aktiverer ? "Aktiverer..." : "🌱 Aktiver vekstsesong"}
                  </button>
                )}
              </div>

              {sesong && saaddeKulturer.length > 0 && (
                <div style={{ marginTop:12, borderTop:"1px solid #2d4a26", paddingTop:10 }}>
                  <div style={{ fontSize:10, color:"#4a6a38", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Aktive kulturer</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {saaddeKulturer.map(k => (
                      <div key={k.id} style={{ background:"#0f1a0d", borderRadius:5, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontSize:13, color:"#c8dca8" }}>{k.kultur}</span>
                          <span style={{ fontSize:11, color:"#5a7a4a", marginLeft:10 }}>Sådd {k.saato}</span>
                        </div>
                        <div style={{ fontSize:11, color:"#a8d878" }}>{k.areal_daa ? `${k.areal_daa} daa` : ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Siste måling */}
            <SisteMaalingKort maaling={maaling}/>

            {/* Handlingsknapper — bare synlig når sesong er aktiv */}
            {sesong && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                <button onClick={() => hentPrognose("jordklar")} disabled={laster}
                  style={{ ...S.btn, background:"#1a3a18", borderColor:"#2a6a2a", color:"#78f0a8", padding:"14px 10px", fontSize:12, textAlign:"center", opacity:laster?0.6:1 }}>
                  {laster && lasterType==="jordklar" ? <Spinner/> : "🌿 Sjekk jordklar status"}
                </button>
                <button onClick={() => hentPrognose("full")} disabled={laster}
                  style={{ ...S.btn, background:"#1a2a3a", borderColor:"#2a4a6a", color:"#78c8f0", padding:"14px 10px", fontSize:12, textAlign:"center", opacity:laster?0.6:1 }}>
                  {laster && lasterType==="full" ? <Spinner/> : "🌤️ Hent værdata og prognoser"}
                </button>
                {saaddeKulturer.length > 0 && (
                  <button onClick={() => hentPrognose("vekst")} disabled={laster}
                    style={{ ...S.btn, background:"#2a1a3a", borderColor:"#5a3a6a", color:"#c878f0", padding:"14px 10px", fontSize:12, textAlign:"center", gridColumn:"span 2", opacity:laster?0.6:1 }}>
                    {laster && lasterType==="vekst" ? <Spinner/> : "🌱 Hent vekststatus og tiltak"}
                  </button>
                )}
              </div>
            )}

            {/* Siste rapport — kortvisning */}
            {rapport && (
              <div style={S.card}>
                <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>
                  Siste ukesrapport — {rapport.rapport_dato}
                </div>
                <div style={{ fontSize:12, color:"#c8dca8", lineHeight:1.6 }}>
                  {rapport.full_rapport?.slice(0, 300)}...
                </div>
                <button onClick={() => setTab("rapport")} style={{ ...S.bsm, marginTop:10, fontSize:11, padding:"5px 12px" }}>
                  Les full rapport →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PROGNOSE ── */}
        {tab === "prognose" && (
          <div>
            {sesong && (
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                {[
                  { t:"jordklar", l:"🌿 Jordklar status",       bg:"#1a3a18", cl:"#78f0a8" },
                  { t:"vekst",    l:"🌱 Vekststatus",            bg:"#2a1a3a", cl:"#c878f0" },
                  { t:"full",     l:"🌤️ Full oppdatering",      bg:"#1a2a3a", cl:"#78c8f0" },
                ].map(({ t, l, bg, cl }) => (
                  <button key={t} onClick={() => hentPrognose(t)} disabled={laster}
                    style={{ ...S.btn, background:bg, borderColor:cl+"88", color:cl, padding:"8px 16px", fontSize:12, opacity:laster?0.6:1 }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            {laster && <Spinner/>}
            {prognose && !laster && (
              <>
                {prognose.type === "jordklar" && <JordklarTrafikklys tekst={prognose.rapport}/>}
                <RapportVisning
                  tekst={prognose.rapport}
                  tittel={prognose.type==="jordklar" ? "Jordklar vurdering" : prognose.type==="vekst" ? "Vekststatus og tiltak" : "Full vær og vekstoppdatering"}
                  timestamp={prognose.timestamp}
                />
              </>
            )}
            {!prognose && !laster && (
              <div style={{ textAlign:"center", color:"#3a5a30", padding:40, fontSize:13 }}>
                {sesong ? "Trykk en av knappene over for å hente prognose fra Claude" : "Aktiver vekstsesong fra Oversikt-fanen først"}
              </div>
            )}
          </div>
        )}

        {/* ── UKESRAPPORT ── */}
        {tab === "rapport" && (
          <div>
            {rapport
              ? <RapportVisning tekst={rapport.full_rapport} tittel={`Ukesrapport — ${rapport.rapport_dato}`} timestamp={rapport.generert_kl}/>
              : <div style={{ textAlign:"center", color:"#3a5a30", padding:40 }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
                  <div style={{ fontSize:13 }}>
                    {sesong
                      ? "Ingen ukesrapport ennå. Første rapport kommer mandag kl. 05:00 etter at såing er registrert."
                      : "Aktiver vekstsesong for å starte ukentlige rapporter."
                    }
                  </div>
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
