-- Allow a newly-authenticated user to find and link their own employee record by email
CREATE POLICY "employee self-link by email"
  ON employees FOR SELECT
  USING (email = auth.email() AND auth_user_id IS NULL);

CREATE POLICY "employee update own auth_user_id"
  ON employees FOR UPDATE
  USING (email = auth.email() AND auth_user_id IS NULL)
  WITH CHECK (auth_user_id = auth.uid());
