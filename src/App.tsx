import { useCallback, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import { PreviewHeader } from './components/PreviewHeader';
import { PreviewToolbar } from './components/PreviewToolbar';
import { PreviewStage } from './components/PreviewStage';
import {
  ArticleSummary,
  PreviewTheme,
  ViewportPresetId,
  getNextTheme,
  normalizeHash,
} from './utils/previewConfig';

export default function App() {
  const [viewport, setViewport] = useState<ViewportPresetId>('desktop');
  const [currentHash, setCurrentHash] = useState<string>('#inicio');
  const [reloadRevision, setReloadRevision] = useState<number>(0);
  const [theme, setTheme] = useState<PreviewTheme>('auto');
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  const handleNavigate = useCallback((hash: string) => {
    setCurrentHash(normalizeHash(hash));
  }, []);

  const handleReload = useCallback(() => {
    setReloadRevision((prev) => prev + 1);
  }, []);

  const handleCycleTheme = useCallback(() => {
    setTheme((prev) => getNextTheme(prev));
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      {!focusMode && (
        <>
          <PreviewHeader
            currentHash={currentHash}
            onNavigate={handleNavigate}
            onReload={handleReload}
          />
          <PreviewToolbar
            viewport={viewport}
            onViewportChange={setViewport}
            currentHash={currentHash}
            onNavigate={handleNavigate}
            articles={articles}
            theme={theme}
            onCycleTheme={handleCycleTheme}
            onEnterFocusMode={() => setFocusMode(true)}
          />
        </>
      )}

      {focusMode && (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="fixed right-4 bottom-4 z-30 inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white/95 px-3.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-xs transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31340]"
        >
          <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Mostrar barra</span>
        </button>
      )}

      <PreviewStage
        viewport={viewport}
        currentHash={currentHash}
        reloadRevision={reloadRevision}
        theme={theme}
        onHashChangeFromIframe={handleNavigate}
        onArticlesExtracted={setArticles}
      />
    </div>
  );
}
