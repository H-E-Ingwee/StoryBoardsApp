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
      ? 'text-[#730E20] hover:bg-[#730E20]/10'
      : variant === 'solid'
        ? 'text-white bg-[#F27D16] hover:bg-[#d86b10]'
        : 'text-[#032940] hover:bg-[#032940]/10';
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-black transition-colors flex items-center gap-2 ${styles}`}
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
    <div className="font-body">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-full shadow-xl border flex items-center gap-3 text-sm font-black ${
              toast.type === 'error'
                ? 'bg-[#730E20] text-white border-[#730E20]'
                : 'bg-[#032940] text-white border-[#032940]'
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

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="font-heading font-black text-3xl text-[#032940]">Dashboard</div>
          <div className="text-[#555555] font-semibold mt-1">
            A clean home for projects, versions, exports, and your studio workflow.
          </div>
        </div>
        <button
          onClick={createNewProject}
          className="bg-[#F27D16] hover:bg-[#d86b10] text-white px-5 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-md shadow-[#F27D16]/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
          type="button"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="mt-6 bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl p-1 w-fit">
            <button
              onClick={() => setView('active')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                view === 'active' ? 'bg-white text-[#032940] shadow-sm' : 'text-[#555555] hover:text-[#032940]'
              }`}
              type="button"
            >
              Active
            </button>
            <button
              onClick={() => setView('archived')}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-colors ${
                view === 'archived' ? 'bg-white text-[#032940] shadow-sm' : 'text-[#555555] hover:text-[#032940]'
              }`}
              type="button"
            >
              Archived
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3 bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl px-4 py-3">
            <Search size={18} className="text-[#555555]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${view} projects…`}
              className="w-full outline-none text-sm font-semibold text-[#032940] bg-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#E0E0E0] rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#F27D16]/10 text-[#F27D16]' : 'text-[#555555] hover:bg-[#F0F0F0]'
                }`}
                type="button"
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'list' ? 'bg-[#F27D16]/10 text-[#F27D16]' : 'text-[#555555] hover:bg-[#F0F0F0]'
                }`}
                type="button"
                title="List view"
              >
                <ListIcon size={18} />
              </button>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]">
                <ArrowUpDown size={16} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-[#E0E0E0] rounded-2xl pl-9 pr-10 py-3 text-sm font-black text-[#032940] focus:outline-none focus:ring-2 focus:ring-[#032940]/20"
              >
                <option value="updated">Last updated</option>
                <option value="title">Title (A–Z)</option>
              </select>
              <ChevronRight
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] rotate-90"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 text-[#730E20] bg-[#730E20]/10 p-4 rounded-2xl font-semibold border border-[#730E20]/20">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'}`}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`bg-white border border-[#E0E0E0] rounded-2xl shadow-sm animate-pulse overflow-hidden ${
                viewMode === 'list' ? 'p-5 flex items-center gap-4' : 'h-64'
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
        <div className="mt-10 text-center p-16 bg-white rounded-2xl border-2 border-[#E0E0E0] border-dashed shadow-sm">
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
        <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-3'}`}>
          {processed.map((p) => (
            <div
              key={p.id}
              onClick={() => openProject(p)}
              className={`group relative bg-white border border-[#E0E0E0] hover:border-[#F27D16]/60 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer ${
                viewMode === 'list' ? 'p-5 flex items-center gap-4 hover:-translate-y-0.5' : 'p-6 flex flex-col h-64 hover:-translate-y-1'
              }`}
              role="button"
              tabIndex={0}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F27D16] to-[#730E20] opacity-0 group-hover:opacity-100 transition-opacity" />

              {viewMode === 'list' && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#032940] to-[#021B2B] flex items-center justify-center text-white shadow-sm">
                  <Sparkles size={18} className="text-[#F27D16]" />
                </div>
              )}

              <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xl text-[#032940] truncate">
                      {p.name || 'Untitled Story'}
                    </div>
                    <div className="text-xs text-[#555555] font-semibold mt-1">
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
                      className={`p-2 rounded-xl transition-colors ${
                        openMenuId === p.id ? 'bg-[#F0F0F0] text-[#032940]' : 'text-[#555555] hover:bg-[#F0F0F0]'
                      }`}
                      type="button"
                      aria-label="Project menu"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openMenuId === p.id && (
                      <div
                        data-menu
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E0E0E0] z-50 py-2 overflow-hidden"
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

                <div className={`${viewMode === 'list' ? 'mt-3' : 'mt-5'} flex flex-wrap gap-2`}>
                  <span className="text-xs bg-[#032940]/5 text-[#032940] px-3 py-1.5 rounded-xl font-black border border-[#032940]/10">
                    {(p.panels?.length || 0) + ' Shots'}
                  </span>
                  <span className="text-xs bg-[#F0F0F0] text-[#555555] px-3 py-1.5 rounded-xl font-semibold border border-[#E0E0E0]">
                    Studio-ready
                  </span>
                  {(p.tags || []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-[#F27D16]/10 text-[#F27D16] px-3 py-1.5 rounded-xl font-black border border-[#F27D16]/20"
                    >
                      {t}
                    </span>
                  ))}
                  {(p.tags || []).length > 2 && (
                    <span className="text-xs bg-[#F0F0F0] text-[#555555] px-3 py-1.5 rounded-xl font-semibold border border-[#E0E0E0]">
                      +{(p.tags || []).length - 2}
                    </span>
                  )}
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="mt-auto pt-5 border-t border-[#F0F0F0] flex flex-wrap gap-2">
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
  );
}

