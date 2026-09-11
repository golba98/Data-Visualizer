import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { watchPage } from './support/watch-page.mjs';
import {
  findCanvasProblems,
  findLayoutProblems,
  installTooltipRecorder,
  lastTooltipFrame,
  probeCanvasText,
  waitForChart
} from './support/mobile-checks.mjs';

// Every chart, found from its source file so a new chart is covered without
// editing this list. hasTooltip marks charts that promise a touch tooltip.
const VIS_ROOT = new URL('../../src/visualizations/', import.meta.url);
const CHARTS = ['inequality', 'survey', 'archive'].flatMap((group) =>
  readdirSync(new URL(`${group}/`, VIS_ROOT))
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
      const source = readFileSync(new URL(`${group}/${file}`, VIS_ROOT), 'utf8');
      return {
        group,
        id: source.match(/this\.id = '([^']+)'/)[1],
        hasTooltip: source.includes('drawChartTooltip')
      };
    }));

// Canvas text that is meant to overlap, keyed by chart id, with the reason.
const ALLOWED_TEXT_PROBLEMS = {};

function isAllowed(chartId, problem) {
  return (ALLOWED_TEXT_PROBLEMS[chartId] || []).some(({ pattern }) => pattern.test(problem));
}

async function collectProblems(page, chartId, label) {
  const layout = await findLayoutProblems(page);
  const canvas = await findCanvasProblems(page);
  const text = await probeCanvasText(page);
  return [...layout, ...canvas, ...text.problems.filter((p) => !isAllowed(chartId, p))]
    .map((problem) => `[${label}] ${problem}`);
}

// Resizing re-renders on the next animation frame; wait until the canvas
// has been redrawn at the container's new width.
async function waitForCanvasToFit(page, chartId) {
  await expect.poll(() => page.evaluate(() => {
    const container = document.getElementById('chart-container');
    const canvas = container && container.querySelector('canvas');
    return !!canvas && Math.abs(parseFloat(canvas.style.width) - container.clientWidth) <= 1;
  })).toBe(true);
  await waitForChart(page, chartId);
}

// Taps a grid of points over the visible part of the canvas (below the
// sticky menu bar, which would take the tap) and returns the first tap that
// drew a tooltip.
async function findTooltipByTapping(page) {
  const canvas = page.locator('#chart-container canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const viewport = page.viewportSize();
  const menuBar = page.locator('#mobile-menu-toggle');
  const menuBox = await menuBar.isVisible() ? await menuBar.boundingBox() : null;
  const minY = menuBox ? menuBox.y + menuBox.height + 2 : 0;

  for (let row = 1; row <= 12; row++) {
    for (let col = 1; col <= 10; col++) {
      const x = box.x + (box.width * col) / 11;
      const y = box.y + (box.height * row) / 13;
      if (y < minY || y > viewport.height) continue;
      await page.touchscreen.tap(x, y);
      const frame = await lastTooltipFrame(page);
      if (frame && frame.shown) return { x, y, frame, box };
    }
  }
  return null;
}

// Each test opens its own page, so charts can be checked in parallel.
test.describe.configure({ mode: 'parallel' });

test('the chart list matches the charts the page registers', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.gallery && window.gallery.visuals.length > 0);
  const registered = await page.evaluate(() => window.gallery.visuals.map((vis) => vis.id));
  expect([...new Set(registered)].sort()).toEqual(CHARTS.map((chart) => chart.id).sort());
});

for (const chart of CHARTS) {
  test(`${chart.group}: ${chart.id}`, async ({ page }) => {
    const { consoleErrors, pageErrors } = watchPage(page);
    const problems = [];

    await page.goto(`/#${chart.id}`);
    await waitForChart(page, chart.id);
    problems.push(...await collectProblems(page, chart.id, 'initial'));

    // Annotations off and back on.
    const annotations = page.locator('#chart-controls [data-annotation-button]');
    await annotations.tap();
    await expect(annotations).toHaveAttribute('aria-pressed', 'false');
    await waitForChart(page, chart.id);
    problems.push(...await collectProblems(page, chart.id, 'annotations hidden'));
    await annotations.tap();
    await expect(annotations).toHaveAttribute('aria-pressed', 'true');

    // Chart controls (archive select and sliders) redraw without breaking.
    const selects = page.locator('#chart-controls select');
    for (let i = 0; i < await selects.count(); i++) {
      const values = await selects.nth(i).locator('option').evaluateAll((options) => options.map((o) => o.value));
      await selects.nth(i).selectOption(values[values.length - 1]);
    }
    const sliders = page.locator('#chart-controls input[type="range"]');
    for (let i = 0; i < await sliders.count(); i++) {
      const min = await sliders.nth(i).getAttribute('min');
      await sliders.nth(i).fill(String(min));
    }
    if (await selects.count() + await sliders.count() > 0) {
      await waitForChart(page, chart.id);
      problems.push(...await collectProblems(page, chart.id, 'controls changed'));
    }

    // Exports produce a real file of the right type.
    const png = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save high-res PNG' }).tap();
    expect((await png).suggestedFilename()).toMatch(/\.png$/);
    const csv = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download CSV' }).tap();
    expect((await csv).suggestedFilename()).toMatch(/\.csv$/);

    // About panel and, where offered, the data table.
    await page.locator('#about-chart-toggle').tap();
    const panel = page.locator('#info-panel');
    await expect(panel).toBeVisible();
    await expect(panel).toBeInViewport();
    const dataTable = page.locator('#chart-data-details');
    if (await dataTable.isVisible()) {
      await dataTable.locator('summary').tap();
      await expect(dataTable.locator('table')).toBeVisible();
    }
    problems.push(...(await findLayoutProblems(page)).map((p) => `[about panel] ${p}`));
    await page.locator('#info-panel-close').tap();
    await expect(panel).toBeHidden();

    // Touch tooltips: a tap on a mark shows one inside the canvas, and a tap
    // on empty space clears it.
    await installTooltipRecorder(page);
    const hit = await findTooltipByTapping(page);
    if (chart.hasTooltip && !hit) {
      problems.push('[tooltip] no tap on the chart showed a tooltip');
    }
    if (hit) {
      const size = await page.evaluate(() => [window.width, window.height]);
      for (const b of hit.frame.boxes) {
        if (b.left < -1 || b.top < -1 || b.right > size[0] + 1 || b.bottom > size[1] + 1) {
          problems.push(`[tooltip] tooltip text drawn off the canvas after a tap at `
            + `${Math.round(hit.x - hit.box.x)},${Math.round(hit.y - hit.box.y)}`);
          break;
        }
      }
      const canvas = page.locator('#chart-container canvas');
      const box = await canvas.boundingBox();
      await page.touchscreen.tap(box.x + 3, box.y + 3);
      if ((await lastTooltipFrame(page)).shown) {
        problems.push('[tooltip] tooltip stays on screen after tapping empty space');
      }
    }

    // Rotating the phone re-renders at the new size.
    const viewport = page.viewportSize();
    await page.setViewportSize({ width: viewport.height, height: viewport.width });
    await waitForCanvasToFit(page, chart.id);
    problems.push(...await collectProblems(page, chart.id, 'rotated'));

    expect(problems, problems.join('\n')).toEqual([]);
    expect(pageErrors, 'no uncaught page errors').toEqual([]);
    expect(consoleErrors, 'no console errors').toEqual([]);
  });
}
