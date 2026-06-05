'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Search, Loader2, ArrowRight, FileText, Compass, Map, Building2, MessageSquare, BookOpen, Tag, Briefcase, HelpCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SearchResults {
  questions: Array<{ id: string; text: string; difficulty: string; subCategory: { name: string } }>;
  tests: Array<{ id: string; title: string; duration: number }>;
  roadmaps: Array<{ id: string; title: string; description: string }>;
  companies: Array<{ id: string; name: string }>;
  experiences: Array<{ id: string; company: { name: string }; role: string; upvoteCount: number }>;
  notes: Array<{ id: string; title: string; category: string }>;
  pyqs: Array<{ id: string; company: { name: string }; year: number; role: string; topic: string }>;
  jobs: Array<{ id: string; title: string; company: string; location: string; salary: string | null }>;
  rounds: Array<{ id: string; roundName: string; description: string; company: { name: string } }>;
}

function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [keyword, setKeyword] = useState(query);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'tests' | 'pyqs' | 'jobs' | 'notes' | 'experiences'>('all');

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (e) {
      console.error('Global search error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setKeyword(query);
      executeSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword);
  };

  const countTotal = () => {
    if (!results) return 0;
    return (
      results.questions.length +
      results.tests.length +
      results.roadmaps.length +
      results.companies.length +
      results.experiences.length +
      results.notes.length +
      results.pyqs.length +
      results.jobs.length +
      results.rounds.length
    );
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Universal Search Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Global Search</h1>
          <p className="text-slate-550 text-sm mt-2 font-medium">
            Search terms across coding questions, previous year papers, jobs, notes, and experiences.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl flex gap-3 text-left">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Type search terms (e.g. Deadlock, Amazon, Arrays)..."
              required
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Navigation tabs */}
        {results && (
          <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm overflow-x-auto whitespace-nowrap gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Results ({countTotal()})
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mock Tests ({results.tests.length})
            </button>
            <button
              onClick={() => setActiveTab('pyqs')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'pyqs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              PYQs ({results.pyqs.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Jobs ({results.jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'notes' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Revision Notes ({results.notes.length})
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'experiences' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Experiences ({results.experiences.length})
            </button>
          </div>
        )}

        {/* Results Rendering - Grouped logically by type */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-205 rounded-2xl shadow-sm">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-slate-500 mt-4 text-sm font-semibold">Scanning index tables...</span>
          </div>
        ) : results ? (
          <div className="space-y-8 text-left">
            
            {/* Group 1: Mock Tests */}
            {(activeTab === 'all' || activeTab === 'tests') && results.tests.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Mock Tests ({results.tests.length} Results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.tests.map((test) => (
                    <div key={test.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex justify-between items-center group hover:border-indigo-250 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{test.title}</h4>
                        <p className="text-slate-450 text-xs font-bold">{test.duration} minutes</p>
                      </div>
                      <Link
                        href="/tests"
                        className="p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all shadow-sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 2: Previous Year Questions */}
            {(activeTab === 'all' || activeTab === 'pyqs') && results.pyqs.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-indigo-600" />
                  Previous Year Questions ({results.pyqs.length} Results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.pyqs.map((pyq) => (
                    <div key={pyq.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-indigo-250 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                          {pyq.company.name} ({pyq.year})
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pyq.topic}</span>
                      </div>
                      <p className="text-slate-750 text-sm font-bold truncate">{pyq.role}</p>
                      <Link
                        href="/pyq"
                        className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 mt-1"
                      >
                        View PYQ Directory <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 3: Jobs */}
            {(activeTab === 'all' || activeTab === 'jobs') && results.jobs.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
                  Active Job Listings ({results.jobs.length} Results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.jobs.map((job) => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-indigo-250 transition-all">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{job.title}</h4>
                        <p className="text-slate-500 text-xs font-bold mt-0.5">{job.company}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-450 pt-1 font-bold">
                        <span>{job.location}</span>
                        {job.salary && <span className="text-emerald-600 font-extrabold">{job.salary}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 4: Revision Notes */}
            {(activeTab === 'all' || activeTab === 'notes') && results.notes.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Revision Notes ({results.notes.length} Results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.notes.map((note) => (
                    <div key={note.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex justify-between items-center group hover:border-indigo-250 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{note.title}</h4>
                        <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{note.category}</span>
                      </div>
                      <Link
                        href="/notes"
                        className="p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all shadow-sm"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group 5: Experiences */}
            {(activeTab === 'all' || activeTab === 'experiences') && results.experiences.length > 0 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-indigo-600" />
                  Interview Experiences ({results.experiences.length} Results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.experiences.map((exp) => (
                    <div key={exp.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-indigo-250 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">{exp.company.name}</span>
                        <h4 className="font-extrabold text-slate-850 text-sm mt-1">{exp.role} Interview</h4>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold pt-1">
                        <span className="text-slate-450">{exp.upvoteCount} helpful upvotes</span>
                        <Link
                          href="/interview-experiences"
                          className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-bold"
                        >
                          Read log <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback if no matching records at all */}
            {countTotal() === 0 && (
              <div className="text-center py-16 border border-dashed border-slate-250 bg-white rounded-2xl shadow-sm">
                <span className="text-slate-500 text-sm font-bold">No records matching the term "{keyword}" were found.</span>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-250 bg-white rounded-2xl shadow-sm">
            <span className="text-slate-500 text-sm font-bold">Enter a search keyword to scan the placement database.</span>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-550 mt-4 text-sm font-semibold">Initializing search engine...</span>
      </div>
    }>
      <SearchResultsComponent />
    </Suspense>
  );
}
