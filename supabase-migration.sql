-- ============================================
-- Door Showcase - Supabase Database Init
-- Run in Supabase SQL Editor
-- ============================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  area TEXT DEFAULT '',
  house_type TEXT DEFAULT '',
  renovation_type TEXT DEFAULT '',
  demand TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  visit_time TIMESTAMPTZ DEFAULT NOW()
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '木门',
  type TEXT NOT NULL DEFAULT '案例库',
  exif_time TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  image_id BIGINT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_phone, image_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_visits_phone ON visits(customer_phone);
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category, type);
CREATE INDEX IF NOT EXISTS idx_favorites_phone ON favorites(customer_phone);
CREATE INDEX IF NOT EXISTS idx_favorites_image ON favorites(image_id);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON favorites FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage Bucket (run in Supabase Dashboard)
-- Go to: Storage > New Bucket
-- Name: images
-- Public: YES
-- File size limit: 20MB
-- ============================================
