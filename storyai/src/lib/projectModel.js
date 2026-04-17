export const APP_ID = 'storyai-local';

export function migrateProject(project) {
  // Non-destructive forward migration. Existing fields preserved.
  const panels = Array.isArray(project?.panels) ? project.panels : [];
  const migratedPanels = panels.map((p) => ({
    id: p.id,
    caption: p.caption ?? '',
    prompt: p.prompt ?? p.imagePrompt ?? '',
    imageUrl: p.imageUrl ?? null,
    isGenerating: false,
    // studio metadata (optional)
    shotSize: p.shotSize ?? '',
    cameraAngle: p.cameraAngle ?? '',
    lens: p.lens ?? '',
    timeOfDay: p.timeOfDay ?? '',
    notes: p.notes ?? '',
    takes: Array.isArray(p.takes) ? p.takes : (p.imageUrl ? [{ id: crypto.randomUUID(), imageUrl: p.imageUrl, createdAt: Date.now() }] : []),
    selectedTakeId: p.selectedTakeId ?? '',
    selected: false,
  }));

  return {
    id: project?.id ?? crypto.randomUUID(),
    name: project?.name ?? 'Untitled Story',
    script: project?.script ?? '',
    styleId: project?.styleId ?? 'cinematic',
    characterRef: project?.characterRef ?? '',
    tags: Array.isArray(project?.tags) ? project.tags : [],
    archived: !!project?.archived,
    panels: migratedPanels,
    updatedAt: project?.updatedAt ?? Date.now(),
  };
}

