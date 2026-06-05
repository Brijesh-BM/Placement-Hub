'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, BookOpen, Calendar, Building2, Tag, ArrowRight, Loader2, Bookmark, BookmarkCheck, Sparkles, PieChart } from 'lucide-react';
import Link from 'next/link';

interface PYQ {
  id: string;
  year: number;
  role: string;
  round: string;
  question: string;
  answer: string;
  explanation: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  company: {
    id: string;
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface Analytics {
  trendingTopics: Array<{ name: string; count: number }>;
  companyBreakdown: Array<{ company: string; topTopics: Array<{ topic: string; count: number }> }>;
}

export default function PYQPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [loading, setLoading] = useState(true);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  const fetchFilters = async () => {
    try {
      const compRes = await fetch('/api/companies');
      if (compRes.ok) {
        const compData = await compRes.json();
        setCompanies(compData.companies || []);
      }

      const analyticsRes = await fetch('/api/pyq/analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      const bookmarksRes = await fetch('/api/bookmarks');
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        const pyqBookmarks = bookmarksData.bookmarks
          .filter((b: any) => b.questionId !== null)
          .map((b: any) => b.questionId);
        setBookmarks(pyqBookmarks);
      }
    } catch (e) {
      console.error('Failed to fetch filter options', e);
    }
  };

  const fetchPYQs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCompany) queryParams.append('companyId', selectedCompany);
      if (selectedDifficulty) queryParams.append('difficulty', selectedDifficulty);
      if (selectedTopic) queryParams.append('topic', selectedTopic);
      if (selectedYear) queryParams.append('year', selectedYear);

      const res = await fetch(`/api/pyq?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPyqs(data.pyqs || []);
      }
    } catch (e) {
      console.error('Failed to fetch PYQs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchPYQs();
  }, [search, selectedCompany, selectedDifficulty, selectedTopic, selectedYear]);

  const handleBookmarkToggle = async (questionId: string) => {
    setBookmarkingId(questionId);
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookmarked) {
          setBookmarks([...bookmarks, questionId]);
        } else {
          setBookmarks(bookmarks.filter(id => id !== questionId));
        }
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    } finally {
      setBookmarkingId(null);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'EASY') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (diff === 'MEDIUM') return 'bg-amber-50 border-amber-250 text-amber-700';
    return 'bg-rose-50 border-rose-250 text-rose-700';
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Database of Real Placement Exams</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Previous Year Questions</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Search and practice actual questions asked during recent campus recruitment drives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-650">
                <Filter className="h-4 w-4" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Search & Filters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                
                {/* Search text */}
                <div className="sm:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions or topics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                  />
                </div>

                {/* Company selection */}
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none"
                >
                  <option value="">All Companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Difficulty selection */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none"
                >
                  <option value="">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                {/* Year Selection */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none"
                >
                  <option value="">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>

            {/* PYQ List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 border border-slate-250 rounded-2xl bg-white shadow-sm">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="text-slate-500 mt-4 text-sm font-semibold">Fetching past question banks...</span>
              </div>
            ) : pyqs.length > 0 ? (
              <div className="space-y-4">
                {pyqs.map((pyq) => {
                  const isBookmarked = bookmarks.includes(pyq.id);

                  return (
                    <div key={pyq.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden group hover:border-indigo-250 transition-all">
                      
                      {/* Top tags */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                            <Building2 className="h-3.5 w-3.5" />
                            {pyq.company.name}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg text-xs font-bold">
                            <Calendar className="h-3.5 w-3.5" />
                            {pyq.year}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-650 rounded-lg text-xs font-bold">
                            <BookOpen className="h-3.5 w-3.5" />
                            {pyq.round}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(pyq.difficulty)}`}>
                            {pyq.difficulty}
                          </span>
                        </div>

                        {/* Bookmark Toggle Button */}
                        <button
                          onClick={() => handleBookmarkToggle(pyq.id)}
                          disabled={bookmarkingId === pyq.id}
                          className={`p-2 rounded-xl border transition ${
                            isBookmarked
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-650 hover:bg-indigo-100'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Question Description */}
                      <div className="space-y-2 text-left">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Question Description</span>
                        <div className="text-slate-800 text-sm font-bold leading-relaxed bg-slate-50 border border-slate-200 p-4 rounded-xl">
                          {pyq.question}
                        </div>
                      </div>

                      {/* Answer and Explanation */}
                      <div className="space-y-3 pt-2 text-left">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Answer Key</span>
                          <p className="text-slate-700 text-sm font-bold">{pyq.answer}</p>
                        </div>

                        {pyq.explanation && (
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Explanation</span>
                            <p className="text-slate-550 text-xs leading-relaxed font-semibold">{pyq.explanation}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-bold flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-indigo-500" />
                          Topic: <span className="text-slate-700 font-extrabold">{pyq.topic}</span>
                        </span>
                        <span className="text-slate-450 font-bold">Role: <span className="text-slate-700 font-extrabold">{pyq.role}</span></span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white py-16 text-center px-4 shadow-sm">
                <span className="text-slate-500 text-sm font-semibold">No questions match selection filters.</span>
                <button 
                  onClick={() => { setSearch(''); setSelectedCompany(''); setSelectedDifficulty(''); setSelectedTopic(''); setSelectedYear(''); }}
                  className="text-indigo-650 hover:text-indigo-755 text-xs font-bold mt-2 inline-flex items-center gap-1"
                >
                  Reset filters <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6 text-left">
            
            {/* Most Asked Topics Percentage Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-650">
                <PieChart className="h-4 w-4" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Most Asked Topics</span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Arrays & Hashing</span>
                    <span>18%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Strings manipulation</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Trees & Binary Search</span>
                    <span>12%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>DBMS Indexing</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-650">
                <Tag className="h-4 w-4" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Frequently Asked Topics</span>
              </div>

              {analytics && analytics.trendingTopics.length > 0 ? (
                <div className="space-y-3">
                  {analytics.trendingTopics.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">{topic.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">
                        {topic.count} asked
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">No topic analytics computed.</span>
              )}
            </div>

            {/* Company-wise Top Topics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-650">
                <Building2 className="h-4 w-4" />
                <span className="font-extrabold text-xs uppercase tracking-wider">Company Wise Trends</span>
              </div>

              {analytics && analytics.companyBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {analytics.companyBreakdown.map((cb, idx) => (
                    <div key={idx} className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 block">{cb.company} Topics</span>
                      <div className="flex flex-wrap gap-2">
                        {cb.topTopics.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg">
                            {t.topic} ({t.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-xs italic">No company trending topics.</span>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
