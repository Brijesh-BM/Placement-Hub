'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Search, ArrowRight, Star, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';

interface CompanyListItem {
  id: string;
  name: string;
  logoUrl: string | null;
  tests: Array<{ id: string; title: string }>;
}

export default function CompanyHubPage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fallback metadata checklist mapping direct product experience
  const fallbackCompanies = [
    { name: 'Amazon', desc: 'SDE patterns, Online Assessments, coding interviews, and leadership principles.', tier: 'Product Giant', difficulty: 'Hard', rounds: 5, mockTests: 30, experiences: 400, active: true },
    { name: 'Google', desc: 'SDE engineering roles, advanced algorithmic analysis, system engineering interviews.', tier: 'Product Giant', difficulty: 'Hard', rounds: 6, mockTests: 45, experiences: 520, active: true },
    { name: 'Microsoft', desc: 'Codility coding tests, software engineering foundations, technical mock rounds.', tier: 'Product Giant', difficulty: 'Hard', rounds: 5, mockTests: 35, experiences: 380, active: true },
    { name: 'TCS', desc: 'Ninja & Digital recruitment patterns, aptitude tests, and basic programming prep.', tier: 'Service Major', difficulty: 'Easy', rounds: 4, mockTests: 12, experiences: 220, active: true },
    { name: 'Infosys', desc: 'System Engineer processes, cognitive mapping tests, and structural aptitude practice.', tier: 'Service Major', difficulty: 'Easy', rounds: 4, mockTests: 15, experiences: 180, active: true },
    { name: 'Accenture', desc: 'Associate Software Engineer roles, critical thinking parameters, and mock OAs.', tier: 'Tech Consult', difficulty: 'Medium', rounds: 3, mockTests: 20, experiences: 150, active: true },
    { name: 'Wipro', desc: 'Elite NTH mock exams, technical fundamentals, and interview experience archives.', tier: 'Service Major', difficulty: 'Easy', rounds: 4, mockTests: 10, experiences: 110, active: true },
    { name: 'Capgemini', desc: 'Pseudo-code logic tests, numerical aptitude rounds, and communication interviews.', tier: 'Tech Consult', difficulty: 'Medium', rounds: 4, mockTests: 8, experiences: 95, active: true },
    { name: 'Cognizant', desc: 'GenC & GenC Next diagnostic preparation guides and round assessment mocks.', tier: 'Service Major', difficulty: 'Medium', rounds: 3, mockTests: 6, experiences: 80, active: true },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const displayCompanies = fallbackCompanies.map(fc => {
    const dbComp = companies.find(c => c.name.toLowerCase() === fc.name.toLowerCase());
    return {
      ...fc,
      dbId: dbComp?.id || null,
      mockTestsCount: dbComp?.tests?.length || fc.mockTests,
    };
  });

  const filtered = displayCompanies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    if (diff === 'Medium') return 'bg-amber-50 border-amber-100 text-amber-700';
    return 'bg-rose-50 border-rose-100 text-rose-700';
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Target Company Preparation</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Company Hub</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              Understand hiring timelines, mock test patterns, and real interview requirements.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search target companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company) => (
            <div 
              key={company.name} 
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[240px] relative overflow-hidden shadow-sm hover:shadow transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${getDifficultyColor(company.difficulty)}`}>
                      {company.difficulty}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded">
                      {company.tier}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                    {company.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 font-medium">{company.desc}</p>
                </div>
              </div>

              {/* Stats list under card */}
              <div className="grid grid-cols-3 gap-2 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 mt-4 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Rounds</span>
                  <span className="text-xs font-bold text-slate-700">{company.rounds}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Mock Tests</span>
                  <span className="text-xs font-bold text-slate-700">{company.mockTestsCount}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Experiences</span>
                  <span className="text-xs font-bold text-slate-700">{company.experiences}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs text-indigo-600 font-bold">Ready to practice</span>
                <Link 
                  href={`/company-hub/${company.name.toLowerCase()}`}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Open Hub
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
