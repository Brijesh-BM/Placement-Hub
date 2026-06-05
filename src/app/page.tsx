import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Map, 
  Flame, 
  Building2,
  Sparkles,
  Award,
  BookOpen,
  Users,
  Compass,
  Code
} from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden select-none">
      
      {/* Background soft grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] z-0"></div>

      <div className="max-w-4xl text-center space-y-10 z-10">
        
        {/* Brand Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-black shadow-sm">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
          <span>Placement Intelligence Platform v3.0</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Ace Your Career Placements with <span className="text-indigo-600">Confidence</span>
          </h1>
          <p className="text-slate-550 text-sm sm:text-md max-w-xl mx-auto font-semibold leading-relaxed">
            Practice TCS, Infosys, and Amazon simulated mock tests. Build custom career roadmaps, study revision notes, and check verified interview logs.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-2">
          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-650/15"
            >
              Enter Student Command Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-650/15"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold rounded-xl text-xs flex items-center justify-center transition shadow-sm"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Platform Stat Diagnostics (High Information Density) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-3xl mx-auto">
          <div className="space-y-1">
            <span className="text-2xl font-black text-slate-800 block">25,000+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Practice Questions</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-6">
            <span className="text-2xl font-black text-slate-800 block">500+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Simulated Mocks</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-6">
            <span className="text-2xl font-black text-slate-800 block">1,000+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Interview Logs</span>
          </div>
          <div className="space-y-1 border-l border-slate-100 pl-6">
            <span className="text-2xl font-black text-slate-800 block">100+</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Companies</span>
          </div>
        </div>

        {/* Core Career Journey Timelines */}
        <div className="space-y-4 max-w-3xl mx-auto text-left pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">First-Time User Journey</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-bold">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center rounded-full text-[10px] font-black">1</span>
              <h4 className="text-slate-800">Quick Registration</h4>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Sign up with your college profile details.</p>
            </div>
            
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center rounded-full text-[10px] font-black">2</span>
              <h4 className="text-slate-800">Survey Onboarding</h4>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Choose target roles and rate confidence.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center rounded-full text-[10px] font-black">3</span>
              <h4 className="text-slate-800">Baseline Assessment</h4>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Attempt the 30-minute diagnostic test.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-1.5">
              <span className="h-5 w-5 bg-indigo-50 border border-indigo-100 text-indigo-750 flex items-center justify-center rounded-full text-[10px] font-black">4</span>
              <h4 className="text-slate-800">Placement Snapshot</h4>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">Review your initial strengths and gaps.</p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl shadow-sm space-y-1.5">
              <span className="h-5 w-5 bg-indigo-600 text-white flex items-center justify-center rounded-full text-[10px] font-black">5</span>
              <h4 className="text-indigo-900">Dashboard Unlock</h4>
              <p className="text-[10px] text-indigo-650 font-bold leading-relaxed">Explore matches, actions, and roadmaps.</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (HackerRank & Leetcode level) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto pt-4">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 hover:border-indigo-200 transition">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Diagnostic Test Engine</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Proctored examination portal with tab switch warning telemetry, auto-submit timer triggers, and subcategory accuracy grading.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 hover:border-indigo-200 transition">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 w-fit">
              <Map className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Personalised Roadmaps</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Duolingo-style milestone maps displaying steps completed for Software Engineer, Frontend, Backend, and Data Analyst pathways.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 hover:border-indigo-200 transition">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 w-fit">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm">Interactive Company Hubs</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              Hiring pattern blueprints, round durations, package scopes, and FAQ checklists for TCS, Amazon, and Infosys.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
