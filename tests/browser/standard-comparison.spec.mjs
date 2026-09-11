import { expect, test } from '@playwright/test';

const DEFAULT_PAIR = ['za-gini-trend', 'za-dwelling-ownership-by-group'];

test.use({ viewport: { width: 2048, height: 1152 } });

async function waitForFrameChart(frame, id) {
  await frame.locator('#chart-container canvas').waitFor({ state: 'visible' });
  await expect.poll(async () => frame.locator('body').evaluate((_, chartId) => {
    const visual = window.gallery && window.gallery.selectedVisual;
    return !!visual && visual.id === chartId && visual.isReady === true;
  }, id)).toBe(true);

  await frame.locator('body').evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function readCanvasMetrics(frame) {
  return frame.locator('#chart-container canvas').evaluate((canvas) => {
    const shown = canvas.getBoundingClientRect();
    const container = canvas.parentElement.getBoundingClientRect();
    const card = document.querySelector('.chart-card').getBoundingClientRect();

    return {
      logicalWidth: window.width,
      logicalHeight: window.height,
      drawnWidth: parseFloat(canvas.style.width),
      drawnHeight: parseFloat(canvas.style.height),
      shownWidth: shown.width,
      shownHeight: shown.height,
      containerWidth: container.width,
      containerHeight: container.height,
      cardBottom: card.bottom
    };
  });
}

function expectUnsquashed(metrics, label) {
  expect(metrics.logicalHeight, `${label}: chart has a readable height`)
    .toBeGreaterThanOrEqual(320);
  expect(Math.abs(metrics.shownWidth - metrics.drawnWidth), `${label}: canvas width is not CSS-scaled`)
    .toBeLessThan(2);
  expect(Math.abs(metrics.shownHeight - metrics.drawnHeight), `${label}: canvas height is not CSS-scaled`)
    .toBeLessThan(2);
  expect(Math.abs(metrics.shownWidth - metrics.containerWidth), `${label}: canvas fills its container width`)
    .toBeLessThan(2);
  expect(Math.abs(metrics.shownHeight - metrics.containerHeight), `${label}: canvas fills its container height`)
    .toBeLessThan(2);
}

async function readPngDimensions(download) {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);

  const png = Buffer.concat(chunks);
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20)
  };
}

test.describe('standard comparison layout', () => {
  test('every selectable chart fills its comparison pane without scaling', async ({ page }) => {
    await page.goto(`/#compare/${DEFAULT_PAIR[0]}/${DEFAULT_PAIR[1]}`);
    const ids = await page.locator('.comparison-select').first().locator('option')
      .evaluateAll((options) => options.map((option) => option.value));

    for (const id of ids) {
      await page.goto(`/#compare/${id}/${DEFAULT_PAIR[0]}`);
      const pane = page.locator('.comparison-pane').first();
      const frame = page.frameLocator('.comparison-pane iframe').first();
      await waitForFrameChart(frame, id);

      const metrics = await readCanvasMetrics(frame);
      expectUnsquashed(metrics, id);

      const iframeHeight = await pane.locator('iframe').evaluate(
        (element) => element.getBoundingClientRect().height);
      expect(metrics.cardBottom, `${id}: the complete chart card fits inside its iframe`)
        .toBeLessThanOrEqual(iframeHeight + 1);
    }
  });

  test('both canvases redraw when the standard comparison changes size', async ({ page }) => {
    await page.goto(`/#compare/${DEFAULT_PAIR[0]}/${DEFAULT_PAIR[1]}`);

    for (const viewport of [
      { width: 1024, height: 768 },
      { width: 2048, height: 1152 }
    ]) {
      await page.setViewportSize(viewport);

      for (let index = 0; index < DEFAULT_PAIR.length; index++) {
        const frame = page.frameLocator('.comparison-pane iframe').nth(index);
        await waitForFrameChart(frame, DEFAULT_PAIR[index]);
        await expect.poll(async () => {
          const metrics = await readCanvasMetrics(frame);
          return Math.abs(metrics.shownWidth - metrics.drawnWidth) < 2
            && Math.abs(metrics.shownHeight - metrics.drawnHeight) < 2;
        }, { message: `pane ${index + 1} redraws at ${viewport.width}x${viewport.height}` })
          .toBe(true);
        expectUnsquashed(await readCanvasMetrics(frame), `pane ${index + 1} at ${viewport.width}px`);
      }
    }
  });

  test('desktop comparison exports the same full-size canvas that is displayed', async ({ page }) => {
    await page.goto(`/#compare/${DEFAULT_PAIR[0]}/${DEFAULT_PAIR[1]}`);

    const frame = page.frameLocator('.comparison-pane iframe').nth(1);
    await waitForFrameChart(frame, DEFAULT_PAIR[1]);
    const metrics = await readCanvasMetrics(frame);
    expectUnsquashed(metrics, 'desktop PNG source');

    const downloadPromise = page.waitForEvent('download');
    await frame.getByRole('button', { name: 'Save high-res PNG' }).click();
    const download = await downloadPromise;
    const png = await readPngDimensions(download);

    expect(download.suggestedFilename())
      .toBe('za-dwelling-ownership-by-group-chart.png');
    expect(png.width).toBe(metrics.logicalWidth * 3);
    expect(png.height).toBe(metrics.logicalHeight * 3);
  });
});
