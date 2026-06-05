'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  Check, 
  X, 
  CheckSquare, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string;
  correctAnswer: number;
  explanation: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  subCategoryId: string;
  subCategory: {
    name: string;
    category: { name: string };
  };
  companyTags: Array<{ name: string }>;
}

interface Test {
  id: string;
  title: string;
  duration: number;
  category: { name: string };
  testQuestions: Array<{
    question: { id: string; text: string };
  }>;
}

interface AdminStats {
  totalStudents: number;
  totalQuestions: number;
  totalTests: number;
  totalAttempts: number;
  recentAttempts: Array<{
    id: string;
    userName: string;
    userEmail: string;
    testTitle: string;
    percentage: number;
    score: number;
    maxScore: number;
    startedAt: string;
  }>;
}

interface MetadataItem {
  id: string;
  name: string;
}

interface CategoryWithSub {
  id: string;
  name: string;
  subCategories: MetadataItem[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'tests'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Metadata
  const [categories, setCategories] = useState<CategoryWithSub[]>([]);
  const [companyTags, setCompanyTags] = useState<MetadataItem[]>([]);

  // Question Form State
  const [showQModal, setShowQModal] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qDifficulty, setQDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [qSubCatId, setQSubCatId] = useState('');
  const [qTags, setQTags] = useState('');

  // Test Form State
  const [showTModal, setShowTModal] = useState(false);
  const [tTitle, setTTitle] = useState('');
  const [tDescription, setTDescription] = useState('');
  const [tDuration, setTDuration] = useState(60);
  const [tCategoryId, setTCategoryId] = useState('');
  const [tSelectedQIds, setTSelectedQIds] = useState<string[]>([]);
  const [tQFilter, setTQFilter] = useState('');

  // Search Filter
  const [qSearch, setQSearch] = useState('');
  const [qSubCatFilter, setQSubCatFilter] = useState('');
  const [qDifficultyFilter, setQDifficultyFilter] = useState('');

  // Status message
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data.overview);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (qSearch) params.append('search', qSearch);
      if (qSubCatFilter) params.append('subCategoryId', qSubCatFilter);
      if (qDifficultyFilter) params.append('difficulty', qDifficultyFilter);
      params.append('limit', '100');

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/admin/metadata');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
        setCompanyTags(data.companyTags);
        if (data.categories.length > 0) {
          // Set defaults for forms
          if (data.categories[0].subCategories.length > 0) {
            setQSubCatId(data.categories[0].subCategories[0].id);
          }
          setTCategoryId(data.categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchQuestions(),
      fetchTests(),
      fetchMetadata()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions();
    }
  }, [qSearch, qSubCatFilter, qDifficultyFilter]);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // --- Question Handlers ---
  const handleOpenQModal = (q?: Question) => {
    if (q) {
      setEditingQId(q.id);
      setQText(q.text);
      try {
        setQOptions(JSON.parse(q.options));
      } catch (e) {
        setQOptions(q.options.split(','));
      }
      setQCorrect(q.correctAnswer);
      setQExplanation(q.explanation || '');
      setQDifficulty(q.difficulty);
      setQSubCatId(q.subCategoryId);
      setQTags(q.companyTags.map(t => t.name).join(', '));
    } else {
      setEditingQId(null);
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrect(0);
      setQExplanation('');
      setQDifficulty('EASY');
      // Set default subcat
      if (categories.length > 0 && categories[0].subCategories.length > 0) {
        setQSubCatId(categories[0].subCategories[0].id);
      }
      setQTags('');
    }
    setShowQModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || qOptions.some(o => !o.trim()) || !qSubCatId) {
      showAlert('Please fill in all required fields.', 'error');
      return;
    }

    const payload = {
      text: qText,
      options: qOptions,
      correctAnswer: qCorrect,
      explanation: qExplanation,
      difficulty: qDifficulty,
      subCategoryId: qSubCatId,
      companyTags: qTags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      const url = editingQId ? `/api/admin/questions/${editingQId}` : '/api/admin/questions';
      const method = editingQId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert(editingQId ? 'Question updated!' : 'Question created!');
        setShowQModal(false);
        fetchQuestions();
        fetchOverview();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Request failed');
      }
    } catch (err: any) {
      showAlert(err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAlert('Question deleted.');
        fetchQuestions();
        fetchOverview();
      } else {
        const d = await res.json();
        throw new Error(d.error);
      }
    } catch (err: any) {
      showAlert(err.message || 'Deletion failed', 'error');
    }
  };

  // --- Test Handlers ---
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim() || !tCategoryId || tSelectedQIds.length === 0) {
      showAlert('Title, Category, and at least 1 Question are required.', 'error');
      return;
    }

    const payload = {
      title: tTitle,
      description: tDescription,
      duration: tDuration,
      categoryId: tCategoryId,
      questionIds: tSelectedQIds,
    };

    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showAlert('Mock test created successfully!');
        setShowTModal(false);
        setTTitle('');
        setTDescription('');
        setTDuration(60);
        setTSelectedQIds([]);
        fetchTests();
        fetchOverview();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create test');
      }
    } catch (err: any) {
      showAlert(err.message || 'Action failed', 'error');
    }
  };

  const toggleTestQSelection = (id: string) => {
    if (tSelectedQIds.includes(id)) {
      setTSelectedQIds(tSelectedQIds.filter(qid => qid !== id));
    } else {
      setTSelectedQIds([...tSelectedQIds, id]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-zinc-500 mt-4 text-sm font-medium">Loading administrative workspace...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Alert toast */}
      {alertMsg && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-sm flex items-center gap-2 animate-in slide-in-from-bottom duration-250 ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/20 text-red-300'
        }`}>
          {alertMsg.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {alertMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/15 border border-amber-500/25 text-amber-400 rounded-xl">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Manage mock assessments, system databases, and questions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-850">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'questions'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Question Bank
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'tests'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Mock Tests
        </button>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Diagnostic numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-5 border border-zinc-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Total Students</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats?.totalStudents}</h3>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-zinc-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Questions Bank</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats?.totalQuestions}</h3>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-zinc-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Assessments</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats?.totalTests}</h3>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-zinc-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Attempts Taken</span>
              <h3 className="text-3xl font-extrabold text-white mt-1">{stats?.totalAttempts}</h3>
            </div>
          </div>

          {/* Recent attempts table */}
          <div className="glass-panel rounded-2xl p-6">
            <span className="font-semibold text-white block mb-4">Recent Student Submissions</span>
            {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-medium">
                      <th className="py-3">Student</th>
                      <th className="py-3">Mock Test</th>
                      <th className="py-3 text-center">Score</th>
                      <th className="py-3 text-center">Percentage</th>
                      <th className="py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {stats.recentAttempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:text-white transition">
                        <td className="py-3.5">
                          <span className="block font-medium">{attempt.userName}</span>
                          <span className="block text-xs text-zinc-500">{attempt.userEmail}</span>
                        </td>
                        <td className="py-3.5 font-medium">{attempt.testTitle}</td>
                        <td className="py-3.5 text-center">{attempt.score} / {attempt.maxScore}</td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            attempt.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-850 text-zinc-400'
                          }`}>
                            {attempt.percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 text-right text-zinc-500">
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="text-zinc-600 text-xs italic block text-center py-6">No attempts logged yet.</span>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            
            {/* Search filter bars */}
            <div className="flex flex-wrap gap-3 flex-1 w-full">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-2 pl-11 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              {/* Subcat filter */}
              <select
                value={qSubCatFilter}
                onChange={(e) => setQSubCatFilter(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-850 text-sm text-zinc-300 rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="">All Topics</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Difficulty filter */}
              <select
                value={qDifficultyFilter}
                onChange={(e) => setQDifficultyFilter(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-850 text-sm text-zinc-300 rounded-xl px-4 py-2 focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <button
              onClick={() => handleOpenQModal()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-lg shadow-violet-900/20"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-850">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-500 font-medium">
                    <th className="py-3 px-5">Question</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4 text-center">Difficulty</th>
                    <th className="py-3 px-4">Tags</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-900/20 transition">
                      <td className="py-4 px-5 font-medium max-w-[280px] md:max-w-[400px] truncate">{q.text}</td>
                      <td className="py-4 px-4">
                        <span className="block text-xs text-zinc-500">{q.subCategory?.category?.name}</span>
                        <span className="block font-semibold">{q.subCategory?.name}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'EASY' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                            : (q.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10')
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {q.companyTags.map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-zinc-850 text-zinc-400 rounded text-[10px] font-semibold">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenQModal(q)}
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-650 text-xs italic">
                        No questions matched the search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-white">Mock Assessments Library</span>
            <button
              onClick={() => setShowTModal(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-lg shadow-violet-900/20"
            >
              <Plus className="h-4 w-4" />
              Create Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-4 border border-zinc-900">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-violet-600/10 text-violet-400 border border-violet-500/10 rounded-full">
                      {test.category?.name}
                    </span>
                    <span className="text-xs text-zinc-500">{test.duration} mins</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{test.title}</h3>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
                  <span>Questions Linked: <span className="text-white font-semibold">{test.testQuestions?.length || 0}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ADD / EDIT QUESTION MODAL --- */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-lg">{editingQId ? 'Edit Question' : 'Add New Question'}</span>
              <button onClick={() => setShowQModal(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Question Text</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question details..."
                  required
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Options (Fill all 4)</label>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={qCorrect === idx}
                      onChange={() => setQCorrect(idx)}
                      className="accent-violet-500 h-4 w-4"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const nextOpts = [...qOptions];
                        nextOpts[idx] = e.target.value;
                        setQOptions(nextOpts);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      required
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Explanation (optional)</label>
                <textarea
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Provide correct answer steps/reasoning..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Topic Subcategory</label>
                  <select
                    value={qSubCatId}
                    onChange={(e) => setQSubCatId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-300"
                  >
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        {cat.subCategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-300"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Company Tags (Comma separated)</label>
                <input
                  type="text"
                  value={qTags}
                  onChange={(e) => setQTags(e.target.value)}
                  placeholder="e.g. TCS, Infosys, Accenture"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition shadow-lg shadow-violet-950/20"
              >
                {editingQId ? 'Update Question' : 'Create Question'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE TEST ASSESSMENT MODAL --- */}
      {showTModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-lg">Create Assessment Test</span>
              <button onClick={() => setShowTModal(false)} className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Test Title</label>
                  <input
                    type="text"
                    value={tTitle}
                    onChange={(e) => setTTitle(e.target.value)}
                    placeholder="e.g., TCS Aptitude Mock"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Category</label>
                    <select
                      value={tCategoryId}
                      onChange={(e) => setTCategoryId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-300"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Duration (mins)</label>
                    <input
                      type="number"
                      value={tDuration}
                      onChange={(e) => setTDuration(parseInt(e.target.value, 10))}
                      min="5"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-sm text-zinc-250 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Test Description</label>
                <textarea
                  value={tDescription}
                  onChange={(e) => setTDescription(e.target.value)}
                  placeholder="Details and directions for students..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none"
                />
              </div>

              {/* Questions Picker */}
              <div className="space-y-3 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Link Questions ({tSelectedQIds.length} selected)</label>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Filter bank..."
                      value={tQFilter}
                      onChange={(e) => setTQFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1 px-3 pl-9 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                <div className="border border-zinc-800 rounded-xl max-h-[180px] overflow-y-auto divide-y divide-zinc-900 bg-zinc-950">
                  {questions
                    .filter(q => q.text.toLowerCase().includes(tQFilter.toLowerCase()))
                    .map((q) => {
                      const selected = tSelectedQIds.includes(q.id);
                      return (
                        <div 
                          key={q.id} 
                          onClick={() => toggleTestQSelection(q.id)}
                          className={`flex items-center gap-3 p-2.5 text-xs cursor-pointer transition ${
                            selected ? 'bg-violet-600/10 text-violet-300' : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <CheckSquare className={`h-4.5 w-4.5 transition ${selected ? 'text-violet-500 fill-violet-500/10' : 'text-zinc-700'}`} />
                          <span className="truncate flex-1 font-medium">{q.text}</span>
                          <span className="text-zinc-650 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850">{q.subCategory?.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition shadow-lg shadow-violet-950/20"
              >
                Create Assessment Mock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
