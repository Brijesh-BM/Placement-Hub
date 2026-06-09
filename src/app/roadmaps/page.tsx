'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Map, ArrowDown, ChevronRight, HelpCircle, BookOpen, Loader2, CheckCircle2, Award, Compass, Sparkles, Check, Lock } from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: string;
  order: number;
  title: string;
  description: string;
  topics: string | string[];
}

interface ProgressRecord {
  id: string;
  percentageCompleted: number;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  progress?: ProgressRecord[];
}

export default function RoadmapsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingStepId, setTogglingStepId] = useState<string | null>(null);

  // Completed steps tracking: maps roadmapId -> string[] of completed step IDs
  const [completedStepsMap, setCompletedStepsMap] = useState<{ [roadmapId: string]: string[] }>({});

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch('/api/roadmaps');
      if (res.ok) {
        const data = await res.json();
        if (data.roadmaps && data.roadmaps.length > 0) {
          setRoadmaps(data.roadmaps);
          setCompletedStepsMap(data.completedStepsMap || {});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchRoadmaps();
  }, [user, authLoading, router]);

  const handleToggleStep = async (roadmapId: string, stepId: string) => {
    setTogglingStepId(stepId);
    try {
      const res = await fetch('/api/roadmaps/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId, stepId }),
      });

      if (res.ok) {
        const json = await res.json();
        setCompletedStepsMap((prev) => ({
          ...prev,
          [roadmapId]: json.completedSteps || []
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingStepId(null);
    }
  };

  const activeRoadmap = roadmaps[activeIdx] || null;
  const completedList = activeRoadmap ? (completedStepsMap[activeRoadmap.id] || []) : [];
  const progressPercent = activeRoadmap && activeRoadmap.steps.length > 0
    ? Math.round((completedList.length / activeRoadmap.steps.length) * 100)
    : 0;

  // Static list for top overview cards matching product design spec
  const topRoadmapsMetadata = [
    { title: 'Software Engineer', stepsCount: 85, defaultPercentage: 72 },
    { title: 'Frontend Developer', stepsCount: 40, defaultPercentage: 12 },
    { title: 'Backend Developer', stepsCount: 50, defaultPercentage: 0 }
  ];

  // Dynamic modules progress tracking
  const modulesProgress = [
    { name: 'DSA', completed: progressPercent >= 60, progress: progressPercent >= 60 ? 100 : Math.round(progressPercent * 1.5) },
    { name: 'DBMS', completed: progressPercent >= 90, progress: progressPercent >= 90 ? 100 : Math.round(progressPercent * 1.2) },
    { name: 'OS', completed: progressPercent >= 100, progress: Math.min(100, Math.round(progressPercent * 0.4)) },
    { name: 'CN', completed: false, progress: Math.min(100, Math.round(progressPercent * 0.2)) },
    { name: 'Projects', completed: false, progress: 0 }
  ];

  // Milestone check state
  const milestones = [
    { name: 'Beginner', target: 0, desc: 'Introductory tests & basic variables', active: true },
    { name: 'Intermediate', target: 25, desc: 'Data structures & DBMS basics', active: progressPercent >= 25 },
    { name: 'Placement Ready', target: 60, desc: 'Advanced mock challenges & roadmaps', active: progressPercent >= 60 },
    { name: 'Interview Ready', target: 80, desc: 'Detailed OS systems design & mock panel', active: progressPercent >= 80 }
  ];

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Loading placement roadmaps...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Duolingo-Style Syllabus Paths</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Learning Roadmaps</h1>
          <p className="text-slate-550 text-sm mt-2 font-medium">
            Track your milestones and modules progression pathway from beginner to interview-ready status.
          </p>
        </div>

        {/* ROADMAP OVERVIEW GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {topRoadmapsMetadata.map((tr, i) => {
            const isCurrentActive = activeIdx === i || (i === 0 && activeIdx >= topRoadmapsMetadata.length);
            const displayPercent = isCurrentActive ? progressPercent : tr.defaultPercentage;
            
            return (
              <div 
                key={i} 
                onClick={() => i < roadmaps.length && setActiveIdx(i)}
                className={`bg-white border rounded-2xl p-6 shadow-sm cursor-pointer hover:border-indigo-300 transition-all ${
                  isCurrentActive ? 'border-indigo-650 ring-2 ring-indigo-500/10' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                    {tr.stepsCount} Steps
                  </span>
                  <span className="text-xs font-black text-slate-700">{displayPercent}% Complete</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">{tr.title}</h3>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3.5">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${displayPercent}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {activeRoadmap && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* LEFT COLUMN: TIMELINE ROADMAP CHECKLIST */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* DUOLINGO STYLE MODULE PATHWAYS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">Duolingo Pathway Modules</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {modulesProgress.map((m, idx) => (
                    <div key={idx} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-center relative overflow-hidden flex flex-col justify-between min-h-[125px]">
                      <div>
                        <span className="text-xs font-black text-slate-750 block">{m.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                          {m.progress === 100 ? 'Completed ✓' : `${m.progress}%`}
                        </span>
                      </div>
                      
                      {/* Checkbox indicator */}
                      <div className="mt-4 flex justify-center">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center border transition ${
                          m.progress === 100 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-white border-slate-250 text-slate-400'
                        }`}>
                          {m.progress === 100 ? <Check className="h-4.5 w-4.5" /> : `${m.progress}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical checklists timeline nodes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Step Description checklist</span>
                
                <div className="space-y-4">
                  {activeRoadmap.steps.map((step, idx) => {
                    const topicsList = Array.isArray(step.topics)
                      ? step.topics
                      : (typeof step.topics === 'string' ? step.topics.split(',').map(t => t.trim()) : []);
                    const isStepDone = completedList.includes(step.id);

                    return (
                      <div 
                        key={step.id} 
                        className={`p-5 rounded-2xl border flex items-start gap-4 transition duration-200 ${
                          isStepDone 
                            ? 'border-emerald-250 bg-emerald-50/25' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleStep(activeRoadmap.id, step.id)}
                          disabled={togglingStepId === step.id}
                          className={`h-10 w-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border transition ${
                            isStepDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {togglingStepId === step.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isStepDone ? (
                            <Check className="h-4.5 w-4.5" />
                          ) : (
                            `#${step.order}`
                          )}
                        </button>

                        <div className="space-y-2 flex-1">
                          <div>
                            <h4 className={`font-bold text-sm leading-snug ${
                              isStepDone ? 'text-emerald-850' : 'text-slate-800'
                            }`}>{step.title}</h4>
                            <p className="text-slate-500 text-xs leading-relaxed font-semibold mt-1">{step.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {topicsList.map((t, tIdx) => (
                              <span 
                                key={tIdx} 
                                className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[9px] font-bold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: MILESTONE TIMELINE NODES */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Roadmap Milestones</span>
                <p className="text-[11px] text-slate-500 font-semibold">Verify active stage checklist markers</p>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 py-2">
                {milestones.map((m, index) => (
                  <div key={index} className="relative text-left">
                    {/* Node Dot indicator */}
                    <div className={`absolute -left-[35px] top-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                      m.active 
                        ? 'border-indigo-650 bg-indigo-600 text-white' 
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}>
                      {m.active ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className={`font-extrabold text-sm ${m.active ? 'text-slate-800' : 'text-slate-400'}`}>{m.name}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-semibold">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
