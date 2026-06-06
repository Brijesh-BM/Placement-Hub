'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, Sparkles } from 'lucide-react';

export default function AnalysisPage() {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const steps = [
    "Analyzing Performance",
    "Generating Skill Scores",
    "Analyzing Weak Areas",
    "Matching Companies",
    "Building Learning Path"
  ];

  useEffect(() => {
    let id: string | null = null;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      id = searchParams.get('attemptId');
      setAttemptId(id);
    }

    if (!id) {
      router.push('/dashboard');
      return;
    }

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/placement-snapshot/${attemptId}`);
          }, 800);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [attemptId, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 text-center space-y-8 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div 
            className="h-full bg-indigo-650 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Diagnosis Header */}
        <div className="space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full animate-bounce">
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Placement Snapshot Engine</h2>
          <p className="text-slate-550 text-xs font-semibold">Running diagnostic algorithms on baseline results</p>
        </div>

        {/* List of loading states */}
        <div className="space-y-4 text-left">
          {steps.map((text, idx) => {
            const isCompleted = step > idx;
            const isActive = step === idx;
            
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-350 ${
                  isCompleted 
                    ? 'bg-emerald-50/50 border-emerald-150 text-emerald-800' 
                    : (isActive ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 shadow-sm' : 'bg-slate-50/20 border-slate-150 text-slate-400')
                }`}
              >
                <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 text-xs transition ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                    : (isActive ? 'border-indigo-600 bg-white text-indigo-600' : 'border-slate-300 bg-slate-50 text-slate-400')
                }`}>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                
                <span className={`text-xs font-extrabold ${isActive ? 'translate-x-1 transition' : ''}`}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Final footer status */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Status: {step === steps.length - 1 ? 'Completing build path...' : 'Processing telemetry data...'}
        </div>

      </div>
    </div>
  );
}
