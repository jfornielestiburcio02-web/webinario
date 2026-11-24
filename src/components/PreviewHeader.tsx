import { RotateCw } from 'lucide-react';
import { PRIMARY_NAV_SECTIONS, getActiveNavSection } from '../utils/previewConfig';

interface PreviewHeaderProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
  onReload: () => void;
}

export function PreviewHeader({
  currentHash,
  onNavigate,
  onReload,
}: PreviewHeaderProps) {
  const activeNav = getActiveNavSection(currentHash);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 md:px-6">
      <button
        type="button"
        onClick={() => onNavigate('#inicio')}
        className="shrink-0 whitespace-nowrap text-left text-base font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31340]"
      >
        Previsualización 3Cat
      </button>

      <nav
        aria-label="Secciones principales del HTML"
        className="hidden items-center gap-6 md:flex"
      >
        {PRIMARY_NAV_SECTIONS.map((section) => {
          const isActive = activeNav === section.hash;
          return (
            <button
              key={section.hash}
              type="button"
              onClick={() => onNavigate(section.hash)}
              aria-current={isActive ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31340] ${
                isActive
                  ? 'border-[#e31340] text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onReload}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-[#e31340] px-3.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#c81038] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31340]"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Recargar</span>
        </button>
      </div>
    </header>
  );
}
