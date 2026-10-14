import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProjectBySlug } from '@/lib/api';
import { Project } from '@/types';
import { ArrowLeft, ExternalLink, Github, CheckCircle2, Layers, Cpu, Star, Activity, RefreshCw } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    getProjectBySlug(slug)
      .then(({ data, related: relatedProjects }) => {
        if (!data) {
          setNotFound(true);
        } else {
          setProject(data);
          setRelated(relatedProjects || []);
          document.title = `${data.title} - Md Mehedi Hasan Rueen`;
        }
      })
      .catch((err) => {
        console.error('Error fetching project detail:', err);
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
        </div>
        <p className="text-xs font-medium text-slate-500">Loading project architecture & case study...</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <Cpu className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          The requested engineering case study could not be located in our system.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Showcase
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      {/* Back Navigation */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Showcase
      </Link>

      {/* Hero Title Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {project.is_featured && (
            <span className="bg-indigo-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Featured Showcase Project
            </span>
          )}
          {project.tech_stacks?.map((stack) => (
            <span 
              key={stack.id}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stack.color || '#4f46e5' }} />
              {stack.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          {project.title}
        </h1>

        <p className="text-lg text-indigo-700 font-medium max-w-3xl leading-relaxed mb-6">
          {project.tagline}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {project.demo_url && (
            <a 
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Live Demonstration
            </a>
          )}
          {project.github_url && (
            <a 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-800 shadow-sm transition-all flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              View Source Repository
            </a>
          )}
        </div>
      </div>

      {/* Cover Banner */}
      {project.cover_image && (
        <div className="relative w-full h-[320px] sm:h-[450px] rounded-2xl overflow-hidden mb-12 border border-slate-200 shadow-lg bg-slate-100">
          <img 
            src={project.cover_image} 
            alt={project.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60" />
        </div>
      )}

      {/* Metrics Spotlight Grid */}
      {project.metrics && Object.keys(project.metrics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(project.metrics).map(([key, val]) => (
            <div key={key} className="glass-panel p-5 rounded-2xl border-indigo-200/80 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>{key}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Case Study Column */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Executive Summary */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-200 bg-white">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              Project Executive Summary
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
              {project.summary}
            </p>
          </div>

          {/* Key Features List */}
          {project.features && project.features.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-200 bg-white">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Key Engineering Features
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {project.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-800 font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture & Implementation Details */}
          {project.architecture_notes && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-200 bg-white">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                System Architecture & Design Patterns
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-indigo-700 mb-4 leading-relaxed">
                {project.architecture_notes}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {project.description}
              </p>
            </div>
          )}

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-200 bg-white sticky top-28">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Project Specification
            </h4>

            <div className="space-y-4 text-sm">
              <div>
                <span className="block text-xs font-medium text-slate-500 mb-1">Author</span>
                <span className="text-slate-900 font-bold text-xs">Md Mehedi Hasan Rueen</span>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 mb-1">Status</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                  ● Production Ready
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 mb-1">Created Date</span>
                <span className="text-slate-800 text-xs font-medium">
                  {new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 mb-2">Technologies Used</span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stacks?.map((stack) => (
                    <span key={stack.id} className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
                      {stack.name}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Related Projects */}
      {related && related.length > 0 && (
        <div className="mt-20 pt-12 border-t border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Case Studies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
