-- ============================================================
-- Treevü EWA — Migration 003
-- Seed demo employees for Ripley Perú S.A.
-- auth_user_id is NULL — linked after employee's first OTP login
-- ============================================================

INSERT INTO employees (
  id, company_id, name, dni, phone,
  base_salary, position, department,
  active, ewa_enabled, start_date
) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Ana García',       '45123456', '+51987654321', 2400, 'Vendedora',      'Tienda',    true,  true,  '2022-01-15'),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Luis Torres',      '47891234', '+51976543210', 3200, 'Supervisor',     'Tienda',    true,  true,  '2020-06-01'),
  ('aaaaaaaa-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'María Quispe',     '43567890', '+51965432109', 2800, 'Cajera',         'Caja',      true,  true,  '2021-09-10'),
  ('aaaaaaaa-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Jorge Huanca',     '46234567', '+51954321098', 2600, 'Almacenero',     'Logística', true,  false, '2023-02-20'),
  ('aaaaaaaa-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Rosa Mamani',      '44890123', '+51943210987', 2400, 'Vendedora',      'Tienda',    true,  true,  '2022-07-05'),
  ('aaaaaaaa-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'Pedro Ccopa',      '48345678', '+51932109876', 4500, 'Gerente Tienda', 'Gerencia',  true,  true,  '2019-03-01'),
  ('aaaaaaaa-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000001', 'Carmen López',     '41678901', '+51921098765', 2800, 'Cajera Senior',  'Caja',      true,  true,  '2021-11-15'),
  ('aaaaaaaa-0000-0000-0000-000000000008', '11111111-0000-0000-0000-000000000001', 'Marco Villanueva', '49012345', '+51910987654', 3000, 'Técnico IT',     'TI',        false, false, '2023-01-10')
ON CONFLICT DO NOTHING;

-- ── Link employee to auth user after first OTP login ─────────────────────────
-- After an employee logs in via phone OTP for the first time, run:
--
--   UPDATE employees
--   SET auth_user_id = '<uuid from supabase auth.users>'
--   WHERE phone = '+51<phone_number>';
--
-- Or use the Supabase Dashboard → Authentication → Users to find the UUID.
