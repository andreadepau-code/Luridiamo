-- Luridiamo Database Schema (Supabase)
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Places table (baracchini/paninari)
CREATE TABLE IF NOT EXISTS places (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  description TEXT,
  opening_hours TEXT,
  closing_hours TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial queries (simple B-tree for lat/lng)
CREATE INDEX IF NOT EXISTS places_lat_idx ON places (latitude);
CREATE INDEX IF NOT EXISTS places_lng_idx ON places (longitude);
CREATE INDEX IF NOT EXISTS places_active_idx ON places (is_active);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reviews
CREATE INDEX IF NOT EXISTS reviews_place_id_idx ON reviews (place_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews (created_at DESC);

-- User reports (crowdsourced additions)
CREATE TABLE IF NOT EXISTS user_reports (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  opening_hours TEXT,
  specialties TEXT[],
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reported_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data - 4 famous Milan night snack bars
INSERT INTO places (name, latitude, longitude, address, opening_hours, closing_hours, image_url, is_active, created_at) VALUES
  ('Il Re della Salamella', 45.4662, 9.1900, 'Piazzale Lotto, Milano', '20:00', '05:00', 'https://picsum.photos/seed/luridiamo1/200/150', true, NOW()),
  ('Paninaro San Siro', 45.4700, 9.1905, 'Via San Siro, Milano', '21:00', '04:00', 'https://picsum.photos/seed/luridiamo2/200/150', true, NOW()),
  ('Baracchino Navigli', 45.4705, 9.1950, 'Zona Navigli, Milano', '22:00', '06:00', 'https://picsum.photos/seed/luridiamo3/200/150', true, NOW()),
  ('Luridino San Beato', 45.4650, 9.1850, 'Via San Beato, Milano', '20:30', '05:30', 'https://picsum.photos/seed/luridiamo4/200/150', true, NOW())
ON CONFLICT DO NOTHING;

-- Seed reviews
INSERT INTO reviews (place_id, rating, comment, user_name, created_at) VALUES
  (1, 5, 'La salamella è incredibile!', 'Milanese1985', NOW()),
  (1, 4, 'Ottimo panino, ma la fila è lunga', 'NotteInCittà', NOW()),
  (2, 5, 'La piadina è perfetta', 'PaninaroFan', NOW()),
  (2, 4, 'Servizio un po’ lento', 'GiovaneMilano', NOW()),
  (3, 5, 'La cotoletta è la migliore!', 'CotolettaLover', NOW()),
  (3, 4, 'Ottimo ambiente notturno', 'NavigliWalker', NOW()),
  (4, 4, 'Buono ma un po’ affollato', 'SanBeatoLocal', NOW())
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Places are publicly readable" ON places FOR SELECT USING (true);
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "User reports are publicly readable" ON user_reports FOR SELECT USING (true);

-- Allow anyone to insert reviews and reports
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert user reports" ON user_reports FOR INSERT WITH CHECK (true);