-- Seed demo company
INSERT INTO public.companies (id, name, ruc, industry, employee_count, ewa_limit_percentage)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'TechCorp Peru SAC',
  '20123456789',
  'Tecnología',
  150,
  50.00
)
ON CONFLICT (ruc) DO NOTHING;

-- Note: Demo employee will be created automatically when a user signs up
-- The trigger will create the employee profile with the user's metadata
