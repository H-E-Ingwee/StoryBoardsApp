import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Edit3,
  Image as ImageIcon,
  Loader2,
  PenTool,
  Plus,
  Printer,
  Save,
  Sparkles,
  Trash2,
  Wand2,
  XSquare,
  FileSpreadsheet,
  Package,
} from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { APP_ID, migrateProject } from '../lib/projectModel';
import { StoryAILogo } from '../components/StoryAILogo';
import JSZip from 'jszip';

const ART_STYLES = [
  { id: 'cinematic', label: 'Cinematic Movie', suffix: 'cinematic shot, 35mm lens, 8k resolution, highly detailed, dramatic lighting, movie still' },
  { id: 'african-cinema', label: 'African Cinematic', suffix: 'nollywood blockbuster style, vibrant colors, african landscape, rich skin tones, dramatic lighting, cinematic storytelling' },
  { id: 'pencil', label: 'Pencil Sketch', suffix: 'rough pencil sketch, storyboard art, loose lines, monochrome, hand-drawn style, graphite' },
  { id: 'comic', label: 'Graphic Novel', suffix: 'graphic novel style, comic book panel, vibrant colors, ink outlines, high contrast' },
  { id: 'watercolor', label: 'Watercolor', suffix: 'watercolor painting, loose brush strokes, artistic, expressive, storybook illustration' },
  { id: 'noir', label: 'Film Noir', suffix: 'film noir style, high contrast black and white, dramatic shadows, moody lighting' },
];

function buildFullPrompt({ basePrompt, styleSuffix, characterRef, shotMeta }) {
  const parts = [];
  if (shotMeta?.shotSize) parts.push(`SHOT SIZE: ${shotMeta.shotSize}`);
  if (shotMeta?.cameraAngle) parts.push(`CAMERA ANGLE: ${shotMeta.cameraAngle}`);
  if (shotMeta?.lens) parts.push(`LENS: ${shotMeta.lens}`);
  if (shotMeta?.timeOfDay) parts.push(`TIME OF DAY: ${shotMeta.timeOfDay}`);
  const metaBlock = parts.length ? ` (${parts.join(' | ')})` : '';

  let full = `${basePrompt}${metaBlock}. ${styleSuffix}`;
  if (characterRef?.trim()) full += `. CRITICAL CONSISTENCY DETAILS: ${characterRef}`;
  return full;
}

export function EditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [activePanelId, setActivePanelId] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user || !projectId) return;
    const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', projectId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          navigate('/app');
          return;
        }
        const data = migrateProject({ id: snap.id, ...snap.data() });
        setProject(data);
      },
      (e) => {
        console.error(e);
        setError('Failed to load project.');
      },
    );
    return () => unsub();
  }, [user, projectId, navigate]);

  const style = useMemo(() => {
    const id = project?.styleId;
    return ART_STYLES.find((s) => s.id === id) || ART_STYLES[0];
  }, [project?.styleId]);

  const panels = project?.panels || [];
  const activePanel = panels.find((p) => p.id === activePanelId) || null;

  const scheduleAutoSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveProject(), 600);
  };

  const saveProject = async () => {
    if (!user || !project) return;
    setIsSaving(true);
    setError('');
    try {
      const ref = doc(db, 'artifacts', APP_ID, 'users', user.uid, 'projects', project.id);
      await setDoc(ref, { ...project, updatedAt: Date.now() });
    } catch (e) {
      console.error(e);
      setError('Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = (patch) => {
    setProject((prev) => {
      const next = { ...prev, ...patch };
      return next;
    });
    scheduleAutoSave();
  };

  const updatePanel = (id, patch) => {
    setProject((prev) => {
      const nextPanels = (prev.panels || []).map((p) => (p.id === id ? { ...p, ...patch } : p));
      return { ...prev, panels: nextPanels };
    });
    scheduleAutoSave();
  };

  const addManualPanel = () => {
    const newPanel = {
      id: crypto.randomUUID(),
      caption: 'New Shot',
      prompt: 'Describe the visual here…',
      imageUrl: null,
      isGenerating: false,
      shotSize: '',
      cameraAngle: '',
      lens: '',
      timeOfDay: '',
      notes: '',
      takes: [],
      selectedTakeId: '',
      selected: false,
    };
    setProject((prev) => ({ ...prev, panels: [...prev.panels, newPanel] }));
    setActivePanelId(newPanel.id);
    scheduleAutoSave();
  };

  const removePanel = (id) => {
    if (!confirm('Delete this shot?')) return;
    setProject((prev) => ({ ...prev, panels: prev.panels.filter((p) => p.id !== id) }));
    if (activePanelId === id) setActivePanelId(null);
    scheduleAutoSave();
  };

  const movePanel = (index, direction) => {
    setProject((prev) => {
      const arr = [...prev.panels];
      if (direction === 'up' && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      } else if (direction === 'down' && index < arr.length - 1) {
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
      }
      return { ...prev, panels: arr };
    });
    scheduleAutoSave();
  };

  const handleParseScript = async () => {
    if (!project?.script?.trim()) {
      setError('Please enter a script to parse.');
      return;
    }
    setIsParsing(true);
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/parse-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: project.script }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Failed to parse script on backend.');
      }
      const data = await response.json();
      const scenes = data.data?.scenes || [];
      const characters = data.data?.characters || [];

      const newPanels = scenes.map((s) => ({
        id: crypto.randomUUID(),
        caption: s.caption,
        prompt: s.imagePrompt,
        imageUrl: null,
        isGenerating: false,
        shotSize: '',
        cameraAngle: '',
        lens: '',
        timeOfDay: '',
        notes: '',
        takes: [],
        selectedTakeId: '',
        selected: false,
      }));

      let nextCharacterRef = project.characterRef || '';
      if (characters.length > 0) {
        const charRefs = characters.map((c) => `${c.name}: ${c.visual_description}`).join('\n');
        nextCharacterRef = nextCharacterRef ? nextCharacterRef + '\n\n' + charRefs : charRefs;
      }

      setProject((prev) => ({
        ...prev,
        characterRef: nextCharacterRef,
        panels: [...prev.panels, ...newPanels],
      }));
      scheduleAutoSave();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to auto-parse the script.');
    } finally {
      setIsParsing(false);
    }
  };

  const generateImageForPanel = async (panelId) => {
    setError('');
    updatePanel(panelId, { isGenerating: true });
    const panelToGen = (project.panels || []).find((p) => p.id === panelId);
    if (!panelToGen) return;
    try {
      const fullPrompt = buildFullPrompt({
        basePrompt: panelToGen.prompt,
        styleSuffix: style.suffix,
        characterRef: project.characterRef,
        shotMeta: panelToGen,
      });

      const response = await fetch('http://127.0.0.1:5000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Image generation failed on backend.');
      }

      const data = await response.json();
      const base64Image = data.image_base64;
      if (!base64Image) throw new Error('Image generation failed (missing image data).');

      const imageUrl = `data:image/png;base64,${base64Image}`;
      const takeId = crypto.randomUUID();
      updatePanel(panelId, {
        imageUrl,
        isGenerating: false,
        takes: [...(panelToGen.takes || []), { id: takeId, imageUrl, createdAt: Date.now() }],
        selectedTakeId: takeId,
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Image generation failed.');
      updatePanel(panelId, { isGenerating: false });
    }
  };

  const setAllSelected = (selected) => {
    setProject((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => ({ ...p, selected })),
    }));
    scheduleAutoSave();
  };

  const generateSelected = async () => {
    const selectedIds = (project.panels || []).filter((p) => p.selected).map((p) => p.id);
    if (selectedIds.length === 0) {
      setError('Select at least one shot to batch-generate.');
      return;
    }
    for (const id of selectedIds) {
      // sequential to avoid throttling and to keep UI responsive
      await generateImageForPanel(id);
    }
  };

  const exportShotCSV = () => {
    const rows = [
      [
        'shot_number',
        'caption',
        'prompt',
        'shot_size',
        'camera_angle',
        'lens',
        'time_of_day',
        'notes',
        'selected_take',
      ],
      ...(project.panels || []).map((p, idx) => {
        const take = (p.takes || []).find((t) => t.id === p.selectedTakeId) || null;
        return [
          String(idx + 1),
          (p.caption || '').replaceAll('\n', ' '),
          (p.prompt || '').replaceAll('\n', ' '),
          p.shotSize || '',
          p.cameraAngle || '',
          p.lens || '',
          p.timeOfDay || '',
          (p.notes || '').replaceAll('\n', ' '),
          take ? 'yes' : 'no',
        ];
      }),
    ];

    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? '');
            const escaped = s.replaceAll('"', '""');
            return `"${escaped}"`;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(project.name || 'storyai').replaceAll(' ', '_')}_shots.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const exportZIP = async () => {
    setError('');
    try {
      const zip = new JSZip();

      const meta = {
        projectId: project.id,
        name: project.name,
        styleId: project.styleId,
        tags: project.tags || [],
        exportedAt: new Date().toISOString(),
        shotCount: (project.panels || []).length,
      };
      zip.file('metadata.json', JSON.stringify(meta, null, 2));

      // Reuse CSV export logic for a clean index file.
      const csvRows = [
        [
          'shot_number',
          'caption',
          'prompt',
          'shot_size',
          'camera_angle',
          'lens',
          'time_of_day',
          'notes',
          'image_file',
        ],
      ];

      const imagesFolder = zip.folder('images');

      for (let i = 0; i < (project.panels || []).length; i++) {
        const p = project.panels[i];
        const shotNum = String(i + 1).padStart(3, '0');
        const take = (p.takes || []).find((t) => t.id === p.selectedTakeId) || null;
        const dataUrl = take?.imageUrl || null;
        let fileName = '';

        if (dataUrl && dataUrl.startsWith('data:image/')) {
          const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
          if (match) {
            const mime = match[1];
            const b64 = match[2];
            const ext = mime.includes('png') ? 'png' : 'jpg';
            fileName = `shot_${shotNum}.${ext}`;
            imagesFolder.file(fileName, b64, { base64: true });
          }
        }

        csvRows.push([
          String(i + 1),
          (p.caption || '').replaceAll('\n', ' '),
          (p.prompt || '').replaceAll('\n', ' '),
          p.shotSize || '',
          p.cameraAngle || '',
          p.lens || '',
          p.timeOfDay || '',
          (p.notes || '').replaceAll('\n', ' '),
          fileName,
        ]);
      }

      const csv = csvRows
        .map((r) =>
          r
            .map((cell) => {
              const s = String(cell ?? '');
              const escaped = s.replaceAll('"', '""');
              return `"${escaped}"`;
            })
            .join(','),
        )
        .join('\n');
      zip.file('shots.csv', csv);

      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(project.name || 'storyai').replaceAll(' ', '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to export ZIP.');
    }
  };

  if (!project) {
    return (
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 shadow-sm">
        <div className="text-[#555555] font-semibold">Loading studio…</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-sm overflow-hidden">
      <header className="h-16 px-4 flex items-center justify-between border-b border-[#E0E0E0] bg-white">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate('/app')}
            className="text-[#555555] hover:text-[#032940] hover:bg-[#F0F0F0] px-3 py-2 rounded-xl font-black text-sm transition-colors"
            type="button"
          >
            ← Dashboard
          </button>
          <div className="w-px h-6 bg-[#E0E0E0]" />
          <input
            value={project.name}
            onChange={(e) => updateProject({ name: e.target.value })}
            className="font-heading font-black text-xl text-[#032940] bg-transparent border-b-2 border-transparent hover:border-[#E0E0E0] focus:border-[#F27D16] outline-none px-2 py-1 w-48 sm:w-80 transition-colors"
            placeholder="Project Name"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#555555] hidden md:inline">
            {isSaving ? 'Saving…' : 'All changes saved'}
          </span>
          <button
            onClick={saveProject}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black text-[#032940] bg-[#F0F0F0] hover:bg-[#E0E0E0] rounded-xl transition-colors"
            type="button"
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={exportShotCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black text-[#032940] bg-white border border-[#E0E0E0] hover:border-[#032940] rounded-xl transition-colors"
            type="button"
            title="Export shot metadata CSV"
          >
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button
            onClick={exportZIP}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black text-[#032940] bg-white border border-[#E0E0E0] hover:border-[#032940] rounded-xl transition-colors"
            type="button"
            title="Export ZIP (images + CSV + metadata)"
          >
            <Package size={16} /> ZIP
          </button>
          <button
            onClick={() => window.print()}
            disabled={panels.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black text-white bg-[#F27D16] hover:bg-[#d86b10] rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            type="button"
          >
            <Printer size={16} /> Export PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr_380px] min-h-[calc(100vh-64px-48px)]">
        {/* Left: Script + global direction */}
        <aside className="border-r border-[#E0E0E0] bg-white p-6 flex flex-col gap-6">
          <div>
            <div className="font-heading font-black text-[#032940] text-lg flex items-center gap-2 mb-3">
              <PenTool size={18} className="text-[#730E20]" /> Script / Treatment
            </div>
            <textarea
              value={project.script}
              onChange={(e) => updateProject({ script: e.target.value })}
              placeholder="Paste your script here to auto-generate shots…"
              className="w-full h-44 p-4 text-sm font-semibold bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl focus:ring-2 focus:ring-[#032940] focus:border-[#032940] outline-none resize-none transition-all"
            />
            <button
              onClick={handleParseScript}
              disabled={isParsing || !project.script}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-[#032940] hover:bg-[#021B2B] text-white py-3 rounded-2xl text-sm font-black disabled:opacity-60 transition-colors shadow-md"
              type="button"
            >
              {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              Auto-Parse into Shots
            </button>
          </div>

          <div className="border-t border-[#E0E0E0] pt-6">
            <div className="font-heading font-black text-[#032940] text-lg mb-4">Global Direction</div>
            <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
              Visual Aesthetic
            </label>
            <select
              value={project.styleId}
              onChange={(e) => updateProject({ styleId: e.target.value })}
              className="w-full p-3 mb-5 text-sm font-black text-[#032940] bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl outline-none focus:ring-2 focus:ring-[#032940]"
            >
              {ART_STYLES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
              Consistency Reference
            </label>
            <textarea
              value={project.characterRef}
              onChange={(e) => updateProject({ characterRef: e.target.value })}
              placeholder="E.g., Protagonist is a tall Kenyan woman in her 30s wearing a red leather jacket…"
              className="w-full h-32 p-4 text-sm font-semibold bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl focus:ring-2 focus:ring-[#032940] outline-none resize-none transition-all"
            />
            <div className="text-xs text-[#730E20] font-semibold mt-2 bg-[#730E20]/5 p-3 rounded-xl border border-[#730E20]/10">
              This reference is appended to every generation to keep characters consistent.
            </div>

            <div className="mt-6">
              <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
                Project tags
              </label>
              <input
                value={(project.tags || []).join(', ')}
                onChange={(e) =>
                  updateProject({
                    tags: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 12),
                  })
                }
                className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-sm font-semibold text-[#032940]"
                placeholder="e.g. pilot, draft-2, noir, client-review"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {(project.tags || []).map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-[#F27D16]/10 text-[#F27D16] px-3 py-1.5 rounded-xl font-black border border-[#F27D16]/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-[#730E20]/10 border-l-4 border-[#730E20] p-4 text-[#730E20] text-sm font-semibold rounded-r-xl">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Shot board */}
        <section className="bg-[#F0F0F0] p-6 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAllSelected(true)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E0E0E0] text-[#032940] text-sm font-black hover:border-[#032940] transition-colors flex items-center gap-2"
                type="button"
              >
                <CheckSquare size={16} /> Select all
              </button>
              <button
                onClick={() => setAllSelected(false)}
                className="px-3 py-2 rounded-xl bg-white border border-[#E0E0E0] text-[#032940] text-sm font-black hover:border-[#032940] transition-colors flex items-center gap-2"
                type="button"
              >
                <XSquare size={16} /> Clear
              </button>
              <button
                onClick={generateSelected}
                className="px-3 py-2 rounded-xl bg-[#F27D16] text-white text-sm font-black hover:bg-[#d86b10] transition-colors flex items-center gap-2 shadow-sm shadow-[#F27D16]/20"
                type="button"
              >
                <Sparkles size={16} /> Generate selected
              </button>
            </div>
            <button
              onClick={addManualPanel}
              className="px-3 py-2 rounded-xl bg-white border border-[#E0E0E0] text-[#032940] text-sm font-black hover:border-[#F27D16] transition-colors flex items-center gap-2"
              type="button"
            >
              <Plus size={16} /> Add shot
            </button>
          </div>

          {panels.length === 0 ? (
            <div className="h-[520px] flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-white border-2 border-[#E0E0E0] shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="text-[#CCCCCC]" size={40} />
                </div>
                <h2 className="font-heading font-black text-2xl text-[#032940] mb-3">Blank Canvas</h2>
                <p className="text-[#555555] font-semibold mb-8">
                  Paste a script on the left to auto-parse shots, or add your first shot manually.
                </p>
                <button
                  onClick={addManualPanel}
                  className="bg-white border-2 border-[#E0E0E0] hover:border-[#032940] text-[#032940] px-6 py-3 rounded-2xl font-black transition-all shadow-sm hover:shadow-md"
                  type="button"
                >
                  + Add Empty Shot
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {panels.map((panel, index) => {
                const selectedTake = panel.takes?.find((t) => t.id === panel.selectedTakeId);
                const displayImage = selectedTake?.imageUrl || panel.imageUrl;
                return (
                  <div
                    key={panel.id}
                    className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden group ${
                      activePanelId === panel.id ? 'border-[#F27D16] shadow-lg' : 'border-[#E0E0E0] hover:border-[#F27D16] hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-video w-full bg-[#F0F0F0] relative flex items-center justify-center overflow-hidden border-b border-[#E0E0E0]">
                      {panel.isGenerating ? (
                        <div className="flex flex-col items-center text-[#032940]">
                          <Loader2 className="w-10 h-10 animate-spin mb-3 text-[#F27D16]" />
                          <span className="text-xs font-black tracking-widest uppercase">Generating…</span>
                        </div>
                      ) : displayImage ? (
                        <img src={displayImage} alt={`Shot ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-[#CCCCCC] w-16 h-16" />
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className="bg-[#032940]/90 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md">
                          SHOT {index + 1}
                        </div>
                        <label className="bg-white/90 px-2 py-1 rounded-xl text-xs font-black text-[#032940] flex items-center gap-2 border border-[#E0E0E0] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!panel.selected}
                            onChange={(e) => updatePanel(panel.id, { selected: e.target.checked })}
                          />
                          Select
                        </label>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => movePanel(index, 'up')}
                          disabled={index === 0}
                          className="bg-white/95 p-2 rounded-xl hover:bg-white disabled:opacity-50 text-[#032940] shadow-md transition-colors"
                          type="button"
                          aria-label="Move up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => movePanel(index, 'down')}
                          disabled={index === panels.length - 1}
                          className="bg-white/95 p-2 rounded-xl hover:bg-white disabled:opacity-50 text-[#032940] shadow-md transition-colors"
                          type="button"
                          aria-label="Move down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={() => removePanel(panel.id)}
                          className="bg-[#730E20]/95 text-white p-2 rounded-xl hover:bg-[#730E20] shadow-md ml-1 transition-colors"
                          type="button"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setActivePanelId(panel.id)}
                      className="w-full text-left p-5"
                      type="button"
                    >
                      <div className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-2">
                        Caption / Action
                      </div>
                      <div className="text-sm font-semibold text-[#333333] leading-relaxed line-clamp-3">
                        {panel.caption}
                      </div>
                    </button>

                    <div className="px-5 pb-5">
                      <button
                        onClick={() => generateImageForPanel(panel.id)}
                        disabled={panel.isGenerating || !panel.prompt}
                        className={`w-full py-3 rounded-2xl text-sm font-black flex justify-center items-center gap-2 transition-all ${
                          displayImage
                            ? 'bg-white border-2 border-[#E0E0E0] hover:border-[#F27D16] text-[#032940]'
                            : 'bg-[#F27D16] hover:bg-[#d86b10] text-white shadow-md shadow-[#F27D16]/20'
                        }`}
                        type="button"
                      >
                        {panel.isGenerating ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <ImageIcon size={18} />
                        )}
                        {displayImage ? 'Regenerate (new take)' : 'Generate Image'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Inspector */}
        <aside className="border-l border-[#E0E0E0] bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StoryAILogo className="w-10 h-10" />
              <div>
                <div className="font-heading font-black text-[#032940]">Inspector</div>
                <div className="text-xs text-[#555555] font-semibold">Shot details & takes</div>
              </div>
            </div>
            {activePanel && (
              <div className="text-xs font-black tracking-widest uppercase text-[#F27D16]">
                Selected
              </div>
            )}
          </div>

          {!activePanel ? (
            <div className="mt-6 bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl p-5 text-sm text-[#555555] font-semibold">
              Select a shot on the board to edit prompts, metadata, notes, and choose the best take.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
                  Caption
                </label>
                <textarea
                  value={activePanel.caption}
                  onChange={(e) => updatePanel(activePanel.id, { caption: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-sm font-semibold text-[#032940] resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#F27D16] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Edit3 size={14} /> Visual Prompt
                </label>
                <textarea
                  value={activePanel.prompt}
                  onChange={(e) => updatePanel(activePanel.id, { prompt: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-sm font-semibold text-[#032940] resize-none"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-[#555555] uppercase tracking-widest mb-2">
                    Shot size
                  </label>
                  <input
                    value={activePanel.shotSize || ''}
                    onChange={(e) => updatePanel(activePanel.id, { shotSize: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-xs font-black text-[#032940]"
                    placeholder="WS / CU / MCU…"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#555555] uppercase tracking-widest mb-2">
                    Angle
                  </label>
                  <input
                    value={activePanel.cameraAngle || ''}
                    onChange={(e) => updatePanel(activePanel.id, { cameraAngle: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-xs font-black text-[#032940]"
                    placeholder="Eye level / OTS…"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#555555] uppercase tracking-widest mb-2">
                    Lens
                  </label>
                  <input
                    value={activePanel.lens || ''}
                    onChange={(e) => updatePanel(activePanel.id, { lens: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-xs font-black text-[#032940]"
                    placeholder="50mm / 85mm…"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#555555] uppercase tracking-widest mb-2">
                    Time
                  </label>
                  <input
                    value={activePanel.timeOfDay || ''}
                    onChange={(e) => updatePanel(activePanel.id, { timeOfDay: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-xs font-black text-[#032940]"
                    placeholder="DAY / NIGHT…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#555555] uppercase tracking-widest mb-2">
                  Notes
                </label>
                <textarea
                  value={activePanel.notes || ''}
                  onChange={(e) => updatePanel(activePanel.id, { notes: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-[#F0F0F0] border border-[#E0E0E0] outline-none focus:ring-2 focus:ring-[#032940] text-sm font-semibold text-[#032940] resize-none"
                  rows={3}
                  placeholder="Director intent, continuity, blocking…"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-black text-[#032940] uppercase tracking-widest">
                    Takes
                  </div>
                  <div className="text-xs font-semibold text-[#555555]">
                    {activePanel.takes?.length || 0} saved
                  </div>
                </div>
                {(activePanel.takes?.length || 0) === 0 ? (
                  <div className="text-sm text-[#555555] font-semibold bg-[#F0F0F0] border border-[#E0E0E0] rounded-2xl p-4">
                    Generate an image to create your first take.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {activePanel.takes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updatePanel(activePanel.id, { selectedTakeId: t.id })}
                        className={`aspect-video rounded-xl overflow-hidden border-2 transition-colors ${
                          activePanel.selectedTakeId === t.id ? 'border-[#F27D16]' : 'border-[#E0E0E0] hover:border-[#032940]'
                        }`}
                        type="button"
                        aria-label="Select take"
                      >
                        <img src={t.imageUrl} alt="Take" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

