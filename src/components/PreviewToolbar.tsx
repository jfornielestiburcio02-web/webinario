import {
  Maximize2,
  Monitor,
  Moon,
  Smartphone,
  Sun,
  SunMoon,
  Tablet,
} from 'lucide-react';
import {
  ALL_ROUTE_OPTIONS,
  ArticleSummary,
  PreviewTheme,
  VIEWPORT_PRESETS,
  ViewportPresetId,
  getThemeLabel,
  normalizeHash,
} from '../utils/previewConfig';

interface PreviewToolbarProps {
  viewport: ViewportPresetId;
  onViewportChange: (viewport: ViewportPresetId) => void;
  currentHash: string;
  onNavigate: (hash: string) => void;
  articles: ArticleSummary[];
  theme: PreviewTheme;
  onCycleTheme: () => void;
  onEnterFocusMode: () => void;
}

const VIEWPORT_ICONS: Record<ViewportPresetId, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function PreviewToolbar({
  viewport,
  onViewportChange,
  currentHash,
  onNavigate,
  articles,
  theme,
  onCycleTheme,
  onEnterFocusMode,
}: PreviewToolbarProps) {
  const normalizedHash = normalizeHash(currentHash);
  const preset = VIEWPORT_PRESETS[viewport];

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : SunMoon;

  return (
    <div
      role="region"
      aria-label="Controles de previsualización"
      className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 md:gap-4 md:px-6"
    >
      <div className="flex shrink-0 items-center gap-3">
        <div
          role="group"
          aria-label="Tamaño de pantalla"
          className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-0.5"
        >
          {(Object.keys(VIEWPORT_PRESETS) as ViewportPresetId[]).map((id) => {
            const item = VIEWPORT_PRESETS[id];
            const Icon = VIEWPORT_ICONS[id];
            const isSelected = viewport === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onViewportChange(id)}
                aria-pressed={isSelected}
                title={item.label}
                className={`inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e31340] sm:px-2.5 ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sr-only sm:hidden">{item.label}</span>
              </button>
            );
          })}
        </div>

        <span className="font-mono-tabular hidden whitespace-nowrap text-xs text-slate-500 lg:inline">
          {preset.dimensionsLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <label htmlFor="route-select" className="sr-only">
          Ir a sección o artículo
        </label>
        <select
          id="route-select"
          value={normalizedHash}
          onChange={(e) => onNavigate(e.target.value)}
          className="h-8 min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e31340] sm:flex-none sm:w-56 sm:px-2.5 md:w-64"
        >
          <optgroup label="Secciones">
            {ALL_ROUTE_OPTIONS.map((route) => (
              <option key={route.hash} value={route.hash}>
                {route.label}
              </option>
            ))}
          </optgroup>
          {articles.length > 0 && (
            <optgroup label="Noticias y contenidos">
              {articles.map((article) => (
                <option key={article.id} value={`#noticia-${article.id}`}>
                  {article.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <button
          type="button"
          onClick={onCycleTheme}
          title="Cambiar tema de la vista previa"
          aria-label={`Tema: ${getThemeLabel(theme)}`}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e31340] sm:px-2.5"
        >
          <ThemeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Tema: {getThemeLabel(theme)}</span>
        </button>

        <button
          type="button"
          onClick={onEnterFocusMode}
          title="Ampliar vista sin barra superior"
          aria-label="Ampliar vista"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#e31340] sm:px-2.5"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Ampliar</span>
        </button>
      </div>
    </div>
  );
}
