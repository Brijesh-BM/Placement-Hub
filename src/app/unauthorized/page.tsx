import Link from 'next/link';
import { Lock, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 bg-slate-50 relative overflow-hidden select-none">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] z-0"></div>

      <div className="max-w-md text-center space-y-6 z-10 animate-in fade-in duration-300">
        {/* Animated Icon */}
        <div className="inline-flex p-4 bg-amber-50 border border-amber-100 text-amber-650 rounded-2xl shadow-sm hover:scale-105 transition duration-300">
          <Lock className="h-16 w-16 text-amber-600 animate-pulse" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">403</h1>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Access Denied / Forbidden</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
            Your current account credentials and role permissions are not authorized to view the requested management command center or workspace.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Home className="h-4 w-4 text-slate-500" />
            Landing Page
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-indigo-650/10"
          >
            Go to Dashboard
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
