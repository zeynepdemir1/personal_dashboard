export interface GcalSource {
  index: number;
  label: string;
  url: string;
}

export function getGcalSources(env: Record<string, string | undefined>): GcalSource[];
