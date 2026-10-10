'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { 
  ArrowLeft, Calendar, FileText, Share2, Check, ExternalLink, 
  Shield, Sparkles, AlertCircle, Clock, CheckCircle2, Award, 
  Cpu, Layers, BookOpen, User, Hash, Database, Lock, Server, 
  Network, Zap, Briefcase, Mail, ArrowRight, CornerDownRight, 
  Bookmark, Compass, Terminal, ShieldCheck, CheckCheck
} from 'lucide-react';
import { CustomPage } from '@/types';
import { API_BASE_URL } from '@/lib/api';

// Robust inline markdown parser for bold, inline code, and links
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-700 text-xs font-mono font-medium">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 font-semibold inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
            <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />
          </a>
        );
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Selects tailored domain icons based on capability keywords
function getCapabilityIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('database') || t.includes('sql') || t.includes('redis') || t.includes('cache') || t.includes('query')) {
    return Database;
  }
  if (t.includes('security') || t.includes('zero-trust') || t.includes('auth') || t.includes('gateway') || t.includes('ddos') || t.includes('token')) {
    return ShieldCheck;
  }
  if (t.includes('microservice') || t.includes('distributed') || t.includes('system') || t.includes('stream') || t.includes('broker') || t.includes('api')) {
    return Cpu;
  }
  if (t.includes('full-stack') || t.includes('next.js') || t.includes('frontend') || t.includes('laravel') || t.includes('engineering') || t.includes('monolith')) {
    return Layers;
  }
  if (t.includes('concurrency') || t.includes('latency') || t.includes('speed') || t.includes('performance') || t.includes('throughput')) {
    return Zap;
  }
  if (t.includes('audit') || t.includes('consulting') || t.includes('advisory') || t.includes('retainer') || t.includes('due diligence')) {
    return Briefcase;
  }
  return CheckCircle2;
}

export default function CustomPageView() {
  const params = useParams();
  const slug = params?.slug as string;

  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track reading scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`${API_BASE_URL}/pages/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page details');
          }
          return;
        }

        const json = await res.json();
        setPage(json.data);
      } catch (err) {
        console.error('Error fetching custom page:', err);
        setError('Network error while retrieving page details');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

// Helper to detect if content is rich HTML (from Quill)
function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

// Injects IDs into HTML headings for Table of Contents jump links
function prepareHtmlContent(rawHtml: string): string {
  return rawHtml.replace(/<h([2-4])(?:\s+([^>]*))?>([\s\S]*?)<\/h\1>/gi, (match, level, attrs = '', inner) => {
    if (attrs.includes('id=')) return match;
    const textOnly = inner.replace(/<[^>]*>/g, '').trim();
    const id = textOnly.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<h${level} id="${id}" ${attrs}>${inner}</h${level}>`;
  });
}

  // Extract table of contents headings
  const tableOfContents = useMemo(() => {
    if (!page?.content) return [];
    const items: { id: string; text: string; level: number }[] = [];
    
    if (isHtmlContent(page.content)) {
      const headingRegex = /<h([2-4])(?:\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;
      let match;
      while ((match = headingRegex.exec(page.content)) !== null) {
        const level = parseInt(match[1]);
        const rawText = match[2].replace(/<[^>]*>/g, '').trim();
        const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (rawText) {
          items.push({ id, text: rawText, level });
        }
      }
    } else {
      const lines = page.content.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          const text = trimmed.replace('### ', '').replace(/:$/, '').trim();
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text, level: 3 });
        } else if (trimmed.startsWith('#### ')) {
          const text = trimmed.replace('#### ', '').replace(/:$/, '').trim();
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, text, level: 4 });
        }
      });
    }
    return items;
  }, [page?.content]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scrollToHeading = (id: string) => {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-white px-4">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-800">Loading Document Architecture...</p>
        <p className="text-xs text-slate-400 mt-1">Fetching live metadata from PostgreSQL 16</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
          The requested document (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs">{slug}</code>) could not be located in the database or has not been published yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Portfolio Showcase
        </Link>
      </div>
    );
  }

  // Parses markdown headers, capability cards, numbered workflows, and callouts
  const formatContent = (rawContent: string) => {
    const lines = rawContent.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: number) => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={key} className="text-slate-700 text-base leading-relaxed mb-6 whitespace-pre-line font-normal">
            {renderInlineMarkdown(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        flushParagraph(idx);
        const headingText = trimmed.replace('### ', '').replace(/:$/, '').trim();
        const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        elements.push(
          <div key={idx} id={headingId} className="pt-8 pb-3 border-b border-slate-100 mb-5 first:pt-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {headingText}
                </h3>
              </div>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('#### ')) {
        flushParagraph(idx);
        const subText = trimmed.replace('#### ', '').replace(/:$/, '').trim();
        const subId = subText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        elements.push(
          <div key={idx} id={subId} className="pt-6 pb-2 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-4 rounded-full bg-indigo-500 inline-block" />
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {subText}
              </h4>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushParagraph(idx);
        const itemContent = trimmed.replace(/^[-*]\s+/, '');
        
        // Check for capability card pattern: **Title**: Description or **Title** - Description
        const boldMatch = itemContent.match(/^\*\*([^*]+)\*\*[:\s-]+(.*)$/);

        if (boldMatch) {
          const itemTitle = boldMatch[1].trim();
          const itemDesc = boldMatch[2].trim();
          const IconComp = getCapabilityIcon(itemTitle);

          elements.push(
            <div 
              key={idx} 
              className="group relative p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 my-3"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0 mt-0.5">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {itemTitle}
                  </h5>
                  <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {renderInlineMarkdown(itemDesc)}
                  </p>
                </div>
              </div>
            </div>
          );
        } else {
          elements.push(
            <div 
              key={idx} 
              className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-white transition-all duration-200 my-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {renderInlineMarkdown(itemContent)}
              </div>
            </div>
          );
        }
      } else if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph(idx);
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const stepNum = numMatch[1].padStart(2, '0');
          const stepContent = numMatch[2];
          const boldMatch = stepContent.match(/^\*\*([^*]+)\*\*[:\s-]+(.*)$/);

          if (boldMatch) {
            const stepTitle = boldMatch[1].trim();
            const stepDesc = boldMatch[2].trim();
            const IconComp = getCapabilityIcon(stepTitle);

            elements.push(
              <div 
                key={idx} 
                className="group relative p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 my-3"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {stepNum}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                      {stepTitle}
                    </h5>
                    <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                      {renderInlineMarkdown(stepDesc)}
                    </p>
                  </div>
                </div>
              </div>
            );
          } else {
            elements.push(
              <div 
                key={idx} 
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-white transition-all my-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {numMatch[1]}
                </div>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {renderInlineMarkdown(stepContent)}
                </div>
              </div>
            );
          }
        }
      } else if (trimmed.startsWith('> ')) {
        flushParagraph(idx);
        elements.push(
          <div key={idx} className="relative p-5 rounded-2xl bg-indigo-50/40 border-l-4 border-l-indigo-600 border border-indigo-100/60 my-5 text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
            <div className="flex items-start gap-3">
              <Bookmark className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                {renderInlineMarkdown(trimmed.replace(/^>\s+/, ''))}
              </div>
            </div>
          </div>
        );
      } else if (trimmed === '') {
        flushParagraph(idx);
      } else {
        currentParagraph.push(line);
      }
    });

    flushParagraph(lines.length + 1);
    return elements;
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 z-[60] transition-all duration-100 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Page Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link 
              href="/" 
              className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
            >
              Showcase
            </Link>
            <span>/</span>
            <span className="text-slate-400">Documents</span>
            <span>/</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
              {page.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Document</span>
                </>
              )}
            </button>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Hero Card with Blueprint Grid Pattern & Gradient Mesh */}
        <div className="relative p-6 sm:p-10 lg:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm mb-10 overflow-hidden">
          
          {/* Engineering Blueprint Grid Overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-200/30 via-purple-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-blue-100/30 via-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-xs">
                <Terminal className="w-3.5 h-3.5" />
                Systems Architecture Briefing
              </span>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Production Practice
              </span>

              {page.show_in_menu && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured in Navbar
                </span>
              )}

              <span className="text-xs text-slate-500 font-medium ml-auto hidden sm:flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Published {new Date(page.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              {page.title}
            </h1>

            {/* Summary */}
            {page.summary && (
              <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mb-8">
                {page.summary}
              </p>
            )}

            {/* Quick Author & Action Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  MR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Md Mehedi Hasan Rueen</p>
                  <p className="text-[11px] text-indigo-600 font-medium">Lead Software Engineer & Systems Architect</p>
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-3">
                <a
                  href="mailto:mwrueen@admin.com?subject=Consulting%20Inquiry%20via%20Portfolio"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Direct Technical Inquiry
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Two Column Layout: Main Case Content + Sticky Architect Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-10 rounded-3xl border-slate-200 bg-white shadow-sm space-y-2">
              {isHtmlContent(page.content) ? (
                <div 
                  className="custom-quill-content space-y-2"
                  dangerouslySetInnerHTML={{ __html: prepareHtmlContent(page.content) }}
                />
              ) : (
                formatContent(page.content)
              )}

              {/* Bottom Consultation Engagement Callout Card */}
              <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/40 border border-indigo-100/80 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                      <Briefcase className="w-4 h-4" />
                      Engineering Collaboration
                    </div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Ready to scale your architecture?
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md">
                      Available for architecture design sprints, high-scale database audits, and lead engineering advisory retainers.
                    </p>
                  </div>
                  <a
                    href="mailto:mwrueen@admin.com?subject=Architecture%20Advisory%20Inquiry"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Schedule Consultation
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <div className="space-y-6">
            
            {/* Author & Architect Profile Card */}
            <div className="glass-panel p-6 rounded-3xl border-slate-200 bg-white shadow-sm sticky top-28 space-y-6">
              
              <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-[1.5px] shadow-sm">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-sm text-indigo-700">
                      MR
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Available for Architecture & Engineering" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Md Mehedi Hasan Rueen</h4>
                  <p className="text-xs font-semibold text-indigo-600">Lead Software Engineer & Systems Architect</p>
                </div>
              </div>

              {/* Table of Contents (On this page) */}
              {tableOfContents.length > 0 && (
                <div className="space-y-3 pb-5 border-b border-slate-100">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    On This Page
                  </h5>
                  <nav className="space-y-1.5">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`text-left block w-full text-xs transition-colors hover:text-indigo-600 ${
                          item.level === 3 
                            ? 'font-semibold text-slate-700 py-1 flex items-center gap-1.5' 
                            : 'font-normal text-slate-500 pl-4 py-0.5 flex items-center gap-1'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${item.level === 3 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                        <span className="truncate">{item.text}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Core Technical Domains */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Core Technical Domains</h5>
                <div className="flex flex-wrap gap-1.5">
                  {['Laravel 11', 'Next.js 14', 'PostgreSQL 16', 'Go Microservices', 'Redis 7', 'Zero-Trust', 'Distributed Systems'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Document Specifications */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Details</h5>
                <div className="text-xs space-y-2.5">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Route URI</span>
                    <span className="font-semibold text-indigo-600 font-mono text-[11px]">/pages/{page.slug}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Navigation Mode</span>
                    <span className="font-semibold text-slate-800">
                      {page.show_in_menu ? 'Navbar Menu' : 'Direct Link Only'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live in PostgreSQL
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <a
                  href="mailto:mwrueen@admin.com?subject=Inquiry%20regarding%20Consulting%20Services"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Md Mehedi Hasan Rueen
                </a>
                <Link
                  href="/"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Explore Projects Showcase
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
