import React from 'react';
import { Terminal, Github, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white text-slate-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-xs">
            MR
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Md Mehedi Hasan Rueen</p>
            <p className="text-xs text-slate-500">Lead Software Engineer • Laravel 11, Next.js 14 & PostgreSQL 16</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
          <a href="https://github.com/mwrueen" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <Linkedin className="w-3.5 h-3.5 text-blue-600" />
            LinkedIn
          </a>
          <a href="mailto:mwrueen@admin.com" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-purple-600" />
            Contact
          </a>
        </div>

        <div className="text-xs text-slate-400 text-center md:text-right">
          <p>&copy; {new Date().getFullYear()} Md Mehedi Hasan Rueen. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
