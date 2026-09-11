import { expect, test } from '@playwright/test';

// Phone-sized checks for the story and chart views. Each chart that stacks rows
// exposes getRowLayout(), which reports the same numbers its draw() uses, so the
// checks below catch rows running into each other or into the footnote.

const PORTRAIT_FLOOR = 380;
const LANDSCAPE_FLOOR = 300;

const VIEWPORTS = [
  { name: 'small phone', width: 360, height: 600, floor: PORTRAIT_FLOOR },
  { name: 'Galaxy-sized phone', width: 369, height: 660, floor: PORTRAIT_FLOOR },
  { name: 'large phone', width: 412, height: 780, floor: PORTRAIT_FLOOR },
  { name: 'landscape phone', width: 740, height: 360, floor: LANDSCAPE_FLOOR }
];

function watchPageErrors(page) {
  const pageErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message || String(error));
  });
  return pageErrors;
}

// Waits until the requested chart has loaded and the canvas has been resized to
// its box. Height is not compared here because the canvas has its own minimum.
async function waitForChart(page, visualId) {
  await page.waitForFunction((id) => {
    if (typeof gallery === 'undefined' || !gallery || !gallery.selectedVisual) return false;
    var vis = gallery.selectedVisual;
    if (vis.id !== id || vis.loaded !== true || gallery.isTourTransitioning) return false;
    return document.getElementById('chart-container').clientWidth === width;
  }, visualId, { timeout: 20_000 });
}

async function readRowLayout(page) {
  return page.evaluate(() => {
    var vis = gallery.selectedVisual;
    if (typeof vis.getRowLayout !== 'function') return null;
    return { canvasHeight: height, layout: vis.getRowLayout() };
  });
}

function expectRowsFit(result, label) {
  if (!result) return;
  const { canvasHeight, layout } = result;
  const lastRowBottom = layout.top + (layout.step * (layout.rowCount - 1)) + layout.rowHeight;

  expect(layout.step, `${label}: rows do not overlap each other`)
    .toBeGreaterThanOrEqual(layout.rowHeight - 0.5);
  expect(lastRowBottom, `${label}: last row stays above the axis labels`)
    .toBeLessThanOrEqual(layout.rowsBottom + 0.5);
  expect(layout.rowsBottom, `${label}: rows stay above the footnote`)
    .toBeLessThanOrEqual(layout.footnoteTop + 0.5);
  expect(layout.footnoteTop, `${label}: footnote starts inside the canvas`)
    .toBeLessThan(canvasHeight);
}

for (const viewport of VIEWPORTS) {
  test.describe(`phone layout at ${viewport.width}x${viewport.height} (${viewport.name})`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });

    test('every story step gives its chart the free space without overlaps', async ({ page }, testInfo) => {
      const pageErrors = watchPageErrors(page);
      await page.goto('/');
      await page.waitForFunction(() => typeof gallery !== 'undefined' && !!gallery);
      const steps = await page.evaluate(() => gallery.tourSteps.map((step) => ({
        id: step.id,
        visualId: step.visualId
      })));

      for (const step of steps) {
        await page.goto(`/#tour/${step.id}`);
        await page.reload();
        await waitForChart(page, step.visualId);

        const sizes = await page.evaluate(() => {
          var main = document.querySelector('.main-content').getBoundingClientRect();
          return { mainHeight: main.height, canvasHeight: height };
        });

        expect(sizes.mainHeight, `${step.id}: story fills the screen height`)
          .toBeGreaterThanOrEqual(viewport.height - 1);
        expect(sizes.canvasHeight, `${step.id}: chart is at least the floor height`)
          .toBeGreaterThanOrEqual(viewport.floor);
        expectRowsFit(await readRowLayout(page), step.id);

        await testInfo.attach(`${viewport.width}x${viewport.height}-${step.id}.png`, {
          body: await page.screenshot(),
          contentType: 'image/png'
        });
      }

      expect(pageErrors, 'no uncaught page errors').toEqual([]);
    });

    test('every chart view keeps its rows clear of the footnote', async ({ page }) => {
      const pageErrors = watchPageErrors(page);
      await page.goto('/');
      await page.waitForFunction(() => typeof gallery !== 'undefined' && !!gallery);
      const ids = await page.evaluate(() => gallery.visuals.map((vis) => vis.id));

      for (const id of ids) {
        await page.evaluate((visualId) => gallery.selectVisual(visualId), id);
        await waitForChart(page, id);
        expectRowsFit(await readRowLayout(page), id);
      }

      expect(pageErrors, 'no uncaught page errors').toEqual([]);
    });
  });
}
