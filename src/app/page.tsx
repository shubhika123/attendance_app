'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (profile?.role === 'teacher') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, profile, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3e5f5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-purple-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
