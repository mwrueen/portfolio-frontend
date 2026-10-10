'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { ExternalLink, Github, ArrowUpRight, Star, Cpu, CheckCircle2 } from 'lucide-react';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  return (
    <div className="card-gorgeous rounded-2xl overflow-hidden flex flex-col h-full bg-white group relative">
      
      {/* Cover Image Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-50">
        {project.cover_image ? (
          <img 
            src={project.cover_image} 
            alt={project.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 flex items-center justify-center">
            <Cpu className="w-12 h-12 text-indigo-400 opacity-30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

        {/* Featured Badge */}
        {project.is_featured && (
          <div className="absolute top-3 left-3 bg-white/95 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-indigo-100">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            Featured Architecture
          </div>
        )}

        {/* Quick Links Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {project.github_url && (
            <a 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md shadow-xs border border-slate-200/80 hover:text-indigo-600 transition-all duration-200"
              title="View GitHub Repository"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {project.demo_url && (
            <a 
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white backdrop-blur-md shadow-xs transition-all duration-200"
              title="Live Demo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        
        <div>
          {/* Tech Stack Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            {project.tech_stacks?.map((stack) => (
              <span 
                key={stack.id}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-50 border border-slate-200/70 text-slate-700 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stack.color || '#4f46e5' }} />
                {stack.name}
              </span>
            ))}
          </div>

          {/* Title & Tagline */}
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            <Link href={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          <p className="text-xs font-medium text-indigo-600 mb-3 line-clamp-1">
            {project.tagline}
          </p>

          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
            {project.summary}
          </p>

          {/* Key Feature Highlights */}
          {project.features && project.features.length > 0 && (
            <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100">
              {project.features.slice(0, 2).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Bar & Details Link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {project.metrics ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              {Object.entries(project.metrics).slice(0, 2).map(([key, val]) => (
                <span key={key} className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 font-medium">
                  <strong className="text-indigo-600 font-semibold">{key}:</strong> {val}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-400">Microservice Architecture</span>
          )}

          <Link 
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 group-hover:translate-x-0.5 transition-all"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
