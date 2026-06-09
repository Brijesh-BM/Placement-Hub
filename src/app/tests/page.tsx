'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle,
  Play, 
  Loader2,
  Filter,
  Tag
} from 'lucide-react';

interface TestItem {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  category: string;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  type: 'TOPIC' | 'SECTIONAL' | 'MOCK' | 'COMPANY' | 'BASELINE' | 'OA_TEMPLATE';
  attemptCount: number;
  averageScore: number;
  tags: string[];
  passingScore: number | null;
}

interface CategoryItem {
  id: string;
  name: string;
}

export default function TestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeType, setActiveType] = useState('All');

  // Start Test Modal Confirmation
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [startingTest, setStartingTest] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const testsRes = await fetch('/api/tests');
        const catRes = await fetch('/api/tests/categories');
        if (testsRes.ok && catRes.ok) {
          const tData = await testsRes.json();
          const cData = await catRes.json();
          setTests(tData.tests);
          setCategories(cData.categories);
        }
      } catch (e) {
        console.error('Failed to load tests list', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, authLoading, router]);

  const handleStartTest = async () => {
    if (!selectedTest) return;
    setStartingTest(true);

    try {
      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: selectedTest.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start attempt.');
      }

      router.push(`/test-engine/${data.attempt.id}`);
    } catch (e: any) {
      alert(e.message || 'Error starting assessment');
      setStartingTest(false);
    }
  };

  // Filter Logic
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase()) || 
      (test.description || '').toLowerCase().includes(search.toLowerCase()) ||
      test.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCat === 'All' || test.category === activeCat;
    const matchesDifficulty = activeDifficulty === 'All' || test.difficulty === activeDifficulty;
    const matchesType = activeType === 'All' || test.type === activeType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'HARD': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TOPIC': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'SECTIONAL': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'MOCK': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'COMPANY': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'BASELINE': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'OA_TEMPLATE': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Fetching active mock assessments...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Placement Assessments</h1>
        <p className="text-slate-500 text-sm mt-1">
          Practice with topic-specific tests, sectional mocks, company OAs, and diagnostic exams.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by test title, topic, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              <span>Difficulty:</span>
              <select
                value={activeDifficulty}
                onChange={(e) => setActiveDifficulty(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-850 font-extrabold cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Test Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              <span>Test Type:</span>
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-850 font-extrabold cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="TOPIC">Topic Tests</option>
                <option value="SECTIONAL">Sectional Tests</option>
                <option value="MOCK">Full Mock Exams</option>
                <option value="COMPANY">Company OA Tests</option>
                <option value="BASELINE">Baseline Exams</option>
                <option value="OA_TEMPLATE">OA Templates</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Tab Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              activeCat === 'All'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                activeCat === cat.name
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <div 
            key={test.id} 
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[260px] relative overflow-hidden shadow-sm hover:shadow-md transition duration-200"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                    {test.category}
                  </span>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 border rounded-full ${getTypeColor(test.type)}`}>
                    {test.type}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {test.duration}m
                  </span>
                  <span className="flex items-center gap-0.5">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                    {test.questionCount} Qs
                  </span>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{test.title}</h3>
                  <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 border rounded ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty}
                  </span>
                </div>
                <p className="text-slate-550 text-xs line-clamp-2 leading-relaxed">
                  {test.description || 'Simulated assessment incorporating realistic recruitment problems.'}
                </p>
              </div>

              {/* Tags Display */}
              {test.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <Tag className="h-3 w-3 text-slate-405" />
                  {test.tags.slice(0, 3).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 border border-slate-200 text-slate-500 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-left text-[11px] text-slate-500 font-semibold">
                <div>Attempts: <strong className="text-slate-800">{test.attemptCount}</strong></div>
                <div>Avg Score: <strong className="text-slate-800">{test.averageScore}%</strong></div>
              </div>
              <button
                onClick={() => setSelectedTest(test)}
                className="py-2 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-sm hover:shadow active:scale-97"
              >
                Start Test
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredTests.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-slate-250 rounded-2xl bg-white shadow-inner">
            <span className="text-slate-400 text-sm italic">No mock assessments matched your filters.</span>
          </div>
        )}
      </div>

      {/* --- CONFIRMATION PROCTOR MODAL --- */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-650 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 text-lg block">Assessment Proctor Warning</span>
                <span className="text-slate-500 text-xs font-semibold">Read guidelines before starting the mock exam.</span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
              <div className="flex gap-2">
                <span className="text-rose-650 font-bold">1.</span>
                <span><strong className="text-slate-800">Tab Switching Ban</strong>: Changing browser tabs or closing the window will generate warnings. Exceeding <strong className="text-slate-800">3 warnings</strong> will trigger immediate auto-submission.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-rose-650 font-bold">2.</span>
                <span><strong className="text-slate-800">Continuous Timer</strong>: Once started, the timer of <strong className="text-slate-800">{selectedTest.duration} minutes</strong> runs continuously. Refreshing the browser does NOT pause the timer.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-rose-650 font-bold">3.</span>
                <span><strong className="text-slate-800">Attempt Policy</strong>: Submission will log under your profile, updating your readiness scores and global averages.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedTest(null)}
                className="flex-1 py-2.5 bg-slate-55 border border-slate-200 text-slate-655 font-bold rounded-xl text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                disabled={startingTest}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                {startingTest ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Enter Exam Engine
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
