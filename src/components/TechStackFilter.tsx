'use client';

import React from 'react';
import { TechStack } from '@/types';
import { Layers } from 'lucide-react';

interface Props {
  techStacks: TechStack[];
  selectedTech: string | null;
  onSelectTech: (slug: string | null) => void;
}

export default function TechStackFilter({ techStacks, selectedTech, onSelectTech }: Props) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Filter Projects by Technology
        </h3>
        {selectedTech && (
          <button 
            onClick={() => onSelectTech(null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectTech(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
            selectedTech === null
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
          }`}
        >
          All Tech Stack ({techStacks.reduce((acc, curr) => acc + (curr.projects_count || 0), 0) || 'All'})
        </button>

        {techStacks.map((stack) => {
          const isSelected = selectedTech === stack.slug;
          return (
            <button
              key={stack.id}
              onClick={() => onSelectTech(isSelected ? null : stack.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 border flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-sm'
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-xs" 
                style={{ backgroundColor: stack.color || '#4f46e5' }}
              />
              {stack.name}
              {stack.projects_count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stack.projects_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
