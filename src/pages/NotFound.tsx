import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Page Not Found | Md Mehedi Hasan Rueen';
  }, []);

  return (
    <div className="pt-36 pb-28 max-w-xl mx-auto px-4 text-center min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-xs">
        <Cpu className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Error 404</span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
        Endpoint Not Found
      </h1>
      <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-md">
        The requested URL path does not exist on this portfolio system or may have been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Portfolio Showcase
      </Link>
    </div>
  );
}
