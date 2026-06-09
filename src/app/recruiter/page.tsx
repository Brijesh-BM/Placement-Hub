'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Briefcase, Users, PlusCircle, CheckCircle, Search, Filter, Loader2, ArrowRight, Award, ShieldCheck, Mail, Database, Building2, Sparkles, Star, Target, Check, ChartColumn } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Candidate {
  id: string;
  name: string;
  email: string;
  branch: string | null;
  gradYear: number | null;
  cgpa: number | null;
  targetRole: string | null;
  collegeName: string;
  collegeId: string | null;
  skills: string[];
  readinessScore: number | null;
  mockAverage: number | null;
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string | null;
  jobType: string;
  requiredSkills: string;
  experienceLevel: string;
  cgpaCutoff: number | null;
  readinessCutoff: number | null;
  assessments: Array<{
    id: string;
    testId: string;
    _count: { invitations: number };
  }>;
}

interface College {
  id: string;
  name: string;
}

interface Test {
  id: string;
  title: string;
}

export default function RecruiterPortal() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Job creation Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSalary, setFormSalary] = useState('');
  const [formJobType, setFormJobType] = useState('Full Time');
  const [formSkills, setFormSkills] = useState('');
  const [formExpLevel, setFormExpLevel] = useState('Entry Level');
  const [formCollegeId, setFormCollegeId] = useState('');
  const [formCgpaCutoff, setFormCgpaCutoff] = useState('');
  const [formReadinessCutoff, setFormReadinessCutoff] = useState('');
  const [formTestId, setFormTestId] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [minReadiness, setMinReadiness] = useState('');

  // Invitation state
  const [invitingStudentId, setInvitingStudentId] = useState<string | null>(null);
  const [inviteJobId, setInviteJobId] = useState('');
  const [inviteTestId, setInviteTestId] = useState('');
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const candidatesRes = await fetch('/api/recruiter/candidates');
      if (candidatesRes.ok) {
        const cData = await candidatesRes.json();
        setCandidates(cData.candidates || []);
      }

      const jobsRes = await fetch('/api/recruiter/jobs');
      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        setJobs(jData.jobs || []);
        if (jData.jobs && jData.jobs.length > 0) {
          setInviteJobId(jData.jobs[0].id);
        }
      }

      const collegesRes = await fetch('/api/colleges');
      if (collegesRes.ok) {
        const colData = await collegesRes.json();
        setColleges(colData.colleges || []);
      }

      const testsRes = await fetch('/api/tests');
      if (testsRes.ok) {
        const tData = await testsRes.json();
        setTests(tData.tests || []);
        if (tData.tests && tData.tests.length > 0) {
          setFormTestId(tData.tests[0].id);
          setInviteTestId(tData.tests[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load recruiter data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (authLoading) return;
    if (!user || user.role !== 'RECRUITER') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, authLoading, router]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          company: formCompany,
          description: formDescription,
          location: formLocation,
          salary: formSalary,
          jobType: formJobType,
          requiredSkills: formSkills,
          experienceLevel: formExpLevel,
          collegeId: formCollegeId || null,
          cgpaCutoff: formCgpaCutoff ? parseFloat(formCgpaCutoff) : null,
          readinessCutoff: formReadinessCutoff ? parseFloat(formReadinessCutoff) : null,
          testId: formTestId || null,
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        // Clear inputs
        setFormTitle('');
        setFormCompany('');
        setFormDescription('');
        setFormLocation('');
        setFormSalary('');
        setFormSkills('');
        setFormCgpaCutoff('');
        setFormReadinessCutoff('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleInvite = async (studentId: string) => {
    if (!inviteJobId || !inviteTestId) {
      alert('Please configure/create a Job and link an Assessment first.');
      return;
    }
    setInvitingStudentId(studentId);
    setInviteMsg(null);
    setInviteError(null);

    try {
      const res = await fetch('/api/recruiter/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          jobId: inviteJobId,
          testId: inviteTestId,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInviteMsg('Shortlist invitation sent successfully!');
      } else {
        setInviteError(data.error || 'Failed to send invitation');
      }
    } catch (e) {
      setInviteError('Failed to dispatch invitation.');
    } finally {
      setInvitingStudentId(null);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCollege = filterCollege ? c.collegeId === filterCollege : true;
    const matchesRole = filterRole ? c.targetRole === filterRole : true;
    const matchesCgpa = minCgpa ? (c.cgpa !== null && c.cgpa >= parseFloat(minCgpa)) : true;
    const matchesReadiness = minReadiness ? (c.readinessScore !== null && c.readinessScore >= parseFloat(minReadiness)) : true;

    return matchesSearch && matchesCollege && matchesRole && matchesCgpa && matchesReadiness;
  });

  // Recharts candidate average skills metrics
  const barChartData = [
    { name: 'DSA', Average: 68 },
    { name: 'DBMS', Average: 78 },
    { name: 'OS', Average: 62 },
    { name: 'CN', Average: 58 },
    { name: 'Aptitude', Average: 72 }
  ];

  if (authLoading || !user || user.role !== 'RECRUITER' || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-550 mt-4 text-sm font-semibold">Loading recruiter workspace...</span>
      </div>
    );
  }

  const totalInvitedCount = jobs.reduce((sum, j) => sum + (j.assessments?.[0]?._count?.invitations || 0), 0);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Talent Acquisition Board</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Recruiter Portal</h1>
            <p className="text-slate-550 text-sm mt-2 font-medium">
              Analyze student cgpas, test performance, and readiness stats to dispatch assessments.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Create Job Listing
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Jobs Created</span>
              <h3 className="text-3xl font-black text-slate-800">{jobs.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Candidates Screened</span>
              <h3 className="text-3xl font-black text-slate-800">{candidates.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Shortlisted</span>
              <h3 className="text-3xl font-black text-slate-800">{totalInvitedCount}</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Interview Ready</span>
              <h3 className="text-3xl font-black text-slate-800">
                {candidates.filter(c => (c.readinessScore || 0) >= 75).length}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* CREATE JOB PANEL */}
        {showCreateForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm text-left">
            <h3 className="text-xl font-bold text-slate-900">Create New Job & Assessment Link</h3>
            
            <form onSubmit={handleCreateJob} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Software Engineer Intern"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="Amazon Inc."
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Location</label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Bangalore, India"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Salary Package</label>
                <input
                  type="text"
                  value={formSalary}
                  onChange={(e) => setFormSalary(e.target.value)}
                  placeholder="e.g. 12 LPA"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Type</label>
                <select
                  value={formJobType}
                  onChange={(e) => setFormJobType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Required Skills</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="React, SQL, Java"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Experience Level</label>
                <select
                  value={formExpLevel}
                  onChange={(e) => setFormExpLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 text-sm focus:outline-none"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target College</label>
                <select
                  value={formCollegeId}
                  onChange={(e) => setFormCollegeId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 text-sm focus:outline-none"
                >
                  <option value="">All Colleges</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Link Assessment Test</label>
                <select
                  value={formTestId}
                  onChange={(e) => setFormTestId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 text-sm focus:outline-none"
                >
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCgpaCutoff}
                    onChange={(e) => setFormCgpaCutoff(e.target.value)}
                    placeholder="8.0"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Min Readiness</label>
                  <input
                    type="number"
                    value={formReadinessCutoff}
                    onChange={(e) => setFormReadinessCutoff(e.target.value)}
                    placeholder="70"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline roles, requirements..."
                  required
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5"
                >
                  {formSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RECRUITER ANALYTICS & SKILL DISTRIBUTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 mb-4 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Average Skill Readiness</span>
            <p className="text-xs text-slate-500 font-semibold">Distribution of skill ratings analyzed across all active profiles</p>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                    labelStyle={{ color: '#475569', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Average" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* CANDIDATES DIRECTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Candidate Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit space-y-6 text-left shadow-sm">
            <div className="flex items-center gap-2 text-indigo-650">
              <Filter className="h-4 w-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Configure Filters</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Candidate Name / Skill</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. Brijesh, Java..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Target College</label>
                <select
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-sm focus:outline-none"
                >
                  <option value="">All Colleges</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Target Career Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-sm focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                  <option value="FRONTEND_DEVELOPER">Frontend Developer</option>
                  <option value="BACKEND_DEVELOPER">Backend Developer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    placeholder="7.5"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Min Readiness</label>
                  <input
                    type="number"
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(e.target.value)}
                    placeholder="70"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-900 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Candidates Table Layout */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Invitation Notification drawer */}
            {(inviteMsg || inviteError) && (
              <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
                inviteMsg ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-250 text-rose-800'
              }`}>
                <span>{inviteMsg || inviteError}</span>
                <button onClick={() => { setInviteMsg(null); setInviteError(null); }} className="text-xs font-bold underline">Dismiss</button>
              </div>
            )}

            {/* Invite dispatch configuration parameters */}
            {jobs.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-left shadow-sm">
                <span className="text-slate-450 text-xs font-bold uppercase tracking-wider block">Assessment Invite dispatch</span>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <select
                    value={inviteJobId}
                    onChange={(e) => setInviteJobId(e.target.value)}
                    className="bg-slate-50 border border-slate-205 text-slate-700 text-xs rounded-xl py-2 px-3 focus:outline-none"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>Job: {j.title} ({j.company})</option>
                    ))}
                  </select>

                  <select
                    value={inviteTestId}
                    onChange={(e) => setInviteTestId(e.target.value)}
                    className="bg-slate-50 border border-slate-205 text-slate-700 text-xs rounded-xl py-2 px-3 focus:outline-none"
                  >
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>Test: {t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Candidates Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {filteredCandidates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50 text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Candidate Name</th>
                        <th className="py-4 px-6 text-center">Readiness Score</th>
                        <th className="py-4 px-6">College</th>
                        <th className="py-4 px-6 text-center">Average Score</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="hover:bg-slate-50/50 transition">
                          
                          {/* Info */}
                          <td className="py-4 px-6">
                            <div className="text-left">
                              <span className="font-bold text-slate-800 text-sm block">{candidate.name}</span>
                              <span className="text-slate-450 text-xs mt-0.5 block flex items-center gap-1 font-semibold">
                                <Mail className="h-3 w-3" />
                                {candidate.email}
                              </span>
                              <span className="text-[9px] uppercase font-bold text-indigo-700 mt-1.5 inline-block bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                {candidate.targetRole?.replace('_', ' ')}
                              </span>
                            </div>
                          </td>

                          {/* Readiness */}
                          <td className="py-4 px-6 text-center">
                            {candidate.readinessScore !== null ? (
                              <div className="inline-flex flex-col items-center">
                                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${
                                  candidate.readinessScore >= 75
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : (candidate.readinessScore >= 50 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700')
                                }`}>
                                  {candidate.readinessScore} / 100
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-xs font-semibold">N/A</span>
                            )}
                          </td>

                          {/* College */}
                          <td className="py-4 px-6">
                            <div className="text-left font-semibold text-slate-600">
                              <span className="text-xs block flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                {candidate.collegeName}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                CGPA: {candidate.cgpa || 'N/A'} • Grad {candidate.gradYear || 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Mock Average */}
                          <td className="py-4 px-6 text-center font-bold text-slate-800">
                            {candidate.mockAverage !== null ? `${candidate.mockAverage}%` : '-'}
                          </td>

                          {/* Action button */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleInvite(candidate.id)}
                              disabled={invitingStudentId === candidate.id}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-50 border border-slate-205 hover:bg-indigo-650 hover:text-white hover:border-transparent text-slate-650 rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              {invitingStudentId === candidate.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  Invite
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center border border-dashed border-slate-200 bg-slate-50/50">
                  <span className="text-slate-400 text-xs font-semibold">No candidates match current filtering parameters.</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
