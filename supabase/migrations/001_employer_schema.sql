-- ============================================================
-- Treevü EWA — Employer Dashboard Schema
-- Migration 001
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  text NOT NULL,
  ruc                   text UNIQUE,
  country               text NOT NULL DEFAULT 'PE',
  ewa_limit_pct         numeric(5,2) NOT NULL DEFAULT 50.00, -- % of earned wage available
  ewa_max_pct           numeric(5,2) NOT NULL DEFAULT 75.00, -- absolute max
  max_advances_per_month int NOT NULL DEFAULT 2,
  payroll_cycle         text NOT NULL DEFAULT 'monthly' CHECK (payroll_cycle IN ('monthly','biweekly')),
  payroll_start_day     int NOT NULL DEFAULT 1,
  payroll_end_day       int NOT NULL DEFAULT 30,
  ewa_enabled           boolean NOT NULL DEFAULT true,
  logo_url              text,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- EMPLOYER USERS (RRHH / Finanzas)
-- ============================================================
CREATE TABLE IF NOT EXISTS employer_users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id  uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL,
  role          text NOT NULL DEFAULT 'hr'
                  CHECK (role IN ('admin','hr','finance','readonly')),
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id      uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id        uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_code     text,
  name              text NOT NULL,
  phone             text,
  dni               text,
  email             text,
  base_salary       numeric(12,2) NOT NULL,
  salary_currency   text NOT NULL DEFAULT 'PEN',
  start_date        date,
  position          text,
  department        text,
  ewa_enabled       boolean NOT NULL DEFAULT true,
  ewa_custom_limit_pct numeric(5,2), -- NULL = use company default
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE(company_id, employee_code),
  UNIQUE(company_id, dni)
);

-- ============================================================
-- PAYROLL CYCLES
-- ============================================================
CREATE TABLE IF NOT EXISTS payroll_cycles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_start  date NOT NULL,
  period_end    date NOT NULL,
  payday        date NOT NULL,
  status        text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','closed','paid')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE(company_id, period_start, period_end)
);

-- ============================================================
-- ADVANCES (source of truth shared with PWA)
-- ============================================================
CREATE TABLE IF NOT EXISTS advances (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id         uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_cycle_id    uuid REFERENCES payroll_cycles(id),
  amount              numeric(12,2) NOT NULL CHECK (amount > 0),
  currency            text NOT NULL DEFAULT 'PEN',
  status              text NOT NULL DEFAULT 'requested'
                        CHECK (status IN (
                          'requested','approved','processing','paid','rejected','reversed'
                        )),
  -- auto vs manual approval
  auto_approved       boolean NOT NULL DEFAULT false,
  -- rejection
  rejection_reason    text,
  -- disbursement
  destination_wallet_id uuid,
  disbursement_ref    text,
  disbursement_method text CHECK (disbursement_method IN ('yape','plin','bcp','interbank','other')),
  -- fee (charged to company, 0 for employee)
  fee                 numeric(12,2) NOT NULL DEFAULT 0,
  fee_currency        text NOT NULL DEFAULT 'PEN',
  -- timestamps
  requested_at        timestamptz NOT NULL DEFAULT now(),
  approved_at         timestamptz,
  processing_at       timestamptz,
  paid_at             timestamptz,
  rejected_at         timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- EMPLOYEE WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_wallets (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('yape','plin','lukita','bcp','interbank','bbva','scotiabank','other')),
  number        text NOT NULL,
  alias         text,
  is_primary    boolean NOT NULL DEFAULT false,
  verified      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE(employee_id, type, number)
);

-- FK from advances to wallets (added after wallet table)
ALTER TABLE advances
  ADD CONSTRAINT fk_advances_wallet
  FOREIGN KEY (destination_wallet_id)
  REFERENCES employee_wallets(id)
  ON DELETE SET NULL;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id      uuid NOT NULL,
  recipient_type    text NOT NULL CHECK (recipient_type IN ('employee','employer')),
  company_id        uuid REFERENCES companies(id) ON DELETE CASCADE,
  type              text NOT NULL,  -- advance_approved, advance_rejected, cycle_closed, etc.
  title             text NOT NULL,
  body              text NOT NULL,
  payload           jsonb,
  read              boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_employer_users_updated_at
  BEFORE UPDATE ON employer_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payroll_cycles_updated_at
  BEFORE UPDATE ON payroll_cycles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_advances_updated_at
  BEFORE UPDATE ON advances
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_employees_company_id       ON employees(company_id);
CREATE INDEX idx_employees_auth_user_id     ON employees(auth_user_id);
CREATE INDEX idx_advances_employee_id       ON advances(employee_id);
CREATE INDEX idx_advances_status            ON advances(status);
CREATE INDEX idx_advances_requested_at      ON advances(requested_at DESC);
CREATE INDEX idx_payroll_cycles_company_id  ON payroll_cycles(company_id);
CREATE INDEX idx_notifications_recipient    ON notifications(recipient_id, read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cycles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_wallets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;

-- Helper: get company_id of the authenticated employer_user
CREATE OR REPLACE FUNCTION auth_employer_company_id()
RETURNS uuid AS $$
  SELECT company_id FROM employer_users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get employee_id of the authenticated employee
CREATE OR REPLACE FUNCTION auth_employee_id()
RETURNS uuid AS $$
  SELECT id FROM employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- COMPANIES: employer sees own company only
CREATE POLICY "employer sees own company"
  ON companies FOR SELECT
  USING (id = auth_employer_company_id());

-- EMPLOYER_USERS: user can always see their own row (needed for first login)
CREATE POLICY "employer sees own row"
  ON employer_users FOR SELECT
  USING (auth_user_id = auth.uid());

-- EMPLOYER_USERS: see colleagues in same company
CREATE POLICY "employer sees own company users"
  ON employer_users FOR SELECT
  USING (company_id = auth_employer_company_id());

CREATE POLICY "employer manages own company users (admin only)"
  ON employer_users FOR ALL
  USING (
    company_id = auth_employer_company_id()
    AND EXISTS (
      SELECT 1 FROM employer_users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- EMPLOYEES: employer sees employees of own company
CREATE POLICY "employer sees own employees"
  ON employees FOR SELECT
  USING (company_id = auth_employer_company_id());

CREATE POLICY "employer manages employees (hr/admin)"
  ON employees FOR ALL
  USING (
    company_id = auth_employer_company_id()
    AND EXISTS (
      SELECT 1 FROM employer_users
      WHERE auth_user_id = auth.uid() AND role IN ('admin','hr')
    )
  );

-- Employee sees only own record
CREATE POLICY "employee sees own record"
  ON employees FOR SELECT
  USING (auth_user_id = auth.uid());

-- PAYROLL_CYCLES
CREATE POLICY "employer sees own cycles"
  ON payroll_cycles FOR SELECT
  USING (company_id = auth_employer_company_id());

CREATE POLICY "employer manages cycles (finance/admin)"
  ON payroll_cycles FOR ALL
  USING (
    company_id = auth_employer_company_id()
    AND EXISTS (
      SELECT 1 FROM employer_users
      WHERE auth_user_id = auth.uid() AND role IN ('admin','finance')
    )
  );

-- ADVANCES: employer sees advances for their employees
CREATE POLICY "employer sees advances"
  ON advances FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE company_id = auth_employer_company_id()
    )
  );

CREATE POLICY "employer updates advances (finance/admin)"
  ON advances FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE company_id = auth_employer_company_id()
    )
    AND EXISTS (
      SELECT 1 FROM employer_users
      WHERE auth_user_id = auth.uid() AND role IN ('admin','finance')
    )
  );

-- Employee sees own advances
CREATE POLICY "employee sees own advances"
  ON advances FOR SELECT
  USING (employee_id = auth_employee_id());

CREATE POLICY "employee creates own advances"
  ON advances FOR INSERT
  WITH CHECK (employee_id = auth_employee_id());

-- EMPLOYEE_WALLETS
CREATE POLICY "employer sees wallets"
  ON employee_wallets FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE company_id = auth_employer_company_id()
    )
  );

CREATE POLICY "employee manages own wallets"
  ON employee_wallets FOR ALL
  USING (
    employee_id = auth_employee_id()
  );

-- NOTIFICATIONS
CREATE POLICY "user sees own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "user updates own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================================
-- DEMO SEED DATA
-- ============================================================
INSERT INTO companies (id, name, ruc, country, ewa_limit_pct, ewa_max_pct, max_advances_per_month, payroll_cycle, payroll_start_day, payroll_end_day)
VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Ripley Perú S.A.',
  '20331268064',
  'PE',
  50.00,
  75.00,
  2,
  'monthly',
  1,
  30
);

INSERT INTO payroll_cycles (id, company_id, period_start, period_end, payday, status)
VALUES (
  '22222222-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  '2026-03-01',
  '2026-03-31',
  '2026-03-31',
  'open'
);
