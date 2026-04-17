-- ============================================================
-- Treevü EWA — Leads CRM Bridge
-- Migration 002
-- ============================================================

-- ============================================================
-- LEADS (inbound CRM — mirrors Notion, Supabase as truth)
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       text UNIQUE NOT NULL,
  name        text,
  company     text,
  phone       text,
  score       int,
  estado      text NOT NULL DEFAULT 'Nuevo'
                CHECK (estado IN ('Nuevo','Contactado','Reunión','Propuesta','Cerrado','Descartado')),
  channel     text,
  notion_id   text UNIQUE,
  company_id  uuid REFERENCES companies(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_email_idx   ON leads(email);
CREATE INDEX IF NOT EXISTS leads_estado_idx  ON leads(estado);
CREATE INDEX IF NOT EXISTS leads_score_idx   ON leads(score DESC);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);

-- ============================================================
-- ABM PIPELINE (outbound — 14-day sequences)
-- ============================================================
CREATE TABLE IF NOT EXISTS abm_pipeline (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     uuid REFERENCES leads(id) ON DELETE CASCADE,
  notion_id   text UNIQUE,
  stage       int NOT NULL DEFAULT 0,
  last_touch  timestamptz,
  next_touch  timestamptz,
  status      text NOT NULL DEFAULT 'activo'
                CHECK (status IN ('activo','pausado','completado','descartado')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS abm_next_touch_idx ON abm_pipeline(next_touch);
CREATE INDEX IF NOT EXISTS abm_status_idx     ON abm_pipeline(status);

-- ============================================================
-- MEETINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     uuid REFERENCES leads(id) ON DELETE SET NULL,
  calendly_id text UNIQUE,
  scheduled_at timestamptz,
  status      text NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AUTO-LINK lead to company when deal closes
-- ============================================================
CREATE OR REPLACE FUNCTION link_lead_to_company()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.estado = 'Cerrado' AND NEW.company IS NOT NULL AND NEW.company_id IS NULL THEN
    UPDATE leads
    SET company_id = companies.id
    FROM companies
    WHERE companies.name = NEW.company
    AND leads.id = NEW.id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER leads_link_company
  AFTER INSERT OR UPDATE OF estado ON leads
  FOR EACH ROW EXECUTE FUNCTION link_lead_to_company();

-- ============================================================
-- RLS — employers can only see their own company's leads
-- ============================================================
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE abm_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings     ENABLE ROW LEVEL SECURITY;

-- Service role bypass (used by API functions)
CREATE POLICY "service_role_all_leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_abm"
  ON abm_pipeline FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_meetings"
  ON meetings FOR ALL
  USING (auth.role() = 'service_role');
