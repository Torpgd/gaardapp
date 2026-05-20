-- ============================================================
-- TORP GÅRDSRIFT — Tiltak-tabell
-- Kjør i Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS tiltak (
    id              BIGSERIAL PRIMARY KEY,
    sesong_id       BIGINT REFERENCES vekstsesong(id),
    rapport_id      BIGINT REFERENCES vekstrapporter(id),  -- hvilken rapport foreslo dette

    -- Klassifisering
    kategori        TEXT NOT NULL,   -- 'sprøyting' | 'gjødsling' | 'inspeksjon' | 'annet'
    type            TEXT,            -- 'Ugras' | 'Sopp' | 'Vekstregulering' | 'Insekt' (kun sprøyting)
    kultur          TEXT,            -- 'Betong vårhvete' | 'Stella åkerbønner' | null (gjelder begge)

    -- Innhold
    tittel          TEXT NOT NULL,   -- kort beskrivelse, f.eks. "Atlantis OD mot floghavre"
    middel          TEXT,            -- produktnavn (sprøyting/gjødsling)
    dose            TEXT,            -- mengde/daa
    tidspunkt       TEXT,            -- "nå" | "innen 3 dager" | "ved BBCH 30–32"
    begrunnelse     TEXT,
    prioritet       TEXT NOT NULL DEFAULT 'Middels',  -- 'Høy' | 'Middels' | 'Lav'

    -- Status
    status          TEXT NOT NULL DEFAULT 'aktiv',    -- 'aktiv' | 'utført' | 'ikke_aktuelt'
    status_endret   TIMESTAMPTZ,
    status_av       TEXT,            -- hvem endret status
    status_notat    TEXT,            -- valgfri kommentar ved avkryssing

    -- Sporing
    foreslatt_dato  DATE NOT NULL DEFAULT CURRENT_DATE,
    utfort_dato     DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indekser
CREATE INDEX IF NOT EXISTS idx_tiltak_sesong   ON tiltak(sesong_id);
CREATE INDEX IF NOT EXISTS idx_tiltak_status   ON tiltak(status);
CREATE INDEX IF NOT EXISTS idx_tiltak_kategori ON tiltak(kategori);

-- RLS
ALTER TABLE tiltak ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON tiltak FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "anon_read"        ON tiltak FOR SELECT TO anon USING (true);
CREATE POLICY "anon_write"       ON tiltak FOR ALL TO anon USING (true) WITH CHECK (true);

-- Trigger: oppdater updated_at automatisk
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tiltak_updated_at
  BEFORE UPDATE ON tiltak
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
