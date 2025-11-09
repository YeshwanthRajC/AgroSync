-- ============================================
-- SAFE MIGRATION SCRIPT FOR SESSION-BASED OPERATIONS
-- This only adds NEW tables without touching existing ones
-- ============================================

-- ============================================
-- 1. CREATE NEW TABLES (Session-Based System)
-- ============================================

-- DRONE OPERATION SESSIONS TABLE
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

-- SESSION MARKERS TABLE
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

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.drone_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_markers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE POLICIES (with DROP IF EXISTS to avoid conflicts)
-- ============================================

-- Policies for drone_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.drone_sessions;
CREATE POLICY "Users can view own sessions" 
  ON public.drone_sessions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.drone_sessions;
CREATE POLICY "Users can insert own sessions" 
  ON public.drone_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.drone_sessions;
CREATE POLICY "Users can update own sessions" 
  ON public.drone_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.drone_sessions;
CREATE POLICY "Users can delete own sessions" 
  ON public.drone_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for session_markers
DROP POLICY IF EXISTS "Users can view own session markers" ON public.session_markers;
CREATE POLICY "Users can view own session markers" 
  ON public.session_markers FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own session markers" ON public.session_markers;
CREATE POLICY "Users can insert own session markers" 
  ON public.session_markers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own session markers" ON public.session_markers;
CREATE POLICY "Users can delete own session markers" 
  ON public.session_markers FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CREATE FUNCTION TO AUTO-COUNT AREAS
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

-- ============================================
-- 5. CREATE TRIGGER FOR AUTO-COUNTING
-- ============================================

DROP TRIGGER IF EXISTS update_areas_count ON public.session_markers;
CREATE TRIGGER update_areas_count
  AFTER INSERT OR DELETE ON public.session_markers
  FOR EACH ROW EXECUTE FUNCTION update_session_areas_count();

-- ============================================
-- 6. CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

DROP TRIGGER IF EXISTS on_session_updated ON public.drone_sessions;
CREATE TRIGGER on_session_updated
  BEFORE UPDATE ON public.drone_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_drone_sessions_user_id ON public.drone_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_sessions_date ON public.drone_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_drone_sessions_status ON public.drone_sessions(status);
CREATE INDEX IF NOT EXISTS idx_session_markers_session_id ON public.session_markers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_markers_user_id ON public.session_markers(user_id);

-- ============================================
-- 8. ADD session_id COLUMN TO image_analyses (if not exists)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'image_analyses' 
    AND column_name = 'session_id'
  ) THEN
    ALTER TABLE public.image_analyses 
    ADD COLUMN session_id uuid REFERENCES public.drone_sessions ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_image_analyses_session_id ON public.image_analyses(session_id);
  END IF;
END $$;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
-- 
-- What was created:
-- ✅ drone_sessions table (NEW)
-- ✅ session_markers table (NEW)
-- ✅ Row Level Security policies
-- ✅ Auto-count trigger for total_areas
-- ✅ Auto-update timestamp trigger
-- ✅ Performance indexes
-- ✅ session_id link in image_analyses
--
-- Your existing tables remain untouched:
-- ✅ profiles (unchanged)
-- ✅ drone_markers (old table - still exists but not used)
-- ✅ image_analyses (updated with session_id column)
-- ✅ user_preferences (unchanged)
-- ✅ weather_history (unchanged)
--
-- You can now use the session-based drone operations!
