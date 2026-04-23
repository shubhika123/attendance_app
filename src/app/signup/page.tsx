'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowRight, Eye, EyeOff, AlertCircle, UserCircle2, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const TEACHER_SECRET_CODE = 'DEVOPS2024'; // Teacher registration code

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    enrollment: '',
    branch: '',
    semester: '',
    teacherCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'teacher' && form.teacherCode !== TEACHER_SECRET_CODE) {
      setError('Invalid teacher access code. Please contact your administrator.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          name: form.name,
          enrollment: form.enrollment,
          branch: form.branch,
          semester: form.semester,
          role: role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profile is created automatically via DB trigger
      if (role === 'teacher') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
          {/* Header */}
          <div className="bg-[#8e24aa] p-6 text-center text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                <GraduationCap size={28} />
              </div>
              <h1 className="text-xl font-black">Create Account</h1>
              <p className="text-purple-200 text-[10px] font-medium mt-1 uppercase tracking-widest">
                Attendance Pro
              </p>
            </div>
          </div>

          <div className="p-6">
            {step === 'role' ? (
              // Step 1: Pick role
              <div>
                <h2 className="text-base font-black text-gray-800 mb-1">I am a...</h2>
                <p className="text-xs text-gray-400 mb-6">Choose your account type to get started</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setRole('student')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      role === 'student'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <UserCircle2 size={32} />
                    <span className="font-bold text-sm">Student</span>
                    <span className="text-[10px] text-center leading-relaxed opacity-70">Mark attendance and track your progress</span>
                  </button>

                  <button
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      role === 'teacher'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <Shield size={32} />
                    <span className="font-bold text-sm">Teacher</span>
                    <span className="text-[10px] text-center leading-relaxed opacity-70">Open/close attendance and manage students</span>
                  </button>
                </div>

                <button
                  onClick={() => setStep('form')}
                  className="w-full bg-[#8e24aa] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#7b1fa2] transition-all flex items-center justify-center gap-2"
                >
                  CONTINUE AS {role.toUpperCase()}
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              // Step 2: Fill in details
              <div>
                <button
                  onClick={() => setStep('role')}
                  className="text-[10px] font-bold text-gray-400 hover:text-purple-600 mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Change role
                </button>

                <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full mb-4 ${
                  role === 'teacher' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {role === 'teacher' ? <Shield size={12} /> : <UserCircle2 size={12} />}
                  Signing up as {role}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      placeholder="Shubhika Jain"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">University Email</label>
                    <input name="email" value={form.email} onChange={handleChange} required type="email"
                      placeholder="name@university.edu"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
                  </div>

                  {role === 'student' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrollment Number</label>
                        <input name="enrollment" value={form.enrollment} onChange={handleChange} required
                          placeholder="06401192024"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Branch</label>
                          <select name="branch" value={form.branch} onChange={handleChange} required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all">
                            <option value="">Select</option>
                            <option value="AIML">AIML</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Semester</label>
                          <select name="semester" value={form.semester} onChange={handleChange} required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all">
                            <option value="">Select</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={String(s)}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'teacher' && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teacher Access Code</label>
                      <input name="teacherCode" value={form.teacherCode} onChange={handleChange} required
                        placeholder="Enter the secret code given by admin"
                        className="w-full px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
                      <p className="text-[9px] text-amber-600 mt-1 font-medium">This code is provided by the system administrator.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Password</label>
                    <div className="relative">
                      <input name="password" value={form.password} onChange={handleChange} required
                        type={showPassword ? 'text' : 'password'} minLength={6}
                        placeholder="Min 6 characters"
                        className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#8e24aa] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#7b1fa2] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        CREATING ACCOUNT...
                      </>
                    ) : (
                      <>CREATE ACCOUNT <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            <div className="mt-5 text-center">
              <p className="text-[11px] text-gray-400 font-medium">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-600 font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
