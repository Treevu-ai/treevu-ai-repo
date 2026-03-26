import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Schema creation SQL split into smaller chunks to avoid execution issues
const schemaQueries = [
  // Companies table
  `CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ruc TEXT UNIQUE NOT NULL,
    industry TEXT,
    employee_count INTEGER DEFAULT 0,
    ewa_limit_percentage DECIMAL(5,2) DEFAULT 50.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Employee profiles
  `CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT UNIQUE,
    phone TEXT,
    monthly_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
    hire_date DATE,
    department TEXT,
    position TEXT,
    financial_wellness_score INTEGER DEFAULT 50,
    total_ewa_withdrawn DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // EWA Requests
  `CREATE TABLE IF NOT EXISTS public.ewa_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('yape', 'plin', 'bank_transfer')),
    payment_account TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Transactions history
  `CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    ewa_request_id UUID REFERENCES public.ewa_requests(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('ewa_withdrawal', 'ewa_repayment', 'salary_credit')),
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // Financial metrics
  `CREATE TABLE IF NOT EXISTS public.financial_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    earned_salary DECIMAL(10,2) NOT NULL,
    available_for_ewa DECIMAL(10,2) NOT NULL,
    ewa_usage_count INTEGER DEFAULT 0,
    avg_request_amount DECIMAL(10,2) DEFAULT 0,
    days_since_last_ewa INTEGER,
    wellness_score INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, metric_date)
  );`,

  // Education progress
  `CREATE TABLE IF NOT EXISTS public.education_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, module_id)
  );`,

  // Enable RLS
  `ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.ewa_requests ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;`,

  // RLS Policies for employees
  `CREATE POLICY IF NOT EXISTS "employees_select_own" ON public.employees
    FOR SELECT USING (auth.uid() = id);`,

  `CREATE POLICY IF NOT EXISTS "employees_update_own" ON public.employees
    FOR UPDATE USING (auth.uid() = id);`,

  `CREATE POLICY IF NOT EXISTS "employees_insert_own" ON public.employees
    FOR INSERT WITH CHECK (auth.uid() = id);`,

  // RLS Policies for ewa_requests
  `CREATE POLICY IF NOT EXISTS "ewa_requests_select_own" ON public.ewa_requests
    FOR SELECT USING (employee_id = auth.uid());`,

  `CREATE POLICY IF NOT EXISTS "ewa_requests_insert_own" ON public.ewa_requests
    FOR INSERT WITH CHECK (employee_id = auth.uid());`,

  // RLS Policies for transactions
  `CREATE POLICY IF NOT EXISTS "transactions_select_own" ON public.transactions
    FOR SELECT USING (employee_id = auth.uid());`,

  // RLS Policies for financial_metrics
  `CREATE POLICY IF NOT EXISTS "financial_metrics_select_own" ON public.financial_metrics
    FOR SELECT USING (employee_id = auth.uid());`,

  // RLS Policies for education_progress
  `CREATE POLICY IF NOT EXISTS "education_progress_select_own" ON public.education_progress
    FOR SELECT USING (employee_id = auth.uid());`,

  `CREATE POLICY IF NOT EXISTS "education_progress_insert_own" ON public.education_progress
    FOR INSERT WITH CHECK (employee_id = auth.uid());`,

  `CREATE POLICY IF NOT EXISTS "education_progress_update_own" ON public.education_progress
    FOR UPDATE USING (employee_id = auth.uid());`,

  // Companies policy
  `CREATE POLICY IF NOT EXISTS "companies_select_by_employee" ON public.companies
    FOR SELECT USING (
      id IN (SELECT company_id FROM public.employees WHERE id = auth.uid())
    );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_employees_company ON public.employees(company_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ewa_requests_employee ON public.ewa_requests(employee_id);`,
  `CREATE INDEX IF NOT EXISTS idx_ewa_requests_status ON public.ewa_requests(status);`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_employee ON public.transactions(employee_id);`,
  `CREATE INDEX IF NOT EXISTS idx_financial_metrics_employee_date ON public.financial_metrics(employee_id, metric_date);`,
]

async function runMigrations() {
  console.log('[v0] Starting database migrations...')

  for (let i = 0; i < schemaQueries.length; i++) {
    try {
      const { error } = await supabase.rpc('exec', {
        statement: schemaQueries[i],
      })

      if (error) {
        // Some errors are expected (e.g., "already exists")
        if (!error.message.includes('already exists')) {
          console.warn(`[v0] Query ${i + 1} warning: ${error.message}`)
        }
      } else {
        console.log(`[v0] Query ${i + 1}/${schemaQueries.length} executed`)
      }
    } catch (err) {
      console.warn(`[v0] Query ${i + 1} error: ${err}`)
    }
  }

  console.log('[v0] Migration completed')
}

runMigrations().catch(console.error)
