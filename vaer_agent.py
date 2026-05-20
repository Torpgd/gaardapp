"""
Torp Gårdsrift — Vær og Vekstsesong Agent
==========================================
Kjøres med: python vaer_agent.py

Funksjoner:
  1. Mottar data fra Ecowitt gateway (alle tilkoblede sensorer)
  2. Lagrer til Supabase
  3. Henter 48t + 10d varsel fra Met.no
  4. Ukentlig rapport mandag kl 05:00
  5. On-demand prognose via API fra appen
"""

import json
import datetime
import threading
import time
import requests
import anthropic
from flask import Flask, request, jsonify

# ============================================================
# KONFIGURASJON
# ============================================================
ANTHROPIC_API_KEY  = "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"
SUPABASE_URL       = "https://zasjbcbkvehhbqydadnz.supabase.co"
SUPABASE_KEY       = "sb_secret_Y3M7tYniKtCqFFmqGIcDUA_47EDP-uT"
GARD_LAT           = 59.1555
GARD_LON           = 11.3486
METNO_USER_AGENT   = "TorpGardsrift/1.0 jonmeriksen@me.com"
FLASK_PORT         = 8765
# ============================================================

app    = Flask(__name__)
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


# ── Supabase ─────────────────────────────────────────────────────────────────

def sb_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def sb_insert(tabell, data):
    try:
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/{tabell}",
            headers={**sb_headers(), "Prefer": "return=minimal"},
            json=data, timeout=10
        )
        return r.status_code in (200, 201)
    except Exception as e:
        print(f"Supabase insert feil ({tabell}): {e}")
        return False

def sb_select(tabell, params="", single=False):
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/{tabell}?{params}",
            headers=sb_headers(), timeout=10
        )
        data = r.json()
        return (data[0] if data else None) if single else data
    except Exception as e:
        print(f"Supabase select feil ({tabell}): {e}")
        return None if single else []


# ── Konvertering ──────────────────────────────────────────────────────────────

def f_til_c(f):
    try: return round((float(f) - 32) * 5 / 9, 2)
    except: return None

def mph_til_ms(v):
    try: return round(float(v) * 0.44704, 2)
    except: return None

def tomme_til_mm(v):
    try: return round(float(v) * 25.4, 2)
    except: return None

def safe_float(v):
    try: return float(v)
    except: return None


# ── Ecowitt mottak ────────────────────────────────────────────────────────────

@app.route("/vaer", methods=["POST"])
def motta_vaer():
    d   = request.form
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    rad = {
        "timestamp":        now,
        "temp_c":           f_til_c(d.get("tempf")),
        "fuktighet_pst":    safe_float(d.get("humidity")),
        "vindstyrke_ms":    mph_til_ms(d.get("windspeedmph")),
        "vindkast_ms":      mph_til_ms(d.get("windgustmph")),
        "vindretning":      safe_float(d.get("winddir")),
        "nedbor_time_mm":   tomme_til_mm(d.get("rainratein")),
        "nedbor_dag_mm":    tomme_til_mm(d.get("dailyrainin")),
        "solstraling_wm2":  safe_float(d.get("solarradiation")),
        "uv_index":         safe_float(d.get("uv")),
        "trykk_hpa":        safe_float(d.get("baromrelin")),
        "jordtemp1_c":      f_til_c(d.get("soiltemp1f")),
        "jordtemp2_c":      f_til_c(d.get("soiltemp2f")),
        "jordfukt1_pst":    safe_float(d.get("soilmoisture1")),
        "jordfukt2_pst":    safe_float(d.get("soilmoisture2")),
        "radata":           json.dumps(dict(d))
    }
    rad = {k: v for k, v in rad.items() if v is not None}
    return ("OK", 200) if sb_insert("vaer_malinger", rad) else ("FEIL", 500)


# ── Met.no varsel ─────────────────────────────────────────────────────────────

def hent_yr_varsel(lat=None, lon=None):
    lat = lat or GARD_LAT
    lon = lon or GARD_LON
    try:
        r  = requests.get(
            "https://api.met.no/weatherapi/locationforecast/2.0/compact",
            headers={"User-Agent": METNO_USER_AGENT},
            params={"lat": lat, "lon": lon}, timeout=10
        )
        ts = r.json()["properties"]["timeseries"]
    except Exception as e:
        return {"feil": str(e)}

    now = datetime.datetime.now(datetime.timezone.utc)

    timevarsel = []
    for e in ts:
        tid = datetime.datetime.fromisoformat(e["time"].replace("Z", "+00:00"))
        if (tid - now).total_seconds() > 48 * 3600:
            break
        inst  = e["data"]["instant"]["details"]
        next1 = e["data"].get("next_1_hours", {}).get("details", {})
        timevarsel.append({
            "tid": e["time"],
            "temp_c": inst.get("air_temperature"),
            "fuktighet_pst": inst.get("relative_humidity"),
            "vindstyrke_ms": inst.get("wind_speed"),
            "vindkast_ms": inst.get("wind_speed_of_gust"),
            "nedbor_mm": next1.get("precipitation_amount", 0)
        })

    dagsoversikt = {}
    for e in ts:
        tid = datetime.datetime.fromisoformat(e["time"].replace("Z", "+00:00"))
        if (tid - now).days > 10:
            break
        dato  = tid.strftime("%Y-%m-%d")
        inst  = e["data"]["instant"]["details"]
        next6 = e["data"].get("next_6_hours", {}).get("details", {})
        if dato not in dagsoversikt:
            dagsoversikt[dato] = {"temps": [], "fukt": [], "vind": [], "nedbor": 0.0}
        if inst.get("air_temperature") is not None:
            dagsoversikt[dato]["temps"].append(inst["air_temperature"])
        if inst.get("relative_humidity") is not None:
            dagsoversikt[dato]["fukt"].append(inst["relative_humidity"])
        if inst.get("wind_speed") is not None:
            dagsoversikt[dato]["vind"].append(inst["wind_speed"])
        if next6.get("precipitation_amount") is not None:
            dagsoversikt[dato]["nedbor"] += next6["precipitation_amount"]

    dagsvarsel = []
    for dato, v in dagsoversikt.items():
        dagsvarsel.append({
            "dato": dato,
            "snitt_temp_c": round(sum(v["temps"]) / len(v["temps"]), 1) if v["temps"] else None,
            "maks_temp_c": round(max(v["temps"]), 1) if v["temps"] else None,
            "min_temp_c": round(min(v["temps"]), 1) if v["temps"] else None,
            "snitt_fuktighet_pst": round(sum(v["fukt"]) / len(v["fukt"]), 1) if v["fukt"] else None,
            "maks_vind_ms": round(max(v["vind"]), 1) if v["vind"] else None,
            "total_nedbor_mm": round(v["nedbor"], 1)
        })

    return {"time_for_time_48t": timevarsel, "dagsoversikt_10d": dagsvarsel}


# ── Hjelpefunksjoner ──────────────────────────────────────────────────────────

def hent_vaer_historikk(dager=7):
    siden = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=dager)).isoformat()
    return sb_select(
        "vaer_malinger",
        f"timestamp=gte.{siden}&order=timestamp.asc"
        f"&select=timestamp,temp_c,fuktighet_pst,vindstyrke_ms,vindkast_ms,"
        f"nedbor_dag_mm,solstraling_wm2,jordtemp1_c,jordfukt1_pst,trykk_hpa"
    )

def hent_aktiv_sesong():
    return sb_select("vekstsesong", "aktiv=eq.true&order=id.desc&limit=1", single=True)

def hent_kulturer(sesong_id):
    return sb_select("sesong_kulturer", f"sesong_id=eq.{sesong_id}&aktiv=eq.true")

def beregn_graddager(saato_str, basistemp=5.0):
    if not saato_str:
        return None
    try:
        rader = sb_select(
            "vaer_malinger",
            f"timestamp=gte.{saato_str}&select=timestamp,temp_c&order=timestamp.asc"
        )
        dagdata = {}
        for rad in rader:
            dato = rad["timestamp"][:10]
            if dato not in dagdata:
                dagdata[dato] = []
            if rad.get("temp_c") is not None:
                dagdata[dato].append(rad["temp_c"])
        return round(sum(max(0, sum(t)/len(t) - basistemp) for t in dagdata.values() if t), 1)
    except:
        return None


# ── System-prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Du er en presis og praktisk landbruksrådgiver for Torp gård i Halden, Østfold.
Gården dyrker primært Betong vårhvete og Stella åkerbønner på siltig finsand og lettleire.
Du har tilgang til data fra Ecowitt-sensorer (luft, jordtemp WN34S, jordfuktighet WH51L) og Met.no-varsel.

JORDARBEIDING — beslutningskriterier:
Pløying: Jordtemp >3°C, jordfukt <70%, nedbør siste 48t <10mm, ingen kraftig nedbør varslet 24t
Harving: Jordtemp >4°C, jordfukt <65%, 2+ tørre dager, vind <8 m/s
Såing hvete: Jordtemp >5°C stabilt 3 dager, ingen frost 7 dager, jordfukt 40-70%
Såing åkerbønner: Jordtemp >8°C stabilt 3 dager, ingen nattfrost 10 dager, stigende trend

BBCH HVETE (graddager basis 5°C):
00-09 Spiring (0-50 GD) · 10-19 Bladutvikling (50-150) · 20-29 Busking (150-250)
30-39 Strekningsvekst (250-400) · 40-49 Skyting (400-550) · 50-59 Aksskyting (550-650)
60-69 Blomstring (650-750) · 70-89 Kornfylling/modning (750-1100) · 90-99 Høstmodning (>1100)

BBCH ÅKERBØNNER (graddager basis 5°C):
00-09 Spiring (0-80 GD) · 10-19 Bladutvikling (80-200) · 20-29 Sideskudd (200-350)
50-69 Blomstring (350-550) · 70-79 Belgutvikling (550-700) · 80-89 Frøfylling (700-900) · 90-99 Modning (>900)

TRESKING: Kornfukt <14-15%, luftfukt <70%, ingen nedbør 24t, stabil periode varslet
SPRØYTING: Ikke vind >3 m/s, ikke nedbør 4t, ikke <10°C
GJØDSLING: Ikke nedbør >5mm 24t, ikke vind >8 m/s, idealtemp 8-18°C

Gi alltid konkrete handlingsrettede råd. Skill tydelig mellom de ulike kulturene.
Angi usikkerhet hvis datagrunnlaget er tynt."""


# ── Claude tools og agent ─────────────────────────────────────────────────────

TOOLS = [
    {
        "name": "hent_vaer_historikk",
        "description": "Henter historiske værdata inkl. jordtemperatur og jordfuktighet fra Torp gård.",
        "input_schema": {
            "type": "object",
            "properties": {"dager": {"type": "integer", "description": "Antall dager bakover (standard 7)"}}
        }
    },
    {
        "name": "hent_yr_varsel",
        "description": "Henter 48t time-for-time og 10 dagers dagsoversikt fra Met.no for Torp gård.",
        "input_schema": {
            "type": "object",
            "properties": {
                "lat": {"type": "number"},
                "lon": {"type": "number"}
            }
        }
    },
    {
        "name": "hent_graddager",
        "description": "Beregner akkumulerte graddager siden såing for en gitt kultur.",
        "input_schema": {
            "type": "object",
            "properties": {
                "saato": {"type": "string", "description": "Såingsdato YYYY-MM-DD"},
                "kultur": {"type": "string"}
            },
            "required": ["saato", "kultur"]
        }
    }
]

def kjor_claude(spørsmål, kontekst=""):
    messages = [{"role": "user", "content": f"{kontekst}\n\n{spørsmål}".strip()}]
    while True:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages
        )
        if resp.stop_reason == "end_turn":
            for b in resp.content:
                if hasattr(b, "text"):
                    return b.text
            return "(Ingen svar)"

        results = []
        for b in resp.content:
            if b.type == "tool_use":
                inp = b.input or {}
                if b.name == "hent_vaer_historikk":
                    res = hent_vaer_historikk(inp.get("dager", 7))
                elif b.name == "hent_yr_varsel":
                    res = hent_yr_varsel(inp.get("lat"), inp.get("lon"))
                elif b.name == "hent_graddager":
                    res = {"kultur": inp.get("kultur"), "saato": inp.get("saato"),
                           "graddager": beregn_graddager(inp.get("saato"))}
                else:
                    res = {"feil": f"Ukjent: {b.name}"}
                results.append({"type": "tool_result", "tool_use_id": b.id,
                                 "content": json.dumps(res, ensure_ascii=False, default=str)})

        messages.append({"role": "assistant", "content": resp.content})
        messages.append({"role": "user", "content": results})


# ── Parse strukturerte tiltak fra Claude-svar ─────────────────────────────────

def parse_tiltak(rapport_tekst, kulturer):
    """
    Ber Claude parse sin egen fritekstrapport og returnere strukturerte tiltak
    som JSON. Kalles etter at rapporten er generert.
    """
    kultur_liste = ", ".join([k["kultur"] for k in kulturer if k.get("saato")])
    sporsmaal = f"""Les denne vekstrapporten og ekstraher ALLE anbefalte tiltak som JSON.

RAPPORT:
{rapport_tekst}

Returner KUN gyldig JSON (ingen annen tekst) i dette formatet:
{{
  "sproyting": [
    {{
      "kultur": "kulturname",
      "type": "Ugras|Sopp|Vekstregulering|Insekt",
      "middel": "produktnavn",
      "dose": "mengde/daa",
      "tidspunkt": "naa|innen X dager|ved BBCH XX",
      "begrunnelse": "kort forklaring",
      "prioritet": "Hoy|Middels|Lav"
    }}
  ],
  "gjodsel": [
    {{
      "kultur": "kulturname",
      "produkt": "produktnavn",
      "mengde": "kg/daa",
      "tidspunkt": "naa|innen X dager",
      "begrunnelse": "kort forklaring",
      "prioritet": "Hoy|Middels|Lav"
    }}
  ],
  "inspeksjon": [
    {{
      "kultur": "kulturname",
      "oppgave": "hva som skal sjekkes",
      "tidspunkt": "naa|innen X dager",
      "prioritet": "Hoy|Middels|Lav"
    }}
  ],
  "andre": [
    {{
      "oppgave": "beskrivelse",
      "tidspunkt": "naa|innen X dager",
      "prioritet": "Hoy|Middels|Lav"
    }}
  ]
}}

Aktuelle kulturer: {kultur_liste}
Hvis det ikke er anbefalte tiltak av en type, bruk tom liste [].
Returner KUN JSON."""

    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": sporsmaal}]
        )
        tekst = resp.content[0].text.strip()
        # Fjern eventuelle markdown-backticks
        if "```" in tekst:
            lines = tekst.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            tekst = "\n".join(lines)
        return json.loads(tekst)
    except Exception as e:
        print(f"parse_tiltak feil: {e}")
        return {"sproyting": [], "gjodsel": [], "inspeksjon": [], "andre": []}


def merge_tiltak(sesong_id, rapport_id, tiltak_parsed):
    """
    Merger nye tiltak fra rapport inn i tiltak-tabellen.
    Regler:
      - Tiltak med status 'utført' eller 'ikke_aktuelt' berøres ikke.
      - Eksisterende aktivt tiltak med samme kultur+kategori+middel/tittel
        oppdateres (tidspunkt, prioritet, begrunnelse) — ikke duplikert.
      - Nye tiltak som ikke finnes fra før legges til med status 'aktiv'.
    Returnerer antall nye tiltak lagt til.
    """
    import requests as _req

    # Hent eksisterende aktive tiltak for denne sesongen
    eksisterende = sb_select(
        "tiltak",
        f"sesong_id=eq.{sesong_id}&status=eq.aktiv"
    ) or []

    def nøkkel(rad):
        """Unik identifikator per tiltak: kultur + kategori + middel/tittel"""
        return (
            (rad.get("kultur") or "").lower().strip(),
            (rad.get("kategori") or "").lower().strip(),
            (rad.get("middel") or rad.get("tittel") or "").lower().strip()
        )

    eks_nøkler = {nøkkel(e): e for e in eksisterende}

    def prioritet_norm(p):
        mapping = {"hoy": "Høy", "høy": "Høy", "middels": "Middels", "lav": "Lav"}
        return mapping.get((p or "Middels").lower(), "Middels")

    nye = 0

    # Sprøyting
    for t in (tiltak_parsed.get("sproyting") or tiltak_parsed.get("sprøyting") or []):
        rad = {
            "sesong_id":      sesong_id,
            "rapport_id":     rapport_id,
            "kategori":       "sprøyting",
            "type":           t.get("type", ""),
            "kultur":         t.get("kultur", ""),
            "tittel":         f"{t.get('middel','')} mot {t.get('type','').lower()}",
            "middel":         t.get("middel", ""),
            "dose":           t.get("dose", ""),
            "tidspunkt":      t.get("tidspunkt", ""),
            "begrunnelse":    t.get("begrunnelse", ""),
            "prioritet":      prioritet_norm(t.get("prioritet")),
            "foreslatt_dato": datetime.date.today().isoformat(),
            "status":         "aktiv",
        }
        k = nøkkel(rad)
        if k in eks_nøkler:
            # Oppdater tidspunkt, prioritet og begrunnelse på eksisterende
            eks_id = eks_nøkler[k]["id"]
            _req.patch(
                f"{SUPABASE_URL}/rest/v1/tiltak?id=eq.{eks_id}",
                headers=sb_headers(),
                json={
                    "tidspunkt":   rad["tidspunkt"],
                    "prioritet":   rad["prioritet"],
                    "begrunnelse": rad["begrunnelse"],
                    "rapport_id":  rapport_id,
                },
                timeout=10
            )
        else:
            sb_insert("tiltak", rad)
            nye += 1

    # Gjødsling
    for t in (tiltak_parsed.get("gjodsel") or tiltak_parsed.get("gjødsling") or []):
        rad = {
            "sesong_id":      sesong_id,
            "rapport_id":     rapport_id,
            "kategori":       "gjødsling",
            "kultur":         t.get("kultur", ""),
            "tittel":         f"{t.get('produkt','')}",
            "middel":         t.get("produkt", ""),
            "dose":           t.get("mengde", ""),
            "tidspunkt":      t.get("tidspunkt", ""),
            "begrunnelse":    t.get("begrunnelse", ""),
            "prioritet":      prioritet_norm(t.get("prioritet")),
            "foreslatt_dato": datetime.date.today().isoformat(),
            "status":         "aktiv",
        }
        k = nøkkel(rad)
        if k in eks_nøkler:
            eks_id = eks_nøkler[k]["id"]
            _req.patch(
                f"{SUPABASE_URL}/rest/v1/tiltak?id=eq.{eks_id}",
                headers=sb_headers(),
                json={"tidspunkt": rad["tidspunkt"], "prioritet": rad["prioritet"], "rapport_id": rapport_id},
                timeout=10
            )
        else:
            sb_insert("tiltak", rad)
            nye += 1

    # Inspeksjon
    for t in (tiltak_parsed.get("inspeksjon") or []):
        rad = {
            "sesong_id":      sesong_id,
            "rapport_id":     rapport_id,
            "kategori":       "inspeksjon",
            "kultur":         t.get("kultur", ""),
            "tittel":         t.get("oppgave", ""),
            "tidspunkt":      t.get("tidspunkt", ""),
            "prioritet":      prioritet_norm(t.get("prioritet")),
            "foreslatt_dato": datetime.date.today().isoformat(),
            "status":         "aktiv",
        }
        k = nøkkel(rad)
        if k in eks_nøkler:
            eks_id = eks_nøkler[k]["id"]
            _req.patch(
                f"{SUPABASE_URL}/rest/v1/tiltak?id=eq.{eks_id}",
                headers=sb_headers(),
                json={"tidspunkt": rad["tidspunkt"], "prioritet": rad["prioritet"], "rapport_id": rapport_id},
                timeout=10
            )
        else:
            sb_insert("tiltak", rad)
            nye += 1

    # Andre tiltak
    for t in (tiltak_parsed.get("andre") or []):
        rad = {
            "sesong_id":      sesong_id,
            "rapport_id":     rapport_id,
            "kategori":       "annet",
            "tittel":         t.get("oppgave", ""),
            "tidspunkt":      t.get("tidspunkt", ""),
            "prioritet":      prioritet_norm(t.get("prioritet")),
            "foreslatt_dato": datetime.date.today().isoformat(),
            "status":         "aktiv",
        }
        k = nøkkel(rad)
        if k in eks_nøkler:
            eks_id = eks_nøkler[k]["id"]
            _req.patch(
                f"{SUPABASE_URL}/rest/v1/tiltak?id=eq.{eks_id}",
                headers=sb_headers(),
                json={"tidspunkt": rad["tidspunkt"], "prioritet": rad["prioritet"], "rapport_id": rapport_id},
                timeout=10
            )
        else:
            sb_insert("tiltak", rad)
            nye += 1

    return nye


# ── Rapporter og prognoser ────────────────────────────────────────────────────

def generer_ukentlig_rapport():
    sesong = hent_aktiv_sesong()
    if not sesong:
        print("Ingen aktiv vekstsesong")
        return None

    kulturer = hent_kulturer(sesong["id"])
    saadde   = [k for k in kulturer if k.get("saato")]
    if not saadde:
        print("Ingen kulturer er sådd ennå")
        return None

    kultur_info = "\n".join([
        f"- {k['kultur']} ({k.get('sort','')}) · Sådd: {k['saato']} · "
        f"Areal: {k.get('areal_daa','?')} daa · Graddager: {beregn_graddager(k.get('saato'))} GD"
        for k in saadde
    ])

    kontekst = (
        f"UKENTLIG RAPPORT — {datetime.date.today().strftime('%d. %B %Y')}\n"
        f"Aktive kulturer:\n{kultur_info}"
    )

    spørsmål = """Lag komplett ukentlig vekstrapport med disse seksjonene:

1. UKEN SOM VAR — Oppsummer vær siste 7 dager og hvordan det påvirket veksten.

2. VEKSTSTATUS PER KULTUR — For HVER kultur separat:
   - Nåværende BBCH-stadium basert på graddager
   - Hva skjer i planten nå
   - Hva du skal se etter i åkeren denne uken

3. UKEN SOM KOMMER — Værutsikter og hva det betyr for veksten.

4. ANBEFALTE TILTAK:
   - Sprøyting (ugras/sopp/insekt) med konkrete midler og doser
   - Gjødsling
   - Inspeksjoner og kontroller
   - Andre tiltak

5. TRESKEPROGNOSE — kun hvis kornmodning nærmer seg (BBCH >80)

Vær konkret og handlingsrettet. Skill alltid tydelig mellom hvete og åkerbønner."""

    print(f"[{datetime.datetime.now()}] Genererer ukentlig rapport...")
    rapport = kjor_claude(spørsmål, kontekst)

    # Parse strukturerte tiltak fra fritekstrapporten
    print("Parser strukturerte tiltak...")
    tiltak_parsed = parse_tiltak(rapport, saadde)

    kulturer_status = [{
        "kultur":    k["kultur"],
        "saato":     k.get("saato"),
        "graddager": beregn_graddager(k.get("saato"))
    } for k in saadde]

    # Lagre rapport (uten tiltak-kolonne — tiltak lever i egen tabell)
    rapport_rad = sb_select(
        "vekstrapporter",
        f"sesong_id=eq.{sesong['id']}&rapport_dato=eq.{datetime.date.today().isoformat()}&limit=1",
        single=True
    )
    if not rapport_rad:
        # Ny rad for i dag
        import requests as _req
        r = _req.post(
            f"{SUPABASE_URL}/rest/v1/vekstrapporter",
            headers={**sb_headers(), "Prefer": "return=representation"},
            json={
                "sesong_id":       sesong["id"],
                "rapport_dato":    datetime.date.today().isoformat(),
                "full_rapport":    rapport,
                "kulturer_status": json.dumps(kulturer_status),
                "tiltak":          json.dumps(tiltak_parsed, ensure_ascii=False)
            },
            timeout=10
        )
        rapport_id = r.json()[0]["id"] if r.ok and r.json() else None
    else:
        rapport_id = rapport_rad["id"]
        # Oppdater eksisterende rad for i dag
        import requests as _req
        _req.patch(
            f"{SUPABASE_URL}/rest/v1/vekstrapporter?id=eq.{rapport_id}",
            headers={**sb_headers()},
            json={
                "full_rapport":    rapport,
                "kulturer_status": json.dumps(kulturer_status),
                "tiltak":          json.dumps(tiltak_parsed, ensure_ascii=False)
            },
            timeout=10
        )

    # Merge tiltak inn i tiltak-tabellen
    antall = merge_tiltak(sesong["id"], rapport_id, tiltak_parsed)
    print(f"Rapport lagret — {antall} tiltak lagt til / oppdatert i tiltak-tabellen.")
    return rapport


def generer_prognose(prognose_type="full"):
    sesong   = hent_aktiv_sesong()
    kulturer = hent_kulturer(sesong["id"]) if sesong else []

    if prognose_type == "jordklar":
        spørsmål = """Vurder om jorda på Torp er klar for bearbeiding nå.

Format — én linje per aktivitet:
PLØYING:              🟢/🟡/🔴  [kort begrunnelse]
HARVING:              🟢/🟡/🔴  [kort begrunnelse]
SÅING HVETE:          🟢/🟡/🔴  [kort begrunnelse]
SÅING ÅKERBØNNER:     🟢/🟡/🔴  [kort begrunnelse]

Avslutt med anbefalt handling neste 3 dager."""

    elif prognose_type == "vekst":
        kliste = "\n".join([
            f"- {k['kultur']} · Sådd: {k.get('saato','?')} · GD: {beregn_graddager(k.get('saato'))}"
            for k in kulturer if k.get("saato")
        ]) or "Ingen kulturer er sådd ennå."
        spørsmål = f"""Gi oppdatert vekststatus for Torp gård.

Kulturer:
{kliste}

Inkluder per kultur: BBCH-stadium, hva som skjer i planten, hva du bør sjekke i åkeren, og utsikter neste 5 dager."""

    else:
        spørsmål = """Gi komplett oppdatering for Torp gård:
1. Nåværende værforhold og jordstatus (temp, fuktighet, jordtemp)
2. Vekststatus per kultur med BBCH-stadium
3. Jordklar-trafikklys (pløying/harving/såing hvete/såing bønner)
4. Anbefalte tiltak neste 48 timer
5. Treskeprognose hvis aktuelt"""

    rapport = kjor_claude(spørsmål)

    if sesong:
        sb_insert("vaer_prognoser", {
            "sesong_id":     sesong["id"],
            "prognose_type": prognose_type,
            "innhold":       rapport
        })
    return rapport


# ── Flask API ─────────────────────────────────────────────────────────────────

@app.route("/api/prognose", methods=["POST"])
def api_prognose():
    data   = request.json or {}
    ptype  = data.get("type", "full")
    rapport = generer_prognose(ptype)
    return jsonify({"rapport": rapport, "timestamp": datetime.datetime.now().isoformat()})

@app.route("/api/siste_rapport", methods=["GET"])
def api_siste_rapport():
    return jsonify(sb_select("vekstrapporter", "order=rapport_dato.desc&limit=1", single=True) or {})

@app.route("/api/siste_maaling", methods=["GET"])
def api_siste_maaling():
    return jsonify(sb_select("vaer_malinger", "order=timestamp.desc&limit=1", single=True) or {})

@app.route("/api/historikk", methods=["GET"])
def api_historikk():
    dager = int(request.args.get("dager", 7))
    return jsonify(hent_vaer_historikk(dager))


# ── Scheduler ─────────────────────────────────────────────────────────────────

def ukentlig_scheduler():
    while True:
        now = datetime.datetime.now()
        if now.weekday() == 0 and now.hour == 5 and now.minute == 0:
            try:
                generer_ukentlig_rapport()
            except Exception as e:
                print(f"Rapport feil: {e}")
            time.sleep(61)
        else:
            time.sleep(30)


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  Torp Gårdsrift — Vær og Vekstsesong Agent")
    print(f"  Ecowitt:   http://0.0.0.0:{FLASK_PORT}/vaer")
    print(f"  API:       http://0.0.0.0:{FLASK_PORT}/api/")
    print(f"  Supabase:  {SUPABASE_URL}")
    print("=" * 60)

    threading.Thread(target=ukentlig_scheduler, daemon=True).start()
    threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=FLASK_PORT, use_reloader=False),
        daemon=True
    ).start()

    while True:
        try:
            inp = input("\nKommando (rapport/jordklar/vekst/full/spørsmål/avslutt): ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not inp or inp == "avslutt":
            break
        elif inp in ("rapport",):
            print(generer_ukentlig_rapport() or "Ingen aktiv sesong/såing")
        elif inp in ("jordklar", "vekst", "full"):
            print(generer_prognose(inp))
        else:
            print(kjor_claude(inp))
