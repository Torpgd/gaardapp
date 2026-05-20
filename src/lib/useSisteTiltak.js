import { useState, useEffect } from "react";

const SUPABASE_URL      = "https://zasjbcbkvehhbqydadnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wTSsiXVhL6nPDsdYjRF8Yg_tCYyLzAU";

async function sbFetch(tabell, params = "") {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabell}?${params}`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    return r.ok ? r.json() : [];
  } catch {
    return [];
  }
}

async function sbPatch(tabell, matchParams, data) {
  try {
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
  } catch {
    return false;
  }
}

/**
 * Henter aktive tiltak fra tiltak-tabellen i Supabase.
 * Tiltak overlever ukesrapporter — fjernes kun når brukeren
 * markerer dem som utført eller ikke aktuelt.
 *
 * Returnerer:
 *   tiltak       — liste med aktive tiltak-rader
 *   laster       — boolean
 *   feil         — string
 *   markerUtfort — async fn(id, utfortAv, notat)
 *   markerIkkeAktuelt — async fn(id, notat)
 *   refresh      — fn() for å tvinge ny henting
 */
export function useTiltak() {
  const [tiltak, setTiltak]   = useState([]);
  const [laster, setLaster]   = useState(true);
  const [feil, setFeil]       = useState("");
  const [versjon, setVersjon] = useState(0);

  useEffect(() => {
    async function hent() {
      setLaster(true);
      setFeil("");
      try {
        const rader = await sbFetch(
          "tiltak",
          "status=eq.aktiv&order=prioritet.asc,foreslatt_dato.desc"
        );
        // Sorter: Høy → Middels → Lav
        const rang = { "Høy": 0, "Middels": 1, "Lav": 2 };
        rader.sort((a, b) => (rang[a.prioritet] ?? 1) - (rang[b.prioritet] ?? 1));
        setTiltak(rader);
      } catch (e) {
        setFeil("Kunne ikke hente tiltak fra Supabase");
      }
      setLaster(false);
    }
    hent();
  }, [versjon]);

  async function markerUtfort(id, utfortAv = "", notat = "") {
    const ok = await sbPatch("tiltak", `id=eq.${id}`, {
      status:        "utført",
      status_endret: new Date().toISOString(),
      status_av:     utfortAv,
      status_notat:  notat,
      utfort_dato:   new Date().toISOString().slice(0, 10)
    });
    if (ok) setTiltak(p => p.filter(t => t.id !== id));
    return ok;
  }

  async function markerIkkeAktuelt(id, notat = "") {
    const ok = await sbPatch("tiltak", `id=eq.${id}`, {
      status:        "ikke_aktuelt",
      status_endret: new Date().toISOString(),
      status_notat:  notat
    });
    if (ok) setTiltak(p => p.filter(t => t.id !== id));
    return ok;
  }

  return {
    tiltak,
    laster,
    feil,
    markerUtfort,
    markerIkkeAktuelt,
    refresh: () => setVersjon(v => v + 1)
  };
}
