-- ==============================================================================
-- VATAPI HERITAGE WATCH: THE ORACLE PREDICTIVE AI & MICRO-CROWDFUNDING ENGINE
-- ==============================================================================

-- 1. Environmental Logs Table (30-day telemetry for Oracle Predictive AI)
CREATE TABLE IF NOT EXISTS public.environmental_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT NOT NULL DEFAULT 'Badami Cave 3',
    humidity NUMERIC(5,2) NOT NULL, -- e.g. 78.50%
    temperature NUMERIC(5,2) NOT NULL, -- e.g. 34.20°C
    footfall_count INT NOT NULL, -- daily visitor count
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.environmental_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view environmental logs" ON public.environmental_logs;
CREATE POLICY "Public can view environmental logs"
    ON public.environmental_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can insert environmental logs" ON public.environmental_logs;
CREATE POLICY "Service can insert environmental logs"
    ON public.environmental_logs FOR INSERT WITH CHECK (true);

-- 2. Crowdfunding Campaigns Table (Investor Lane Micro-Crowdfunding)
CREATE TABLE IF NOT EXISTS public.crowdfunding_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
    current_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    backers_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'funded', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.crowdfunding_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view crowdfunding campaigns" ON public.crowdfunding_campaigns;
CREATE POLICY "Public can view crowdfunding campaigns"
    ON public.crowdfunding_campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update crowdfunding campaigns" ON public.crowdfunding_campaigns;
CREATE POLICY "Public can update crowdfunding campaigns"
    ON public.crowdfunding_campaigns FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can insert crowdfunding campaigns" ON public.crowdfunding_campaigns;
CREATE POLICY "Public can insert crowdfunding campaigns"
    ON public.crowdfunding_campaigns FOR INSERT WITH CHECK (true);

-- 3. Donations Table (Adopt-A-Crack micro-contributions: ₹10, ₹50, ₹100)
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.crowdfunding_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    donor_name TEXT DEFAULT 'Anonymous Citizen',
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view donations" ON public.donations;
CREATE POLICY "Public can view donations"
    ON public.donations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert donations" ON public.donations;
CREATE POLICY "Public can insert donations"
    ON public.donations FOR INSERT WITH CHECK (true);

-- Enable Realtime publication for crowdfunding campaigns & donations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'crowdfunding_campaigns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.crowdfunding_campaigns;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'donations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
  END IF;
END $$;

-- 4. Seed 30 Days of Mock Weather and Crowd Data for Badami Cave 3
DELETE FROM public.environmental_logs WHERE site_name = 'Badami Cave 3';

INSERT INTO public.environmental_logs (site_name, humidity, temperature, footfall_count, date)
VALUES
  ('Badami Cave 3', 68.2, 33.5, 2100, CURRENT_DATE - INTERVAL '29 days'),
  ('Badami Cave 3', 70.1, 34.0, 2350, CURRENT_DATE - INTERVAL '28 days'),
  ('Badami Cave 3', 72.4, 34.8, 2200, CURRENT_DATE - INTERVAL '27 days'),
  ('Badami Cave 3', 75.0, 35.2, 2800, CURRENT_DATE - INTERVAL '26 days'),
  ('Badami Cave 3', 79.5, 33.1, 3900, CURRENT_DATE - INTERVAL '25 days'), -- Weekend surge
  ('Badami Cave 3', 82.3, 32.5, 4400, CURRENT_DATE - INTERVAL '24 days'), -- Weekend surge
  ('Badami Cave 3', 74.1, 33.8, 2150, CURRENT_DATE - INTERVAL '23 days'),
  ('Badami Cave 3', 71.8, 34.4, 2050, CURRENT_DATE - INTERVAL '22 days'),
  ('Badami Cave 3', 69.5, 35.0, 2250, CURRENT_DATE - INTERVAL '21 days'),
  ('Badami Cave 3', 73.2, 35.5, 2400, CURRENT_DATE - INTERVAL '20 days'),
  ('Badami Cave 3', 77.8, 34.1, 2600, CURRENT_DATE - INTERVAL '19 days'),
  ('Badami Cave 3', 84.5, 31.8, 4100, CURRENT_DATE - INTERVAL '18 days'), -- High humidity + crowd
  ('Badami Cave 3', 86.0, 31.2, 4750, CURRENT_DATE - INTERVAL '17 days'),
  ('Badami Cave 3', 79.2, 33.0, 2300, CURRENT_DATE - INTERVAL '16 days'),
  ('Badami Cave 3', 75.4, 34.2, 2180, CURRENT_DATE - INTERVAL '15 days'),
  ('Badami Cave 3', 72.0, 35.1, 2220, CURRENT_DATE - INTERVAL '14 days'),
  ('Badami Cave 3', 74.8, 35.6, 2500, CURRENT_DATE - INTERVAL '13 days'),
  ('Badami Cave 3', 80.1, 33.4, 2750, CURRENT_DATE - INTERVAL '12 days'),
  ('Badami Cave 3', 85.3, 32.0, 4300, CURRENT_DATE - INTERVAL '11 days'),
  ('Badami Cave 3', 88.2, 31.5, 4920, CURRENT_DATE - INTERVAL '10 days'), -- Peak stress day
  ('Badami Cave 3', 83.4, 32.8, 2450, CURRENT_DATE - INTERVAL '9 days'),
  ('Badami Cave 3', 78.1, 33.9, 2380, CURRENT_DATE - INTERVAL '8 days'),
  ('Badami Cave 3', 76.5, 34.5, 2300, CURRENT_DATE - INTERVAL '7 days'),
  ('Badami Cave 3', 74.0, 35.2, 2620, CURRENT_DATE - INTERVAL '6 days'),
  ('Badami Cave 3', 79.6, 34.0, 2900, CURRENT_DATE - INTERVAL '5 days'),
  ('Badami Cave 3', 86.4, 32.2, 4550, CURRENT_DATE - INTERVAL '4 days'),
  ('Badami Cave 3', 87.8, 31.7, 4800, CURRENT_DATE - INTERVAL '3 days'),
  ('Badami Cave 3', 81.2, 33.1, 2600, CURRENT_DATE - INTERVAL '2 days'),
  ('Badami Cave 3', 78.5, 34.0, 2520, CURRENT_DATE - INTERVAL '1 day'),
  ('Badami Cave 3', 82.0, 33.6, 3100, CURRENT_DATE);
