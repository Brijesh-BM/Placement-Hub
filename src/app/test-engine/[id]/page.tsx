'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Loader2, 
  Timer,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface EngineQuestion {
  id: string;
  text: string;
  options: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  order: number;
  selectedOption: number | null;
  markedForReview: boolean;
}

export default function TestEnginePage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<EngineQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Selections state: mappings of questionId to values
  const [selections, setSelections] = useState<{ [qId: string]: number | null }>({});
  const [reviewed, setReviewed] = useState<{ [qId: string]: boolean }>({});

  // Timer & Proctoring
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs for timer loop & tab monitoring
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isBlurHandling = useRef(false);

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      if (!res.ok) throw new Error('Failed to load test details.');

      const data = await res.json();

      if (data.attempt.status === 'SUBMITTED') {
        router.push(`/results/${attemptId}`);
        return;
      }

      setTestTitle(data.test.title);
      setQuestions(data.questions);
      setWarnings(data.attempt.warningsCount || 0);

      // Populate initial selections
      const initialSels: { [key: string]: number | null } = {};
      const initialRev: { [key: string]: boolean } = {};
      data.questions.forEach((q: EngineQuestion) => {
        initialSels[q.id] = q.selectedOption;
        initialRev[q.id] = q.markedForReview;
      });
      setSelections(initialSels);
      setReviewed(initialRev);

      setTimeLeft(data.remainingSeconds);
    } catch (e: any) {
      alert(e.message || 'Error loading exam session');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  // Timer Loop
  useEffect(() => {
    if (timeLeft <= 0 || loading || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, loading, submitting]);

  // Tab blur proctoring helper
  useEffect(() => {
    if (loading || submitting) return;

    const handleBlur = async () => {
      if (isBlurHandling.current) return;
      isBlurHandling.current = true;

      try {
        const res = await fetch('/api/attempts/warn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId }),
        });

        if (res.ok) {
          const data = await res.json();
          setWarnings(data.warningsCount);

          if (data.triggerAutoSubmit) {
            alert('Security Violation: Maximum tab switches exceeded. Submitting exam now.');
            handleForceSubmit();
          } else {
            setShowWarningModal(true);
          }
        }
      } catch (e) {
        console.error('Proctor monitor error', e);
      } finally {
        isBlurHandling.current = false;
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [loading, submitting]);

  const formatTimer = (seconds: number) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const selectOption = (qId: string, optIdx: number) => {
    setSelections(prev => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const toggleReview = (qId: string) => {
    setReviewed(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const getAnswersPayload = () => {
    return Object.keys(selections).map((qId) => ({
      questionId: qId,
      selectedOption: selections[qId],
      markedForReview: !!reviewed[qId],
    }));
  };

  const handleRedirect = () => {
    if (testTitle === 'Placement Baseline Assessment') {
      router.push(`/analysis?attemptId=${attemptId}`);
    } else {
      router.push(`/results/${attemptId}`);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your assessment?')) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: getAnswersPayload(),
        }),
      });

      if (res.ok) {
        handleRedirect();
      } else {
        throw new Error('Failed to submit exam.');
      }
    } catch (e) {
      alert('Submit failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: getAnswersPayload(),
        }),
      });
      handleRedirect();
    } catch (e) {
      console.error(e);
      handleRedirect();
    }
  };

  const handleForceSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: getAnswersPayload(),
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      handleRedirect();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-550 mt-4 text-sm font-semibold">Entering secure exam environment...</span>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen text-center">
        <div className="max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <span className="text-sm font-bold text-slate-500 block">No Questions Found</span>
          <p className="text-xs text-slate-405 font-semibold leading-relaxed">
            This assessment does not contain any questions. Please return to the dashboard.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selections[currentQ.id] !== null;
  const isMarked = reviewed[currentQ.id];

  // Count tallies
  const answeredCount = Object.values(selections).filter(s => s !== null).length;
  const markedCount = Object.values(reviewed).filter(r => r === true).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-[calc(100vh-64px)] relative select-none">
      
      {/* Proctor warnings warning modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-red-250 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in duration-200 shadow-2xl">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-fit mx-auto border border-rose-100">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">Proctor Warning: Tab Switch</h3>
            <p className="text-slate-550 text-xs leading-relaxed font-semibold">
              You switched windows or tabs. A security warning has been registered. 
              Warnings: <span className="text-rose-650 font-black">{warnings} / 3</span>.
              Reaching 3 warnings triggers immediate auto-submission.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 bg-rose-650 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION BAR */}
      <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold text-slate-850 text-sm tracking-tight">{testTitle}</span>
          <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Secure Proctoring Active
          </span>
        </div>

        {/* Tally counter details */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold">
          <span className="text-slate-500">Question <span className="text-slate-800">{currentIdx + 1}</span> / {questions.length}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> Answered: {answeredCount}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-purple-600"></span> Review: {markedCount}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-red-500"></span> Unanswered: {unansweredCount}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Clock */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
            timeLeft < 300 
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Timer className="h-4 w-4" />
            <span className="font-mono font-bold text-sm">{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* VIEWPORT AREA AND PALETTE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left pane: Question Viewport */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto space-y-6">
          
          <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              Question Description #{currentIdx + 1}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
                {currentQ.topic}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                currentQ.difficulty === 'EASY' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : (currentQ.difficulty === 'MEDIUM' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700')
              }`}>
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          {/* Question Text Description area */}
          <div className="text-left py-4">
            <p className="text-lg text-slate-800 font-bold leading-relaxed whitespace-pre-line">
              {currentQ.text}
            </p>
          </div>

          {/* Answer Options list cards */}
          <div className="space-y-3.5 pt-2 text-left">
            {currentQ.options.map((opt, idx) => {
              const selected = selections[currentQ.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => selectOption(currentQ.id, idx)}
                  className={`p-4 border rounded-xl cursor-pointer transition flex items-center gap-3.5 active:scale-99 select-none ${
                    selected
                      ? 'bg-indigo-50/70 border-indigo-650 text-indigo-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <div className={`h-6.5 w-6.5 rounded-full border flex items-center justify-center text-xs font-black transition ${
                    selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-650'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-sm font-semibold leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation and palette button controls */}
          <div className="pt-6 border-t border-slate-200 flex justify-between gap-4 mt-auto">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-transparent shadow-sm"
            >
              <span className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" /> Previous</span>
            </button>

            <button
              onClick={() => toggleReview(currentQ.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 shadow-sm ${
                isMarked
                  ? 'bg-purple-50 border-purple-200 text-purple-750'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flag className={`h-4 w-4 ${isMarked ? 'fill-purple-500/10 text-purple-600' : 'text-slate-400'}`} />
              {isMarked ? 'Marked' : 'Mark for Review'}
            </button>

            <button
              onClick={() => {
                if (currentIdx < questions.length - 1) {
                  setCurrentIdx(prev => prev + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              {currentIdx === questions.length - 1 ? (
                <>Finish Assessment</>
              ) : (
                <>Save & Next <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right pane: Navigation palette grid */}
        <div className="w-80 border-l border-slate-200 p-6 flex flex-col justify-between bg-white shrink-0">
          <div className="space-y-6 text-left">
            <span className="font-extrabold text-slate-800 block text-sm">Question Navigation Palette</span>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const active = currentIdx === idx;
                const answered = selections[q.id] !== null;
                const marked = reviewed[q.id];

                // Palette color logic matching TCS & Infosys
                let colorStyle = 'bg-red-500 border-red-650 text-white hover:bg-red-600'; // Unanswered
                if (marked) {
                  colorStyle = 'bg-purple-600 border-purple-750 text-white hover:bg-purple-700'; // Marked for review
                } else if (answered) {
                  colorStyle = 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'; // Answered
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-9 rounded-lg text-xs font-black border flex items-center justify-center transition shadow-sm ${colorStyle} ${
                      active ? 'ring-4 ring-indigo-500/20 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color legends */}
          <div className="border-t border-slate-150 pt-6 space-y-2.5 text-xs text-left">
            <div className="flex items-center gap-2.5 font-semibold text-slate-500">
              <div className="h-4 w-4 rounded bg-red-500 border border-red-600"></div>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-slate-500">
              <div className="h-4 w-4 rounded bg-emerald-500 border border-emerald-600"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-slate-500">
              <div className="h-4 w-4 rounded bg-purple-600 border border-purple-750"></div>
              <span>Marked for Review</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
