'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient, AttendanceSession, Profile } from '@/lib/supabase';
import Header from '@/components/Header';
import { Timer, Users, Lock, Unlock, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedStudents, setMarkedStudents] = useState<{student: Profile, log: any}[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const supabase = createClient();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && profile?.role === 'student') router.replace('/dashboard');
  }, [user, profile, loading]);

  const fetchActiveSession = useCallback(async () => {
    const { data } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    setActiveSession(data);
    if (data?.expires_at) {
      const secondsLeft = Math.max(0, Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(secondsLeft);
    }
  }, []);

  const fetchMarkedStudents = useCallback(async (sessionId?: string) => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('attendance_logs')
      .select('*, student:profiles(*)')
      .eq('session_id', sessionId)
      .order('marked_at', { ascending: false });
    setMarkedStudents((data as any) || []);
  }, []);

  const fetchTotalStudents = useCallback(async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    setTotalStudents(count || 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchActiveSession();
    fetchTotalStudents();

    const channel = supabase
      .channel('admin-session-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, fetchActiveSession)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, (payload) => {
        fetchMarkedStudents(activeSession?.id || payload.new?.session_id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (activeSession) fetchMarkedStudents(activeSession.id);
  }, [activeSession]);

  // Countdown timer
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCloseAttendance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession?.id]);

  const handleOpenAttendance = async () => {
    if (!user) return;
    setIsCreating(true);
    const expiresAt = new Date(Date.now() + selectedDuration * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('attendance_sessions')
      .insert({ created_by: user.id, expires_at: expiresAt, duration_minutes: selectedDuration })
      .select()
      .single();
    if (data) {
      setActiveSession(data);
      setTimeLeft(selectedDuration * 60);
      setMarkedStudents([]);
    }
    setIsCreating(false);
  };

  const handleCloseAttendance = async () => {
    if (!activeSession) return;
    await supabase
      .from('attendance_sessions')
      .update({ is_active: false })
      .eq('id', activeSession.id);
    setActiveSession(null);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-purple-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="text-4xl">⚠️</div>
          <p className="text-sm font-bold text-gray-700">Profile not found</p>
          <p className="text-xs text-gray-400">Please run the SQL setup in Supabase first.<br/>Redirecting to login...</p>
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title={`Admin — ${profile.name}`} onSignOut={signOut} />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendance Control */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Attendance Control</h2>
                  <p className="text-sm text-gray-400">Open a window for students to mark attendance</p>
                </div>
                <div className={`p-3 rounded-full ${activeSession ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {activeSession ? <Unlock size={24} /> : <Lock size={24} />}
                </div>
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mb-6">
                {activeSession ? (
                  <>
                    <div className={`text-5xl font-black font-mono mb-2 ${timeLeft < 60 ? 'text-red-500' : 'text-purple-600'}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Time Remaining</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-bold">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      ATTENDANCE WINDOW OPEN
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center gap-2">
                    <ShieldAlert size={48} strokeWidth={1.5} />
                    <p className="font-medium">Attendance Window is Closed</p>
                    <p className="text-xs">Set a duration and click Open</p>
                  </div>
                )}
              </div>

              {/* Duration Selector */}
              {!activeSession && (
                <div className="mb-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Duration</p>
                  <div className="flex gap-2">
                    {[2, 3, 5, 10].map(d => (
                      <button key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          selectedDuration === d
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-200 text-gray-500 hover:border-purple-300'
                        }`}>
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={activeSession ? handleCloseAttendance : handleOpenAttendance}
                disabled={isCreating}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-60
                  ${activeSession ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#8e24aa] hover:bg-[#7b1fa2] text-white'}`}
              >
                {isCreating ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> OPENING...</>
                ) : activeSession ? (
                  <><Lock size={20} /> CLOSE ATTENDANCE NOW</>
                ) : (
                  <><Unlock size={20} /> OPEN FOR {selectedDuration} MINUTES</>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 mb-4">
                <Users size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Live Count</span>
              </div>
              <div className="text-4xl font-black text-gray-800">{markedStudents.length}</div>
              <p className="text-xs text-gray-400 mt-1">of {totalStudents} students marked</p>
              <div className="mt-4">
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full transition-all duration-500"
                    style={{ width: totalStudents > 0 ? `${(markedStudents.length / totalStudents) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-purple-900 p-5 rounded-2xl text-white">
              <h3 className="font-bold text-xs mb-1 flex items-center gap-2">
                <Timer size={14} /> Session Info
              </h3>
              <p className="text-purple-300 text-[10px]">
                {activeSession
                  ? `Opened at ${format(new Date(activeSession.created_at), 'hh:mm a')}`
                  : 'No active session'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Student List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              Students Who Marked Attendance
            </h3>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {markedStudents.length} Present
            </span>
          </div>

          {markedStudents.length === 0 ? (
            <div className="p-10 text-center text-gray-400 italic text-sm">
              {activeSession ? 'Waiting for students to mark attendance...' : 'Open an attendance window to start.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-purple-50 text-purple-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Enrollment</th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Sem</th>
                    <th className="px-4 py-3 text-left">Marked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {markedStudents.map((item: any, idx) => (
                    <tr key={item.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.student?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{item.student?.enrollment || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{item.student?.branch || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{item.student?.semester || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        {format(new Date(item.marked_at), 'hh:mm:ss a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
