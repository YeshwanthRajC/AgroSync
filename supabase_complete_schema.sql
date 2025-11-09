-- ============================================
-- COMPLETE SUPABASE SQL SCHEMA FOR AGROSYNC
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (User Information)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- 2. DRONE MARKERS TABLE (Map Markers)
-- ============================================
CREATE TABLE IF NOT EXISTS public.drone_markers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  area text NOT NULL,
  location_name text,
  coordinates text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.drone_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own markers" 
  ON public.drone_markers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own markers" 
  ON public.drone_markers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own markers" 
  ON public.drone_markers FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. IMAGE ANALYSES TABLE (Crop Analysis Results)
-- ============================================
CREATE TABLE IF NOT EXISTS public.image_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  image_url text,
  analysis_result jsonb,
  crop_health text,
  recommendations text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" 
  ON public.image_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" 
  ON public.image_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. USER PREFERENCES TABLE (Settings)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  default_location text,
  default_latitude numeric,
  default_longitude numeric,
  weather_alerts boolean DEFAULT true,
  theme text DEFAULT 'light',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" 
  ON public.user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
  ON public.user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON public.user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================
-- 5. WEATHER HISTORY TABLE (Weather Data Logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.weather_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  location text NOT NULL,
  temperature numeric,
  humidity numeric,
  wind_speed numeric,
  weather_condition text,
  data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.weather_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather history" 
  ON public.weather_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather history" 
  ON public.weather_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGERS (Auto-create profile on signup)
-- ============================================

-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for user_preferences table
DROP TRIGGER IF EXISTS on_preferences_updated ON public.user_preferences;
CREATE TRIGGER on_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_drone_markers_user_id ON public.drone_markers(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_markers_created_at ON public.drone_markers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON public.image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_created_at ON public.image_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_history_user_id ON public.weather_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_history_created_at ON public.weather_history(created_at DESC);

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- All tables, policies, triggers, and indexes have been created.
-- Your AgroSync database is ready to use!
