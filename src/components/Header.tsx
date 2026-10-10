'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Shield, Code2, Sparkles, FolderGit2, Menu, X, ArrowUpRight, FileText } from 'lucide-react';
import { getAdminToken } from '@/lib/auth';
import { CustomPage } from '@/types';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuPages, setMenuPages] = useState<CustomPage[]>([]);

  const fetchMenuPages = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/pages?menu=1');
      if (res.ok) {
        const json = await res.json();
        setMenuPages(json.data || []);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);

    // Check if user is authenticated
    const checkAuth = () => {
      setIsLoggedIn(!!getAdminToken());
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);

    // Fetch dynamic custom pages for menu
    fetchMenuPages();
    window.addEventListener('pages-updated', fetchMenuPages);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('pages-updated', fetchMenuPages);
    };
  }, []);

  return (
    <header 
      suppressHydrationWarning
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]' 
          : 'bg-white/80 backdrop-blur-sm py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" suppressHydrationWarning>
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group" suppressHydrationWarning>
          <span className="relative block" suppressHydrationWarning>
            <span className="block w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-[1.5px] shadow-sm group-hover:shadow-md group-hover:shadow-indigo-500/20 transition-all duration-300" suppressHydrationWarning>
              <span className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-bold text-xs text-indigo-700 tracking-wider" suppressHydrationWarning>
                MR
              </span>
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" title="Available for Architecture & Engineering" />
          </span>

          <span className="block" suppressHydrationWarning>
            <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              Md Mehedi Hasan Rueen
            </span>
            <span className="block text-xs font-semibold text-indigo-600 tracking-wide">
              Lead Software Engineer & Systems Architect
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-slate-600">
          <Link 
            href="/" 
            className={`transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              pathname === '/' 
                ? 'text-indigo-600 bg-indigo-50/70 border border-indigo-100/60 font-semibold' 
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            <FolderGit2 className={`w-4 h-4 ${pathname === '/' ? 'text-indigo-600' : 'text-slate-500'}`} />
            Projects Showcase
          </Link>
          <a 
            href="/#projects" 
            className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <Code2 className="w-4 h-4 text-slate-400" />
            Architecture
          </a>
          <a 
            href="/#tech-matrix" 
            className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <Sparkles className="w-4 h-4 text-slate-400" />
            Tech Matrix
          </a>

          {/* Dynamic Admin-Curated Menu Pages */}
          {menuPages.map((p) => {
            const isAbout = p.title.toLowerCase().includes('about md mehedi');
            const displayTitle = isAbout ? 'About Me' : p.title;
            const isActive = pathname === `/pages/${p.slug}`;

            return (
              <Link
                key={p.id}
                href={`/pages/${p.slug}`}
                className={`transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/70 border border-indigo-100/60 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
                title={p.title}
              >
                <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="max-w-[150px] truncate">{displayTitle}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Admin Link */}
        <div className="hidden sm:flex items-center gap-3" suppressHydrationWarning>
          <Link 
            href={isLoggedIn ? "/admin/dashboard" : "/admin/login"} 
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white shadow-xs hover:shadow-md hover:shadow-indigo-600/20 transition-all duration-200"
            suppressHydrationWarning
          >
            <Shield className={`w-3.5 h-3.5 ${isLoggedIn ? 'text-emerald-400' : 'text-indigo-300'}`} />
            {isLoggedIn ? 'Admin Dashboard' : 'CMS Admin Portal'}
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
          suppressHydrationWarning
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-5 pt-4 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl" suppressHydrationWarning>
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-900 hover:text-indigo-600 font-semibold py-2"
          >
            Projects Showcase
          </Link>
          <a 
            href="/#projects" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-indigo-600 font-medium py-2"
          >
            Architecture
          </a>
          <a 
            href="/#tech-matrix" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 hover:text-indigo-600 font-medium py-2"
          >
            Tech Matrix
          </a>

          {/* Dynamic Menu Pages in Mobile Drawer */}
          {menuPages.map((p) => (
            <Link
              key={p.id}
              href={`/pages/${p.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 hover:text-indigo-600 font-medium py-2 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              {p.title}
            </Link>
          ))}

          <Link 
            href={isLoggedIn ? "/admin/dashboard" : "/admin/login"} 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-indigo-600 font-semibold py-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-100"
          >
            <span className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${isLoggedIn ? 'text-emerald-600' : 'text-indigo-600'}`} />
              {isLoggedIn ? 'Admin Dashboard' : 'CMS Admin Portal'}
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
