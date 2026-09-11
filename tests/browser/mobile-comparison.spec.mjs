import { expect, test } from '@playwright/test';

const PAIR = ['za-gini-trend', 'za-dwelling-ownership-by-group'];

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
});
