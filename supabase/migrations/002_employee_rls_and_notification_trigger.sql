-- ============================================================
-- Treevü EWA — Migration 002
-- 1. Missing RLS policies for employee users (PWA access)
-- 2. Notification trigger on advance status changes
-- ============================================================

-- ── Employee reads own company (needed for EWA config via JOIN) ──────────────
CREATE POLICY "employee sees own company"
  ON companies FOR SELECT
  USING (
    id = (SELECT company_id FROM employees WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- ── Employee reads own payroll cycle ──────────────────────────────────────────
CREATE POLICY "employee sees company cycle"
  ON payroll_cycles FOR SELECT
  USING (
    company_id = (SELECT company_id FROM employees WHERE auth_user_id = auth.uid() LIMIT 1)
  );

-- ── Notification trigger function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_on_advance_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_auth_user_id uuid;
BEGIN
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  SELECT auth_user_id INTO v_auth_user_id
  FROM employees WHERE id = NEW.employee_id;

  IF v_auth_user_id IS NULL THEN RETURN NEW; END IF;

  IF NEW.status = 'approved' THEN
    INSERT INTO notifications (recipient_id, recipient_type, type, title, body, payload)
    VALUES (
      v_auth_user_id, 'employee', 'advance_approved',
      'Adelanto aprobado',
      'Tu solicitud de S/ ' || NEW.amount || ' fue aprobada.',
      jsonb_build_object('advance_id', NEW.id, 'amount', NEW.amount)
    );

  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO notifications (recipient_id, recipient_type, type, title, body, payload)
    VALUES (
      v_auth_user_id, 'employee', 'advance_rejected',
      'Solicitud rechazada',
      COALESCE('Motivo: ' || NEW.rejection_reason, 'Tu solicitud no fue aprobada.'),
      jsonb_build_object('advance_id', NEW.id)
    );

  ELSIF NEW.status = 'paid' THEN
    INSERT INTO notifications (recipient_id, recipient_type, type, title, body, payload)
    VALUES (
      v_auth_user_id, 'employee', 'advance_paid',
      'Dinero enviado',
      'S/ ' || NEW.amount || ' fue transferido a tu cuenta.',
      jsonb_build_object('advance_id', NEW.id, 'amount', NEW.amount)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_advance_notification
  AFTER UPDATE ON advances
  FOR EACH ROW EXECUTE FUNCTION notify_on_advance_status_change();
