import React, { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import TechStackFilter from '@/components/TechStackFilter';
import ProjectCard from '@/components/ProjectCard';
import ProjectSearch from '@/components/ProjectSearch';
import { Project, TechStack } from '@/types';
import { getProjects, getTechStacks } from '@/lib/api';
import { FolderGit2, RefreshCw, Cpu } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Md Mehedi Hasan Rueen | Software Engineer & Systems Architect Portfolio';
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [pData, tData] = await Promise.all([
        getProjects(),
        getTechStacks()
      ]);

      setProjects(pData);
      setTechStacks(tData);
      setLoading(false);
    }

    loadData();
  }, []);

  // Filter projects by selected tech and search term
  const filteredProjects = projects.filter((project) => {
    const matchesTech = !selectedTech || project.tech_stacks?.some((t) => t.slug === selectedTech);
    const matchesSearch = !searchTerm || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTech && matchesSearch;
  });

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <HeroSection />

      {/* Main Portfolio Showcase Section */}
      <section id="projects" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              Md Mehedi Hasan Rueen — Engineering Portfolio
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Software Engineering <span className="text-gradient">Showcase</span>
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md font-normal leading-relaxed">
            Curated production systems, REST API architectures, and fullstack platforms engineered by Md Mehedi Hasan Rueen.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ProjectSearch 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
        </div>

        {/* Tech Stack Pills */}
        <TechStackFilter 
            techStacks={techStacks} 
            selectedTech={selectedTech} 
            onSelectTech={setSelectedTech} 
        />

        {/* Loading State */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
            <p className="text-xs font-medium text-slate-500">Querying PostgreSQL 16 database...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="card-gorgeous p-12 rounded-2xl text-center max-w-lg mx-auto bg-white border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Matching Projects Found</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              No projects matched your search criteria: &ldquo;{searchTerm || selectedTech}&rdquo;.
            </p>
            <button
              onClick={() => {
                setSelectedTech(null);
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
