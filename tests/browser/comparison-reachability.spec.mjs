import { test, expect } from '@playwright/test';

const route = '/#compare/za-gini-trend/za-dwelling-ownership-by-group';

for (const viewport of [
  { width: 2048, height: 1152 }, { width: 1440, height: 810 },
  { width: 1024, height: 768 }, { width: 320, height: 664 },
  { width: 360, height: 664 }, { width: 390, height: 664 },
  { width: 430, height: 664 }
]) {
  test(`complete comparison is reachable at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, isMobile: viewport.width < 821,
      hasTouch: viewport.width < 821 });
    const page = await context.newPage();
    await page.goto(route);
    for (let index = 0; index < 2; index++) {
      const iframe = page.locator('.comparison-pane iframe').nth(index);
      await iframe.scrollIntoViewIfNeeded();
      const frame = iframe.contentFrame();
      await expect.poll(() => frame.locator('body').evaluate(() =>
        window.gallery?.selectedVisual?.isReady)).toBe(true);
      const source = frame.locator('.chart-source');
      await source.scrollIntoViewIfNeeded();
      // The source must be inside both its iframe and the visible parent panel.
      await expect.poll(async () => {
        const outer = await iframe.boundingBox();
        const inner = await source.evaluate(e => {
          const r = e.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom };
        });
        const limit = await page.locator('.comparison-view').evaluate(e =>
          Math.min(innerHeight, e.getBoundingClientRect().bottom));
        return inner.top >= 0 && inner.bottom <= outer.height + 1
          && outer.y + inner.top >= 0 && outer.y + inner.bottom <= limit + 1;
      }).toBe(true);
      expect(await frame.locator('body').evaluate(() =>
        document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.width < 821) {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.setViewportSize(viewport);
      await page.locator('.comparison-select').first().selectOption('za-dwelling-ownership-by-group');
      await expect(page.locator('.comparison-select').first()).toHaveValue('za-dwelling-ownership-by-group');
      await page.getByRole('button', { name: 'Reset comparison' }).click();
      await page.getByRole('button', { name: 'Exit comparison' }).click();
      await expect(page.locator('.comparison-view')).toBeHidden();
    }
    await context.close();
  });
}

test('Gini annotation rectangles do not overlap in comparison or standalone views', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  for (const url of [route, '/#za-gini-trend']) {
    await page.goto(url);
    const frame = url === route ? page.locator('iframe').first().contentFrame() : page;
    await expect.poll(() => frame.locator('body').evaluate(() =>
      window.gallery?.selectedVisual?.isReady)).toBe(true);
    const boxes = await frame.locator('body').evaluate(() => {
      const original = window.rect;
      const boxes = [];
      window.rect = function(x, y, width, height, ...rest) {
        boxes.push({ x, y, width, height });
        return original(x, y, width, height, ...rest);
      };
      try { window.gallery.selectedVisual.drawAnnotations(); }
      finally { window.rect = original; }
      return boxes;
    });
    expect(boxes).toHaveLength(2);
    const [a, b] = boxes;
    expect(a.x + a.width <= b.x || b.x + b.width <= a.x
      || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
  }
});

test('all mobile comparison selections load and their controls work', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 },
    isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(route);
  const ids = await page.locator('.comparison-select').first().locator('option')
    .evaluateAll(options => options.map(option => option.value));
  for (const id of ids) {
    await page.locator('.comparison-select').first().selectOption(id);
    const iframe = page.locator('iframe').first();
    await iframe.scrollIntoViewIfNeeded();
    const frame = iframe.contentFrame();
    await expect.poll(() => frame.locator('body').evaluate(() =>
      window.gallery?.selectedVisual?.isReady)).toBe(true);
    await expect.poll(async () => {
      const cardBottom = await frame.locator('.chart-card').evaluate(e => e.getBoundingClientRect().bottom);
      return cardBottom <= (await iframe.boundingBox()).height + 1;
    }).toBe(true);
    expect(await frame.locator('canvas').evaluate(e =>
      Math.abs(e.getBoundingClientRect().height - parseFloat(e.style.height)))).toBeLessThan(2);
  }
  await page.locator('.comparison-select').first().selectOption('za-gini-trend');
  const frame = page.locator('iframe').first().contentFrame();
  await frame.getByRole('button', { name: 'Hide annotations' }).click();
  await expect(frame.getByRole('button', { name: 'Show annotations' })).toBeVisible();
  await frame.getByRole('button', { name: 'Show annotations' }).click();
  const downloaded = page.waitForEvent('download');
  await frame.getByRole('button', { name: 'Download CSV' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  expect(await download.failure()).toBeNull();
  await context.close();
});
