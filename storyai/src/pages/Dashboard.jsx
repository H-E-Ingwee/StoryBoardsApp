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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = projects.filter((p) => (!!p.archived ? 'archived' : 'active') === view);
    if (!q) return base;
    return base.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [projects, query, view]);

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
  };

  const setArchived = async (p, archived) => {
    if (!user) return;
    const next = migrateProject({ ...p, archived, updatedAt: Date.now() });
    const projRef = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', p.id);
    await setDoc(projRef, next);
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
        </div>
      </div>

      {error && (
        <div className="mt-6 text-[#730E20] bg-[#730E20]/10 p-4 rounded-2xl font-semibold border border-[#730E20]/20">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 bg-white border border-[#E0E0E0] rounded-2xl p-10 shadow-sm">
          <div className="text-[#555555] font-semibold">Loading projects…</div>
        </div>
      ) : filtered.length === 0 ? (
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => openProject(p)}
              className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm hover:border-[#F27D16] hover:shadow-xl cursor-pointer transition-all group flex flex-col h-64 relative overflow-hidden"
              role="button"
              tabIndex={0}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F27D16] to-[#730E20] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-heading font-black text-xl text-[#032940] truncate">
                    {p.name || 'Untitled Story'}
                  </div>
                  <div className="text-xs text-[#555555] font-semibold mt-1">
                    Last edited:{' '}
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteProject(p.id, e)}
                  className="text-[#CCCCCC] hover:text-[#730E20] hover:bg-[#730E20]/10 p-2 rounded-xl transition-colors -mr-2 -mt-2"
                  type="button"
                  aria-label="Delete project"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
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
                      .then(() => alert('Project link copied.'));
                  }}
                  icon={Sparkles}
                  label="Copy link"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

