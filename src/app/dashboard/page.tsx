'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  Award, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Compass, 
  ArrowRight,
  TrendingUp,
  FileText,
  Bell,
  BellOff,
  Briefcase,
  Target,
  Sparkles,
  Calendar,
  Lock,
  Check,
  Zap,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface DashboardStats {
  totalTests: number;
  averageScore: number;
  strongTopics: string[];
  weakTopics: string[];
  recommendations: Array<{ id: string; title: string; type: string; reason: string }>;
  recentActivity: Array<{
    id: string;
    testTitle: string;
    category: string;
    percentage: number;
    score: number;
    maxScore: number;
    submittedAt: string;
  }>;
  scoreHistory: Array<{ testNumber: string; percentage: number; title: string }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifTray, setShowNotifTray] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const userName = user?.name || '';
  const streak = user?.profile?.streak || 0;
  const targetRole = user?.profile?.targetRole || 'SOFTWARE_ENGINEER';
  const readinessScore = user?.profile?.readinessScore?.overallScore ?? null;
  const onboardingProfile = user?.profile?.onboardingProfile ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'STUDENT') {
      const op = user.profile?.onboardingProfile;
      if (!op || op.completedOnboarding === false) {
        router.push('/onboarding');
        return;
      }
    }

    const fetchStatsAndNotifications = async () => {
      try {
        setStatsLoading(true);
        const [statsRes, notifRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/notifications')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard info', e);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStatsAndNotifications();
  }, [user, authLoading, router]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeReadiness = readinessScore !== null ? readinessScore : 74;

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'Elite', color: 'text-indigo-700 bg-indigo-50 border-indigo-150' };
    if (score >= 70) return { label: 'Placement Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-150' };
    if (score >= 45) return { label: 'Developing', color: 'text-amber-700 bg-amber-50 border-amber-150' };
    return { label: 'Beginner', color: 'text-red-700 bg-red-50 border-red-150' };
  };

  const getRoleLabel = (role: string) => {
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  // 9 categories Skill Radar metrics
  const radarData = [
    { subject: 'Aptitude', score: activeReadiness + 6, fullMark: 100 },
    { subject: 'Reasoning', score: activeReadiness + 1, fullMark: 100 },
    { subject: 'Verbal', score: activeReadiness - 4, fullMark: 100 },
    { subject: 'DSA', score: activeReadiness - 9, fullMark: 100 },
    { subject: 'DBMS', score: 90, fullMark: 100 },
    { subject: 'OS', score: 60, fullMark: 100 },
    { subject: 'CN', score: 55, fullMark: 100 },
    { subject: 'OOP', score: 85, fullMark: 100 },
    { subject: 'Comm.', score: activeReadiness - 2, fullMark: 100 },
  ];

  // Fallback Score Trend data
  const scoreHistoryData = stats?.scoreHistory && stats.scoreHistory.length > 0 
    ? stats.scoreHistory 
    : [
        { testNumber: 'Week 1', percentage: 65, title: 'Initial Assessment' },
        { testNumber: 'Week 2', percentage: 68, title: 'Quant Aptitude Mock' },
        { testNumber: 'Week 3', percentage: 70, title: 'TCS Aptitude Set' },
        { testNumber: 'Week 4', percentage: 74, title: 'Latest DBMS Exam' }
      ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (authLoading || !user) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650"></div>
          <span className="text-sm font-semibold text-slate-500">Loading your command center...</span>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650"></div>
          <span className="text-sm font-semibold text-slate-500">Loading placement metrics...</span>
        </div>
      </div>
    );
  }

  if (onboardingProfile && onboardingProfile.completedBaselineAssessment === false) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
          
          {/* GREETINGS TOP STATUS BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
                <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                <span>Placement Command Center</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none text-left">
                Welcome to PlacementHub, <span className="text-indigo-600">{userName || 'Student'}</span>
              </h1>
              <p className="text-slate-550 text-sm mt-2 font-medium text-left">
                Let's build your placement profile • Complete your next steps
              </p>
            </div>
            <Link 
              href="/baseline-info"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-sm font-bold transition shadow-sm"
            >
              Take Baseline Assessment
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>

          {/* STEP TRACKER SECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-left">Your Onboarding Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Step 1 */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-left">
                <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Step 1: Create Account</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">Completed</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-left">
                <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Step 2: Onboarding Survey</h4>
                  <p className="text-[10px] text-emerald-605 font-bold uppercase">{onboardingProfile.targetRole?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-left relative animate-pulse">
                <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Step 3: Baseline Assessment</h4>
                  <p className="text-[10px] text-indigo-650 font-bold">Active Diagnostic</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-150 rounded-xl text-slate-400 text-left">
                <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Step 4: Readiness Score</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Locked</p>
                </div>
              </div>

            </div>
          </div>

          {/* MAIN WIDGETS GIRD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Circular Readiness Placeholder */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Placement Readiness Score</span>
                
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28 shrink-0 flex items-center justify-center bg-slate-50 rounded-full border-2 border-dashed border-slate-250">
                    <span className="text-3xl font-black text-slate-350">--</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 block uppercase">READINESS STATUS</span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-md text-xs font-bold mt-1">
                      Not Available Yet
                    </span>
                    <p className="text-[10px] text-slate-450 font-semibold mt-1.5 leading-relaxed">
                      Complete your first assessment to generate readiness score.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-6">
                <Link 
                  href="/baseline-info" 
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  Take Baseline Assessment
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Action Center - Empty State */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recommended Next Actions</span>
                  <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full">Direction Engine</span>
                </div>

                <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-3 my-auto">
                  <span className="text-slate-400 text-xs font-semibold block">
                    No learning actions recommended yet.
                  </span>
                  <Link 
                    href="/baseline-info" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-150 text-indigo-750 text-xs font-extrabold rounded-xl transition hover:bg-indigo-100"
                  >
                    Complete your first assessment
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* ROADMAPS & COMPANY READINESS PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Skill Radar Placeholder */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-6 flex flex-col justify-between text-left">
              <div className="space-y-1 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Skill Radar Diagnosis</span>
                <p className="text-xs text-slate-450 font-semibold">Verify strengths across technical core domains</p>
              </div>
              
              <div className="h-64 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-center">
                <span className="text-slate-400 text-xs font-semibold italic">
                  Radar analysis locked. Complete baseline test.
                </span>
              </div>
            </div>

            {/* Company Matches Placeholder */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-6 flex flex-col justify-between text-left">
              <div className="space-y-1 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Company Readiness Matches</span>
                <p className="text-xs text-slate-450 font-semibold">Matched threshold readiness percentages per organization</p>
              </div>

              <div className="h-64 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-center">
                <span className="text-slate-400 text-xs font-semibold italic">
                  Not available yet. Take baseline assessment.
                </span>
              </div>
            </div>

          </div>

          {/* ROADMAP TRACKER EMPTY STATE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Roadmap Pathway Progress</span>
                <h3 className="font-extrabold text-slate-800 text-md mt-0.5">0% completed</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">Locked</span>
            </div>
            
            <div className="py-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
              <span className="text-slate-400 text-xs font-semibold block">Select a learning roadmap to unlock milestones.</span>
              <Link href="/roadmaps" className="text-indigo-650 hover:text-indigo-755 text-xs font-black mt-1.5 inline-flex items-center gap-1">
                Explore available roadmaps <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span>Placement Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              Good Evening, <span className="text-indigo-600">{userName || 'Brijesh'}</span>
            </h1>
            <p className="text-slate-550 text-sm mt-2 font-medium">
              Software Engineer Track • Here is your dashboard breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifTray(!showNotifTray)}
                className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition relative shadow-sm hover:shadow"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 border border-white text-[10px] font-black text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifTray && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-40 space-y-3 max-h-96 overflow-y-auto animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-sm text-slate-900">In-App Notifications</span>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>

                  {notifications.length > 0 ? (
                    <div className="space-y-2.5">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                          className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                            n.isRead 
                              ? 'bg-slate-50/50 border-slate-150 text-slate-500' 
                              : 'bg-indigo-50/40 border-indigo-100 text-slate-900 hover:bg-indigo-50/60'
                          }`}
                        >
                          <h4 className="font-bold text-xs leading-snug flex items-center gap-1.5">
                            {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>}
                            {n.title}
                          </h4>
                          <p className="text-[11px] mt-1 leading-relaxed text-slate-650">{n.message}</p>
                          <span className="text-[9px] text-slate-450 block mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 flex flex-col items-center gap-2">
                      <BellOff className="h-6 w-6" />
                      <span className="text-xs font-semibold">No notifications logged.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Main Action buttons */}
            <Link 
              href="/tests"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-sm font-bold transition shadow-sm"
            >
              <Compass className="h-4.5 w-4.5" />
              Take Test
            </Link>
          </div>
        </div>

        {/* HERO SECTION: COMMAND & ACTION CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Readiness Dashboard circular score widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Placement Readiness Score</span>
              
              <div className="flex items-center gap-6">
                <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                  {/* SVG circular track progress */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="#6366f1" strokeWidth="8" fill="transparent"
                      strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * activeReadiness) / 100} />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 leading-none">{activeReadiness}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-slate-400 block font-bold">CURRENT STATUS</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${getReadinessLevel(activeReadiness).color} mt-1`}>
                      {getReadinessLevel(activeReadiness).label}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 space-y-1">
                    <div>Target Track: <span className="font-bold text-slate-800">{getRoleLabel(targetRole)}</span></div>
                    <div>Target Score: <span className="font-bold text-slate-800">85+</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Estimated Interview Readiness:</span>
              <span className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-md">
                3 Weeks
              </span>
            </div>
          </div>

          {/* Action Center - Guided Next Steps (The Duolingo-like instruction) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recommended Next Actions</span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Direction Engine</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Complete DBMS Mock Test</h4>
                      <p className="text-[10px] text-slate-400">DBMS score is currently below target benchmarks</p>
                    </div>
                  </div>
                  <Link href="/tests" className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition">
                    Take Test
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Improve Operating Systems</h4>
                      <p className="text-[10px] text-slate-400">Weak area identified in CPU scheduling variables</p>
                    </div>
                  </div>
                  <Link href="/notes" className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-150 transition">
                    Read Notes
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Take Amazon OA Mock</h4>
                      <p className="text-[10px] text-slate-400">Top matching target company for your skill bracket</p>
                    </div>
                  </div>
                  <Link href="/company-hub/amazon" className="px-3 py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition">
                    Practice OA
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Read Deadlock Notes</h4>
                      <p className="text-[10px] text-slate-400">Review concurrency issues and critical sections</p>
                    </div>
                  </div>
                  <Link href="/notes" className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-150 transition">
                    Open Notes
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* VISUAL ANALYTICS: RADAR & TREND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Skill Radar Chart - replacing generic list boxes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1 mb-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-bold">Skill Radar Diagnosis</span>
              <p className="text-xs text-slate-500 font-semibold">Radar breakdown across aptitude and technical domains</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} fontWeight="650" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                    <Radar name="Student" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
              )}
            </div>
          </div>

          {/* Score trend history chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Score Progress Trend</span>
                <p className="text-xs text-slate-500 font-semibold">Diagnostic performance index over last 30 days (65 → {activeReadiness})</p>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Velocity +14%
              </span>
            </div>

            <div className="h-64 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="testNumber" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#475569', fontWeight: 'bold' }}
                      itemStyle={{ color: '#4f46e5' }}
                      formatter={(value: any, name: any, props: any) => [`${value}%`, props.payload.title]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ r: 5, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                      activeDot={{ r: 7, stroke: '#4f46e5', strokeWidth: 2, fill: '#4f46e5' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
              )}
            </div>
          </div>
        </div>

        {/* DIAGNOSTICS SECTION: STRONG, WEAK AND COMPANY MATCH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Strong Areas - Green Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Strong Areas</span>
            
            <div className="space-y-2.5">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800">DBMS (Database Management)</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded">90%</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800">OOP (Object Oriented Programming)</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded">85%</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-800">SQL Queries & Indexes</span>
                <span className="text-xs font-extrabold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded">88%</span>
              </div>
            </div>
          </div>

          {/* Weak Areas - Red Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Weak / Focus Areas</span>
            
            <div className="space-y-2.5">
              <Link href="/notes" className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between hover:border-rose-350 transition block text-left">
                <span className="font-bold text-xs text-rose-800">CN (Computer Networks)</span>
                <span className="text-xs font-extrabold text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded">55%</span>
              </Link>
              <Link href="/notes" className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between hover:border-rose-350 transition block text-left">
                <span className="font-bold text-xs text-rose-800">OS (CPU Scheduling)</span>
                <span className="text-xs font-extrabold text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded">60%</span>
              </Link>
              <Link href="/notes" className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between hover:border-rose-350 transition block text-left">
                <span className="font-bold text-xs text-rose-800">Probability & Statistics</span>
                <span className="text-xs font-extrabold text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded">62%</span>
              </Link>
            </div>
          </div>

          {/* Company Match Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Company Placement Match</span>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">You Are Ready For:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    TCS
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Infosys
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Wipro
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Not Yet Ready:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold">
                    <Lock className="h-3 w-3 text-slate-400" />
                    Amazon
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold">
                    <Lock className="h-3 w-3 text-slate-400" />
                    Microsoft
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-semibold">
                    <Lock className="h-3 w-3 text-slate-400" />
                    Google
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RECENT ACTIVITY & SUBMISSIONS LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-900 block">Assessment Activity Logs</span>
            <Link href="/tests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition">
              View all exams <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3 px-2">Mock Test Title</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2 text-center">Percentage</th>
                    <th className="py-3 px-2 text-center">Score</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats.recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-2 font-bold text-slate-800">{activity.testTitle}</td>
                      <td className="py-3.5 px-2 text-slate-550 text-xs font-semibold">{activity.category}</td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                          activity.percentage >= 75 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : (activity.percentage >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100')
                        }`}>
                          {activity.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center text-slate-500 text-xs font-semibold">
                        {activity.score} / {activity.maxScore}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link 
                          href={`/results/${activity.id}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-750 transition"
                        >
                          Report
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl py-10 bg-slate-50/50">
              <span className="text-slate-400 text-xs font-semibold">No diagnostic test submissions found.</span>
              <Link href="/tests" className="text-indigo-600 hover:text-indigo-700 text-xs font-bold mt-2 inline-flex items-center gap-1">
                Attempt a mock assessment <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
