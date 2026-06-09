'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Building2, Search, ArrowRight, Sparkles, Loader2, Award, Briefcase, ChevronRight } from 'lucide-react';

interface CompanyListItem {
  id: string;
  name: string;
  logoUrl: string | null;
  difficulty: string;
  packageRange: string;
  readinessScore: number;
  tests: Array<{ id: string; title: string }>;
}

export default function CompanyHubPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

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
  }, [user, authLoading, router]);

  const getTier = (name: string) => {
    const n = name.toLowerCase();
    if (['amazon', 'google', 'microsoft'].includes(n)) return 'Product Giant';
    if (['tcs', 'infosys'].includes(n)) return 'Service Major';
    return 'Tech Consult';
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'Easy') return 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
    if (diff === 'Medium') return 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
    return 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
    if (score >= 70) return 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20';
    if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20';
  };

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || !user || loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-indigo-650 animate-spin" />
        <span className="text-slate-500 mt-4 text-sm font-semibold">Loading placement intelligence...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-650 font-bold text-xs uppercase tracking-widest mb-2">
              <Sparkles className="h-4.5 w-4.5" />
              <span>Target Company Intelligence</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Company Prep Hub</h1>
            <p className="text-slate-550 text-sm mt-3 font-medium max-w-xl leading-relaxed">
              Explore dynamic hiring timelines, take simulated assessments matching real-world exam matrices, and review previous year questions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search target companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((company) => {
            const tier = getTier(company.name);
            return (
              <div 
                key={company.name} 
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Background soft glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-purple-50/0 group-hover:to-indigo-50/20 transition-all duration-300 -z-10" />

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-650 group-hover:scale-105 transition-transform">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full ${getDifficultyColor(company.difficulty)}`}>
                        {company.difficulty}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full">
                        {tier}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                      {company.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold">Average Package: {company.packageRange}</p>
                  </div>
                </div>

                {/* Progress Score Indicator */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">YOUR READINESS</span>
                    <span className={`px-2 py-0.5 rounded-md ${getReadinessColor(company.readinessScore)}`}>
                      {company.readinessScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-550"
                      style={{ width: `${company.readinessScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-6">
                  <span className="text-xs text-slate-400 font-bold">Actionable Modules</span>
                  <Link 
                    href={`/company-hub/${company.name.toLowerCase()}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
                  >
                    Open Hub
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-semibold">
              No target companies match your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
