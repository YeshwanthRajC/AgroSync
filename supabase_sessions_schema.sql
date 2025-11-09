-- ============================================
-- UPDATED SUPABASE SQL SCHEMA FOR AGROSYNC
-- SESSION-BASED DRONE OPERATIONS
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
-- 2. DRONE OPERATION SESSIONS TABLE
-- Each session represents one drone operation
-- ============================================
CREATE TABLE IF NOT EXISTS public.drone_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_name text NOT NULL,
  session_date date DEFAULT CURRENT_DATE NOT NULL,
  start_time timestamptz DEFAULT now() NOT NULL,
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  notes text,
  total_areas integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.drone_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
  ON public.drone_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
  ON public.drone_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
  ON public.drone_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
  ON public.drone_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. SESSION MARKERS TABLE
-- Multiple markers belonging to one session
-- ============================================
CREATE TABLE IF NOT EXISTS public.session_markers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.drone_sessions ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  area_name text NOT NULL,
  location_name text,
  coordinates text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  marker_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.session_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session markers" 
  ON public.session_markers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session markers" 
  ON public.session_markers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own session markers" 
  ON public.session_markers FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 4. IMAGE ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.image_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES public.drone_sessions ON DELETE SET NULL,
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
-- 5. USER PREFERENCES TABLE
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
-- 6. WEATHER HISTORY TABLE
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
-- 7. FUNCTION: Update total_areas count
-- ============================================
CREATE OR REPLACE FUNCTION update_session_areas_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.drone_sessions
    SET total_areas = total_areas + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drone_sessions
    SET total_areas = GREATEST(0, total_areas - 1)
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update total_areas
DROP TRIGGER IF EXISTS update_areas_count ON public.session_markers;
CREATE TRIGGER update_areas_count
  AFTER INSERT OR DELETE ON public.session_markers
  FOR EACH ROW EXECUTE FUNCTION update_session_areas_count();

-- ============================================
-- 8. TRIGGERS (Auto-create profile)
-- ============================================
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

-- Triggers for updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_preferences_updated ON public.user_preferences;
CREATE TRIGGER on_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_session_updated ON public.drone_sessions;
CREATE TRIGGER on_session_updated
  BEFORE UPDATE ON public.drone_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_drone_sessions_user_id ON public.drone_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_sessions_date ON public.drone_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_drone_sessions_status ON public.drone_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_markers_session_id ON public.session_markers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_markers_user_id ON public.session_markers(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON public.image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_session_id ON public.image_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_weather_history_user_id ON public.weather_history(user_id);

-- ============================================
-- SETUP COMPLETE! ✅
-- ============================================
-- Tables created:
-- 1. profiles - User information
-- 2. drone_sessions - Operation sessions (grouping)
-- 3. session_markers - Individual markers within sessions
-- 4. image_analyses - Crop analysis results
-- 5. user_preferences - User settings
-- 6. weather_history - Weather logs
--
-- Features:
-- - Session-based grouping of drone operations
-- - Auto-count of areas per session
-- - Row Level Security enabled
-- - Performance indexes
-- - Automatic timestamps
