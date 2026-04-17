-- ============================================================
-- Treevü EWA — Pilot Company Seed
-- Migration 003
-- ============================================================

-- Pilot company
INSERT INTO companies (
  id, name, ruc, country,
  ewa_limit_pct, ewa_max_pct, max_advances_per_month,
  payroll_cycle, payroll_start_day, payroll_end_day
) VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Distribuidora Lima Norte S.A.C.',
  '20601234567',
  'PE',
  50.00, 75.00, 2,
  'monthly', 1, 30
) ON CONFLICT (id) DO NOTHING;

-- April 2026 payroll cycle
INSERT INTO payroll_cycles (
  id, company_id, period_start, period_end, payday, status
) VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  '2026-04-01',
  '2026-04-30',
  '2026-04-30',
  'open'
) ON CONFLICT (company_id, period_start, period_end) DO NOTHING;

-- Test employee — linked by email on first OTP login
INSERT INTO employees (
  id, company_id, employee_code,
  name, email, phone, dni,
  base_salary, salary_currency,
  start_date, position, department,
  ewa_enabled, active
) VALUES (
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'EMP-001',
  'Ana García',
  'acuba0103@gmail.com',
  '+51951234567',
  '12345678',
  3500.00, 'PEN',
  '2024-01-15',
  'Ejecutiva de Ventas',
  'Comercial',
  true, true
) ON CONFLICT DO NOTHING;

-- Wallet Yape
INSERT INTO employee_wallets (
  id, employee_id, type, number, alias, is_primary, verified
) VALUES (
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'yape',
  '951234567',
  'Yape Personal',
  true,
  true
) ON CONFLICT DO NOTHING;
