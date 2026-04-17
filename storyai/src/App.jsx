import React, { useState, useEffect } from 'react';
import { 
  Download, Loader2, AlertCircle, Printer, PenTool, Wand2, 
  Image as ImageIcon, Sparkles, FolderOpen, Plus, Save, 
  LogOut, ArrowUp, ArrowDown, Trash2, Edit3
} from 'lucide-react';

// --- Firebase Initialization ---
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// --- API Configuration & Utilities ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appId = "storyai-local";

const fetchWithBackoff = async (url, options, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error (${response.status}): ${errText}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
};

const ART_STYLES = [
  { id: 'cinematic', label: 'Cinematic Movie', suffix: 'cinematic shot, 35mm lens, 8k resolution, highly detailed, dramatic lighting, movie still' },
  { id: 'african-cinema', label: 'African Cinematic', suffix: 'nollywood blockbuster style, vibrant colors, african landscape, rich skin tones, dramatic lighting, cinematic storytelling' },
  { id: 'pencil', label: 'Pencil Sketch', suffix: 'rough pencil sketch, storyboard art, loose lines, monochrome, hand-drawn style, graphite' },
  { id: 'comic', label: 'Graphic Novel', suffix: 'graphic novel style, comic book panel, vibrant colors, ink outlines, high contrast' },
  { id: 'watercolor', label: 'Watercolor', suffix: 'watercolor painting, loose brush strokes, artistic, expressive, storybook illustration' },
  { id: 'noir', label: 'Film Noir', suffix: 'film noir style, high contrast black and white, dramatic shadows, moody lighting' }
];

// --- Custom StoryAI Logo Component ---
const StoryAILogo = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <path d="M50 15 L50 28 M30 22 L38 32 M70 22 L62 32 M18 38 L28 42 M82 38 L72 42" stroke="#F27D16" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 35 L72 65 L60 80 L40 80 L28 65 Z" fill="#032940" />
    <circle cx="50" cy="58" r="4" fill="#FFFFFF" />
    <path d="M50 35 L50 54" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M38 82 L62 82 L62 95 L38 95 Z" fill="#730E20" />
    <path d="M36 80 L64 80 L64 85 L36 85 Z" fill="#730E20" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('auth'); 
  const [activeProject, setActiveProject] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('auth');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const openProject = (project) => {
    setActiveProject(project);
    setCurrentView('editor');
  };

  const closeProject = () => {
    setActiveProject(null);
    setCurrentView('dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F27D16]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#333333] font-body selection:bg-[#F27D16] selection:text-white">
      {currentView === 'auth' && <AuthScreen />}
      {currentView === 'dashboard' && user && <Dashboard user={user} onOpenProject={openProject} onLogout={handleLogout} />}
      {currentView === 'editor' && user && activeProject && <Editor user={user} project={activeProject} onClose={closeProject} />}
    </div>
  );
}

// --- VIEWS ---

function AuthScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[#F0F0F0] to-[#E0E0E0]">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-white/20">
        <StoryAILogo className="w-24 h-24 mx-auto mb-6" />
        <h1 className="font-heading font-black text-4xl text-[#032940] mb-2 uppercase tracking-tight">StoryAI</h1>
        <p className="text-[#730E20] font-bold text-xs mb-8 tracking-widest uppercase">By NuruLife Productions</p>
        <p className="text-[#555555] mb-10 leading-relaxed font-medium">Shining Light, Transforming Lives.<br/>Sign in to bring your stories to life.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-[#730E20]/10 text-[#730E20] text-sm font-semibold rounded-xl border border-[#730E20]/20">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#E0E0E0] hover:border-[#032940] hover:shadow-md text-[#032940] font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50"
        >
          {isLoggingIn ? (
            <Loader2 className="animate-spin text-[#F27D16]" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user, onOpenProject, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const projectsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projData = [];
      snapshot.forEach(doc => projData.push({ id: doc.id, ...doc.data() }));
      projData.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(projData);
      setIsLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to load projects.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const createNewProject = async () => {
    const newProject = {
      id: crypto.randomUUID(),
      name: "Untitled Story",
      script: "",
      styleId: 'cinematic',
      characterRef: "",
      panels: [],
      updatedAt: Date.now()
    };
    onOpenProject(newProject);
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm("Are you sure you want to delete this storyboard?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'projects', id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-[#E0E0E0] shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <StoryAILogo className="w-12 h-12" />
            <div>
              <h1 className="font-heading font-black text-2xl text-[#032940] uppercase leading-none">StoryAI</h1>
              <span className="text-xs text-[#730E20] font-bold tracking-widest uppercase">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-[#555555] hidden sm:block">Welcome, <span className="text-[#032940]">{user.displayName || 'Creator'}</span></span>
            <button onClick={onLogout} className="text-[#555555] hover:text-[#730E20] flex items-center gap-2 text-sm font-bold transition-colors bg-[#F0F0F0] px-4 py-2 rounded-lg">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-heading text-3xl font-black text-[#032940]">Your Projects</h2>
            <p className="text-[#555555] mt-1">Manage and edit your visual stories.</p>
          </div>
          <button 
            onClick={createNewProject}
            className="bg-[#F27D16] hover:bg-[#d86b10] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#F27D16]/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus size={20} /> New Project
          </button>
        </div>

        {error && <div className="text-[#730E20] mb-6 bg-[#730E20]/10 p-4 rounded-xl font-semibold border border-[#730E20]/20">{error}</div>}

        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#F27D16] w-10 h-10" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-2xl border-2 border-[#E0E0E0] border-dashed shadow-sm">
            <FolderOpen className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
            <p className="text-[#555555] font-semibold mb-6 text-lg">No projects yet. Start by creating a new one!</p>
            <button onClick={createNewProject} className="text-[#F27D16] font-bold text-lg hover:underline decoration-2 underline-offset-4">Create your first storyboard &rarr;</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div 
                key={p.id} 
                onClick={() => onOpenProject(p)}
                className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-sm hover:border-[#F27D16] hover:shadow-xl cursor-pointer transition-all group flex flex-col h-56 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F27D16] to-[#730E20] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-heading font-bold text-xl text-[#032940] truncate pr-4">{p.name}</h3>
                  <button onClick={(e) => deleteProject(p.id, e)} className="text-[#CCCCCC] hover:text-[#730E20] hover:bg-[#730E20]/10 p-2 rounded-lg transition-colors -mr-2 -mt-2">
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-sm text-[#555555] mb-6">Last edited: {new Date(p.updatedAt).toLocaleDateString()}</p>
                
                <div className="mt-auto flex flex-wrap gap-2">
                  <span className="text-xs bg-[#032940]/5 text-[#032940] px-3 py-1.5 rounded-lg font-bold border border-[#032940]/10">
                    {p.panels?.length || 0} Shots
                  </span>
                  <span className="text-xs bg-[#F0F0F0] text-[#555555] px-3 py-1.5 rounded-lg font-semibold truncate max-w-[140px] border border-[#E0E0E0]">
                    {ART_STYLES.find(s => s.id === p.styleId)?.label || 'Style'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Editor({ user, project, onClose }) {
  const [name, setName] = useState(project.name || "Untitled");
  const [script, setScript] = useState(project.script || "");
  const [styleId, setStyleId] = useState(project.styleId || ART_STYLES[0].id);
  const [characterRef, setCharacterRef] = useState(project.characterRef || "");
  const [panels, setPanels] = useState(project.panels || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  const style = ART_STYLES.find(s => s.id === styleId) || ART_STYLES[0];

  const saveProject = async () => {
    if (!user) return;
    setIsSaving(true);
    setError("");
    try {
      const projRef = doc(db, 'artifacts', appId, 'users', user.uid, 'projects', project.id);
      await setDoc(projRef, {
        id: project.id, name, script, styleId, characterRef, panels, updatedAt: Date.now()
      });
    } catch (err) {
      console.error(err);
      setError("Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleParseScript = async () => {
    if (!script.trim()) {
      setError("Please enter a script to parse.");
      return;
    }
    setIsParsing(true);
    setError("");
    
    try {
      // --- NEW: Calling our local Python Flask Backend! ---
      const response = await fetch("http://127.0.0.1:5000/api/parse-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: script })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg =
          errData.error ||
          errData.details ||
          (typeof errData === 'string' ? errData : null) ||
          "Failed to parse script on backend.";
        throw new Error(msg);
      }

      const data = await response.json();
      const scenes = data.data?.scenes || [];
      const characters = data.data?.characters || [];
      
      const newPanels = scenes.map((s) => ({
        id: crypto.randomUUID(),
        caption: s.caption,
        prompt: s.imagePrompt,
        imageUrl: null,
        isGenerating: false
      }));

      // Auto-populate the Consistency Reference with the extracted characters!
      if (characters.length > 0) {
        const charRefs = characters.map(c => `${c.name}: ${c.visual_description}`).join('\n');
        setCharacterRef(prev => prev ? prev + '\n\n' + charRefs : charRefs);
      }

      setPanels([...panels, ...newPanels]);
      setTimeout(saveProject, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to auto-parse the script.");
    } finally {
      setIsParsing(false);
    }
  };

  const generateImageForPanel = async (panelId) => {
    setError("");
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: true } : p));
    
    const panelToGen = panels.find(p => p.id === panelId);
    if (!panelToGen) return;

    try {
      let fullPrompt = `${panelToGen.prompt}. ${style.suffix}`;
      if (characterRef.trim()) {
        fullPrompt += `. CRITICAL CONSISTENCY DETAILS: ${characterRef}`;
      }

      // Generate via our local backend (Hugging Face image model)
      const response = await fetch("http://127.0.0.1:5000/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || "Image generation failed on backend.");
      }

      const data = await response.json();
      const base64Image = data.image_base64;
      if (!base64Image) throw new Error("Image generation failed (missing image data).");

      setPanels(prev => prev.map(p => 
        p.id === panelId 
          ? { ...p, imageUrl: `data:image/png;base64,${base64Image}`, isGenerating: false } 
          : p
      ));
      
      setTimeout(saveProject, 500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Image generation failed. Please try again.");
      setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: false } : p));
    }
  };

  const updatePanelData = (id, field, value) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addManualPanel = () => {
    setPanels([...panels, { id: crypto.randomUUID(), caption: "New Scene", prompt: "Describe the visual here...", imageUrl: null, isGenerating: false }]);
  };

  const removePanel = (id) => {
    if(confirm("Delete this shot?")) {
      setPanels(prev => prev.filter(p => p.id !== id));
    }
  };

  const movePanel = (index, direction) => {
    const newPanels = [...panels];
    if (direction === 'up' && index > 0) {
      [newPanels[index - 1], newPanels[index]] = [newPanels[index], newPanels[index - 1]];
    } else if (direction === 'down' && index < newPanels.length - 1) {
      [newPanels[index + 1], newPanels[index]] = [newPanels[index], newPanels[index + 1]];
    }
    setPanels(newPanels);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPanels = [...panels];
    const draggedItem = newPanels[draggedIndex];
    newPanels.splice(draggedIndex, 1);
    newPanels.splice(index, 0, draggedItem);
    setPanels(newPanels);
    setDraggedIndex(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F0F0F0]">
      
      {/* FIXED HEADER */}
      <header className="h-16 shrink-0 bg-white shadow-sm border-b border-[#E0E0E0] print:hidden z-20">
        <div className="max-w-[1800px] mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-[#555555] hover:text-[#032940] hover:bg-[#F0F0F0] p-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
              &larr; <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="w-px h-6 bg-[#E0E0E0]"></div>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-heading font-black text-xl text-[#032940] bg-transparent border-b-2 border-transparent hover:border-[#E0E0E0] focus:border-[#F27D16] outline-none px-2 py-1 w-48 sm:w-80 transition-colors"
              placeholder="Project Name"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#555555] hidden md:inline">
              {isSaving ? "Saving..." : "All changes saved"}
            </span>
            <button 
              onClick={saveProject}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#032940] bg-[#F0F0F0] hover:bg-[#E0E0E0] rounded-lg transition-colors"
            >
              <Save size={16} /> <span className="hidden sm:inline">Save</span>
            </button>
            <button 
              onClick={() => window.print()}
              disabled={panels.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#F27D16] hover:bg-[#d86b10] rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              <Printer size={16} /> <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* SPLIT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden max-w-[1800px] w-full mx-auto">
        
        {/* SCROLLABLE SIDEBAR */}
        <aside className="w-full lg:w-[400px] shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col overflow-y-auto print:hidden shadow-sm z-10">
          <div className="p-6 flex flex-col gap-8">
            
            {/* Script Input (FR-3) */}
            <div>
              <h3 className="font-heading font-bold text-[#032940] text-lg flex items-center gap-2 mb-3">
                <PenTool size={18} className="text-[#730E20]" /> Script / Treatment
              </h3>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your script here to auto-generate panels..."
                className="w-full h-48 p-4 text-sm font-medium bg-[#F0F0F0] border border-[#E0E0E0] rounded-xl focus:ring-2 focus:ring-[#032940] focus:border-[#032940] outline-none resize-none transition-all"
              />
              <button
                onClick={handleParseScript}
                disabled={isParsing || !script}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#032940] hover:bg-[#021B2B] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition-colors shadow-md"
              >
                {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                Auto-Parse into Shots
              </button>
            </div>

            <hr className="border-[#E0E0E0]" />

            {/* Settings (FR-6) */}
            <div>
              <h3 className="font-heading font-bold text-[#032940] text-lg mb-4">Global Direction</h3>
              
              <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-2">Visual Aesthetic</label>
              <select 
                value={styleId} 
                onChange={(e) => setStyleId(e.target.value)}
                className="w-full p-3 mb-6 text-sm font-semibold text-[#032940] bg-[#F0F0F0] border border-[#E0E0E0] rounded-xl outline-none focus:ring-2 focus:ring-[#032940]"
              >
                {ART_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>

              <label className="block text-xs font-bold text-[#555555] uppercase tracking-wider mb-2">
                Consistency Reference
              </label>
              <textarea
                value={characterRef}
                onChange={(e) => setCharacterRef(e.target.value)}
                placeholder="E.g., Protagonist is a tall Kenyan woman in her 30s wearing a red leather jacket..."
                className="w-full h-32 p-4 text-sm font-medium bg-[#F0F0F0] border border-[#E0E0E0] rounded-xl focus:ring-2 focus:ring-[#032940] outline-none resize-none transition-all"
              />
              <p className="text-xs text-[#730E20] font-semibold mt-2 bg-[#730E20]/5 p-2 rounded-lg">
                This text acts as an anchor for all generated images to maintain a consistent look.
              </p>
            </div>

            {error && (
              <div className="bg-[#730E20]/10 border-l-4 border-[#730E20] p-4 text-[#730E20] text-sm font-semibold rounded-r-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* SCROLLABLE MAIN BOARD (FR-8) */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10 print:p-0 print:overflow-visible">
          
          {/* Print Header */}
          <div className="hidden print:block mb-10 border-b-4 border-[#730E20] pb-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-heading text-4xl font-black text-[#032940] uppercase">{name}</h1>
                <p className="text-[#555555] mt-2 font-bold text-lg">Style: {style.label} | Total Panels: {panels.length}</p>
              </div>
              <StoryAILogo className="w-20 h-20" />
            </div>
          </div>

          {panels.length === 0 ? (
            <div className="h-full flex items-center justify-center print:hidden">
               <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-white border-2 border-[#E0E0E0] shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="text-[#CCCCCC]" size={40} />
                  </div>
                  <h2 className="font-heading font-black text-2xl text-[#032940] mb-3">Blank Canvas</h2>
                  <p className="text-[#555555] font-medium mb-8">Paste a script and parse it on the left, or manually add your first shot to begin.</p>
                  <button onClick={addManualPanel} className="bg-white border-2 border-[#E0E0E0] hover:border-[#032940] text-[#032940] px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
                    + Add Empty Shot
                  </button>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 print:grid-cols-2 print:gap-10">
              {panels.map((panel, index) => (
                <div 
                  key={panel.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-[#E0E0E0] flex flex-col overflow-hidden group print:border-2 print:border-black print:rounded-none print:shadow-none transition-all duration-200"
                >
                  {/* Image Area */}
                  <div className="aspect-video w-full bg-[#F0F0F0] relative flex items-center justify-center print:border-b-2 print:border-black overflow-hidden border-b border-[#E0E0E0]">
                    {panel.isGenerating ? (
                      <div className="flex flex-col items-center text-[#032940]">
                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-[#F27D16]" />
                        <span className="text-sm font-bold tracking-widest uppercase">Drawing...</span>
                      </div>
                    ) : panel.imageUrl ? (
                      <img src={panel.imageUrl} alt={`Shot ${index+1}`} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-[#CCCCCC] w-16 h-16" />
                    )}

                    <div className="absolute top-3 left-3 bg-[#032940]/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-md print:bg-white print:text-black print:border-2 print:border-black print:rounded-none">
                      SHOT {index + 1}
                    </div>

                    {/* Order Controls (FR-8) */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                      <button onClick={() => movePanel(index, 'up')} disabled={index === 0} className="bg-white/95 p-2 rounded-lg hover:bg-white disabled:opacity-50 text-[#032940] shadow-md transition-colors"><ArrowUp size={16}/></button>
                      <button onClick={() => movePanel(index, 'down')} disabled={index === panels.length-1} className="bg-white/95 p-2 rounded-lg hover:bg-white disabled:opacity-50 text-[#032940] shadow-md transition-colors"><ArrowDown size={16}/></button>
                      <button onClick={() => removePanel(panel.id)} className="bg-[#730E20]/95 text-white p-2 rounded-lg hover:bg-[#730E20] shadow-md ml-1 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </div>

                  {/* Editable Details (FR-5) */}
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <div className="print:block">
                       <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest print:hidden mb-2 block">Caption / Action</label>
                       <textarea 
                          value={panel.caption}
                          onChange={(e) => updatePanelData(panel.id, 'caption', e.target.value)}
                          className="w-full text-sm text-[#333333] font-semibold border-none bg-transparent outline-none resize-none print:resize-none leading-relaxed"
                          rows="3"
                       />
                    </div>
                    
                    <div className="print-hidden flex-1 flex flex-col mt-2">
                       <label className="text-[10px] font-black text-[#F27D16] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                         <Edit3 size={12} /> Visual Prompt
                       </label>
                       <textarea 
                          value={panel.prompt}
                          onChange={(e) => updatePanelData(panel.id, 'prompt', e.target.value)}
                          className="w-full flex-1 text-xs font-medium text-[#555555] p-3 bg-[#F0F0F0] border border-transparent focus:border-[#CCCCCC] focus:bg-white rounded-xl outline-none resize-none transition-colors"
                          rows="3"
                       />
                    </div>

                    {/* Generate Button (FR-7) */}
                    <div className="pt-4 border-t border-[#F0F0F0] print-hidden mt-auto">
                      <button 
                        onClick={() => generateImageForPanel(panel.id)}
                        disabled={panel.isGenerating || !panel.prompt}
                        className={`w-full py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all ${
                          panel.imageUrl 
                            ? 'bg-white border-2 border-[#E0E0E0] hover:border-[#F27D16] text-[#032940]' 
                            : 'bg-[#F27D16] hover:bg-[#d86b10] text-white shadow-md shadow-[#F27D16]/20'
                        }`}
                      >
                        {panel.isGenerating ? <Loader2 size={18} className="animate-spin" /> : (panel.imageUrl ? <Sparkles size={18} className="text-[#F27D16]"/> : <ImageIcon size={18}/>)}
                        {panel.imageUrl ? 'Regenerate Image' : 'Generate Image'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add manual panel button at the end */}
              <button 
                onClick={addManualPanel}
                className="bg-transparent border-2 border-dashed border-[#CCCCCC] hover:border-[#F27D16] hover:bg-[#F27D16]/5 text-[#555555] hover:text-[#F27D16] rounded-2xl h-[400px] flex flex-col items-center justify-center transition-all print:hidden group"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-[#E0E0E0] group-hover:border-[#F27D16] flex items-center justify-center mb-4 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-bold text-lg">Add New Shot</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}