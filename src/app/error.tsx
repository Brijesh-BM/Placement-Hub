'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 bg-slate-50 relative overflow-hidden select-none">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] z-0"></div>

      <div className="max-w-md w-full text-center space-y-6 z-10 animate-in fade-in duration-300">
        {/* Animated Icon */}
        <div className="inline-flex p-4 bg-red-50 border border-red-100 text-red-650 rounded-2xl shadow-sm hover:scale-105 transition duration-300 animate-bounce">
          <ShieldAlert className="h-16 w-16 text-red-650" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">System Error</h1>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Something went wrong!</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
            An unexpected error occurred in the application logic. The developer team has been notified.
          </p>
          {error.message && (
            <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-left text-xs font-mono text-red-700 max-h-32 overflow-y-auto mt-4 break-words">
              <strong>Error Trace:</strong> {error.message}
            </div>
          )}
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
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 bg-red-650 hover:bg-red-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-red-650/10"
          >
            <RefreshCw className="h-4 w-4" />
            Try Reset Page
          </button>
        </div>
      </div>
    </div>
  );
}
