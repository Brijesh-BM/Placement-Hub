'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ArrowLeft,
  Loader2,
  Clock,
  Bookmark
} from 'lucide-react';

interface ResultTopicAnalysis {
  [topic: string]: number;
}

interface ResultData {
  attempt: {
    id: string;
    testTitle: string;
    testCategory: string;
    testDuration: number;
    score: number;
    maxScore: number;
    percentage: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    submittedAt: string;
    warningsCount: number;
  };
  result: {
    id: string;
    rank: number;
    accuracy: number;
    topicAnalysis: ResultTopicAnalysis;
    recommendations?: any[];
  } | null;
  answers: Array<{
    questionId: string;
    text: string;
    options: string[];
    correctAnswer: number;
    selectedOption: number | null;
    isCorrect: boolean;
    explanation: string | null;
    difficulty: string;
    topic: string;
  }>;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = params?.id as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openExplanations, setOpenExplanations] = useState<{ [qId: string]: boolean }>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results/${id}`);
        if (res.ok) {
          const rData = await res.json();
          setData(rData);
        }
      } catch (e) {
        console.error('Failed to fetch results', e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id, user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchBookmarks = async () => {
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const bData = await res.json();
          const qBookmarkedMap: Record<string, boolean> = {};
          bData.bookmarks.forEach((b: any) => {
            if (b.question) {
              qBookmarkedMap[b.question.id] = true;
            }
          });
          setBookmarkedQuestions(qBookmarkedMap);
        }
      } catch (e) {
        console.error('Failed to fetch user bookmarks', e);
      }
    };
    fetchBookmarks();
  }, [user, authLoading]);

  const handleBookmarkQuestion = async (questionId: string) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        const bData = await res.json();
        setBookmarkedQuestions(prev => ({
          ...prev,
          [questionId]: bData.bookmarked
        }));
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
  };

  const toggleExplanation = (qId: string) => {
    setOpenExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Analyzing exam submissions...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-600" />
        <span className="text-slate-800 font-bold">Results not found or loading failed.</span>
        <Link href="/dashboard" className="text-indigo-600 font-semibold hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { attempt, result, answers } = data;

  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-slate-450 hover:text-slate-700 transition text-xs font-bold flex items-center gap-1.5 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{attempt.testTitle}</h1>
          <p className="text-slate-500 text-xs font-semibold">
            Submitted on {new Date(attempt.submittedAt).toLocaleString()} • Duration: {attempt.testDuration} mins
          </p>
        </div>
      </div>

      {/* Analytics widgets row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Score widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Score</span>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {attempt.score} <span className="text-sm font-medium text-slate-450">/ {attempt.maxScore}</span>
          </h3>
          <span className="text-xs text-indigo-600 font-bold block">{attempt.percentage}%</span>
        </div>

        {/* Accuracy widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accuracy</span>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {result?.accuracy || 0}%
          </h3>
          <span className="text-xs text-slate-450 font-bold block">Correct / Answered</span>
        </div>

        {/* Global Rank */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Global Rank</span>
          <h3 className="text-2xl font-extrabold text-indigo-600">
            #{result?.rank || 1}
          </h3>
          <span className="text-xs text-slate-450 font-bold block">Across all submissions</span>
        </div>

        {/* Warnings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tab Violations</span>
          <h3 className={`text-2xl font-extrabold ${attempt.warningsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {attempt.warningsCount} <span className="text-sm font-medium text-slate-400">/ 3</span>
          </h3>
          <span className="text-xs text-slate-450 font-bold block">Proctor limit warning count</span>
        </div>
      </div>

      {/* Answer overview summary breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Answer Breakdown Counts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
          <span className="font-bold text-slate-800 block text-sm border-b border-slate-100 pb-2">Response Breakdown</span>
          
          <div className="space-y-3 text-sm font-semibold">
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Correct Answers
              </span>
              <span className="font-extrabold text-slate-800">{attempt.correctCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-600" />
                Wrong Answers
              </span>
              <span className="font-extrabold text-slate-800">{attempt.incorrectCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                Skipped Questions
              </span>
              <span className="font-extrabold text-slate-800">{attempt.skippedCount}</span>
            </div>
          </div>
        </div>

        {/* Topic Analysis progress bars */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
          <span className="font-bold text-slate-800 block text-sm border-b border-slate-100 pb-2">Topic Accuracy Diagnostics</span>
          
          {result?.topicAnalysis && Object.keys(result.topicAnalysis).length > 0 ? (
            <div className="space-y-3.5">
              {Object.entries(result.topicAnalysis).map(([topic, acc]) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">{topic}</span>
                    <span className={acc >= 75 ? 'text-emerald-700' : (acc >= 50 ? 'text-amber-700' : 'text-rose-700')}>{acc}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-150">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        acc >= 75 ? 'bg-emerald-500' : (acc >= 50 ? 'bg-amber-500' : 'bg-rose-500')
                      }`}
                      style={{ width: `${acc}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic block py-4 font-semibold">No topic diagnostic data.</span>
          )}
        </div>
      </div>

      {/* Recommendations & Actionable Learning Path */}
      {result?.recommendations && result.recommendations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-lg">Actionable Weak-Area Recommendations</h2>
          </div>
          
          <div className="space-y-6">
            {result.recommendations.map((rec: any, rIdx: number) => (
              <div key={rIdx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800">
                    Target Area: <span className="text-indigo-650">{rec.topic}</span>
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                    Accuracy: {rec.score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recommended notes */}
                  {rec.recommendedNotes && rec.recommendedNotes.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Study Materials</span>
                      <div className="space-y-1.5">
                        {rec.recommendedNotes.map((note: any) => (
                          <Link 
                            key={note.id} 
                            href={`/notes?id=${note.id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 block hover:underline"
                          >
                            📖 {note.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended tests */}
                  {rec.recommendedTests && rec.recommendedTests.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Practice Tests</span>
                      <div className="space-y-1.5">
                        {rec.recommendedTests.map((test: any) => (
                          <Link 
                            key={test.id} 
                            href={`/tests?search=${encodeURIComponent(test.title)}`}
                            className="text-xs font-bold text-indigo-650 hover:text-indigo-800 block hover:underline"
                          >
                            📝 {test.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Prioritized Path */}
                {rec.prioritizedPath && rec.prioritizedPath.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Prioritized Action Path</span>
                    <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-600 font-semibold">
                      {rec.prioritizedPath.map((step: string, sIdx: number) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer key list review */}
      <div className="space-y-6 text-left">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assessment Review & Explanations</h2>
        
        <div className="space-y-6">
          {answers.map((ans, idx) => {
            const hasExplanation = !!ans.explanation;
            const isOpened = !!openExplanations[ans.questionId];

            return (
              <div 
                key={ans.questionId}
                className={`p-6 rounded-2xl border ${
                  ans.selectedOption === null 
                    ? 'bg-white border-slate-200 shadow-sm' 
                    : (ans.isCorrect ? 'bg-emerald-50/40 border-emerald-150' : 'bg-rose-50/40 border-rose-150')
                }`}
              >
                {/* Question Info Header */}
                <div className="flex justify-between items-start text-xs text-slate-450 mb-3.5 font-bold">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider">Question {idx + 1}</span>
                    <button 
                      onClick={() => handleBookmarkQuestion(ans.questionId)}
                      className={`p-1 rounded hover:bg-slate-100/50 transition ${bookmarkedQuestions[ans.questionId] ? 'text-amber-500' : 'text-slate-400'}`}
                      title={bookmarkedQuestions[ans.questionId] ? 'Bookmarked' : 'Bookmark Question'}
                    >
                      <Bookmark className={`h-4 w-4 ${bookmarkedQuestions[ans.questionId] ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md">
                      {ans.topic}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-extrabold ${
                      ans.difficulty === 'EASY' ? 'text-emerald-700 bg-emerald-50' : (ans.difficulty === 'MEDIUM' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50')
                    }`}>
                      {ans.difficulty}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-slate-900 font-bold mb-5 whitespace-pre-line leading-relaxed">
                  {ans.text}
                </p>

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
                  {ans.options.map((opt, optIdx) => {
                    const isCorrectOption = optIdx === ans.correctAnswer;
                    const isSelectedOption = optIdx === ans.selectedOption;

                    let optStyle = 'bg-white border-slate-200 text-slate-650';
                    if (isCorrectOption) {
                      optStyle = 'bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold';
                    } else if (isSelectedOption && !ans.isCorrect) {
                      optStyle = 'bg-rose-50 border border-rose-400 text-rose-800 font-bold';
                    }

                    return (
                      <div key={optIdx} className={`p-3.5 rounded-xl border text-sm flex items-center gap-3 ${optStyle}`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCorrectOption 
                            ? 'bg-emerald-600 text-white' 
                            : (isSelectedOption ? 'bg-red-650 text-white' : 'bg-slate-50 border border-slate-250 text-slate-500')
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span className="leading-relaxed font-semibold">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Attempt Status Badge */}
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-bold">
                  <div>
                    {ans.selectedOption === null ? (
                      <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Skipped</span>
                    ) : ans.isCorrect ? (
                      <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">Correct</span>
                    ) : (
                      <span className="text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200">Incorrect</span>
                    )}
                  </div>

                  {hasExplanation && (
                    <button 
                      onClick={() => toggleExplanation(ans.questionId)}
                      className="text-indigo-650 hover:text-indigo-805 font-bold flex items-center gap-1 hover:underline transition"
                    >
                      <BookOpen className="h-4 w-4" />
                      {isOpened ? 'Hide Explanation' : 'View Explanation'}
                      {isOpened ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                {/* Explanation Drawer */}
                {hasExplanation && isOpened && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-250 text-sm text-slate-700 space-y-2 animate-in slide-in-from-top duration-150 leading-relaxed text-left">
                    <span className="font-extrabold text-indigo-650 block text-xs uppercase tracking-wider">Solution Steps</span>
                    <p className="whitespace-pre-line font-medium">{ans.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
