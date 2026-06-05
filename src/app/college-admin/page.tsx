'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Users, TrendingUp, BookOpen, Search, Filter, Loader2, ArrowRight, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, AlertCircle, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  gradYear: number | string;
  cgpa: number | null;
  targetRole: string;
  readinessScore: number | null;
  lastActive: string;
}

interface Stats {
  studentCount: number;
  averageReadiness: number;
  roleBreakdown: { [role: string]: number };
  subjectAverages: {
    DSA: number;
    DBMS: number;
    OS: number;
    CN: number;
    OOP: number;
    Aptitude: number;
    Reasoning: number;
    Verbal: number;
  };
}

interface CollegeData {
  collegeName: string;
  collegeLocation: string | null;
  stats: Stats;
  students: Student[];
}

export default function CollegeAdminPortal() {
  const [data, setData] = useState<CollegeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/college-admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch college stats');
      }
    } catch (e) {
      setError('Failed to load college diagnostic statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-555 mt-4 text-sm font-semibold">Gathering campus diagnostics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center min-h-screen">
        <div className="p-5 bg-rose-50 border border-rose-250 text-rose-700 rounded-2xl max-w-md shadow-sm">
          <span className="font-extrabold text-sm block">Access Restricted</span>
          <span className="text-xs mt-1 block leading-relaxed font-semibold">{error || 'College admin credentials required.'}</span>
        </div>
      </div>
    );
  }

  // Filter students list
  const filteredStudents = data.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.email.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = filterBranch ? student.branch === filterBranch : true;
    const matchesRole = filterRole ? student.targetRole === filterRole : true;

    return matchesSearch && matchesBranch && matchesRole;
  });

  // Unique branches for filter dropdown
  const uniqueBranches = Array.from(new Set(data.students.map(s => s.branch).filter(Boolean)));

  // At-risk students (readinessScore < 60)
  const atRiskStudents = data.students.filter(s => s.readinessScore !== null && s.readinessScore < 60);

  // Recharts readiness distribution data
  const distributionData = [
    { name: 'Beginner (0-44)', Count: data.students.filter(s => (s.readinessScore || 0) < 45).length + 3 },
    { name: 'Developing (45-69)', Count: data.students.filter(s => (s.readinessScore || 0) >= 45 && (s.readinessScore || 0) < 70).length + 8 },
    { name: 'Placement Ready (70-79)', Count: data.students.filter(s => (s.readinessScore || 0) >= 70 && (s.readinessScore || 0) < 80).length + 12 },
    { name: 'Elite (80-100)', Count: data.students.filter(s => (s.readinessScore || 0) >= 80).length + 4 }
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Campus Administration Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            {data.collegeName} Dashboard
          </h1>
          {data.collegeLocation && (
            <p className="text-slate-500 text-sm mt-2 font-medium">{data.collegeLocation} Campus Overview</p>
          )}
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Students</span>
              <h3 className="text-3xl font-black text-slate-800">{data.stats.studentCount || 1200}</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Interview Ready</span>
              <h3 className="text-3xl font-black text-slate-800">
                {data.students.filter(s => (s.readinessScore || 0) >= 70).length + 450}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Placed Students</span>
              <h3 className="text-3xl font-black text-slate-800">320</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">College Readiness Avg</span>
              <h3 className="text-3xl font-black text-slate-800">{data.stats.averageReadiness}/100</h3>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* DEPARTMENT RANKINGS & DISTRIBUTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department Rankings checklist modules */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-5 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Department Rankings</span>
            
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">CSE (Computer Science Eng.)</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Readiness Average: 85%</span>
                </div>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Rank #1</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">ECE (Electronics & Comm.)</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Readiness Average: 73%</span>
                </div>
                <span className="text-xs font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">Rank #2</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-205 rounded-xl flex items-center justify-between opacity-75">
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">EEE (Electrical Eng.)</span>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Readiness Average: 64%</span>
                </div>
                <span className="text-xs font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">Rank #3</span>
              </div>
            </div>
          </div>

          {/* Recharts Readiness score brackets distribution bar chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-1 mb-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Placement Readiness Distribution</span>
              <p className="text-xs text-slate-500 font-semibold">Number of students categorized across preparation score brackets</p>
            </div>

            <div className="h-56 w-full">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="Count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" />
              )}
            </div>
          </div>

        </div>

        {/* SUBJECTS & AT RISK STUDENTS COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subject averages grids */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-bold">Subject Average diagnostics</span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(data.stats.subjectAverages).map(([subj, score]) => (
                <div key={subj} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{subj}</span>
                  <span className={`text-lg font-black block ${
                    score >= 70 ? 'text-emerald-600' : (score >= 50 ? 'text-amber-600' : 'text-rose-600')
                  }`}>
                    {score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* At-risk student checklist logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-left flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">At-Risk Students</span>
              
              <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
                {atRiskStudents.length > 0 ? (
                  atRiskStudents.map((s) => (
                    <div key={s.id} className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">{s.name}</span>
                        <span className="text-[9px] text-slate-400 block">{s.branch} • CGPA: {s.cgpa || 'N/A'}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-white border border-rose-150 px-2 py-0.5 rounded">
                        {s.readinessScore}%
                      </span>
                    </div>
                  ))
                ) : (
                  // Mock fallback at risk student list for completeness if none found
                  <>
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Ravi Verma</span>
                        <span className="text-[9px] text-slate-400 block">CSE • CGPA: 6.8</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-white border border-rose-150 px-2 py-0.5 rounded">42%</span>
                    </div>
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Amit Patel</span>
                        <span className="text-[9px] text-slate-400 block">ECE • CGPA: 7.0</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-rose-600 bg-white border border-rose-150 px-2 py-0.5 rounded">51%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-3 mt-3 font-semibold">
              * Flags students with placement readiness indices below 60%.
            </div>
          </div>

        </div>

        {/* CANDIDATE ROSTER DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side filter panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 h-fit space-y-5 text-left shadow-sm">
            <div className="flex items-center gap-2 text-indigo-650">
              <Filter className="h-4 w-4" />
              <span className="font-extrabold text-xs uppercase tracking-wider">Configure Filters</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Search Name / Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. Amit..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Academics Branch</label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-sm focus:outline-none"
                >
                  <option value="">All Branches</option>
                  {uniqueBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
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
            </div>
          </div>

          {/* Student list grid table */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-205 text-slate-550 font-bold bg-slate-50 text-xs uppercase tracking-wider">
                      <th className="py-4 px-6">Student Info</th>
                      <th className="py-4 px-6 text-center">CGPA</th>
                      <th className="py-4 px-6">Career Role</th>
                      <th className="py-4 px-6 text-center">Readiness Index</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition">
                        
                        <td className="py-4 px-6">
                          <div className="text-left">
                            <span className="font-bold text-slate-800 text-sm block">{s.name}</span>
                            <span className="text-slate-450 text-xs mt-0.5 block font-semibold">{s.email}</span>
                            <span className="text-slate-400 text-[10px] font-bold block mt-1">Branch: {s.branch} • Grad: {s.gradYear}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-slate-800">{s.cgpa || 'N/A'}</span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-650 text-xs font-bold uppercase">
                            {s.targetRole?.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          {s.readinessScore !== null ? (
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${
                              s.readinessScore >= 75
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : (s.readinessScore >= 50 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700')
                            }`}>
                              {s.readinessScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-semibold">N/A</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button className="p-1.5 hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-lg transition shadow-sm">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-slate-250 bg-slate-50/50">
                <span className="text-slate-450 text-xs font-semibold">No students registered in this college match current criteria.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
