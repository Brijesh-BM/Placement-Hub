'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  Briefcase, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  Loader2, 
  AlertTriangle,
  Award,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck,
  CheckSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Trophy,
  Activity,
  Flame,
  ThumbsUp,
  XCircle
} from 'lucide-react';

interface RoundItem {
  id: string;
  roundNumber: number;
  roundName: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  passingScore: number;
  topics: string[];
  prepTips: string | null;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface PYQItem {
  id: string;
  year: number;
  role: string;
  round: string;
  question: string;
  answer: string;
  explanation: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  questionsAsked: string;
  experience: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  selected: boolean;
  year: number;
  roundsText: string | null;
  prepTips: string | null;
  isAnonymous: boolean;
  upvoteCount: number;
}

interface CompanyDetail {
  id: string;
  name: string;
  logoUrl: string | null;
  hiringPattern: string;
  eligibilityCriteria: string;
  hiringRounds: RoundItem[];
  faqs: FaqItem[];
  pyqs: PYQItem[];
  experiences: ExperienceItem[];
  tests: Array<{ id: string; title: string }>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const nameParam = (params?.name as string) || '';
  const companyName = nameParam.charAt(0).toUpperCase() + nameParam.slice(1).toLowerCase();

  const [data, setData] = useState<{
    company: CompanyDetail;
    overallReadiness: number;
    successProbability: string;
    breakdown: Record<string, number>;
    strongAreas: string[];
    weakAreas: string[];
    roundReadiness: number[];
    leaderboard: Array<{ rank: number; name: string; score: number }>;
    userRank: number;
    roadmap: Array<{ week: string; title: string; desc: string; topics: string[] }>;
    analytics: { attempted: number; avgReadiness: number; placementReady: number; diffRound: string; failedTopic: string };
    recommendations: { tests: Array<{ id: string; title: string; type: string }>; notes: Array<{ id: string; title: string; category: string }> };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'pattern' | 'pyqs' | 'faqs'>('roadmap');
  
  // Modal State for OA Simulator Instructions
  const [selectedRoundForSim, setSelectedRoundForSim] = useState<RoundItem | null>(null);
  const [simStarting, setSimStarting] = useState(false);

  // Round completion status (persisted in localStorage)
  const [completedRounds, setCompletedRounds] = useState<Record<string, boolean>>({});

  // Expanded explanations toggles in PYQs tab
  const [expandedPYQs, setExpandedPYQs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const res = await fetch(`/api/companies/${nameParam.toLowerCase()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          
          // Load completed rounds from local storage
          const stored = localStorage.getItem(`placementhub_rounds_completed_${user.id}_${json.company.id}`);
          if (stored) {
            setCompletedRounds(JSON.parse(stored));
          }
        }
      } catch (e) {
        console.error('Failed to load company details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [nameParam, user, authLoading, router]);

  const toggleRoundCompletion = (roundId: string) => {
    if (!data || !user) return;
    const nextCompleted = {
      ...completedRounds,
      [roundId]: !completedRounds[roundId]
    };
    setCompletedRounds(nextCompleted);
    localStorage.setItem(
      `placementhub_rounds_completed_${user.id}_${data.company.id}`,
      JSON.stringify(nextCompleted)
    );
  };

  const handleStartSimulation = async () => {
    if (!selectedRoundForSim) return;
    setSimStarting(true);
    try {
      const res = await fetch('/api/attempts/start-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: selectedRoundForSim.id })
      });
      if (res.ok) {
        const json = await res.json();
        // Automatically mark OA round completed
        toggleRoundCompletion(selectedRoundForSim.id);
        router.push(`/test-engine/${json.attemptId}`);
      } else {
        alert('Failed to start assessment simulator. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error launching proctored test environment.');
    } finally {
      setSimStarting(false);
      setSelectedRoundForSim(null);
    }
  };

  const togglePYQ = (id: string) => {
    setExpandedPYQs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'EASY') return 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400';
    if (diff === 'MEDIUM') return 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400';
    return 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400';
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-550 mt-4 text-sm font-semibold">Loading target analysis...</span>
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center space-y-4 min-h-screen">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <span className="text-slate-700 font-bold">Company profile is under construction.</span>
        <Link href="/company-hub" className="text-indigo-600 font-semibold hover:underline">
          Return to Hub Index
        </Link>
      </div>
    );
  }

  const { company, overallReadiness, successProbability, breakdown, strongAreas, weakAreas, roundReadiness, leaderboard, userRank, roadmap, analytics, recommendations } = data;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Navigation back */}
        <Link 
          href="/company-hub" 
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-650 transition text-xs font-bold"
        >
          <ArrowLeft className="h-4.5 w-4.5" /> Back to Company Hub
        </Link>

        {/* HERO HEADER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col lg:flex-row justify-between gap-8 relative overflow-hidden">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-2xl shrink-0">
              <Building2 className="h-10 w-10" />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{company.name} Hub</h1>
                <span className="text-[10px] font-bold border border-indigo-200 bg-indigo-50/50 text-indigo-700 px-3 py-1 rounded-full uppercase">
                  Avg Package: {company.logoUrl ? company.logoUrl : 'Premium'}
                </span>
              </div>
              <p className="text-slate-550 text-sm font-semibold leading-relaxed max-w-xl">
                Prepare for the entire {company.name} recruitment journey from a single unified preparation module.
              </p>
              
              {/* Highlights row */}
              <div className="flex flex-wrap gap-5 text-xs font-bold text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4.5 w-4.5 text-indigo-500" /> {company.hiringRounds.length} Rounds</span>
                <span className="flex items-center gap-1.5"><Users className="h-4.5 w-4.5 text-indigo-500" /> {company.experiences.length} Live Reviews</span>
                <span className="flex items-center gap-1.5"><Award className="h-4.5 w-4.5 text-indigo-500" /> {company.pyqs.length} PYQs Selections</span>
              </div>
            </div>
          </div>

          {/* Student Specific Readiness Section */}
          <div className="flex flex-wrap items-center gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 shrink-0 lg:max-w-md w-full lg:w-fit justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">SUCCESS ESTIMATOR</span>
              <span className="font-black text-slate-800 text-lg block">{company.name} Readiness</span>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                  Probability: <span className="font-extrabold text-indigo-650">{successProbability}</span>
                </span>
              </div>
            </div>

            <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="6.5" fill="transparent" />
                <circle cx="40" cy="40" r="34" stroke="#6366f1" strokeWidth="6.5" fill="transparent"
                  strokeDasharray="213.6" strokeDashoffset={213.6 - (213.6 * overallReadiness) / 100} />
              </svg>
              <span className="text-lg font-black text-slate-800">{overallReadiness}%</span>
            </div>
          </div>
        </div>

        {/* ANALYTICS BOARD */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Students Attempted</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{analytics.attempted.toLocaleString()}</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Average Readiness</span>
            <span className="text-xl font-black text-indigo-650 block mt-1">{analytics.avgReadiness}%</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Placement Ready</span>
            <span className="text-xl font-black text-emerald-600 block mt-1">{analytics.placementReady}%</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Most Difficult Round</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-1 line-clamp-1">{analytics.diffRound}</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Most Failed Topic</span>
            <span className="text-sm font-extrabold text-rose-600 block mt-1">{analytics.failedTopic}</span>
          </div>
        </div>

        {/* CORE CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Area: 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TABS SELECTOR */}
            <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex-1 py-3 text-center text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'roadmap'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Roadmap & Rounds
              </button>
              <button
                onClick={() => setActiveTab('pattern')}
                className={`flex-1 py-3 text-center text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'pattern'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Process & Eligibility
              </button>
              <button
                onClick={() => setActiveTab('pyqs')}
                className={`flex-1 py-3 text-center text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'pyqs'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Previous PYQs
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`flex-1 py-3 text-center text-xs font-extrabold rounded-xl transition ${
                  activeTab === 'faqs'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                FAQs
              </button>
            </div>

            {/* TAB CONTENT: ROADMAP & ROUNDS */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                
                {/* 4-Week Custom Roadmap */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">4-Week Target Timeline</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {roadmap.map((week, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="text-[10px] font-black text-indigo-650 bg-indigo-50 w-fit px-2 py-0.5 rounded">
                          {week.week}
                        </div>
                        <h5 className="font-extrabold text-xs text-slate-800 leading-snug">{week.title}</h5>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{week.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round modules */}
                <div className="space-y-6">
                  {company.hiringRounds.map((round, index) => {
                    const isCompleted = !!completedRounds[round.id];
                    const readiness = roundReadiness[index] || overallReadiness;

                    // Filter experiences relating to this round
                    const isOA = round.roundName.toLowerCase().includes('online') || round.roundName.toLowerCase().includes('oa');
                    const isHR = round.roundName.toLowerCase().includes('hr') || round.roundName.toLowerCase().includes('behavioral');
                    const roundExperiences = company.experiences.filter(exp => {
                      if (isOA) return exp.roundsText?.toLowerCase().includes('oa') || exp.roundsText?.toLowerCase().includes('online');
                      if (isHR) return exp.roundsText?.toLowerCase().includes('hr') || exp.roundsText?.toLowerCase().includes('behavioral');
                      return exp.roundsText?.toLowerCase().includes('tech') || exp.roundsText?.toLowerCase().includes('coding');
                    }).slice(0, 2);

                    return (
                      <div key={round.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 text-left relative overflow-hidden">
                        
                        {/* Completed Indicator header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleRoundCompletion(round.id)}
                              className="text-slate-300 hover:text-indigo-650 transition shrink-0"
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-50" />
                              ) : (
                                <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
                              )}
                            </button>
                            <div>
                              <h4 className="font-black text-slate-900 text-lg leading-none">
                                Round {round.roundNumber}: {round.roundName}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold block mt-1">{round.description}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-slate-400 block">ROUND READINESS</span>
                              <span className="text-xs font-black text-indigo-650">{readiness}%</span>
                            </div>
                            <div className={`h-8.5 w-8.5 rounded-full border flex items-center justify-center text-[10px] font-black ${getDifficultyColor(round.difficulty)}`}>
                              {round.difficulty.slice(0, 3)}
                            </div>
                          </div>
                        </div>

                        {/* Round Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-xs font-bold">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Duration</span>
                            <span className="text-slate-700">{round.duration} Minutes</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Success Rate</span>
                            <span className="text-slate-700">{round.roundNumber === 1 ? '68%' : '52%'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Passing Score</span>
                            <span className="text-slate-700">{round.passingScore}%</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Topics Tested</span>
                            <span className="text-slate-700 line-clamp-1">{round.topics.join(', ')}</span>
                          </div>
                        </div>

                        {/* Prep Roadmap tips */}
                        {round.prepTips && (
                          <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/50 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-800 block">Preparation Guide</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1">{round.prepTips}</p>
                          </div>
                        )}

                        {/* Embedded Interview Experiences */}
                        {roundExperiences.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Recent Candidate Experiences</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {roundExperiences.map(exp => (
                                <div key={exp.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 relative">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 font-bold">{exp.isAnonymous ? 'Anonymous Candidate' : 'Placement Student'}</span>
                                    <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${
                                      exp.selected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                                    }`}>
                                      {exp.selected ? 'Selected' : 'Rejected'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed italic font-semibold line-clamp-2">
                                    "{exp.experience}"
                                  </p>
                                  <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-1.5 flex items-center justify-between">
                                    <span>Asked: {exp.questionsAsked.split('\n')[0].replace('1. ', '')}</span>
                                    <span className="flex items-center gap-0.5 text-slate-500"><ThumbsUp className="h-3 w-3" /> {exp.upvoteCount}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Round Actions Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {isOA ? (
                            <>
                              <button 
                                onClick={() => setSelectedRoundForSim(round)}
                                className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-sm"
                              >
                                Start OA Simulator
                              </button>
                              <Link 
                                href="/practice"
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Practice OA Questions
                              </Link>
                              <button 
                                onClick={() => setActiveTab('pyqs')}
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                View Previous OA Questions
                              </button>
                            </>
                          ) : isHR ? (
                            <>
                              <Link 
                                href="/notes"
                                className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-sm"
                              >
                                HR Question Bank
                              </Link>
                              <Link 
                                href="/interview-experiences"
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Behavioral Interview Simulator
                              </Link>
                              <Link 
                                href="/notes"
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Leadership Principles Guide
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link 
                                href="/practice"
                                className="px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition shadow-sm"
                              >
                                Practice Technical Round
                              </Link>
                              <button 
                                onClick={() => setActiveTab('pyqs')}
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Most Asked Questions
                              </button>
                              <Link 
                                href="/interview-experiences"
                                className="px-4.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Mock Interview
                              </Link>
                            </>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB CONTENT: PROCESS & ELIGIBILITY */}
            {activeTab === 'pattern' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Activity className="h-5.5 w-5.5 text-indigo-650" /> Recruitment Roadmap Details
                  </h3>
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm font-semibold leading-relaxed whitespace-pre-line">
                    {company.hiringPattern}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <CheckSquare className="h-5.5 w-5.5 text-indigo-650" /> Academic Eligibility Parameters
                  </h3>
                  <div className="prose prose-slate max-w-none text-slate-600 text-sm font-semibold leading-relaxed whitespace-pre-line">
                    {company.eligibilityCriteria}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PYQS */}
            {activeTab === 'pyqs' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
                <div>
                  <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                    Previous Year Questions (PYQs)
                  </h3>
                  <p className="text-slate-450 text-xs mt-1 font-semibold">
                    Review and solve actual exam problems asked in {company.name} placements.
                  </p>
                </div>

                <div className="space-y-4">
                  {company.pyqs.map((pyq) => {
                    const isExpanded = !!expandedPYQs[pyq.id];
                    return (
                      <div key={pyq.id} className="border border-slate-250/70 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50">
                        {/* Header details */}
                        <div 
                          onClick={() => togglePYQ(pyq.id)}
                          className="p-4 bg-white hover:bg-slate-50/50 cursor-pointer flex items-center justify-between gap-4 select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                                {pyq.round}
                              </span>
                              <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                Year: {pyq.year}
                              </span>
                              <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                {pyq.topic}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-sm leading-snug mt-1.5">
                              {pyq.question.split('(Ref')[0]}
                            </h5>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full ${getDifficultyColor(pyq.difficulty)}`}>
                              {pyq.difficulty}
                            </span>
                            <span className="text-xs font-bold text-indigo-600">
                              {isExpanded ? 'Hide Solution' : 'Solve / Show'}
                            </span>
                          </div>
                        </div>

                        {/* Solution & Explanation content */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-200/80 bg-white space-y-4 text-xs font-semibold leading-relaxed">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">CORRECT ANSWER</span>
                              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl">
                                {pyq.answer}
                              </div>
                            </div>
                            
                            {pyq.explanation && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">DETAILED SOLUTION EXPLANATION</span>
                                <div className="p-4 bg-slate-50 border border-slate-200 text-slate-650 rounded-xl whitespace-pre-line leading-loose">
                                  {pyq.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {company.pyqs.length === 0 && (
                    <div className="py-10 text-center text-slate-400 font-semibold italic">
                      No previous questions listed.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FAQS */}
            {activeTab === 'faqs' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-left">
                <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
                  General FAQS
                </h3>
                
                <div className="space-y-4">
                  {company.faqs.map((faq) => (
                    <div key={faq.id} className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <h5 className="font-extrabold text-sm text-slate-800 flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                        {faq.question}
                      </h5>
                      <p className="text-xs text-slate-600 pl-7 leading-relaxed font-semibold">{faq.answer}</p>
                    </div>
                  ))}

                  {company.faqs.length === 0 && (
                    <div className="py-8 text-center text-slate-400 font-semibold italic">
                      No FAQs listed.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Area: 4 Columns */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Category Performance Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Performance Breakdown</span>
              <div className="space-y-3.5">
                {Object.entries(breakdown).map(([cat, score]) => {
                  let barColor = 'bg-indigo-600';
                  if (score >= 80) barColor = 'bg-emerald-500';
                  else if (score < 50) barColor = 'bg-rose-500';
                  else if (score < 70) barColor = 'bg-amber-500';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-650">{cat}</span>
                        <span className="text-slate-800">{score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weak vs Strong Summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase">STRONG (✓)</span>
                  <div className="space-y-1">
                    {strongAreas.slice(0, 3).map(a => (
                      <span key={a} className="text-emerald-700 block">✓ {a}</span>
                    ))}
                    {strongAreas.length === 0 && <span className="text-slate-450 italic font-semibold">None</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase">WEAK (✗)</span>
                  <div className="space-y-1">
                    {weakAreas.slice(0, 3).map(a => (
                      <span key={a} className="text-rose-700 block">✗ {a}</span>
                    ))}
                    {weakAreas.length === 0 && <span className="text-slate-450 italic font-semibold">None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Recommendations */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recommended Practice</span>
              <div className="space-y-3">
                {recommendations.tests.map(test => (
                  <Link 
                    key={test.id} 
                    href="/tests"
                    className="flex items-start justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl hover:bg-indigo-50 transition group"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                        {test.type}
                      </span>
                      <h5 className="font-extrabold text-xs text-slate-800 mt-1 leading-snug group-hover:text-indigo-650 transition">
                        {test.title}
                      </h5>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  </Link>
                ))}

                {recommendations.notes.map(note => (
                  <Link 
                    key={note.id} 
                    href="/notes"
                    className="flex items-start justify-between p-3.5 bg-purple-50/50 border border-purple-100/60 rounded-2xl hover:bg-purple-50 transition group"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        Revision Note
                      </span>
                      <h5 className="font-extrabold text-xs text-slate-800 mt-1 leading-snug group-hover:text-purple-650 transition">
                        {note.title}
                      </h5>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 text-purple-600 shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Trophy className="h-4.5 w-4.5 text-amber-500" />
                <span className="uppercase tracking-wider">Top Performers Leaderboard</span>
              </div>
              <div className="space-y-2">
                {leaderboard.map(student => (
                  <div key={student.rank} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 text-xs font-bold bg-slate-50/20">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        student.rank === 1 ? 'bg-amber-100 text-amber-800' : (student.rank === 2 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-800')
                      }`}>
                        {student.rank}
                      </span>
                      <span className="text-slate-700">{student.name}</span>
                    </div>
                    <span className="text-slate-500">{student.score}%</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Your Rank Position:</span>
                <span className="text-indigo-650">#{userRank}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* OA INSTRUCTIONS MODAL DISPLAY */}
      {selectedRoundForSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-250 rounded-3xl max-w-md w-full p-6 text-left space-y-5 animate-in zoom-in duration-200 shadow-2xl">
            
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 leading-snug">
                  {company.name} {selectedRoundForSim.roundName} Simulator
                </h3>
                <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Instructions Guidelines</span>
              </div>
              <button 
                onClick={() => setSelectedRoundForSim(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 shrink-0"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Assessment Details Box */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-700">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Duration</span>
                <span>{selectedRoundForSim.duration} Minutes</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Questions</span>
                <span>20 MCQs</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Difficulty</span>
                <span>{selectedRoundForSim.difficulty}</span>
              </div>
            </div>

            {/* Rules Checklist */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Exam Rules Checklist</span>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>**Proctored Security**: Tab or window switching triggers warning flags. Reaching 3 warnings auto-submits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>**Continuous Timer**: Once started, the exam timer cannot be paused or stopped.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckSquare className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>**Dynamic Weights**: Generated topics map to: {selectedRoundForSim.topics.join(', ')}.</span>
                </div>
              </div>
            </div>

            {/* Actions button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setSelectedRoundForSim(null)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartSimulation}
                disabled={simStarting}
                className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5"
              >
                {simStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Starting...
                  </>
                ) : (
                  <>
                    Begin Simulator <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
