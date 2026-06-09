'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Bookmark, 
  BookOpen, 
  Briefcase, 
  HelpCircle, 
  Loader2, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface BookmarkedItem {
  id: string;
  createdAt: string;
  question?: {
    id: string;
    text: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    subCategory: { name: string };
  } | null;
  note?: {
    id: string;
    title: string;
    category: string;
  } | null;
  experience?: {
    id: string;
    role: string;
    company: { name: string };
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  } | null;
}

export default function SavedResourcesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'notes' | 'experiences'>('questions');
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, { revealed: boolean; explanation: string; options: string[]; correctIdx: number }>>({});
  const [togglingBookmarkId, setTogglingBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookmarks();
  }, [user, authLoading]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks);
      }
    } catch (e) {
      console.error('Failed to fetch bookmarks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmark: BookmarkedItem) => {
    const payload: any = {};
    if (bookmark.question) payload.questionId = bookmark.question.id;
    if (bookmark.note) payload.noteId = bookmark.note.id;
    if (bookmark.experience) payload.experienceId = bookmark.experience.id;

    setTogglingBookmarkId(bookmark.id);
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    } finally {
      setTogglingBookmarkId(null);
    }
  };

  const handleRevealExplanation = async (questionId: string) => {
    if (revealedQuestions[questionId]) {
      setRevealedQuestions(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], revealed: !prev[questionId].revealed }
      }));
      return;
    }

    try {
      const res = await fetch(`/api/tests/question-detail?id=${questionId}`);
      if (res.ok) {
        const data = await res.json();
        setRevealedQuestions(prev => ({
          ...prev,
          [questionId]: {
            revealed: true,
            explanation: data.question.explanation || 'No explanation provided.',
            options: data.question.options,
            correctIdx: data.question.correctAnswer
          }
        }));
      }
    } catch (e) {
      console.error('Failed to fetch question explanation', e);
    }
  };

  const savedQuestions = bookmarks.filter(b => b.question);
  const savedNotes = bookmarks.filter(b => b.note);
  const savedExperiences = bookmarks.filter(b => b.experience);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'HARD': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Loading your bookmarked resources...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Resources</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and practice your saved questions, learning notes, and interview experience guides.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex gap-1 w-full max-w-md">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Questions ({savedQuestions.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Notes ({savedNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('experiences')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'experiences' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          Experiences ({savedExperiences.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* Saved Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {savedQuestions.map(item => {
              const q = item.question!;
              const detail = revealedQuestions[q.id];
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 transition hover:shadow-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                        {q.subCategory.name}
                      </span>
                      <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 border rounded-full ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveBookmark(item)}
                      disabled={togglingBookmarkId === item.id}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-100 transition"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-left">
                    <p className="text-slate-800 font-bold text-sm leading-relaxed">{q.text}</p>
                  </div>

                  {/* Revealed details */}
                  {detail && detail.revealed && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-left animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <span className="font-extrabold text-xs text-slate-800 block">Options:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {detail.options.map((opt, oIdx) => (
                            <div 
                              key={oIdx} 
                              className={`p-2.5 rounded-lg border font-semibold ${
                                oIdx === detail.correctIdx 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <span className="font-extrabold text-xs text-slate-800 block">Step-by-step Solution:</span>
                        <p className="text-slate-650 text-xs mt-1 leading-relaxed whitespace-pre-wrap">{detail.explanation}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-start">
                    <button
                      onClick={() => handleRevealExplanation(q.id)}
                      className="text-xs font-bold text-indigo-650 hover:text-indigo-750 flex items-center gap-1 transition"
                    >
                      {detail?.revealed ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Reveal Answer & Solution
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            {savedQuestions.length === 0 && (
              <div className="py-16 text-center border border-dashed border-slate-250 rounded-2xl bg-white">
                <span className="text-slate-450 text-sm italic">You haven't bookmarked any practice questions yet.</span>
              </div>
            )}
          </div>
        )}

        {/* Saved Notes Tab */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedNotes.map(item => {
              const note = item.note!;
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
                        {note.category}
                      </span>
                      <button
                        onClick={() => handleRemoveBookmark(item)}
                        disabled={togglingBookmarkId === item.id}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{note.title}</h4>
                  </div>
                  <Link 
                    href={`/notes?id=${note.id}`}
                    className="mt-4 text-xs font-bold text-indigo-650 hover:text-indigo-755 flex items-center justify-start gap-0.5 transition"
                  >
                    Open Learning Note
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
            {savedNotes.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-250 rounded-2xl bg-white">
                <span className="text-slate-450 text-sm italic">You haven't bookmarked any learning notes yet.</span>
              </div>
            )}
          </div>
        )}

        {/* Saved Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedExperiences.map(item => {
              const exp = item.experience!;
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-md transition">
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800">{exp.company.name}</span>
                        <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 border rounded ${getDifficultyColor(exp.difficulty)}`}>
                          {exp.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(item)}
                        disabled={togglingBookmarkId === item.id}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{exp.role} Interview Guide</h4>
                  </div>
                  <Link 
                    href={`/interview-experiences?id=${exp.id}`}
                    className="mt-4 text-xs font-bold text-indigo-650 hover:text-indigo-755 flex items-center justify-start gap-0.5 transition"
                  >
                    Read Interview Prep Tips
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
            {savedExperiences.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-250 rounded-2xl bg-white">
                <span className="text-slate-450 text-sm italic">You haven't bookmarked any interview experiences yet.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
