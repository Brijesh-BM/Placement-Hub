'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Play, 
  HelpCircle, 
  Loader2, 
  Award, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
  difficulty: string;
  category: string;
  topic: string;
  order: number;
}

interface GradedResult {
  questionId: string;
  text: string;
  correctAnswer: number;
  selectedOption: number | null;
  isCorrect: boolean;
  explanation: string | null;
}

export default function PracticePage() {
  const [streak, setStreak] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingQ, setFetchingQ] = useState(false);
  
  // Quiz states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<{ [qId: string]: number | null }>({});

  // Graded State
  const [graded, setGraded] = useState<{
    correctCount: number;
    totalCount: number;
    streak: number;
    results: GradedResult[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setStreak(data.user.profile?.streak || 0);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  const handleStart = async () => {
    setFetchingQ(true);
    try {
      const res = await fetch('/api/practice/daily');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        
        // Reset selections
        const initialSels: { [key: string]: number | null } = {};
        data.questions.forEach((q: Question) => {
          initialSels[q.id] = null;
        });
        setSelections(initialSels);
        setCurrentIdx(0);
        setGraded(null);
        setActive(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingQ(false);
    }
  };

  const handleSelect = (qId: string, idx: number) => {
    setSelections(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Prepare answers payload
    const answersPayload = Object.keys(selections).map(qId => ({
      questionId: qId,
      selectedOption: selections[qId]
    }));

    try {
      const res = await fetch('/api/practice/daily/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        setGraded(data);
        setStreak(data.streak);
        setActive(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-medium">Fetching daily activities...</span>
      </div>
    );
  }

  // 1. Graded review screen
  if (graded) {
    return (
      <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-750 rounded-2xl w-fit mx-auto shadow-sm">
            <Award className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Challenge Completed</h1>
            <p className="text-slate-500 text-sm mt-1">
              Your Score: <span className="text-slate-905 font-bold">{graded.correctCount} / {graded.totalCount}</span>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-150 text-orange-700 rounded-xl text-sm font-bold">
            <Flame className="h-5 w-5 animate-pulse" />
            <span>Streak updated to {graded.streak} days!</span>
          </div>
        </div>

        {/* Detailed Correction list */}
        <div className="space-y-6 text-left">
          <h3 className="font-bold text-slate-800 text-md border-b border-slate-200 pb-2">Incorrect & Correction Details</h3>
          
          <div className="space-y-4">
            {graded.results.map((res, idx) => (
              <div 
                key={res.questionId}
                className={`p-5 rounded-2xl border ${
                  res.isCorrect ? 'bg-emerald-50/50 border-emerald-150' : 'bg-rose-50/50 border-rose-150'
                }`}
              >
                <div className="flex justify-between items-center text-xs text-slate-450 mb-2">
                  <span>Question {idx + 1}</span>
                  {res.isCorrect ? (
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-md">Correct</span>
                  ) : (
                    <span className="text-red-700 font-bold bg-red-100 px-2.5 py-0.5 rounded-md">Incorrect</span>
                  )}
                </div>

                <p className="text-slate-800 font-bold text-sm leading-relaxed mb-3">{res.text}</p>
                
                {/* Explanation */}
                {res.explanation && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed mt-2 flex items-start gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <p>{res.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setGraded(null)}
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition active:scale-98"
        >
          Close Review
        </button>
      </div>
    );
  }

  // 2. Active practice session
  if (active && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-2xl mx-auto w-full flex flex-col justify-between h-[calc(100vh-64px)] animate-in fade-in duration-200">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-bold">
            <span className="uppercase tracking-wider">Daily Challenge</span>
            <span>{currentIdx + 1} / {questions.length}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-indigo-650 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="space-y-6 py-8 flex-1 flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-100/50 text-indigo-700 rounded-full">
              {currentQ.category}
            </span>
            <span className="text-slate-450 font-bold">{currentQ.topic}</span>
          </div>

          <p className="text-lg text-slate-900 font-bold leading-relaxed">
            {currentQ.text}
          </p>

          {/* Options */}
          <div className="space-y-3.5 pt-4">
            {currentQ.options.map((opt, oIdx) => {
              const selected = selections[currentQ.id] === oIdx;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelect(currentQ.id, oIdx)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center gap-3 active:scale-99 ${
                    selected
                      ? 'bg-indigo-50/70 border-indigo-500 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                    selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className="text-sm font-semibold">{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-6 border-t border-slate-200 flex justify-between gap-4 mt-auto">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 bg-white rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-white"
          >
            <span className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" /> Previous</span>
          </button>

          <button
            onClick={() => {
              if (!isLast) {
                setCurrentIdx(prev => prev + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isLast ? (
              <>
                Submit Challenge
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 3. Landing Page Challenge Card
  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden shadow-lg">
        
        {/* Flame decoration */}
        <div className="absolute top-0 right-0 p-8 text-orange-500/5 rotate-12 pointer-events-none">
          <Flame className="h-40 w-40" />
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-100 text-orange-600 rounded-full w-fit mx-auto shadow-sm">
            <Flame className="h-10 w-10 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Practice Challenge</h1>
            <p className="text-slate-550 text-sm mt-1">
              Solve today's 25 curated questions to maintain your learning habits.
            </p>
          </div>
        </div>

        {/* Streaks metrics panel */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 text-center divide-x divide-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block">Current Streak</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{streak} days</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block">Curated Set</span>
            <span className="text-xs font-bold text-slate-700 mt-1.5 block">10 Apt • 10 Reason • 5 Tech</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={fetchingQ}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:bg-indigo-750 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
        >
          {fetchingQ ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              Begin Daily Challenge
            </>
          )}
        </button>
      </div>
    </div>
  );
}
