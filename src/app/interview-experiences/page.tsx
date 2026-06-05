'use client';

import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  X, 
  HelpCircle, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Briefcase,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Award,
  Calendar,
  ShieldCheck,
  Flag,
  BookmarkCheck,
  Bookmark,
  Sparkles,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Vote {
  id: string;
  voteType: 'HELPFUL' | 'NOT_HELPFUL';
}

interface ExperienceItem {
  id: string;
  role: string;
  questionsAsked: string;
  experience: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  selected: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
  packageText: string | null;
  year: number;
  roundsText: string | null;
  prepTips: string | null;
  upvoteCount: number;
  createdAt: string;
  user: { name: string };
  company: { name: string };
  votes: Vote[];
  mistakesMade?: string | null;
}

export default function InterviewExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Tabs: trending | helpful | recent | company
  const [activeTab, setActiveTab] = useState<'trending' | 'helpful' | 'recent' | 'company'>('trending');

  // Filters
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Form Submission Overlay Modal
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [selected, setSelected] = useState(true);
  const [packageText, setPackageText] = useState('');
  const [year, setYear] = useState('2026');
  const [roundsText, setRoundsText] = useState('');
  const [prepTips, setPrepTips] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alert State
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsAdmin(data.user.role === 'ADMIN');
          setUserId(data.user.id);
        }
      }

      const bookmarksRes = await fetch('/api/bookmarks');
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        const expBookmarks = bookmarksData.bookmarks
          .filter((b: any) => b.experienceId !== null)
          .map((b: any) => b.experienceId);
        setBookmarks(expBookmarks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExperiences = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (companyFilter) params.append('company', companyFilter);
      if (difficultyFilter) params.append('difficulty', difficultyFilter);

      const res = await fetch(`/api/experiences?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.experiences || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [search, companyFilter, difficultyFilter]);

  const handleOpenModal = () => {
    setCompany('');
    setRole('');
    setQuestions('');
    setDescription('');
    setDifficulty('MEDIUM');
    setSelected(true);
    setPackageText('');
    setYear('2026');
    setRoundsText('');
    setPrepTips('');
    setMistakes('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !questions.trim() || !description.trim()) {
      setAlertMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          questionsAsked: questions,
          experience: description + (mistakes ? `\n\nMistakes Made:\n${mistakes}` : ''),
          difficulty,
          selected,
          packageText,
          year: parseInt(year, 10),
          roundsText,
          prepTips,
        }),
      });

      if (res.ok) {
        setAlertMsg({ text: 'Interview experience submitted! Awaiting admin approval.', type: 'success' });
        setShowModal(false);
        fetchExperiences();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to submit experience.');
      }
    } catch (err: any) {
      setAlertMsg({ text: err.message || 'Submission failed.', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setAlertMsg(null), 4000);
    }
  };

  const handleVote = async (expId: string, type: 'HELPFUL' | 'NOT_HELPFUL') => {
    try {
      const res = await fetch(`/api/experiences/${expId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: type })
      });

      if (res.ok) {
        const json = await res.json();
        setExperiences(experiences.map(exp => {
          if (exp.id === expId) {
            return {
              ...exp,
              upvoteCount: json.upvoteCount,
              votes: json.userVote ? [{ id: 'mock-id', voteType: type }] : []
            };
          }
          return exp;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleModerate = async (expId: string, status: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    try {
      const res = await fetch(`/api/experiences/${expId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAlertMsg({ text: `Experience status set to ${status}`, type: 'success' });
        fetchExperiences();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmarkToggle = async (experienceId: string) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experienceId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookmarked) {
          setBookmarks([...bookmarks, experienceId]);
        } else {
          setBookmarks(bookmarks.filter(id => id !== experienceId));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'EASY') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    if (diff === 'MEDIUM') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-rose-50 border-rose-200 text-rose-700';
  };

  // Sort and filter logically by active tab
  const getSortedExperiences = () => {
    let list = [...experiences];
    if (activeTab === 'helpful') {
      list.sort((a, b) => b.upvoteCount - a.upvoteCount);
    } else if (activeTab === 'recent') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'company') {
      list = list.filter(e => e.company.name.toLowerCase() === companyFilter.toLowerCase() || companyFilter === '');
    }
    return list;
  };

  const displayList = getSortedExperiences();

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        
        {/* Alert toast */}
        {alertMsg && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-sm flex items-center gap-2 animate-in slide-in-from-bottom duration-250 ${
            alertMsg.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {alertMsg.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {alertMsg.text}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Real Interview Archives</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Interview Library</h1>
            <p className="text-slate-550 text-sm mt-2 font-medium">
              Real interview questions, failures, mistakes, and preparation notes shared by seniors.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4.5 w-4.5" />
            Share Experience
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm">
          {(['trending', 'helpful', 'recent', 'company'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition capitalize ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab === 'helpful' ? 'Most Helpful' : tab === 'company' ? 'Company Specific' : tab}
            </button>
          ))}
        </div>

        {/* Filters Panel - Only visible for search or when company tab is active */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, roles, questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-sm"
            />
          </div>

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-white border border-slate-200 text-sm text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none w-full sm:w-auto shadow-sm"
          >
            <option value="">All Companies</option>
            <option value="TCS">TCS</option>
            <option value="Amazon">Amazon</option>
            <option value="Infosys">Infosys</option>
            <option value="Accenture">Accenture</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-white border border-slate-200 text-sm text-slate-700 rounded-xl px-4 py-2.5 focus:outline-none w-full sm:w-auto shadow-sm"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Experiences list */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          ) : displayList.length > 0 ? (
            displayList.map((exp) => {
              const isExpanded = expandedId === exp.id;
              const hasUpvoted = exp.votes && exp.votes.length > 0;
              const isBookmarked = bookmarks.includes(exp.id);

              return (
                <div 
                  key={exp.id} 
                  className={`bg-white border rounded-2xl p-6 shadow-sm transition-all text-left ${
                    exp.status === 'PENDING' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  
                  {/* Collapsed Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      onClick={() => toggleExpand(exp.id)}
                      className="space-y-2 flex-1 pr-4 cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md">
                          {exp.company.name}
                        </span>
                        <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${getDifficultyBadge(exp.difficulty)}`}>
                          {exp.difficulty}
                        </span>
                        {exp.status !== 'APPROVED' && (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[9px] font-extrabold uppercase">
                            {exp.status}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-md leading-snug">{exp.role}</h3>
                      <p className="text-slate-450 text-xs font-semibold flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" /> Shared by {exp.user?.name || 'Alumnus'} • Class of {exp.year}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Offer status indicator */}
                      <div>
                        {exp.selected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250">
                            Selected / Offered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                            Rejected / No Offer
                          </span>
                        )}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleBookmarkToggle(exp.id)}
                        className={`p-2 rounded-xl border transition ${
                          isBookmarked
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-650'
                            : 'border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      </button>

                      {/* Expand Button */}
                      <button 
                        onClick={() => toggleExpand(exp.id)}
                        className="p-1 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-550" /> : <ChevronDown className="h-5 w-5 text-slate-550" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded view details - QUESTIONS AND TIPS PUT FIRST */}
                  {isExpanded && (
                    <div className="pt-5 border-t border-slate-150 mt-4 space-y-5 animate-in slide-in-from-top duration-200 text-left">
                      
                      {/* 1. Questions asked (priority #1) */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4" />
                          Questions Asked
                        </span>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed font-semibold">
                          {exp.questionsAsked}
                        </div>
                      </div>

                      {/* 2. Compensation & Rounds information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        {exp.packageText && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                            <DollarSign className="h-4.5 w-4.5 text-indigo-500" />
                            <div>
                              <span className="text-slate-400 block uppercase text-[10px]">Compensation</span>
                              <span className="text-indigo-700 font-extrabold">{exp.packageText}</span>
                            </div>
                          </div>
                        )}
                        {exp.roundsText && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                            <Briefcase className="h-4.5 w-4.5 text-indigo-500" />
                            <div>
                              <span className="text-slate-400 block uppercase text-[10px]">Rounds Faced</span>
                              <span className="text-slate-700">{exp.roundsText}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Prep Tips and mistakes made (priority #2) */}
                      {exp.prepTips && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="h-4 w-4" />
                            Preparation Tips & Advice
                          </span>
                          <p className="text-emerald-800 bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                            {exp.prepTips}
                          </p>
                        </div>
                      )}

                      {/* 4. Experience description details */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                          Experience Timeline details
                        </span>
                        <p className="text-slate-650 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs font-semibold">
                          {exp.experience}
                        </p>
                      </div>

                      {/* Community helpful buttons */}
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVote(exp.id, 'HELPFUL')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition ${
                              hasUpvoted
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Helpful ({exp.upvoteCount})
                          </button>
                        </div>

                        {/* Admin Moderation controls */}
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleModerate(exp.id, 'APPROVED')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerate(exp.id, 'REJECTED')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 text-xs font-bold rounded-lg transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleModerate(exp.id, 'FLAGGED')}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-700 text-xs font-bold rounded-lg transition"
                            >
                              Flag
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="py-12 text-center border border-dashed border-slate-200 bg-white rounded-2xl shadow-sm">
              <span className="text-slate-450 text-xs font-semibold italic">No interview logs found.</span>
            </div>
          )}
        </div>

        {/* SHARE EXPERIENCE MODAL FORM */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-6 max-h-[95vh] overflow-y-auto animate-in scale-in duration-200 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Share Placement Interview Experience</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. TCS, Amazon, Infosys"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role Title *</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. SDE Intern"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Compensation (CTC)</label>
                    <input
                      type="text"
                      value={packageText}
                      onChange={(e) => setPackageText(e.target.value)}
                      placeholder="e.g. 12 LPA"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-905 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Grad Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rounds Summary</label>
                    <input
                      type="text"
                      value={roundsText}
                      onChange={(e) => setRoundsText(e.target.value)}
                      placeholder="e.g. Coding OA, Technical Interview, HR"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-905 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="selected"
                      checked={selected}
                      onChange={(e) => setSelected(e.target.checked)}
                      className="accent-indigo-600 h-4 w-4 shrink-0"
                    />
                    <label htmlFor="selected" className="text-xs font-bold text-slate-500 cursor-pointer">
                      Offer Extended / Selected
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Interview Questions Asked *</label>
                  <textarea
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    placeholder="List specific coding challenges, technical questions, or behavioral topics..."
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mistakes Made / Lessons Learned</label>
                  <textarea
                    value={mistakes}
                    onChange={(e) => setMistakes(e.target.value)}
                    placeholder="What questions did you struggle with? What could be improved?"
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Preparation Tips & Advice</label>
                  <textarea
                    value={prepTips}
                    onChange={(e) => setPrepTips(e.target.value)}
                    placeholder="Key concepts, syllabus topics, sheets or notes to revise..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Detailed Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Full recruitment timeline explanation..."
                    required
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition shadow-sm"
                >
                  {submitting ? 'Submitting Experience...' : 'Publish Experience'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
