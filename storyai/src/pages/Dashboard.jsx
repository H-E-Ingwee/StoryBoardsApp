import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Plus,
  Trash2,
  Search,
  Sparkles,
  PencilLine,
  Copy,
  Archive,
  Inbox,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  ChevronRight,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { APP_ID, migrateProject } from '../lib/projectModel';

function ActionButton({ onClick, icon, label, variant = 'ghost' }) {
  const styles =
    variant === 'danger'
      ? 'text-[#730E20] hover:bg-[#730E20]/15 hover:shadow-sm border border-[#730E20]/20'
      : variant === 'solid'
        ? 'text-white bg-[#F27D16] hover:bg-[#d86b10] hover:shadow-lg hover:scale-105 shadow-md'
        : 'text-[#032940] hover:bg-[#032940]/10 hover:shadow-sm border border-[#032940]/10';
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${styles}`}
      type="button"
    >
      {React.createElement(icon, { size: 16 })} {label}
    </button>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [view, setView] = useState('active'); // active | archived
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('updated'); // updated | title
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toast, setToast] = useState(null); // { type, message }

  useEffect(() => {
    if (!user) return;
    const projectsRef = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'projects');
    const unsubscribe = onSnapshot(
      projectsRef,
      (snapshot) => {
        const projData = [];
        snapshot.forEach((d) => projData.push({ id: d.id, ...d.data() }));
        projData.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setProjects(projData);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Failed to load projects.');
        setIsLoading(false);
      },
    );
    return () => unsubscribe();
  }, [user]);

  // Close menus on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpenMenuId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target.closest('[data-menu-trigger]') && !e.target.closest('[data-menu]')) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }
    return undefined;
  }, [openMenuId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = projects.filter((p) => ((p.archived ? 'archived' : 'active') === view));
    if (!q) return base;
    return base.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [projects, query, view]);

  const processed = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === 'title') return (a.name || '').localeCompare(b.name || '');
      const au = a.updatedAt || 0;
      const bu = b.updatedAt || 0;
      return bu - au;
    });
    return arr;
  }, [filtered, sortBy]);

  const createNewProject = async () => {
    if (!user) return;
    const proj = migrateProject({
      id: crypto.randomUUID(),
      name: 'Untitled Story',
      script: '',
      styleId: 'cinematic',
      characterRef: '',
      panels: [],
      updatedAt: Date.now(),
    });
    const projRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', proj.id);
    await setDoc(projRef, proj);
    navigate(`/app/projects/${proj.id}`);
  };

  const openProject = (p) => navigate(`/app/projects/${p.id}`);

  const duplicateProject = async (p) => {
    if (!user) return;
    const copy = migrateProject({
      ...p,
      id: crypto.randomUUID(),
      name: `${p.name || 'Untitled'} (Copy)`,
      updatedAt: Date.now(),
      archived: false,
    });
    const projRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', copy.id);
    await setDoc(projRef, copy);
    setToast({ type: 'success', message: 'Project duplicated.' });
  };

  const setArchived = async (p, archived) => {
    if (!user) return;
    const next = migrateProject({ ...p, archived, updatedAt: Date.now() });
    const projRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', p.id);
    await setDoc(projRef, next);
    setToast({ type: 'success', message: archived ? 'Project archived.' : 'Project restored.' });
  };

  const deleteProject = async (id, e) => {
    e?.stopPropagation?.();
    if (!user) return;
    if (confirm('Are you sure you want to delete this storyboard?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="font-body bg-gradient-to-b from-white to-[#F9F9F9] min-h-screen">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-5 py-3 rounded-full shadow-2xl border flex items-center gap-3 text-sm font-black backdrop-blur-sm ${
              toast.type === 'error'
                ? 'bg-[#730E20]/95 text-white border-[#730E20]'
                : 'bg-[#032940]/95 text-white border-[#032940]'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 rounded-full hover:bg-white/15 transition-colors"
              type="button"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-5 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="font-heading font-black text-4xl text-[#032940] mb-2">Dashboard</div>
            <div className="text-[#666666] font-semibold text-lg">
              Your projects live here. Open one to turn your script into shots and images.
            </div>
          </div>
          <button
            onClick={createNewProject}
            className="bg-[#F27D16] hover:bg-[#d86b10] text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-[#F27D16]/25 transition-all hover:shadow-2xl hover:shadow-[#F27D16]/35 hover:scale-105 duration-200"
            type="button"
          >
            <Plus size={20} /> New Project
          </button>
        </div>

      <div className="mt-8 bg-white border border-[#E0E0E0]/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2 bg-[#F0F0F0]/80 border border-[#E0E0E0] rounded-2xl p-1.5 w-fit">
            <button
              onClick={() => setView('active')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                view === 'active' ? 'bg-white text-[#032940] shadow-md text-[#032940]' : 'text-[#666666] hover:text-[#032940]'
              }`}
              type="button"
            >
              Active
            </button>
            <button
              onClick={() => setView('archived')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                view === 'archived' ? 'bg-white text-[#032940] shadow-md' : 'text-[#666666] hover:text-[#032940]'
              }`}
              type="button"
            >
              Archived
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3 bg-[#F0F0F0]/80 border border-[#E0E0E0] rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#F27D16]/20 focus-within:border-[#F27D16] transition-all duration-200">
            <Search size={18} className="text-[#666666]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${view} projects…`}
              className="w-full outline-none text-sm font-semibold text-[#032940] bg-transparent placeholder:text-[#999999]"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-[#E0E0E0] rounded-2xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-[#F27D16]/15 text-[#F27D16] shadow-sm' : 'text-[#666666] hover:bg-[#F0F0F0]'
                }`}
                type="button"
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <div className="w-px h-6 bg-[#E0E0E0]" />
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-[#F27D16]/15 text-[#F27D16] shadow-sm' : 'text-[#666666] hover:bg-[#F0F0F0]'
                }`}
                type="button"
                title="List view"
              >
                <ListIcon size={18} />
              </button>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]">
                <ArrowUpDown size={16} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-[#E0E0E0] rounded-2xl pl-9 pr-10 py-3 text-sm font-black text-[#032940] focus:outline-none focus:ring-2 focus:ring-[#F27D16]/30 focus:border-[#F27D16] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="updated">Last updated</option>
                <option value="title">Title (A–Z)</option>
              </select>
              <ChevronRight
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] rotate-90"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 text-[#730E20] bg-[#730E20]/10 p-5 rounded-2xl font-semibold border border-[#730E20]/30 shadow-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={`mt-8 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`bg-white border border-[#E0E0E0] rounded-3xl shadow-sm animate-pulse overflow-hidden ${
                viewMode === 'list' ? 'p-6 flex items-center gap-4' : 'h-72'
              }`}
            >
              <div className={`${viewMode === 'list' ? 'w-20 h-20 rounded-2xl bg-[#F0F0F0]' : 'h-28 bg-[#F0F0F0]'}`} />
              <div className={`${viewMode === 'list' ? 'flex-1' : 'p-5'}`}>
                <div className="h-5 bg-[#F0F0F0] rounded w-3/5 mb-3" />
                <div className="h-3 bg-[#F0F0F0] rounded w-4/5 mb-2" />
                <div className="h-3 bg-[#F0F0F0] rounded w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : processed.length === 0 ? (
        <div className="mt-12 text-center p-16 bg-white rounded-3xl border-2 border-[#E0E0E0] border-dashed shadow-sm hover:shadow-md transition-shadow duration-300">
          {view === 'archived' ? (
            <Inbox className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
          ) : (
            <FolderOpen className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
          )}
          <p className="text-[#555555] font-semibold mb-6 text-lg">
            {view === 'archived' ? 'No archived projects.' : 'No projects yet. Start by creating a new one!'}
          </p>
          {view === 'active' && (
            <button
              onClick={createNewProject}
              className="text-[#F27D16] font-black text-lg hover:underline decoration-2 underline-offset-4"
              type="button"
            >
              Create your first storyboard →
            </button>
          )}
        </div>
      ) : (
        <div className={`mt-8 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
          {processed.map((p) => (
            <div
              key={p.id}
              onClick={() => openProject(p)}
              className={`group relative bg-white border border-[#E0E0E0] hover:border-[#F27D16] rounded-3xl transition-all duration-300 shadow-sm hover:shadow-2xl overflow-hidden cursor-pointer ${
                viewMode === 'list' ? 'p-6 flex items-center gap-5 hover:-translate-y-0.5' : 'p-6 flex flex-col h-72 hover:-translate-y-1'
              }`}
              role="button"
              tabIndex={0}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F27D16] via-[#F27D16] to-[#d86b10] opacity-0 group-hover:opacity-100 transition-opacity" />

              {viewMode === 'list' && (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#032940] to-[#021B2B] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
                  <Sparkles size={24} className="text-[#F27D16]" />
                </div>
              )}

              <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-black text-xl lg:text-2xl text-[#032940] truncate group-hover:text-[#F27D16] transition-colors">
                      {p.name || 'Untitled Story'}
                    </div>
                    <div className="text-xs text-[#666666] font-semibold mt-2">
                      Last edited: {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}
                    </div>
                  </div>

                  <div className="relative z-20">
                    <button
                      data-menu-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === p.id ? null : p.id);
                      }}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        openMenuId === p.id ? 'bg-[#F27D16]/15 text-[#F27D16] shadow-sm' : 'text-[#666666] hover:bg-[#F0F0F0] hover:text-[#032940]'
                      }`}
                      type="button"
                      aria-label="Project menu"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === p.id && (
                      <div
                        data-menu
                        className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-[#E0E0E0]/80 z-50 py-2 overflow-hidden backdrop-blur-sm"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            openProject(p);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-black text-[#032940] hover:bg-[#F0F0F0] flex items-center gap-2"
                          type="button"
                        >
                          {React.createElement(PencilLine, { size: 16 })} Open
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            duplicateProject(p);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-black text-[#032940] hover:bg-[#F0F0F0] flex items-center gap-2"
                          type="button"
                        >
                          {React.createElement(Copy, { size: 16 })} Duplicate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            setArchived(p, !p.archived);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-black text-[#032940] hover:bg-[#F0F0F0] flex items-center gap-2"
                          type="button"
                        >
                          {React.createElement(Archive, { size: 16 })} {p.archived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            navigator.clipboard
                              .writeText(`${location.origin}/app/projects/${p.id}`)
                              .then(() => setToast({ type: 'success', message: 'Project link copied.' }))
                              .catch(() => setToast({ type: 'error', message: 'Failed to copy link.' }));
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-black text-[#032940] hover:bg-[#F0F0F0] flex items-center gap-2"
                          type="button"
                        >
                          {React.createElement(Sparkles, { size: 16 })} Copy link
                        </button>
                        <div className="h-px bg-[#E0E0E0] my-2" />
                        <button
                          onClick={(e) => deleteProject(p.id, e)}
                          className="w-full text-left px-4 py-2.5 text-sm font-black text-[#730E20] hover:bg-[#730E20]/10 flex items-center gap-2"
                          type="button"
                        >
                          {React.createElement(Trash2, { size: 16 })} Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`${viewMode === 'list' ? 'mt-4' : 'mt-auto pt-5 border-t border-[#F0F0F0]'} flex flex-wrap gap-2`}>
                  <span className="text-xs bg-[#032940]/8 text-[#032940] px-3 py-2 rounded-xl font-black border border-[#032940]/15">
                    {(p.panels?.length || 0) + ' Shots'}
                  </span>
                  <span className="text-xs bg-[#F27D16]/10 text-[#F27D16] px-3 py-2 rounded-xl font-bold border border-[#F27D16]/20">
                    Studio-ready
                  </span>
                  {(p.tags || []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-[#032940]/10 text-[#032940] px-3 py-2 rounded-xl font-bold border border-[#032940]/15"
                    >
                      {t}
                    </span>
                  ))}
                  {(p.tags || []).length > 2 && (
                    <span className="text-xs bg-[#F0F0F0]/80 text-[#666666] px-3 py-2 rounded-xl font-semibold border border-[#E0E0E0]">
                      +{(p.tags || []).length - 2}
                    </span>
                  )}
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="mt-auto pt-5 border-t border-[#F0F0F0] flex flex-wrap gap-3">
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      openProject(p);
                    }}
                    icon={PencilLine}
                    label="Open"
                    variant="solid"
                  />
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProject(p);
                    }}
                    icon={Copy}
                    label="Duplicate"
                  />
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setArchived(p, !p.archived);
                    }}
                    icon={Archive}
                    label={p.archived ? 'Unarchive' : 'Archive'}
                  />
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard
                        .writeText(`${location.origin}/app/projects/${p.id}`)
                        .then(() => setToast({ type: 'success', message: 'Project link copied.' }))
                        .catch(() => setToast({ type: 'error', message: 'Failed to copy link.' }));
                    }}
                    icon={Sparkles}
                    label="Copy link"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

