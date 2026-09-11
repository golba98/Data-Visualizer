import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { probeCanvasText, waitForChart } from './support/mobile-checks.mjs';

// The sizes the site can give a chart, from the layouts in style.css. On
// portrait phones (chart page, comparison panes, the guided story) a narrow
// canvas is at least 360px tall; landscape phones (chart page, and the
// story's chart column beside its text) give a short canvas at least 400px
// of width; then desktop. Every chart must draw all of its text, inside the
// canvas, without overlaps, at each of them.
const SIZES = [
  ...[260, 300, 340, 390].flatMap((width) => [360, 420, 480].map((height) => [width, height])),
  ...[400, 480, 560, 660, 800].flatMap((width) => [280, 320, 380].map((height) => [width, height])),
  [900, 560],
  [1200, 700]
];

const VIS_ROOT = new URL('../../src/visualizations/', import.meta.url);
const CHART_IDS = ['inequality', 'survey', 'archive'].flatMap((group) =>
  readdirSync(new URL(`${group}/`, VIS_ROOT))
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(new URL(`${group}/${file}`, VIS_ROOT), 'utf8').match(/this\.id = '([^']+)'/)[1]));

test.describe.configure({ mode: 'parallel' });

for (const id of CHART_IDS) {
  test(`${id} draws its text cleanly at every chart size`, async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(`/#${id}`);
    await waitForChart(page, id);

    const problems = [];
    for (const [width, height] of SIZES) {
      for (const annotations of [true, false]) {
        await page.evaluate(({ width, height, annotations }) => {
          const container = document.getElementById('chart-container');
          container.style.cssText = `width:${width}px;height:${height}px;min-height:0;flex:none`;
          if (window.gallery.annotationsEnabled !== annotations) window.gallery.toggleAnnotations();
        }, { width, height, annotations });
        await page.waitForFunction(([w, h]) => window.width === w && window.height === h, [width, height]);
        await waitForChart(page, id);
        const { problems: found } = await probeCanvasText(page);
        const label = `${width}x${height}${annotations ? '' : ' no annotations'}`;
        problems.push(...found.map((problem) => `[${label}] ${problem}`));
      }
    }

    expect(problems, problems.join('\n')).toEqual([]);
  });
}
