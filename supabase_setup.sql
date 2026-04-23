-- ============================================================
-- ATTENDANCE APP - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE (stores extra user data linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment TEXT,
  branch TEXT,
  semester TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  proxy_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATTENDANCE SESSIONS TABLE (teacher creates these)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 3
);

-- 3. ATTENDANCE LOGS TABLE (students mark here)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.attendance_sessions(id) NOT NULL,
  student_id UUID REFERENCES public.profiles(id) NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)  -- prevents double-marking
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Profiles: users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles: users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles: users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: teachers can read all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'teacher'
  ));

-- ATTENDANCE SESSIONS policies
CREATE POLICY "Sessions: anyone authenticated can read"
  ON public.attendance_sessions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sessions: only teachers can insert"
  ON public.attendance_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'
  ));

CREATE POLICY "Sessions: only teachers can update"
  ON public.attendance_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'
  ));

-- ATTENDANCE LOGS policies
CREATE POLICY "Logs: students can insert own logs"
  ON public.attendance_logs FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Logs: students can read own logs"
  ON public.attendance_logs FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Logs: teachers can read all logs"
  ON public.attendance_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'
  ));

-- ============================================================
-- ENABLE REAL-TIME on sessions (so students get instant updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;

-- ============================================================
-- FUNCTION: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, enrollment, branch, semester, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'enrollment', ''),
    COALESCE(NEW.raw_user_meta_data->>'branch', ''),
    COALESCE(NEW.raw_user_meta_data->>'semester', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger that fires after each new auth user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
