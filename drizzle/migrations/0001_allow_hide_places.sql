REVOKE UPDATE ON public.places FROM anon, authenticated;
GRANT UPDATE (is_active) ON public.places TO anon, authenticated;
CREATE POLICY "Anyone can remove places" ON public.places FOR UPDATE TO public USING (is_active = true) WITH CHECK (is_active = false);