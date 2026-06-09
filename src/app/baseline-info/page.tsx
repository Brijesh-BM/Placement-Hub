'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  Sparkles, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Compass,
  Radar,
  Building2,
  Map
} from 'lucide-react';

export default function BaselineInfoPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [testId, setTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchTestId = async () => {
      try {
        const testRes = await fetch('/api/tests/baseline');
        if (testRes.ok) {
          const testData = await testRes.json();
          setTestId(testData.testId);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTestId();
  }, [user, authLoading, router]);

  const handleStart = async () => {
    if (!testId) {
      alert('Baseline Assessment not found. Please contact support.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start attempt.');
      }

      router.push(`/test-engine/${data.attempt.id}`);
    } catch (e: any) {
      alert(e.message || 'Error starting assessment');
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>Onboarding Completed successfully!</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Next Step: Baseline Assessment
        </h2>
        <p className="text-slate-550 text-sm max-w-md mx-auto font-medium">
          Take our diagnostic baseline test to evaluate your placement preparation and unlock your Placement Snapshot.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-xl rounded-2xl sm:px-10 space-y-6 text-left">
          
          {/* Assessment parameters */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-55/10 text-indigo-600 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">TEST DURATION</span>
                <span className="text-xs font-extrabold text-slate-800">30 Minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-55/10 text-indigo-600 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">TOTAL QUESTIONS</span>
                <span className="text-xs font-extrabold text-slate-800">30 MCQs</span>
              </div>
            </div>
          </div>

          {/* Question structure */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assessment Structure:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
              <div className="p-2 bg-slate-50 border border-slate-150 text-slate-650 rounded-lg">
                <span>Aptitude</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">6 Qs</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-150 text-slate-650 rounded-lg">
                <span>Reasoning</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">6 Qs</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-150 text-slate-650 rounded-lg">
                <span>Verbal</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">6 Qs</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-150 text-slate-650 rounded-lg">
                <span>DSA</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">6 Qs</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-150 text-slate-650 rounded-lg col-span-2 sm:col-span-1">
                <span>Technical</span>
                <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">6 Qs</span>
              </div>
            </div>
          </div>

          {/* Unlock list */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">What you will unlock:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-650">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Placement Readiness Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Radar className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Skill Radar Chart</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Company Readiness Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Personalized Learning Roadmap</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-650/15"
            >
              {loading ? (
                <>
                  Locating Test ID...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Take Baseline Assessment
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
