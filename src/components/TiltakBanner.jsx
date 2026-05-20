import { useState } from "react";
import { S } from "../lib/utils";

const PRIORITET_FARGE = { "Høy": "#e08080", "Middels": "#f0c878", "Lav": "#7a9e6a" };
const KATEGORI_FARGE  = {
  "sprøyting": "#c878f0", "gjødsling": "#f0c878",
  "inspeksjon": "#a8d878", "annet": "#78c8f0"
};

/**
 * Viser aktive tiltak fra tiltak-tabellen.
 * Props:
 *   tiltak            — liste fra useTiltak()
 *   laster            — boolean
 *   feil              — string
 *   markerUtfort      — async fn(id, utfortAv, notat)
 *   markerIkkeAktuelt — async fn(id, notat)
 *   filter            — "sprøyting" | "sopp" | "gjødsling" | "alle" (default "alle")
 *   user              — bruker-objekt (for å sette status_av)
 */
export default function TiltakBanner({
  tiltak, laster, feil,
  markerUtfort, markerIkkeAktuelt,
  filter = "alle",
  user
}) {
  const [bekreft, setBekreft] = useState(null); // { id, type } — modal
  const [notat, setNotat]     = useState("");
  const [lagrer, setLagrer]   = useState(false);

  if (laster) return null;
  if (feil)   return null;

  // Filtrer basert på hvilken fane vi er i
  let synlige = tiltak;
  if (filter === "sprøyting") {
    synlige = tiltak.filter(t => t.kategori === "sprøyting");
  } else if (filter === "sopp") {
    synlige = tiltak.filter(t =>
      (t.kategori === "sprøyting" && t.type === "Sopp") ||
      (t.kategori === "inspeksjon" && (
        t.tittel?.toLowerCase().includes("sopp") ||
        t.tittel?.toLowerCase().includes("sjukdom") ||
        t.tittel?.toLowerCase().includes("blad")
      ))
    );
  } else if (filter === "gjødsling") {
    synlige = tiltak.filter(t => t.kategori === "gjødsling");
  }

  if (synlige.length === 0) {
    return (
      <div style={{ background:"#1a1a0f", border:"1px solid #2d2a10", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:11, color:"#4a4a30" }}>
        📋 Ingen aktive anbefalinger — nye tiltak hentes mandag kl. 05:00 fra ukesrapporten.
      </div>
    );
  }

  async function bekreftHandling() {
    if (!bekreft) return;
    setLagrer(true);
    if (bekreft.type === "utfort") {
      await markerUtfort(bekreft.id, user?.name || "", notat);
    } else {
      await markerIkkeAktuelt(bekreft.id, notat);
    }
    setLagrer(false);
    setBekreft(null);
    setNotat("");
  }

  return (
    <>
      <div style={{ background:"#0f1a10", border:"1px solid #2d4a1a", borderRadius:8, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ fontSize:16 }}>📋</span>
          <span style={{ fontSize:11, color:"#5a8a4a", letterSpacing:2, textTransform:"uppercase" }}>
            Aktive anbefalinger ({synlige.length})
          </span>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {synlige.map(t => {
            const pfarge = PRIORITET_FARGE[t.prioritet] || "#7a9e6a";
            const kfarge = KATEGORI_FARGE[t.kategori]   || "#78c8f0";
            return (
              <div key={t.id} style={{ background:"#152012", border:`1px solid ${pfarge}33`, borderLeft:`3px solid ${pfarge}`, borderRadius:5, padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1 }}>
                    {/* Kategori + prioritet */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ ...S.tag, color:kfarge, borderColor:kfarge+"44", fontSize:9 }}>
                        {t.kategori}{t.type ? ` · ${t.type}` : ""}
                      </span>
                      {t.kultur && (
                        <span style={{ ...S.tag, color:"#a8d878", borderColor:"#2d4a26", fontSize:9 }}>
                          {t.kultur}
                        </span>
                      )}
                      <span style={{ fontSize:10, color:pfarge, background:pfarge+"15", border:`1px solid ${pfarge}44`, borderRadius:3, padding:"1px 6px" }}>
                        {t.prioritet}
                      </span>
                    </div>

                    {/* Tittel */}
                    <div style={{ fontSize:13, color:"#d4e8b0", fontWeight:"bold", marginBottom:3 }}>
                      {t.middel || t.tittel}
                    </div>

                    {/* Detaljer */}
                    {t.dose && (
                      <div style={{ fontSize:11, color:"#7a9e6a", marginBottom:2 }}>
                        💧 {t.dose}
                        {t.tidspunkt ? ` · ⏱ ${t.tidspunkt}` : ""}
                      </div>
                    )}
                    {!t.dose && t.tidspunkt && (
                      <div style={{ fontSize:11, color:"#7a9e6a", marginBottom:2 }}>⏱ {t.tidspunkt}</div>
                    )}
                    {t.begrunnelse && (
                      <div style={{ fontSize:11, color:"#5a7a4a", marginTop:2 }}>{t.begrunnelse}</div>
                    )}
                    {t.foreslatt_dato && (
                      <div style={{ fontSize:10, color:"#3a5a30", marginTop:4 }}>
                        Foreslått {new Date(t.foreslatt_dato).toLocaleDateString("nb-NO", { day:"2-digit", month:"short" })}
                      </div>
                    )}
                  </div>

                  {/* Handlingsknapper */}
                  <div style={{ display:"flex", flexDirection:"column", gap:5, flexShrink:0 }}>
                    <button
                      onClick={() => { setBekreft({ id:t.id, type:"utfort", tittel:t.middel||t.tittel }); setNotat(""); }}
                      title="Marker som utført"
                      style={{ background:"#1a3a2a", border:"1px solid #2a7a4a", color:"#78f0a8", borderRadius:5, padding:"5px 10px", cursor:"pointer", fontSize:11, whiteSpace:"nowrap" }}>
                      ✓ Utført
                    </button>
                    <button
                      onClick={() => { setBekreft({ id:t.id, type:"ikke_aktuelt", tittel:t.middel||t.tittel }); setNotat(""); }}
                      title="Ikke aktuelt denne gang"
                      style={{ background:"#2a2a1a", border:"1px solid #5a5a2a", color:"#a0a060", borderRadius:5, padding:"5px 10px", cursor:"pointer", fontSize:11, whiteSpace:"nowrap" }}>
                      ✕ Ikke aktuelt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bekreftelsesmodal */}
      {bekreft && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }}>
          <div style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:10, padding:24, maxWidth:360, width:"100%" }}>
            <div style={{ fontSize:14, color:"#d4e8b0", fontWeight:"bold", marginBottom:4 }}>
              {bekreft.type === "utfort" ? "✓ Marker som utført" : "✕ Marker som ikke aktuelt"}
            </div>
            <div style={{ fontSize:12, color:"#7a9e6a", marginBottom:16 }}>{bekreft.tittel}</div>

            <div style={{ marginBottom:14 }}>
              <label style={S.lbl}>Notat (valgfritt)</label>
              <input
                type="text"
                value={notat}
                onChange={e => setNotat(e.target.value)}
                placeholder={bekreft.type === "utfort" ? "F.eks. sprøytet 2. juni..." : "F.eks. for tidlig i sesongen..."}
                style={{ ...S.inp, width:"100%", boxSizing:"border-box" }}
              />
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={bekreftHandling}
                disabled={lagrer}
                style={{ ...S.btn, background:bekreft.type==="utfort"?"#1a3a2a":"#2a2a1a", borderColor:bekreft.type==="utfort"?"#2a7a4a":"#5a5a2a", color:bekreft.type==="utfort"?"#78f0a8":"#a0a060", flex:1, opacity:lagrer?0.6:1 }}>
                {lagrer ? "Lagrer..." : "Bekreft"}
              </button>
              <button onClick={() => setBekreft(null)} style={{ ...S.bsm, padding:"9px 14px" }}>Avbryt</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
