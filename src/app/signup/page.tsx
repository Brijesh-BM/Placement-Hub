'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GraduationCap, Lock, Mail, User, Building, BookOpen, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function SignupPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          college,
          branch,
          gradYear: parseInt(gradYear, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      await refreshSession();
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50">
      {/* Left Column - Branded Panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20%" cy="30%" r="250" fill="white" />
            <circle cx="80%" cy="80%" r="300" fill="white" />
          </svg>
        </div>

        <div className="z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">PlacementHub</span>
          </div>
        </div>

        <div className="z-10 space-y-6 max-w-lg my-auto">
          <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Prepare for placements with confidence.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed font-medium">
            Practice aptitude, coding, interviews, and company-specific assessments in one place.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-extrabold">25,000+</h3>
              <p className="text-indigo-250 text-sm mt-1">Questions</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-extrabold">500+</h3>
              <p className="text-indigo-250 text-sm mt-1">Mock Tests</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-extrabold">1,000+</h3>
              <p className="text-indigo-250 text-sm mt-1">Interview Experiences</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="text-2xl font-extrabold">100+</h3>
              <p className="text-indigo-250 text-sm mt-1">Companies</p>
            </div>
          </div>
        </div>

        <div className="z-10 text-sm text-indigo-200 font-medium">
          © {new Date().getFullYear()} PlacementHub. Platform for student success.
        </div>
      </div>

      {/* Right Column - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center md:hidden">
            <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-2xl mb-4">
              <GraduationCap className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Sign up to track mock tests, practice daily challenges, and earn badges
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="hidden md:block mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Sign up to access mock engines and diagnostic tracking</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Brijesh Sharma"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@placementhub.com"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    College
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="LDRP Institute"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Branch
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-455" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Eng."
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Graduation Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
                    <select
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition text-sm appearance-none"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Register & Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>



            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
