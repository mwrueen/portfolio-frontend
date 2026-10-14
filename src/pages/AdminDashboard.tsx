import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, TechStack, CustomPage } from '@/types';
import { 
  Plus, Edit2, Trash2, Star, Shield, LogOut, X, RefreshCw, 
  Cpu, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, AlertTriangle,
  FileText, FolderGit2, ExternalLink, Sparkles, Eye, Globe, ArrowUpRight
} from 'lucide-react';
import { getAdminToken, clearAdminAuth } from '@/lib/auth';
import { API_BASE_URL, BASE_URL } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

// Helper to convert existing markdown content into HTML for Quill editor
function markdownToHtml(md: string): string {
  if (!md) return '';
  if (/<[a-z][\s\S]*>/i.test(md)) {
    return md;
  }
  
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      continue;
    }

    line = line
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      html += `<h3>${line.replace('### ', '')}</h3>`;
    } else if (line.startsWith('#### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      html += `<h4>${line.replace('#### ', '')}</h4>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.replace(/^[-*]\s+/, '')}</li>`;
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      if (!inOrderedList) { html += '<ol>'; inOrderedList = true; }
      html += `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
    } else if (line.startsWith('> ')) {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      html += `<blockquote>${line.replace(/^>\s+/, '')}</blockquote>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (inOrderedList) { html += '</ol>'; inOrderedList = false; }
      html += `<p>${line}</p>`;
    }
  }

  if (inList) html += '</ul>';
  if (inOrderedList) html += '</ol>';

  return html;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'pages'>('projects');

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Pages State
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);

  // Project Modals & Confirmation States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Page Modals & Confirmation States
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [customPageToDelete, setCustomPageToDelete] = useState<CustomPage | null>(null);
  const [isDeletingPage, setIsDeletingPage] = useState(false);
  
  // Feedback & Notification States
  const [formError, setFormError] = useState<string>('');
  const [pageFormError, setPageFormError] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Project Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [architectureNotes, setArchitectureNotes] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [selectedStackIds, setSelectedStackIds] = useState<number[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Custom Page Form Fields
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageSummary, setPageSummary] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [pageShowInMenu, setPageShowInMenu] = useState(false);
  const [pageOrderIndex, setPageOrderIndex] = useState(0);
  const [pageIsPublished, setPageIsPublished] = useState(true);
  const [pageSaving, setPageSaving] = useState(false);

  // Auto-dismiss Toast Notifications
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    document.title = 'Project & Pages CMS Dashboard | Md Mehedi Hasan Rueen';
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const token = getAdminToken();

    try {
      const [pRes, tRes, pageRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/tech-stacks`),
        fetch(`${API_BASE_URL}/admin/pages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (pRes.status === 401 || pageRes.status === 401) {
        clearAdminAuth();
        navigate('/admin/login');
        return;
      }

      const pJson = await pRes.json();
      const tJson = await tRes.json();
      const pageJson = await pageRes.json();

      setProjects(pJson.data || []);
      setTechStacks(tJson.data || []);
      setCustomPages(pageJson.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Failed to load data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/admin/login');
  };

  // ---------------------------------------------------------------------------
  // Project Management Actions
  // ---------------------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');
    const token = getAdminToken();
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        showToast('Image uploaded successfully', 'success');
      } else {
        setFormError(data.message || 'Image upload failed. Allowed formats: PNG, JPG, WebP, SVG.');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setFormError('Failed to connect to server for image upload.');
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormError('');
    setTitle('');
    setSlug('');
    setTagline('');
    setSummary('');
    setDescription('');
    setCoverImage('');
    setDemoUrl('');
    setGithubUrl('');
    setArchitectureNotes('');
    setFeaturesInput('');
    setSelectedStackIds([]);
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setFormError('');
    setTitle(p.title);
    setSlug(p.slug);
    setTagline(p.tagline || '');
    setSummary(p.summary || '');
    setDescription(p.description || '');
    setCoverImage(p.cover_image || '');
    setDemoUrl(p.demo_url || '');
    setGithubUrl(p.github_url || '');
    setArchitectureNotes(p.architecture_notes || '');
    setFeaturesInput(p.features ? p.features.join('\n') : '');
    setSelectedStackIds(p.tech_stacks ? p.tech_stacks.map(t => t.id) : []);
    setIsFeatured(p.is_featured);
    setModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const token = getAdminToken();

    const payload = {
      title,
      slug: slug || undefined,
      tagline,
      summary,
      description,
      cover_image: coverImage || null,
      demo_url: demoUrl || null,
      github_url: githubUrl || null,
      architecture_notes: architectureNotes || null,
      features: featuresInput ? featuresInput.split('\n').filter(f => f.trim()) : [],
      is_featured: isFeatured,
      tech_stack_ids: selectedStackIds,
    };

    const url = editingProject
      ? `${API_BASE_URL}/admin/projects/${editingProject.id}`
      : `${API_BASE_URL}/admin/projects`;

    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        showToast(editingProject ? 'Project updated successfully!' : 'Project created successfully!', 'success');
        fetchData();
      } else {
        const errJson = await res.json();
        const msg = errJson.errors 
          ? Object.values(errJson.errors).flat().join('. ') 
          : (errJson.message || 'Validation failed. Please verify the project fields.');
        setFormError(msg);
      }
    } catch (err) {
      console.error(err);
      setFormError('Network communication error while saving project.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (p: Project) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/projects/${p.id}/featured`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(p.is_featured ? 'Project removed from featured' : 'Project highlighted as featured!', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update featured status', 'error');
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`"${projectToDelete.title}" deleted successfully`, 'success');
        setProjectToDelete(null);
        fetchData();
      } else {
        showToast('Failed to delete project', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Custom Pages Management Actions
  // ---------------------------------------------------------------------------
  const openCreatePageModal = () => {
    setEditingPage(null);
    setPageFormError('');
    setPageTitle('');
    setPageSlug('');
    setPageSummary('');
    setPageContent('');
    setPageShowInMenu(false);
    setPageOrderIndex(customPages.length + 1);
    setPageIsPublished(true);
    setPageModalOpen(true);
  };

  const openEditPageModal = (p: CustomPage) => {
    setEditingPage(p);
    setPageFormError('');
    setPageTitle(p.title);
    setPageSlug(p.slug);
    setPageSummary(p.summary || '');
    setPageContent(markdownToHtml(p.content));
    setPageShowInMenu(p.show_in_menu);
    setPageOrderIndex(p.order_index);
    setPageIsPublished(p.is_published);
    setPageModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageSaving(true);
    setPageFormError('');

    // Check if Quill content is empty
    const isQuillEmpty = !pageContent || pageContent === '<p><br></p>' || pageContent.trim() === '';
    if (isQuillEmpty) {
      setPageFormError('Page body content is required.');
      setPageSaving(false);
      return;
    }

    const token = getAdminToken();

    const payload = {
      title: pageTitle,
      slug: pageSlug || undefined,
      summary: pageSummary || null,
      content: pageContent,
      show_in_menu: pageShowInMenu,
      order_index: pageOrderIndex,
      is_published: pageIsPublished,
    };

    const url = editingPage
      ? `${API_BASE_URL}/admin/pages/${editingPage.id}`
      : `${API_BASE_URL}/admin/pages`;

    const method = editingPage ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPageModalOpen(false);
        showToast(editingPage ? 'Custom page updated!' : 'Custom page created successfully!', 'success');
        fetchData();
        // Dispatch event so Header updates its dynamic menu items immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('pages-updated'));
        }
      } else {
        const errJson = await res.json();
        const msg = errJson.errors 
          ? Object.values(errJson.errors).flat().join('. ') 
          : (errJson.message || 'Validation failed. Please verify page fields.');
        setPageFormError(msg);
      }
    } catch (err) {
      console.error(err);
      setPageFormError('Network error while saving custom page.');
    } finally {
      setPageSaving(false);
    }
  };

  const handleTogglePageMenu = async (p: CustomPage) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pages/${p.id}/toggle-menu`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(p.show_in_menu ? 'Page removed from navbar menu' : 'Page added to navbar menu!', 'success');
        fetchData();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('pages-updated'));
        }
      }
    } catch (err) {
      showToast('Failed to toggle menu status', 'error');
    }
  };

  const confirmDeletePage = async () => {
    if (!customPageToDelete) return;
    setIsDeletingPage(true);
    const token = getAdminToken();

    try {
      const res = await fetch(`${API_BASE_URL}/admin/pages/${customPageToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`"${customPageToDelete.title}" deleted successfully`, 'success');
        setCustomPageToDelete(null);
        fetchData();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('pages-updated'));
        }
      } else {
        showToast('Failed to delete custom page', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while deleting page', 'error');
    } finally {
      setIsDeletingPage(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white min-h-[calc(100vh-80px)]">
      
      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-in slide-in-from-top duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Admin Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Md Mehedi Hasan Rueen — Portfolio CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Project & Pages CMS Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage software case studies and publish custom pages with customizable menu visibility</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'projects' ? (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          ) : (
            <button
              onClick={openCreatePageModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Custom Page
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            Logout
          </button>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'projects'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects Showcase ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pages'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Custom Pages ({customPages.length})</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PROJECTS SHOWCASE MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'projects' && (
        <>
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching projects from PostgreSQL API...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
              <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Projects in Database Yet</h3>
              <p className="text-xs text-slate-500 mb-5">Click below to create your first portfolio case study project</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Add First Project
              </button>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet View */}
              <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-4 px-6">Project Title & Tagline</th>
                        <th className="py-4 px-4 text-center">Featured</th>
                        <th className="py-4 px-4">Tech Stacks</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {projects.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {p.cover_image && (
                                <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 mb-0.5 truncate">{p.title}</div>
                                <div className="text-xs text-indigo-700 line-clamp-1 font-medium">{p.tagline}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              className={`p-2 rounded-lg border transition-colors inline-flex items-center justify-center ${
                                p.is_featured 
                                  ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs' 
                                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                              title={p.is_featured ? "Featured project (click to remove)" : "Click to mark as featured"}
                            >
                              <Star className={`w-4 h-4 ${p.is_featured ? 'fill-amber-500' : ''}`} />
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {p.tech_stacks?.map((t) => (
                                <span key={t.id} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700 whitespace-nowrap">
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="Edit Project"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProjectToDelete(p)}
                              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Phone Card View */}
              <div className="md:hidden space-y-4">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.cover_image && (
                          <img src={p.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{p.title}</h4>
                          <p className="text-xs text-indigo-600 line-clamp-1 font-medium">{p.tagline}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`p-2 rounded-lg border shrink-0 transition-colors ${
                          p.is_featured 
                            ? 'bg-amber-50 border-amber-300 text-amber-600' 
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                        title="Toggle featured status"
                      >
                        <Star className={`w-4 h-4 ${p.is_featured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {p.tech_stacks && p.tech_stacks.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {p.tech_stacks.map((t) => (
                          <span key={t.id} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => openEditModal(p)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setProjectToDelete(p)}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CUSTOM PAGES MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'pages' && (
        <>
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching custom pages from database...</p>
            </div>
          ) : customPages.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No Custom Pages Generated Yet</h3>
              <p className="text-xs text-slate-500 mb-5">Create your first custom standalone landing page or policy</p>
              <button
                onClick={openCreatePageModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Generate First Custom Page
              </button>
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Custom Pages Table */}
              <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-4 px-6">Page Title & URL Slug</th>
                        <th className="py-4 px-4 text-center">Navbar Menu Visibility</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {customPages.map((page) => (
                        <tr key={page.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-bold text-slate-900 mb-0.5">{page.title}</div>
                              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                                <Link 
                                  to={`/pages/${page.slug}`} 
                                  target="_blank" 
                                  className="hover:underline flex items-center gap-1"
                                >
                                  /pages/{page.slug}
                                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleTogglePageMenu(page)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 border ${
                                page.show_in_menu
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-xs'
                                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                              }`}
                              title={page.show_in_menu ? "Visible in Navbar Menu (click to hide)" : "Hidden from menu (click to show in navbar menu)"}
                            >
                              {page.show_in_menu ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>In Navbar Menu</span>
                                </>
                              ) : (
                                <span>Hidden (Direct Link Only)</span>
                              )}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              Published
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            <Link
                              to={`/pages/${page.slug}`}
                              target="_blank"
                              className="inline-block p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-400 text-slate-700 transition-colors"
                              title="View Public Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => openEditPageModal(page)}
                              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition-colors"
                              title="Edit Custom Page"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCustomPageToDelete(page)}
                              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-rose-600 hover:text-rose-800 transition-colors"
                              title="Delete Custom Page"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Phone Custom Pages View */}
              <div className="md:hidden space-y-4">
                {customPages.map((page) => (
                  <div key={page.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{page.title}</h4>
                        <Link 
                          to={`/pages/${page.slug}`} 
                          target="_blank" 
                          className="text-xs text-indigo-600 font-medium hover:underline inline-flex items-center gap-0.5"
                        >
                          /pages/{page.slug}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleTogglePageMenu(page)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 border ${
                          page.show_in_menu
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        {page.show_in_menu ? '● In Navbar Menu' : 'Hidden from Menu'}
                      </button>
                      <span className="text-xs text-slate-400 font-medium">Published</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/pages/${page.slug}`}
                        target="_blank"
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => openEditPageModal(page)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setCustomPageToDelete(page)}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* CONFIRMATION MODAL: PROJECT DELETION */}
      {/* ===================================================================== */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Project</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{projectToDelete.title}</strong>? This will permanently remove the project from your showcase database.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CONFIRMATION MODAL: CUSTOM PAGE DELETION */}
      {/* ===================================================================== */}
      {customPageToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Custom Page</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete custom page <strong className="text-slate-900 font-semibold">{customPageToDelete.title}</strong>? Any direct links to <span className="text-indigo-600 font-semibold">/pages/{customPageToDelete.slug}</span> will return 404.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingPage}
                onClick={() => setCustomPageToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPage}
                onClick={confirmDeletePage}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {isDeletingPage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Page
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT PROJECT */}
      {/* ===================================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-5 sm:p-8 rounded-2xl border border-slate-200 my-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                {editingProject ? 'Edit Software Project' : 'Create New Software Project'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 mb-5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{formError}</span>
                <button type="button" onClick={() => setFormError('')} className="p-1 hover:bg-rose-100 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4 text-sm font-sans">
              
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 mb-4">
                <label className="block text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  Upload Image / Brand Logo File
                </label>
                
                <div className="flex items-center gap-4">
                  {coverImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-indigo-300 shrink-0">
                      <img src={coverImage} alt="Uploaded logo preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      id="imageFileInput"
                      className="hidden"
                    />
                    <label
                      htmlFor="imageFileInput"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      {uploadingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Uploading to Server...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          Choose Image File
                        </>
                      )}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1">Select PNG, JPG, WebP, SVG, or GIF (max 5MB)</p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] text-slate-600 mb-1">Image URL:</label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-600"
                    placeholder={`${BASE_URL}/storage/uploads/...`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="e.g. NexusMQ Broker"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL string)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="nexusmq-distributed-broker"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tagline (1-liner summary)</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="Low-latency event broker processing 50k+ events/sec"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Demo Live URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="https://nexusmq.dev"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="https://github.com/mwrueen/nexusmq"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-y"
                  placeholder="Overview for hiring managers and engineers..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-y"
                  placeholder="Detailed breakdown of components, challenges, and solutions..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Architecture Notes</label>
                <textarea
                  rows={2}
                  value={architectureNotes}
                  onChange={(e) => setArchitectureNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-y"
                  placeholder="e.g. Raft consensus algorithm with RocksDB storage engine"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white resize-y"
                  placeholder="Zero-Copy IO&#10;Prometheus Telemetry&#10;Sub-millisecond latency"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Tech Stacks</label>
                <div className="flex flex-wrap gap-2">
                  {techStacks.map((t) => {
                    const active = selectedStackIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (active) {
                            setSelectedStackIds(selectedStackIds.filter((id) => id !== t.id));
                          } else {
                            setSelectedStackIds([...selectedStackIds, t.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          active
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Highlight as Featured Showcase Project
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT CUSTOM PAGE */}
      {/* ===================================================================== */}
      {pageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl lg:max-w-4xl p-5 sm:p-8 rounded-2xl border border-slate-200 my-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {editingPage ? 'Edit Custom Page' : 'Create New Custom Page'}
              </h3>
              <button 
                onClick={() => setPageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pageFormError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 mb-5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{pageFormError}</span>
                <button type="button" onClick={() => setPageFormError('')} className="p-1 hover:bg-rose-100 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePage} className="space-y-4 text-sm font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={pageTitle}
                    onChange={(e) => {
                      setPageTitle(e.target.value);
                      if (!editingPage && !pageSlug) {
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    placeholder="e.g. Architecture Consulting"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 text-slate-500 rounded-l-xl text-xs font-medium">/pages/</span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-r-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-xs font-medium"
                      placeholder="consulting"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary / Excerpt (Optional)</label>
                <input
                  type="text"
                  value={pageSummary}
                  onChange={(e) => setPageSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  placeholder="Short introductory overview displayed at top of the page..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Page Body Content (Quill Rich Text Editor) *</label>
                  <span className="text-[11px] font-semibold text-indigo-600">Quill Snow Editor Active</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Format headings, bold/italic, text color, bullet/ordered lists, blockquotes, code blocks, and hyperlinks.</p>
                
                <RichTextEditor
                  value={pageContent}
                  onChange={setPageContent}
                  placeholder="Write your custom page content here using Quill..."
                  minHeight="220px"
                />
              </div>

              {/* Show in Navigation Menu Checkbox */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInMenuCheck"
                    checked={pageShowInMenu}
                    onChange={(e) => setPageShowInMenu(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="showInMenuCheck" className="text-xs font-bold text-indigo-900 cursor-pointer">
                    Show as Link in Navbar Navigation Menu
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 pl-6">
                  If enabled, this page will appear directly in the top navigation bar menu for all visitors. If unchecked, the page will not be in the menu and can only be accessed via direct link.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pagePublishedCheck"
                  checked={pageIsPublished}
                  onChange={(e) => setPageIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="pagePublishedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Publish page immediately (publicly viewable)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pageSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {pageSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Custom Page'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
