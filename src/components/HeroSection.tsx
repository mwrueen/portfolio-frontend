'use client';

import React from 'react';
import { ArrowRight, Cpu, Layers, ShieldCheck, Sparkles, Terminal, Database, Code2, CheckCircle2, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-white border-b border-slate-100">
      
      {/* Ultra-subtle ambient lighting mesh over pure white */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-200/50 to-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-gradient-to-br from-purple-200/40 to-pink-100/30 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-medium mb-8 shadow-xs hover:border-indigo-300 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-900 font-bold">Md Mehedi Hasan Rueen</span>
          <span className="text-slate-400">|</span>
          <span className="text-indigo-600 font-semibold">Available for Lead Roles & Architecture Consulting</span>
        </div>

        {/* Main Hero Headline */}
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.08] mb-6">
            Architecting Resilient <br className="hidden sm:inline" />
            <span className="text-gradient">Distributed Systems</span> & Web Platforms
          </h1>

          {/* Subtitle / Bio */}
          <p className="text-base sm:text-xl text-slate-600 mb-10 leading-relaxed font-normal">
            Hello, I am <strong className="text-slate-950 font-bold">Md Mehedi Hasan Rueen</strong>. I design high-throughput microservices, robust RESTful APIs, and full-stack web platforms using <strong className="text-slate-900 font-semibold">Laravel & Next.js</strong>, <strong className="text-slate-900 font-semibold">Node.js & React</strong>, powered by <strong className="text-slate-900 font-semibold">PostgreSQL & Redis</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-16">
            <a 
              href="#projects" 
              className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              Explore Projects Showcase
              <ArrowRight className="w-4 h-4" />
            </a>
            <a 
              href="#tech-matrix" 
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 text-sm flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              Engineering Competencies
            </a>
          </div>
        </div>

        {/* Engineering Architecture Highlights Grid */}
        <div id="tech-matrix" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-slate-100">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Fullstack Engine</p>
            <p className="text-base font-extrabold text-slate-900">Laravel 11 & Next.js 14</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Stateless REST APIs & App Router SSR</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
              <Code2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Modern UI & Events</p>
            <p className="text-base font-extrabold text-slate-900">Node.js & React 18</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Realtime WebSockets & Reactive Components</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">Data Layer</p>
            <p className="text-base font-extrabold text-slate-900">PostgreSQL 16 & Redis</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Relational Schemas & High-speed Cache</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Reliability</p>
            <p className="text-base font-extrabold text-slate-900">50k+ RPS Capacity</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">99.99% Availability & P99 Sub-25ms</p>
          </div>

        </div>

      </div>
    </section>
  );
}
