'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ProjectSearch({ searchTerm, onSearchChange }: Props) {
  return (
    <div className="relative w-full max-w-md mb-8">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4 text-indigo-600" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search projects by title, architecture, or features..."
        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
