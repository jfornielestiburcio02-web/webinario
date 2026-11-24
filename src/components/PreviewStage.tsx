import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArticleSummary,
  PREVIEW_ASSET_PATH,
  PreviewTheme,
  VIEWPORT_PRESETS,
  ViewportPresetId,
  buildPreviewUrl,
  normalizeHash,
  parseArticlesFromDataScript,
} from '../utils/previewConfig';

interface PreviewStageProps {
  viewport: ViewportPresetId;
  currentHash: string;
  reloadRevision: number;
  theme: PreviewTheme;
  onHashChangeFromIframe: (hash: string) => void;
  onArticlesExtracted: (articles: ArticleSummary[]) => void;
}

function applyThemeToDocument(doc: Document | null, theme: PreviewTheme) {
  if (!doc?.documentElement) return;
  if (theme === 'auto') {
    doc.documentElement.removeAttribute('data-theme');
  } else {
    doc.documentElement.setAttribute('data-theme', theme);
  }
}

export function PreviewStage({
  viewport,
  currentHash,
  reloadRevision,
  theme,
  onHashChangeFromIframe,
  onArticlesExtracted,
}: PreviewStageProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialSrc] = useState(() =>
    buildPreviewUrl(PREVIEW_ASSET_PATH, currentHash, reloadRevision)
  );
  const lastRevisionRef = useRef(reloadRevision);
  const lastThemeRef = useRef<PreviewTheme>(theme);

  const extractArticlesFromDoc = useCallback(
    (doc: Document | null) => {
      if (!doc) return;
      const dataScript = doc.getElementById('data');
      if (dataScript?.textContent) {
        const lang = doc.documentElement?.lang === 'ca' ? 'ca' : 'es';
        const parsed = parseArticlesFromDataScript(dataScript.textContent, lang);
        if (parsed.length > 0) {
          onArticlesExtracted(parsed);
        }
      }
    },
    [onArticlesExtracted]
  );

  const syncIframeMetadata = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    const doc = iframeRef.current?.contentDocument;
    if (!win || !doc) return;

    if (theme !== 'auto') {
      applyThemeToDocument(doc, theme);
    }
    extractArticlesFromDoc(doc);

    const liveHash = normalizeHash(win.location.hash);
    onHashChangeFromIframe(liveHash);
  }, [extractArticlesFromDoc, onHashChangeFromIframe, theme]);

  // Apply theme changes immediately when toggled from toolbar
  useEffect(() => {
    if (lastThemeRef.current === theme) return;
    lastThemeRef.current = theme;
    applyThemeToDocument(iframeRef.current?.contentDocument ?? null, theme);
  }, [theme]);

  // Sync hash changes requested by parent controls without full iframe reload
  useEffect(() => {
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    if (!win || isLoading) return;

    const targetHash = normalizeHash(currentHash);
    if (normalizeHash(win.location.hash) !== targetHash) {
      win.location.hash = targetHash;
    }
  }, [currentHash, isLoading]);

  // Reload iframe explicitly when reloadRevision increments
  useEffect(() => {
    if (reloadRevision === lastRevisionRef.current) return;
    lastRevisionRef.current = reloadRevision;
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);
    iframe.src = buildPreviewUrl(PREVIEW_ASSET_PATH, currentHash, reloadRevision);
  }, [reloadRevision, currentHash]);

  // Listen to in-iframe navigation events and language changes
  useEffect(() => {
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument;
    if (!win || !doc || isLoading) return;

    const handleHashChange = () => {
      onHashChangeFromIframe(normalizeHash(win.location.hash));
    };

    win.addEventListener('hashchange', handleHashChange);

    let observer: MutationObserver | null = null;
    if (doc.documentElement) {
      observer = new MutationObserver(() => {
        extractArticlesFromDoc(doc);
      });
      observer.observe(doc.documentElement, {
        attributes: true,
        attributeFilter: ['lang'],
      });
    }

    return () => {
      win.removeEventListener('hashchange', handleHashChange);
      observer?.disconnect();
    };
  }, [extractArticlesFromDoc, isLoading, onHashChangeFromIframe]);

  const handleLoad = () => {
    setIsLoading(false);
    syncIframeMetadata();
  };

  const preset = VIEWPORT_PRESETS[viewport];
  const isFramed = preset.width !== null && preset.height !== null;

  return (
    <main className="relative flex min-h-0 flex-1 overflow-auto bg-slate-100">
      {isLoading && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80"
        >
          <p className="text-sm font-medium text-slate-600">
            Cargando previsualización de 3Cat…
          </p>
        </div>
      )}

      <div
        className={
          isFramed
            ? 'mx-auto flex w-full items-start justify-center p-4 sm:p-6'
            : 'h-full w-full'
        }
      >
        <div
          style={
            isFramed
              ? {
                  width: `${preset.width}px`,
                  height: `${preset.height}px`,
                  maxWidth: '100%',
                }
              : undefined
          }
          className={
            isFramed
              ? 'shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm'
              : 'h-full w-full bg-white'
          }
        >
          <iframe
            ref={iframeRef}
            src={initialSrc}
            onLoad={handleLoad}
            title="Previsualización interactiva de 3Cat"
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </div>
    </main>
  );
}
