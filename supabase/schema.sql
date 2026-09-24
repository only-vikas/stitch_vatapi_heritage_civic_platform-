-- =========================================================
-- VATAPI HERITAGE WATCH ENGINE - ADVANCED PHASE 1 SCHEMA
-- Supabase PostgreSQL • Realtime • RLS • Storage
-- =========================================================

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 2. PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'artisan', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================
-- 3. ISSUES (Advanced Heritage Watch Engine)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Structural Damage',
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    jurisdiction TEXT NOT NULL DEFAULT 'ASI Dharwad Circle',
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'in_review', 'in_progress', 'resolved', 'closed', 'escalated')),
    photo_url TEXT,
    voice_note_url TEXT,
    upvotes INT NOT NULL DEFAULT 0,
    escalation_deadline TIMESTAMPTZ,
    resolution_lane TEXT DEFAULT 'government' CHECK (resolution_lane IN ('government', 'community', 'investor')),
    adopted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    adopted_group_name TEXT,
    adopted_action_plan TEXT,
    latitude DOUBLE PRECISION DEFAULT 15.9187,
    longitude DOUBLE PRECISION DEFAULT 75.6784,
    ai_confidence NUMERIC(4,1),
    ai_category TEXT,
    ai_severity TEXT,
    ai_jurisdiction TEXT,
    node_hash TEXT,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Anyone can view issues
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
CREATE POLICY "Anyone can view issues"
    ON public.issues FOR SELECT USING (true);

-- Authenticated users can insert issues
DROP POLICY IF EXISTS "Authenticated users can insert issues" ON public.issues;
CREATE POLICY "Authenticated users can insert issues"
    ON public.issues FOR INSERT WITH CHECK (true);

-- Reporter or officials can update issues (status, adoption, etc.)
DROP POLICY IF EXISTS "Reporter or officials can update issues" ON public.issues;
CREATE POLICY "Reporter or officials can update issues"
    ON public.issues FOR UPDATE USING (
        auth.uid() = reporter_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
        OR true  -- Allow community adoption updates
    );

-- ENABLE REALTIME on issues table
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;


-- =========================================================
-- 4. ISSUE UPVOTES (Community Confirmation)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(issue_id, user_id)  -- One upvote per user per issue
);

ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view upvotes" ON public.issue_upvotes;
CREATE POLICY "Anyone can view upvotes"
    ON public.issue_upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.issue_upvotes;
CREATE POLICY "Authenticated users can upvote"
    ON public.issue_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own upvote" ON public.issue_upvotes;
CREATE POLICY "Users can remove their own upvote"
    ON public.issue_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Auto-increment/decrement upvotes count on issues
CREATE OR REPLACE FUNCTION public.handle_upvote_insert()
RETURNS trigger AS $$
BEGIN
  UPDATE public.issues SET upvotes = upvotes + 1 WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_upvote_delete()
RETURNS trigger AS $$
BEGIN
  UPDATE public.issues SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.issue_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_upvote_insert ON public.issue_upvotes;
CREATE TRIGGER on_upvote_insert
  AFTER INSERT ON public.issue_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_upvote_insert();

DROP TRIGGER IF EXISTS on_upvote_delete ON public.issue_upvotes;
CREATE TRIGGER on_upvote_delete
  AFTER DELETE ON public.issue_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_upvote_delete();


-- =========================================================
-- 5. FOOD KITCHENS (Ooru Oota)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.food_kitchens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    distance TEXT,
    dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified BOOLEAN NOT NULL DEFAULT true,
    contact_phone TEXT,
    specialty_dish TEXT,
    rating NUMERIC(2,1) DEFAULT 4.8,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.food_kitchens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Food kitchens viewable by everyone" ON public.food_kitchens;
CREATE POLICY "Food kitchens viewable by everyone"
    ON public.food_kitchens FOR SELECT USING (true);


-- =========================================================
-- 6. WEAVERS (Artisan-to-Traveller)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.weavers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    gi_verified BOOLEAN NOT NULL DEFAULT true,
    location TEXT DEFAULT 'Guledgudda, Bagalkote',
    experience_years INT DEFAULT 15,
    loom_type TEXT DEFAULT 'Pit Loom',
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.weavers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weavers viewable by everyone" ON public.weavers;
CREATE POLICY "Weavers viewable by everyone"
    ON public.weavers FOR SELECT USING (true);


-- =========================================================
-- 7. STORAGE BUCKET: EVIDENCE
-- =========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence',
    'evidence',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Evidence Read Access" ON storage.objects;
CREATE POLICY "Public Evidence Read Access"
    ON storage.objects FOR SELECT USING (bucket_id = 'evidence');

DROP POLICY IF EXISTS "Anyone can upload evidence" ON storage.objects;
CREATE POLICY "Anyone can upload evidence"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'evidence');


-- =========================================================
-- 8. ESCALATION CRON FUNCTION
-- Called via pg_cron or Supabase Edge Function on schedule
-- Auto-escalates issues past their SLA deadline
-- =========================================================
CREATE OR REPLACE FUNCTION public.check_escalations()
RETURNS void AS $$
BEGIN
  UPDATE public.issues
  SET status = 'escalated', updated_at = NOW()
  WHERE escalation_deadline IS NOT NULL
    AND escalation_deadline < NOW()
    AND status NOT IN ('resolved', 'closed', 'escalated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================
-- 9. SEED DATA (Heritage Watch Demo Issues)
-- =========================================================

-- Seed Issues with escalation deadlines and resolution lanes
INSERT INTO public.issues (title, description, category, severity, jurisdiction, status, photo_url, upvotes, escalation_deadline, resolution_lane, latitude, longitude, ai_confidence, node_hash)
VALUES
(
  'Fissure observed on lintel beam near Cave No. 3 western portico after heavy seepage',
  'Automated high-res photogrammetry detected 94% confidence surface attrition. Micro-fissure displaying mineral runoff during unseasonal rains near the Mahavishnu relief panel. Urgent conservation team dispatch recommended.',
  'Structural Damage',
  'high',
  'ASI Dharwad Circle (Superintending Archaeologist)',
  'in_progress',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA2yMc0QTkYGg81TktaXl2DnNSBQ2vs1XQio9HY8VWQvAGYpwh4jdFfjw3DO2oF6a1YXBACNfwfazoyRjx9SSC03P91SkYVYL1-FQVw_mK3lWIbXHRENLJl1tL3dfk9wz0khPvUZZMhYgN8mo25WYwLea0Mg92F2igK4nwMT_eVUiuQlr1imrK0mlNMRE8Ms8NNMczTDtAfhZXpfpaZsGeaFR2oQsaaS-LpvjNmS8aEFpi8dLCdR5qy',
  7,
  NOW() + INTERVAL '14 hours',
  'government',
  15.9187, 75.6784, 98.2,
  '0x4f8a' || substr(md5(random()::text), 1, 8) || 'b19'
),
(
  'Commercial plastic accumulation along North Shore ghats obstructing pilgrim pathways',
  'Local Guide Shivakumar reported surge in weekend pilgrims leading to discarded water bottles and packaging along the Agastya Tirtha North Ghat stone steps. Community mobilization needed.',
  'Sanitation & Waste',
  'medium',
  'Badami Town Municipal Council (TMC)',
  'reported',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDGNoJjcJImomzEAE5Ddrh30d5MDmPX1xEZD6a_70J_pLPVo12huXvInxBnBNI8niYSS8vLXJ4Db95_fxyzB3a3LpSmWW-cUlkdqjWLgcGfCZ2s35s_NKTch2Lk0BavbDFH5Pnua1sgDjZhLAUDLyTQ7rvxjL-ldrGjf8o8aLAY0Reqvj-brRkAdEQqkOnFBfQsWHv6h8rwBJIvl-glYTwnUBPUoZRlLubajwYwE_sgNqM9NMXM6Ai_',
  12,
  NOW() + INTERVAL '42 hours',
  'community',
  15.9210, 75.6810, 92.1,
  '0x7c3d' || substr(md5(random()::text), 1, 8) || 'a42'
),
(
  'Unauthorized tourist tempo parking blocking emergency heritage buffer zone at Pattadakal',
  'CCTV AI auto-detected unauthorized commercial tourist minivans parked blocking the pedestrian sandstone buffer walkway at the Pattadakal UNESCO perimeter road.',
  'Encroachment & Transit',
  'medium',
  'Bagalkote District Police & Revenue Dept',
  'in_review',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5tJ1aUzEbjEqzS6CKoY0zf4QkxfznFuN2me-2AbrchGmBu6cIoQTjS6wu12P09yVDKgRCqHeKhiKa-VpBtToPfcB_DcwZBoT1p2SUTqjZn8IpxRy_NsdO8qNmVg7166ET0dh_AYQsR7_L8nSuG3KaFwZkb_j19WpQBbQSzqbVNSi9xjdv44ICyzUq9-5Re2t4WNKE_Bhl7SJ-MqRFJCjc8Z8Fvt3XOqkTG0YNt2kC1yG7b4y7IDt',
  5,
  NOW() + INTERVAL '58 hours',
  'government',
  16.0300, 75.8230, 89.4,
  '0x9e1f' || substr(md5(random()::text), 1, 8) || 'c78'
),
(
  'Restored QR code interpretive plaque at Aihole Lad Khan Temple with trilingual Kannada audio guide link',
  'ASI Dharwad & Civic Volunteers successfully installed refurbished brass and dark granite interpretive plaque with Kannada, English and Braille inscriptions at Aihole Lad Khan Chalukya temple courtyard.',
  'Monument Signage',
  'low',
  'ASI Dharwad & Civic Volunteers',
  'resolved',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwo1f9gAG9Om4lccDIsTzyt7qtIfi1wsgM1aWG947aSVkxZEL2qRZtJuA1ETylwFagKwEALXaHGpnlja0r6_0cGiccHp4CH8UDADRvJ5vs476sRStg6e09zT2jxggCfUQSBLYisKg4o9b53Xzd2S96T7pr2DjsfhNvy_Mvy-I0ydpv5ttYkk3OCAy-9bUksv2FKQuv3-d7R-gQt8voVenN9eO1BL_sFY_UpGaSOTSLdkgqw7i6xBr',
  22,
  NULL,
  'community',
  16.0150, 75.8819, 97.6,
  '0x8f2a' || substr(md5(random()::text), 1, 8) || 'c39'
),
(
  'Illegal hawker encroachment near Mahakuta Banashankari Temple entrance pathway',
  'Repeated encroachment by commercial stall vendors along the temple approach. Buffer zone violations obstructing the pilgrim walkway and emergency heritage vehicle access.',
  'Encroachment & Transit',
  'medium',
  'Badami TMC & Taluk Revenue',
  'reported',
  NULL,
  3,
  NOW() + INTERVAL '5 days',
  'investor',
  15.8900, 75.7200, 85.0,
  '0xab3e' || substr(md5(random()::text), 1, 8) || 'd56'
),
(
  'Weathering deterioration on Bhutanatha Temple stone carvings east facade',
  'Accelerated stone surface erosion observed on east-facing Nandi relief carvings. Likely due to unseasonal wind-driven moisture. Heritage conservation assessment required by ASI structural geologist.',
  'Structural Damage',
  'critical',
  'ASI Dharwad Circle (Superintending Archaeologist)',
  'reported',
  NULL,
  15,
  NOW() - INTERVAL '2 hours',  -- Already PAST deadline = ESCALATED
  'government',
  15.9210, 75.6770, 96.8,
  '0xfe22' || substr(md5(random()::text), 1, 8) || 'e91'
)
ON CONFLICT DO NOTHING;


-- Seed Food Kitchens
INSERT INTO public.food_kitchens (name, location, distance, dietary_tags, verified, specialty_dish, rating)
VALUES
('Mallikarjuna Jolada Rotti Mane', 'Badami Cave Temple Road', '0.4 km', ARRAY['Pure Vegetarian', 'North Karnataka Thali', 'Sattvic'], true, 'Jolada Rotti with Yennegai & Shenga Chutney', 4.9),
('Basaveshwara Khanavali', 'Near Agastya Lake, Badami', '0.8 km', ARRAY['Vegetarian', 'Gluten-Free Rotti'], true, 'Authentic Jowar Bhakri, Sajje Rotti & Kaalu Palya', 4.8),
('Mahakuta Amrutha Oota', 'Mahakuta Temple Complex', '4.2 km', ARRAY['Vegetarian', 'Prasada Thali'], true, 'Traditional Temple Meals on Banana Leaf', 4.7),
('Banashankari Mahila Mandali Kitchen', 'Cholachagudda / Banashankari', '5.1 km', ARRAY['Community Kitchen', 'Vegetarian'], true, 'Kadabu, Shenga Holige & Pithla', 4.9)
ON CONFLICT DO NOTHING;

-- Seed Weavers
INSERT INTO public.weavers (name, specialty, gi_verified, location, experience_years, loom_type)
VALUES
('Veeresh Handloom Guild', 'Guledgudda Khana Choli Fabrics (GI Tagged)', true, 'Guledgudda, Ward 4', 28, 'Traditional Pit Loom'),
('Kaveri Artisan Collective', 'Ilkal Pure Silk Saree with Chikki Paras Border', true, 'Ilkal Weaving Cluster', 22, 'Fly Shuttle Loom'),
('Badami Heritage Weaving Society', 'Chalukya Motifs Handloom Scarves & Dhoti', true, 'Badami Old Town', 18, 'Hand Loom'),
('Shree Shakambari Khana Weavers', 'Geometric Kasuti & Khana Blouse Pieces', true, 'Guledgudda Main Market', 32, 'Heritage Jacquard Pit Loom')
ON CONFLICT DO NOTHING;


-- =========================================================
-- 10. POOL RIDES (Circuit Planner & Seat Pooling)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.pool_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_name TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    total_seats INT NOT NULL DEFAULT 6,
    available_seats INT NOT NULL DEFAULT 4,
    route TEXT NOT NULL,
    fare_per_seat NUMERIC NOT NULL DEFAULT 60,
    vehicle_type TEXT DEFAULT 'Force Trax Cruiser',
    driver_phone TEXT DEFAULT '+91 98452 11842',
    rating NUMERIC(2,1) DEFAULT 4.8,
    co2_saved_kg NUMERIC DEFAULT 12,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pool_rides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pool rides viewable by everyone" ON public.pool_rides;
CREATE POLICY "Pool rides viewable by everyone"
    ON public.pool_rides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update available seats" ON public.pool_rides;
CREATE POLICY "Anyone can update available seats"
    ON public.pool_rides FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert rides" ON public.pool_rides;
CREATE POLICY "Anyone can insert rides"
    ON public.pool_rides FOR INSERT WITH CHECK (true);

-- Enable Realtime for pool_rides
ALTER PUBLICATION supabase_realtime ADD TABLE public.pool_rides;

-- Seed Pool Rides
INSERT INTO public.pool_rides (driver_name, departure_time, total_seats, available_seats, route, fare_per_seat, vehicle_type, rating, co2_saved_kg)
VALUES
('Ramesh Pujar', '08:45 AM', 6, 3, 'Badami Station ⇄ Cave Temples ⇄ Mahakuta', 60, 'Force Trax Cruiser (EV Retrofit)', 4.9, 12),
('Basavaraj Hallur', '10:30 AM', 7, 2, 'Badami ⇄ Pattadakal UNESCO Complex', 80, 'Mahindra Bolero Maxi Truck', 4.8, 20),
('Manjunath Badami', '01:15 PM', 6, 4, 'Pattadakal ⇄ Aihole Historical Enclosure', 70, 'KSRTC EV Feeder Shuttle', 4.9, 8),
('Suresh K. Chulachagudda', '02:30 PM', 6, 1, 'Badami ⇄ Mahakuta ⇄ Pattadakal ⇄ Aihole (Full Circuit)', 140, 'Force Cruiser 4x4 Heritage Line', 4.7, 20),
('Yallappa Ganiger', '05:15 PM', 6, 5, 'Aihole ⇄ Mahakuta ⇄ Badami (Sunset Return)', 90, 'Tata Winger Eco Shared Transit', 4.8, 4)
ON CONFLICT DO NOTHING;


-- =========================================================
-- 11. CROWD FORECASTS (Prompt 5.1.1)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.crowd_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL,
    hour_slot TEXT NOT NULL,
    visitor_count INT NOT NULL,
    capacity_limit INT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.crowd_forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Crowd forecasts viewable by everyone" ON public.crowd_forecasts;
CREATE POLICY "Crowd forecasts viewable by everyone"
    ON public.crowd_forecasts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert crowd forecasts" ON public.crowd_forecasts;
CREATE POLICY "Anyone can insert crowd forecasts"
    ON public.crowd_forecasts FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.crowd_forecasts;

-- Seed Simulated Data for Badami, Pattadakal, and Aihole across 4-time slots (7AM, 11AM, 3PM, 5PM)
INSERT INTO public.crowd_forecasts (site_name, hour_slot, visitor_count, capacity_limit)
VALUES
-- Badami Caves (Capacity: 3,500)
('Badami Caves', '07:00 AM', 420, 3500),
('Badami Caves', '11:00 AM', 3325, 3500), -- 95% Peak
('Badami Caves', '03:00 PM', 1850, 3500), -- 53% Moderate
('Badami Caves', '05:00 PM', 3290, 3500), -- 94% Peak

-- Pattadakal (Capacity: 4,000)
('Pattadakal', '07:00 AM', 210, 4000),   -- 5% Low
('Pattadakal', '11:00 AM', 1400, 4000),  -- 35% Moderate
('Pattadakal', '03:00 PM', 1650, 4000),  -- 41% Moderate
('Pattadakal', '05:00 PM', 380, 4000),   -- 9% Low

-- Aihole (Capacity: 3,000)
('Aihole', '07:00 AM', 150, 3000),       -- 5% Low
('Aihole', '11:00 AM', 450, 3000),       -- 15% Low
('Aihole', '03:00 PM', 1650, 3000),      -- 55% Moderate
('Aihole', '05:00 PM', 620, 3000)        -- 20% Low
ON CONFLICT DO NOTHING;


-- =========================================================
-- 12. SUSTAINABILITY METRICS (Water, Waste & Eco-Sentinel)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.sustainability_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type TEXT NOT NULL DEFAULT 'Water', -- 'Water', 'Waste', 'Crowd'
    location TEXT NOT NULL DEFAULT 'Agastya Lake',
    dissolved_oxygen NUMERIC(4,2), -- mg/L
    ph NUMERIC(3,2), -- pH
    turbidity NUMERIC(5,2), -- NTU
    algal_biomass NUMERIC(4,2) DEFAULT 0.12, -- RFU
    purity_index INT DEFAULT 82,
    photo_url TEXT,
    notes TEXT,
    reported_by TEXT DEFAULT 'Citizen Sentinel',
    hotspot_name TEXT,
    hotspot_status TEXT, -- 'Cleared', 'Medium', 'High'
    debris_kg NUMERIC,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sustainability metrics viewable by everyone" ON public.sustainability_metrics;
CREATE POLICY "Sustainability metrics viewable by everyone"
    ON public.sustainability_metrics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert sustainability metrics" ON public.sustainability_metrics;
CREATE POLICY "Anyone can insert sustainability metrics"
    ON public.sustainability_metrics FOR INSERT WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sustainability_metrics;

-- Seed Water & Waste telemetry
INSERT INTO public.sustainability_metrics (metric_type, location, dissolved_oxygen, ph, turbidity, algal_biomass, purity_index, photo_url, notes, reported_by)
VALUES
('Water', 'Agastya Lake North Ghat', 6.8, 7.4, 14.0, 0.12, 82, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkdRVaVwWe2-n_1MD1jf_sqVLgEbYBRzzr0F6FHMf6Sk37BxGc2XQBcOcCQzgzucHQwQJ-MMsXkk5LxiNwIOMPFNv2cGsTSBHLWZrv4HSyQXBAvPhC0NH0Q40PDuaR575JaxbI-k94q5dJbZPtgLLx-hESg8jzXFAd8cebCkpyXOUL4kz9Y6fZcc5k3P5QGK2wwb2kRZtXRCAcl0KK_ExrYvDiVUAW7EMjHrVcUFbafe-XqWa9VEYr', 'Routine morning sensor reading. Optimal transparency.', 'Karnataka SPCB Sensor #AG-1'),
('Water', 'Agastya Lake Silt Trap #2', 6.5, 7.3, 16.5, 0.14, 78, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAJso531CrM-pfXq_R2d8YDc3-DS7nrrUslLlk2UU61SppAsZ-JfbX2HqKDyVoJTRKvJ6K5LnkaJwnqfs91XQpvenY7ksU93PY2OV29Zj5kmCVmR32eKmo1gp70P2PghqAkLiLQcfGAsrLKUUFuo0IaVrEpCuxJWPV1smhSYrsFiwW9gKUzEaY7O0WxL5DcTTD-X_uVGhFThUPjENhpAZfOlzNeovSIooLr1perze4qknTBuLgPQ6_', 'Inlet check before temple tank cascade.', 'Field Officer Suresh Pujar'),
('Water', 'Agastya Lake East Basin', 7.1, 7.5, 12.0, 0.10, 85, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmPCnRDXtITFdwoVg2sWR09C1DnHfytvXH3zaAG5htmxy7y5RbOSIIHXNYCXlymr0stXi9xPu7eG1UjIup-L2WeR-1F6h9_8d969sVA9lMNLTmYLeNWIJYv4kGjAt2yNYDr22vpk1M1xE9jaJZX-F2mu50Z91ysTusPEXDMP9U-xQP7p6TcUPQOnfxlIy4WOz4YXmiq-hwfbaNgaDxFtiVnXSk0zh8Cds0ADruwnIYV5XPklbokZGB', 'Bhutanatha temple reflection shoreline. Very low turbidity.', 'Citizen Sentinel Basamma')
ON CONFLICT DO NOTHING;


