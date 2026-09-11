import { expect, test } from '@playwright/test';

// A phone-sized viewport, where the comparison panes stack in one column.
test.use({
  viewport: { width: 390, height: 664 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true
});

const PAIR = ['za-gini-trend', 'za-dwelling-ownership-by-group'];

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

test.describe('comparison view on a phone', () => {
  test('each pane shows its chart at full height, not squashed', async ({ page }) => {
    await page.goto(`/#compare/${PAIR[0]}/${PAIR[1]}`);

    const panes = page.locator('.comparison-pane');
    await expect(panes).toHaveCount(2);

    for (let index = 0; index < PAIR.length; index++) {
      const pane = panes.nth(index);
      // The second pane is lazy-loaded, so it only loads once scrolled to.
      await pane.scrollIntoViewIfNeeded();

      const frame = page.frameLocator('.comparison-pane iframe').nth(index);
      const canvas = frame.locator('#chart-container canvas');
      await expect(canvas).toBeVisible();

      // The canvas must render at the size it was drawn at; a CSS-squashed
      // canvas is what made the chart unreadable.
      await expect.poll(async () => canvas.evaluate((element) => {
        const drawnHeight = parseFloat(element.style.height);
        const shownHeight = element.getBoundingClientRect().height;
        return shownHeight >= 240 && Math.abs(shownHeight - drawnHeight) < 2;
      }), { message: `pane ${index + 1} canvas is shown at its drawn height` }).toBe(true);

      // The iframe must be tall enough to show the whole card, source included.
      const iframeHeight = await pane.locator('iframe').evaluate(
        (element) => element.getBoundingClientRect().height);
      const cardBottom = await frame.locator('.chart-card').evaluate(
        (element) => element.getBoundingClientRect().bottom);
      expect(cardBottom, `pane ${index + 1} card fits in its iframe`)
        .toBeLessThanOrEqual(iframeHeight + 1);
    }
  });

  test('a chart saved from a comparison pane keeps the readable mobile layout', async ({ page }) => {
    await page.goto(`/#compare/${PAIR[0]}/${PAIR[1]}`);

    const pane = page.locator('.comparison-pane').nth(1);
    await pane.scrollIntoViewIfNeeded();

    const frame = page.frameLocator('.comparison-pane iframe').nth(1);
    const canvas = frame.locator('#chart-container canvas');
    await expect(canvas).toBeVisible();

    await expect.poll(async () => canvas.evaluate(() => {
      const visual = window.gallery && window.gallery.selectedVisual;
      return !!visual && visual.id === 'za-dwelling-ownership-by-group' && visual.isReady === true;
    })).toBe(true);

    const layout = await canvas.evaluate(() => {
      const visual = window.gallery.selectedVisual;
      const rowLayout = visual.getRowLayout();
      const lastRowBottom = rowLayout.top
        + (rowLayout.step * (rowLayout.rowCount - 1))
        + rowLayout.rowHeight;

      return {
        width: window.width,
        height: window.height,
        rowHeight: rowLayout.rowHeight,
        step: rowLayout.step,
        lastRowBottom,
        rowsBottom: rowLayout.rowsBottom,
        footnoteTop: rowLayout.footnoteTop
      };
    });

    expect(layout.height, 'the exported chart uses the readable mobile height')
      .toBeGreaterThanOrEqual(320);
    expect(layout.step, 'rows do not overlap each other')
      .toBeGreaterThanOrEqual(layout.rowHeight - 0.5);
    expect(layout.lastRowBottom, 'the final row stays above the axis labels')
      .toBeLessThanOrEqual(layout.rowsBottom + 0.5);
    expect(layout.rowsBottom, 'the rows stay above the footnote')
      .toBeLessThanOrEqual(layout.footnoteTop + 0.5);

    const downloadPromise = page.waitForEvent('download');
    await frame.getByRole('button', { name: 'Save high-res PNG' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename())
      .toBe('za-dwelling-ownership-by-group-chart.png');

    const png = await readPngDimensions(download);
    expect(png.width, 'PNG width is three times the logical canvas width')
      .toBe(layout.width * 3);
    expect(png.height, 'PNG height is three times the logical canvas height')
      .toBe(layout.height * 3);
  });
});
