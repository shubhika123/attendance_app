import { useState, useEffect, useCallback } from 'react';
import { createClient, AttendanceSession } from '@/lib/supabase';

export function useAttendanceSession() {
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const supabase = createClient();

  const fetchSession = useCallback(async () => {
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    setSession(data);
    setIsActive(!!data);
  }, []);

  useEffect(() => {
    fetchSession();

    const channel = supabase
      .channel('attendance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_sessions',
      }, fetchSession)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSession]);

  return { isActive, session };
}
