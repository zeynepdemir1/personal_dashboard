import { PROJECTS, ROSE, STEEL } from './data';
import type { ChecklistItem, ExtraProject, ProjectOverride } from './types';

export interface ProjectView {
  key: string; // "static:<index>" | "extra:<id>"
  title: string;
  state: string;
  stateColor: string;
  note: string;
  date: string;
  image?: string;
  checklist: ChecklistItem[];
}

export const PROJECT_STATE_OPTIONS: { label: string; color: string }[] = [
  { label: 'Fikir', color: '#8C6B70' },
  { label: 'Planlandı', color: STEEL },
  { label: 'Başlanacak', color: ROSE },
  { label: 'Devam ediyor', color: '#B0554F' },
  { label: 'Tamamlandı', color: '#6E9E7E' },
  { label: 'Beklemede', color: STEEL },
];

export function buildProjectViews(
  extraProjects: ExtraProject[],
  projectOverrides: Record<number, ProjectOverride>,
): ProjectView[] {
  const extras: ProjectView[] = extraProjects.map((p) => ({
    key: `extra:${p.id}`,
    title: p.title,
    state: p.state,
    stateColor: p.stateColor,
    note: p.note,
    date: p.date,
    image: p.image,
    checklist: p.checklist,
  }));
  const statics: ProjectView[] = PROJECTS.map((p, i) => {
    const ov = projectOverrides[i];
    return {
      key: `static:${i}`,
      title: p.title,
      state: ov?.state ?? p.state,
      stateColor: ov?.stateColor ?? p.stateColor,
      note: ov?.note ?? p.note,
      date: p.date,
      image: ov?.image,
      checklist: ov?.checklist ?? [],
    };
  });
  return [...extras, ...statics];
}
