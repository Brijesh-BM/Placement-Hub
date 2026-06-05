'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ArrowLeft, 
  Briefcase, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  GraduationCap, 
  Loader2, 
  AlertTriangle,
  Award,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserCheck,
  CheckSquare
} from 'lucide-react';

interface RoundItem {
  id: string;
  roundNumber: number;
  roundName: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  passingScore: number;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface TestItem {
  id: string;
  title: string;
  duration: number;
  category: { name: string };
  testQuestions: Array<{ id: string }>;
}

interface CompanyDetail {
  id: string;
  name: string;
  logoUrl: string | null;
  hiringPattern: string;
  eligibilityCriteria: string;
  hiringRounds: RoundItem[];
  faqs: FaqItem[];
  tests: TestItem[];
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const nameParam = (params?.name as string) || '';
  const companyName = nameParam.charAt(0).toUpperCase() + nameParam.slice(1).toLowerCase();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pattern' | 'rounds' | 'tests' | 'faqs'>('pattern');

  // Static company metadata to merge for premium UI experience
  const companyUIMap: Record<string, {
    difficulty: string;
    package: string;
    roundsCount: number;
    experiencesCount: number;
    mocksCount: number;
    topics: string[];
    readiness: number;
    readinessLevel: string;
    rounds: Array<{ name: string; desc: string }>;
  }> = {
    'Amazon': {
      difficulty: 'Hard',
      package: '12 - 40 LPA',
      roundsCount: 5,
      experiencesCount: 450,
      mocksCount: 30,
      topics: ['Arrays', 'Strings', 'Hash Maps', 'Trees', 'Graphs'],
      readiness: 62,
      readinessLevel: 'Needs Improvement',
      rounds: [
        { name: 'Round 1: Online Assessment', desc: 'Coding puzzles, debugging tests, and behavioral scenarios.' },
        { name: 'Round 2: Technical Interview I', desc: 'Focus on coding algorithms, time complexity optimization, and basic DSA.' },
        { name: 'Round 3: Technical Interview II', desc: 'Advanced DSA coding questions, dynamic programming, and graphs.' },
        { name: 'Round 4: System Design / OOP', desc: 'High level architecture design and object-oriented paradigms.' },
        { name: 'Round 5: HR & Leadership', desc: 'Evaluation of Amazon Leadership Principles and team compatibility.' }
      ]
    },
    'Google': {
      difficulty: 'Hard',
      package: '18 - 55 LPA',
      roundsCount: 6,
      experiencesCount: 520,
      mocksCount: 45,
      topics: ['Advanced Graphs', 'Trees', 'Dynamic Programming', 'Tries', 'Recursion'],
      readiness: 48,
      readinessLevel: 'Weak',
      rounds: [
        { name: 'Round 1: Screening Test', desc: 'Basic data structures screening mock OA.' },
        { name: 'Round 2: Coding Interview I', desc: 'Algorithmic efficiency, complexity, and graphs.' },
        { name: 'Round 3: Coding Interview II', desc: 'Problem solving on advanced trees and recursion.' },
        { name: 'Round 4: Coding Interview III', desc: 'Systems and storage algorithms analysis.' },
        { name: 'Round 5: System Design', desc: 'Scalable backend service architecture.' },
        { name: 'Round 6: Googliness & Leadership', desc: 'Fit checks and cultural alignment.' }
      ]
    },
    'Tcs': {
      difficulty: 'Easy',
      package: '3.3 - 7.5 LPA',
      roundsCount: 4,
      experiencesCount: 220,
      mocksCount: 12,
      topics: ['Numerical Aptitude', 'Pseudo Code', 'Arrays', 'Basic Strings', 'DBMS Concept'],
      readiness: 85,
      readinessLevel: 'Ready',
      rounds: [
        { name: 'Round 1: Numerical Aptitude', desc: 'Basic mathematics, logical analysis, and verbal evaluation.' },
        { name: 'Round 2: Pseudo Code Test', desc: 'Programming basics, loops dry running, and simple outputs.' },
        { name: 'Round 3: Technical Interview', desc: 'Basic coding questions, OOP concepts, DBMS schemas.' },
        { name: 'Round 4: HR Interview', desc: 'General verification, location flexibility checks, and HR discussion.' }
      ]
    }
  };

  const currentMeta = companyUIMap[companyName] || companyUIMap['Amazon'];

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const res = await fetch(`/api/companies/${nameParam.toLowerCase()}`);
        if (res.ok) {
          const data = await res.json();
          setCompany(data.company);
        } else {
          // If not found, load TCS or fallback
          const fallbackRes = await fetch(`/api/companies/tcs`);
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setCompany(data.company);
          }
        }
      } catch (e) {
        console.error('Failed to fetch company details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetail();
  }, [nameParam]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Loading preparation hub...</span>
      </div>
    );
  }

  if (!company) {
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

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'Easy') return 'bg-emerald-50 border-emerald-250 text-emerald-700';
    if (diff === 'Medium') return 'bg-amber-50 border-amber-250 text-amber-700';
    return 'bg-rose-50 border-rose-250 text-rose-700';
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation back link */}
        <Link 
          href="/company-hub" 
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Company Hub
        </Link>

        {/* HERO HEADER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{company.name}</h1>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getDifficultyBadge(currentMeta.difficulty)}`}>
                  Difficulty: {currentMeta.difficulty}
                </span>
              </div>
              <p className="text-slate-550 text-sm font-medium">Analyze round structures, eligibility bounds, and mock databases.</p>
              
              {/* Highlights row */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 pt-1">
                <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-indigo-500" /> Avg Package: {currentMeta.package}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4 text-indigo-500" /> Rounds: {currentMeta.roundsCount}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4 text-indigo-500" /> {currentMeta.experiencesCount} Experiences</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4 text-indigo-500" /> {currentMeta.mocksCount} Mock Tests</span>
              </div>
            </div>
          </div>

          {/* Student Specific Readiness Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4 shrink-0 lg:max-w-xs w-full lg:w-fit justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">YOUR READINESS</span>
              <span className="font-extrabold text-slate-800 text-lg block">Your {company.name} Prep</span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded mt-1 inline-block">
                {currentMeta.readinessLevel}
              </span>
            </div>

            <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="5" fill="transparent" />
                <circle cx="32" cy="32" r="26" stroke="#6366f1" strokeWidth="5" fill="transparent"
                  strokeDasharray="163.3" strokeDashoffset={163.3 - (163.3 * currentMeta.readiness) / 100} />
              </svg>
              <span className="text-sm font-black text-slate-800">{currentMeta.readiness}%</span>
            </div>
          </div>
        </div>

        {/* TIMELINE & PREP CONTENT COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Area - Timeline & asked topics */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Interactive Timeline Rounds */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-bold">Hiring Rounds Timeline</span>
              
              <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-6 py-2">
                {currentMeta.rounds.map((r, index) => (
                  <div key={index} className="relative text-left">
                    {/* Node Dot icon */}
                    <div className="absolute -left-[35px] top-0.5 h-6 w-6 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center">
                      <span className="text-[10px] font-extrabold text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{r.name}</h4>
                      <p className="text-slate-550 text-xs leading-relaxed max-w-xl">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics asked and preparation sheet cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Most Asked Topics checklist module */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Most Asked Topics</span>
                <div className="space-y-2.5">
                  {currentMeta.topics.map((t) => (
                    <div key={t} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-700">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Prep cards */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recommended Resources</span>
                <div className="space-y-2.5">
                  <Link href="/notes" className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition">
                    <div className="flex items-center gap-2 text-left">
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      <span className="font-bold text-xs text-indigo-900">{company.name} DSA Sheet</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-600" />
                  </Link>
                  <Link href="/tests" className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition">
                    <div className="flex items-center gap-2 text-left">
                      <Award className="h-4 w-4 text-indigo-600" />
                      <span className="font-bold text-xs text-indigo-900">{company.name} OA Mock Exam</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-600" />
                  </Link>
                  <Link href="/interview-experiences" className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition">
                    <div className="flex items-center gap-2 text-left">
                      <UserCheck className="h-4 w-4 text-indigo-600" />
                      <span className="font-bold text-xs text-indigo-900">Student Reviews & Notes</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-600" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Right Area - Tabs navigation detail content */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('pattern')}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition ${
                  activeTab === 'pattern'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Pattern
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition ${
                  activeTab === 'tests'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Mock Exams
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition ${
                  activeTab === 'faqs'
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                FAQs
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'pattern' && (
                <div className="space-y-4 text-left">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Hiring Pattern Schema</h4>
                  <p className="text-slate-650 text-xs leading-relaxed whitespace-pre-line">
                    {company.hiringPattern}
                  </p>
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 pt-2">Eligibility Criteria</h4>
                  <p className="text-slate-650 text-xs leading-relaxed whitespace-pre-line">
                    {company.eligibilityCriteria}
                  </p>
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-3.5 text-left">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Practice OA Exams</h4>
                  
                  {company.tests.map((test) => (
                    <div key={test.id} className="p-3.5 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                          {test.category?.name || 'Coding'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{test.duration} mins</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 leading-snug">{test.title}</h4>
                      <Link 
                        href="/tests" 
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-750 pt-1"
                      >
                        Launch test engine <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}

                  {company.tests.length === 0 && (
                    <div className="py-6 text-center text-slate-400 italic text-xs">
                      No mock exams found.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4 text-left">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">General FAQs</h4>
                  
                  {company.faqs.map((faq) => (
                    <div key={faq.id} className="space-y-1 bg-slate-50/50 p-3 border border-slate-200 rounded-xl">
                      <h5 className="font-bold text-xs text-slate-800 flex items-start gap-1">
                        <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        {faq.question}
                      </h5>
                      <p className="text-[11px] text-slate-550 pl-5 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}

                  {company.faqs.length === 0 && (
                    <div className="py-6 text-center text-slate-400 italic text-xs">
                      No FAQs listed.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
