ALTER TABLE public.places ADD COLUMN weekly_hours jsonb;
COMMENT ON COLUMN public.places.weekly_hours IS 'Per-day opening intervals keyed mon through sun; null retains legacy daily hours. Closing times at or before opening continue into the following day.';
GRANT UPDATE (name, latitude, longitude, address, zone, description, opening_hours, closing_hours, weekly_hours, specialties, image_url) ON public.places TO anon, authenticated;
CREATE POLICY "Anyone can edit active places" ON public.places FOR UPDATE TO anon, authenticated USING (is_active = true) WITH CHECK (is_active = true);
CREATE FUNCTION public.validate_weekly_hours() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE day_key text; entry jsonb;
BEGIN
  IF NEW.weekly_hours IS NULL THEN RETURN NEW; END IF;
  IF jsonb_typeof(NEW.weekly_hours) IS DISTINCT FROM 'object' OR (SELECT count(*) FROM jsonb_object_keys(NEW.weekly_hours)) <> 7 THEN
    RAISE EXCEPTION 'Weekly hours must contain seven days';
  END IF;
  FOREACH day_key IN ARRAY ARRAY['mon','tue','wed','thu','fri','sat','sun'] LOOP
    entry := NEW.weekly_hours -> day_key;
    IF entry IS NULL OR jsonb_typeof(entry) IS DISTINCT FROM 'object' OR jsonb_typeof(entry->'closed') IS DISTINCT FROM 'boolean' OR COALESCE(entry->>'open','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' OR COALESCE(entry->>'close','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN
      RAISE EXCEPTION 'Invalid weekly hours for %', day_key;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_places_weekly_hours BEFORE INSERT OR UPDATE OF weekly_hours ON public.places FOR EACH ROW EXECUTE FUNCTION public.validate_weekly_hours();