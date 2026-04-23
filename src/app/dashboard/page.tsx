'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient, AttendanceSession, AttendanceLog } from '@/lib/supabase';
import Header from '@/components/Header';
import ProfileCard from '@/components/ProfileCard';
import AttendanceProgress from '@/components/AttendanceProgress';
import AttendanceButton from '@/components/AttendanceButton';
import AssignmentsList from '@/components/AssignmentsList';
import GradesTable from '@/components/GradesTable';
import FeedbackSection from '@/components/FeedbackSection';

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [hasMarked, setHasMarked] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const supabase = createClient();

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (profile === null) {
      // Profile not found — SQL not run yet or new user, redirect to login
      setTimeout(() => router.replace('/login'), 3000);
    }
    if (profile?.role === 'teacher') router.replace('/admin');
  }, [user, profile, loading]);

  // Fetch existing attendance logs for this student
  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', user.id)
      .order('marked_at', { ascending: false });
    setAttendanceLogs(data || []);
  }, [user]);

  // Fetch active session on load
  const fetchActiveSession = useCallback(async () => {
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    setActiveSession(data);

    // Check if this student already marked this session
    if (data && user) {
      const { data: log } = await supabase
        .from('attendance_logs')
        .select('id')
        .eq('session_id', data.id)
        .eq('student_id', user.id)
        .maybeSingle();
      setHasMarked(!!log);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchLogs();
    fetchActiveSession();

    // Real-time: listen for session changes
    const channel = supabase
      .channel('session-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendance_sessions',
      }, () => {
        fetchActiveSession();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchLogs, fetchActiveSession]);

  const handleMarkAttendance = async () => {
    if (!activeSession || !user) return;
    setIsMarking(true);

    const { error } = await supabase
      .from('attendance_logs')
      .insert({
        session_id: activeSession.id,
        student_id: user.id,
      });

    if (!error) {
      setHasMarked(true);
      await fetchLogs();
    }
    setIsMarking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3e5f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-purple-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3e5f5]">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="text-4xl">⚠️</div>
          <p className="text-sm font-bold text-gray-700">Profile not found</p>
          <p className="text-xs text-gray-400">The database tables may not be set up yet.<br/>Redirecting to login...</p>
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f9] pb-12 flex flex-col">
      <Header title="My DevOps Status ..." onSignOut={signOut} />

      <main className="flex-1 max-w-md mx-auto w-full">
        <ProfileCard
          name={profile.name}
          enrollment={profile.enrollment}
          branch={profile.branch}
          semester={profile.semester}
          proxyFlag={profile.proxy_flag}
        />

        <AttendanceProgress logs={attendanceLogs} />

        <AttendanceButton
          isActive={!!activeSession && !hasMarked}
          onMark={handleMarkAttendance}
          isLoading={isMarking}
          hasMarked={hasMarked}
        />

        <AssignmentsList />

        <GradesTable />

        <FeedbackSection />
      </main>

      <footer className="mt-8 py-4 border-t border-purple-100 text-center">
        <div className="text-[9px] text-purple-400 font-medium tracking-tight">
          Release: 2026-04-17 09:29:34 +05:30
        </div>
      </footer>
    </div>
  );
}
