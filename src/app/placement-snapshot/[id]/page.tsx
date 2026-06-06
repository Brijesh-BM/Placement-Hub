'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Sparkles, 
  Award, 
  ArrowRight, 
  Loader2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Building2,
  ListTodo
} from 'lucide-react';

interface AttemptData {
  attempt: {
    id: string;
    percentage: number;
    score: number;
    maxScore: number;
  };
  result: {
    accuracy: number;
    topicAnalysis: any; // JSON object or string
  } | null;
}

export default function PlacementSnapshotPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptData | null>(null);

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        const res = await fetch(`/api/results/${attemptId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          router.push('/dashboard');
        }
      } catch (e) {
        console.error(e);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptData();
    }
  }, [attemptId, router]);

  const handleEnterDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const score = data?.attempt.percentage ?? 62;
  
  // Parse topic analysis
  let strengths: string[] = [];
  let improvements: string[] = [];
  
  if (data?.result?.topicAnalysis) {
    try {
      const topicScores = typeof data.result.topicAnalysis === 'string'
        ? JSON.parse(data.result.topicAnalysis)
        : (data.result.topicAnalysis || {});
      Object.keys(topicScores).forEach(topic => {
        if (topicScores[topic] >= 75) {
          strengths.push(topic);
        } else {
          improvements.push(topic);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Fallbacks if lists are empty
  if (strengths.length === 0) {
    strengths = ['DBMS', 'OOP', 'SQL'];
  }
  if (improvements.length === 0) {
    improvements = ['DSA', 'Operating Systems', 'Computer Networks'];
  }

  // Determine readiness matches based on score
  const readyCompanies = score >= 60 ? ['TCS', 'Infosys', 'Wipro'] : ['TCS'];
  const stretchCompanies = ['Amazon', 'Microsoft', 'Google'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-8 text-center">
        
        {/* Sparkle Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-150 text-indigo-750 rounded-full text-xs font-black shadow-sm">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse animate-in spin duration-1000" />
          <span>Placement Snapshot Career Diagnostics</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 space-y-6 text-left relative overflow-hidden">
          
          {/* Diagnostic score circle */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-100 pb-6">
            <div className="relative h-28 w-28 shrink-0 flex items-center justify-center bg-indigo-50/50 rounded-full border border-indigo-100 shadow-inner">
              <div className="text-center">
                <span className="text-4xl font-black text-slate-800 leading-none">{Math.round(score)}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">/ 100</span>
              </div>
            </div>
            
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-indigo-650 uppercase tracking-widest block">BASELINE PLACEMENT DIAGNOSIS</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Placement Snapshot</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                We have generated your baseline skills assessment index. Unlock your personalised learning roadmap below.
              </p>
            </div>
          </div>

          {/* Diagnosis columns: Strengths vs Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-emerald-755 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Strengths
              </span>
              <div className="flex flex-wrap gap-2">
                {strengths.map((s, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-lg shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-rose-755 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-500" />
                Needs Improvement
              </span>
              <div className="flex flex-wrap gap-2">
                {improvements.map((i, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-rose-200 text-rose-700 text-xs font-extrabold rounded-lg shadow-sm">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Company readiness matchups */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Building2 className="h-4.5 w-4.5 text-slate-400" />
              Initial Company Match
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block uppercase">READY TO INTERVIEW</span>
                <div className="flex flex-wrap gap-1.5">
                  {readyCompanies.map((c, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block uppercase">STRETCH GOALS (NOT YET READY)</span>
                <div className="flex flex-wrap gap-1.5">
                  {stretchCompanies.map((c, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Center checklist */}
          <div className="space-y-3.5">
            <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="h-4.5 w-4.5 text-indigo-550" />
              Recommended Actions
            </span>

            <div className="space-y-2 text-xs font-semibold text-slate-650">
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0">1</span>
                <span>Complete DSA Mock Test to practice weak topics</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0">2</span>
                <span>Improve operating systems core components</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center rounded-full text-[10px] shrink-0">3</span>
                <span>Read Deadlock Notes under Learning Notes directory</span>
              </div>
            </div>
          </div>

          {/* Enter Dashboard CTA button */}
          <div className="pt-4">
            <button
              onClick={handleEnterDashboard}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-650/15"
            >
              Enter Dashboard Command Center
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
