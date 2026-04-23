import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
  );


export type Profile = {
  id: string;
  name: string;
  enrollment: string;
  branch: string;
  semester: string;
  role: 'student' | 'teacher';
  proxy_flag: boolean;
  created_at: string;
};

export type AttendanceSession = {
  id: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string | null;
  duration_minutes: number;
};

export type AttendanceLog = {
  id: string;
  session_id: string;
  student_id: string;
  marked_at: string;
};
