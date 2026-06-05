'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  AlertTriangle,
  Play, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface TestItem {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  category: { name: string };
  testQuestions: Array<{ id: string }>;
}

interface CategoryItem {
  id: string;
  name: string;
}

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  // Start Test Modal Confirmation
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [startingTest, setStartingTest] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const testsRes = await fetch('/api/admin/tests');
        const metaRes = await fetch('/api/admin/metadata');
        if (testsRes.ok && metaRes.ok) {
          const tData = await testsRes.json();
          const mData = await metaRes.json();
          setTests(tData.tests);
          setCategories(mData.categories);
        }
      } catch (e) {
        console.error('Failed to load tests list', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

      // Route to active test engine
      router.push(`/test-engine/${data.attempt.id}`);
    } catch (e: any) {
      alert(e.message || 'Error starting assessment');
      setStartingTest(false);
    }
  };

  // Filter Logic
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase()) || 
      (test.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCat === 'All' || test.category.name === activeCat;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
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
          Challenge yourself with simulated hiring tests and quantitative examinations.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search test names..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
          />
        </div>

        {/* Categories Tab Buttons */}
        <div className="flex flex-wrap gap-2">
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
            className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] relative overflow-hidden shadow-sm hover:shadow transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
                  {test.category.name}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {test.duration}m
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                    {test.testQuestions?.length || 0} Qs
                  </span>
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{test.title}</h3>
                <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {test.description || 'Standard placement simulated assessment containing custom problem banks.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTest(test)}
              className="mt-6 w-full py-2.5 bg-white border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-650 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              Start Assessment
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {filteredTests.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-slate-250 rounded-2xl bg-white">
            <span className="text-slate-450 text-sm italic">No mock assessments matched your filters.</span>
          </div>
        )}
      </div>

      {/* --- CONFIRMATION PROCTOR MODAL --- */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 border border-red-100 text-red-650 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900 text-lg block">Assessment Proctor Warning</span>
                <span className="text-slate-500 text-xs font-semibold">Read guidelines before starting the mock exam.</span>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-650 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
              <div className="flex gap-2">
                <span className="text-red-650 font-bold">1.</span>
                <span><strong className="text-slate-800">Tab Switching Ban</strong>: Changing browser tabs or closing the window will generate warnings. Exceeding <strong className="text-slate-800">3 warnings</strong> will trigger immediate auto-submission.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-650 font-bold">2.</span>
                <span><strong className="text-slate-800">Time Boundary</strong>: Once started, the timer of <strong className="text-slate-800">{selectedTest.duration} minutes</strong> runs continuously. Refreshing the browser does NOT pause the timer.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-650 font-bold">3.</span>
                <span><strong className="text-slate-800">Auto submit</strong>: After time runs out, the test will submit automatically.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedTest(null)}
                className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStartTest}
                disabled={startingTest}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
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
