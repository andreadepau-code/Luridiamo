CREATE TABLE public.places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  zone text,
  description text,
  opening_hours text NOT NULL DEFAULT '20:00',
  closing_hours text NOT NULL DEFAULT '04:00',
  specialties text[] NOT NULL DEFAULT '{}',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.places TO anon, authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Places readable" ON public.places FOR SELECT USING (true);
CREATE POLICY "Anyone can add places" ON public.places FOR INSERT WITH CHECK (is_active = true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (char_length(comment) <= 500),
  user_name text NOT NULL DEFAULT 'Anonimo' CHECK (char_length(user_name) <= 40),
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews readable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can review" ON public.reviews FOR INSERT WITH CHECK (true);

INSERT INTO public.places (id, name, latitude, longitude, address, zone, description, opening_hours, closing_hours, specialties) VALUES
('11111111-1111-1111-1111-111111111111','Il Re della Salamella',45.4781,9.1240,'Piazzale Angelo Moratti','San Siro','Il classico baracchino fuori dallo stadio: piastra rovente e cipolle a volontà.','19:00','04:00',ARRAY['Salamella completa','Hamburger','Patatine']),
('22222222-2222-2222-2222-222222222222','Paninaro di Piazzale Lotto',45.4806,9.1460,'Piazzale Lorenzo Lotto','Lotto','Leggendario punto di ritrovo post-serata, aperto fino all''alba.','20:00','06:00',ARRAY['Salamella','Porchetta','Cotoletta']),
('33333333-3333-3333-3333-333333333333','Il Lurido di Garibaldi',45.4846,9.1864,'Via Ceresio / Corso Como','Garibaldi','Dopo i locali di Corso Como, la fermata obbligata.','22:00','05:00',ARRAY['Salamella','Piadina','Würstel']),
('44444444-4444-4444-4444-444444444444','Baracchino dei Navigli',45.4520,9.1760,'Alzaia Naviglio Grande / Darsena','Navigli','Sulla Darsena, panini caldi per chi esce dai bar del Naviglio.','21:00','03:00',ARRAY['Porchetta','Salamella','Bombette']);

INSERT INTO public.reviews (place_id, rating, comment, user_name, tags) VALUES
('11111111-1111-1111-1111-111111111111',5,'Dopo il derby è religione.','Marco',ARRAY['Piastra sempre calda','Salse a volontà']),
('11111111-1111-1111-1111-111111111111',4,'Un po'' di coda ma ne vale la pena.','Giulia',ARRAY['Prezzi ok']),
('22222222-2222-2222-2222-222222222222',5,'Alle 5 di mattina è il paradiso.','Luca',ARRAY['Piastra sempre calda','Prezzi ok']),
('33333333-3333-3333-3333-333333333333',4,'Piadina ottima, salamella top.','Sara',ARRAY['Salse a volontà']),
('44444444-4444-4444-4444-444444444444',3,'Buono ma chiude presto.','Ale',ARRAY['Prezzi ok']);

CREATE POLICY "Public photo read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public photo upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');