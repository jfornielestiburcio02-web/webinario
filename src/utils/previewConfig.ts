export const PREVIEW_ASSET_PATH = '/assets/aistudio/3Cat_f80fb83c.html';

export type ViewportPresetId = 'desktop' | 'tablet' | 'mobile';
export type PreviewTheme = 'auto' | 'light' | 'dark';

export interface ViewportPreset {
  id: ViewportPresetId;
  label: string;
  width: number | null;
  height: number | null;
  dimensionsLabel: string;
}

export interface RouteOption {
  hash: string;
  label: string;
  group: 'principal' | 'plataforma' | 'personal';
}

export interface ArticleSummary {
  id: string;
  title: string;
  platform: '3cat' | '3catinfo';
}

export const VIEWPORT_PRESETS: Record<ViewportPresetId, ViewportPreset> = {
  desktop: {
    id: 'desktop',
    label: 'Escritorio',
    width: null,
    height: null,
    dimensionsLabel: '100% × Completo',
  },
  tablet: {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    height: 1024,
    dimensionsLabel: '768 × 1024',
  },
  mobile: {
    id: 'mobile',
    label: 'Móvil',
    width: 390,
    height: 844,
    dimensionsLabel: '390 × 844',
  },
};

export const PRIMARY_NAV_SECTIONS: RouteOption[] = [
  { hash: '#inicio', label: 'Inicio', group: 'principal' },
  { hash: '#plataformas', label: 'Plataformas', group: 'principal' },
  { hash: '#institucional', label: 'Institucional', group: 'principal' },
  { hash: '#que-es', label: '¿Qué es 3Cat?', group: 'principal' },
  { hash: '#equipo', label: 'Equipo', group: 'principal' },
];

export const ALL_ROUTE_OPTIONS: RouteOption[] = [
  ...PRIMARY_NAV_SECTIONS,
  { hash: '#3cat', label: 'Plataforma 3Cat', group: 'plataforma' },
  { hash: '#3catinfo', label: 'Plataforma 3CatInfo', group: 'plataforma' },
  { hash: '#acceso', label: 'Acceso personal', group: 'personal' },
  { hash: '#cuenta', label: 'Panel de cuenta', group: 'personal' },
];

export function normalizeHash(rawHash: string | null | undefined): string {
  const trimmed = (rawHash ?? '').trim();
  if (!trimmed || trimmed === '#') {
    return '#inicio';
  }
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

export function getActiveNavSection(rawHash: string | null | undefined): string {
  const hash = normalizeHash(rawHash);
  if (hash === '#3cat' || hash === '#3catinfo' || hash.startsWith('#noticia-')) {
    return '#plataformas';
  }
  if (hash === '#cuenta' || hash === '#acceso') {
    return '#acceso';
  }
  const match = PRIMARY_NAV_SECTIONS.find((item) => item.hash === hash);
  return match ? match.hash : '#inicio';
}

export function buildPreviewUrl(
  basePath: string,
  rawHash: string | null | undefined,
  reloadRevision = 0
): string {
  const hash = normalizeHash(rawHash);
  const query = reloadRevision > 0 ? `?v=${reloadRevision}` : '';
  return `${basePath}${query}${hash}`;
}

export function getThemeLabel(theme: PreviewTheme): string {
  switch (theme) {
    case 'light':
      return 'Claro';
    case 'dark':
      return 'Oscuro';
    case 'auto':
      return 'Sistema';
  }
}

export function getNextTheme(current: PreviewTheme): PreviewTheme {
  if (current === 'auto') return 'light';
  if (current === 'light') return 'dark';
  return 'auto';
}

function resolveLocalizedText(
  value: unknown,
  lang: 'es' | 'ca'
): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const candidate = record[lang] ?? record.es ?? record.ca;
    return typeof candidate === 'string' ? candidate : null;
  }
  return null;
}

export function parseArticlesFromDataScript(
  rawJson: string | null | undefined,
  lang: 'es' | 'ca' = 'es'
): ArticleSummary[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson) as {
      arts?: Array<{
        id?: unknown;
        t?: unknown;
        p?: unknown;
        o?: unknown;
        status?: unknown;
      }>;
    };
    if (!Array.isArray(parsed.arts)) return [];
    return parsed.arts
      .filter((item) => {
        if (typeof item?.id !== 'string') return false;
        if (item.status === 'pending') return false;
        return resolveLocalizedText(item.t, lang) !== null;
      })
      .sort((a, b) => String(b.o ?? '').localeCompare(String(a.o ?? '')))
      .map((item) => ({
        id: String(item.id),
        title: resolveLocalizedText(item.t, lang) ?? '',
        platform: item.p === '3cat' ? '3cat' : '3catinfo',
      }));
  } catch {
    return [];
  }
}
