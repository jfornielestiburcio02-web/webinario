import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREVIEW_ASSET_PATH,
  VIEWPORT_PRESETS,
  normalizeHash,
  getActiveNavSection,
  buildPreviewUrl,
  getNextTheme,
  getThemeLabel,
  parseArticlesFromDataScript,
} from './previewConfig.ts';

test('normalizeHash handles empty, bare, and prefixed hashes', () => {
  assert.equal(normalizeHash(''), '#inicio');
  assert.equal(normalizeHash(null), '#inicio');
  assert.equal(normalizeHash('#'), '#inicio');
  assert.equal(normalizeHash('plataformas'), '#plataformas');
  assert.equal(normalizeHash('#noticia-5'), '#noticia-5');
});

test('getActiveNavSection maps platform sub-routes and articles to #plataformas', () => {
  assert.equal(getActiveNavSection('#3cat'), '#plataformas');
  assert.equal(getActiveNavSection('#3catinfo'), '#plataformas');
  assert.equal(getActiveNavSection('#noticia-12'), '#plataformas');
  assert.equal(getActiveNavSection('#cuenta'), '#acceso');
  assert.equal(getActiveNavSection('#equipo'), '#equipo');
  assert.equal(getActiveNavSection('#desconocido'), '#inicio');
});

test('buildPreviewUrl constructs clean local asset URLs with optional revision', () => {
  assert.equal(
    buildPreviewUrl(PREVIEW_ASSET_PATH, '#inicio', 0),
    '/assets/aistudio/3Cat_f80fb83c.html#inicio'
  );
  assert.equal(
    buildPreviewUrl(PREVIEW_ASSET_PATH, '3catinfo', 2),
    '/assets/aistudio/3Cat_f80fb83c.html?v=2#3catinfo'
  );
});

test('theme cycling and labels behave predictably', () => {
  assert.equal(getNextTheme('auto'), 'light');
  assert.equal(getNextTheme('light'), 'dark');
  assert.equal(getNextTheme('dark'), 'auto');
  assert.equal(getThemeLabel('auto'), 'Sistema');
  assert.equal(getThemeLabel('light'), 'Claro');
  assert.equal(getThemeLabel('dark'), 'Oscuro');
});

test('parseArticlesFromDataScript parses and sorts embedded JSON articles safely', () => {
  const sample = JSON.stringify({
    arts: [
      { id: '1', t: 'Primera', p: '3catinfo', o: '2026-01-01' },
      {
        id: '2',
        t: { es: 'Segunda en español', ca: 'Segona en català' },
        p: '3cat',
        o: '2026-05-01',
      },
      {
        id: '3',
        t: { es: 'Pendiente', ca: 'Pendent' },
        p: '3catinfo',
        o: '2026-06-01',
        status: 'pending',
      },
    ],
  });
  const parsedEs = parseArticlesFromDataScript(sample, 'es');
  assert.equal(parsedEs.length, 2);
  assert.equal(parsedEs[0].id, '2');
  assert.equal(parsedEs[0].title, 'Segunda en español');
  assert.equal(parsedEs[0].platform, '3cat');
  assert.equal(parsedEs[1].id, '1');

  const parsedCa = parseArticlesFromDataScript(sample, 'ca');
  assert.equal(parsedCa.length, 2);
  assert.equal(parsedCa[0].title, 'Segona en català');

  assert.deepEqual(parseArticlesFromDataScript('invalid-json'), []);
});

test('VIEWPORT_PRESETS define desktop, tablet, and mobile dimensions', () => {
  assert.equal(VIEWPORT_PRESETS.desktop.width, null);
  assert.equal(VIEWPORT_PRESETS.tablet.width, 768);
  assert.equal(VIEWPORT_PRESETS.mobile.width, 390);
});
