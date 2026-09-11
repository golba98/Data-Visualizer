import { expect, test } from '@playwright/test';
import { watchPage } from './support/watch-page.mjs';
import {
  findCanvasProblems,
  findLayoutProblems,
  probeCanvasText,
  waitForChart
} from './support/mobile-checks.mjs';

test.describe.configure({ mode: 'parallel' });

async function chartProblems(target, label) {
  const canvas = await findCanvasProblems(target);
  const text = await probeCanvasText(target);
  return [...canvas, ...text.problems].map((problem) => `[${label}] ${problem}`);
}

function expectNoProblems(problems, errors) {
  expect(problems, problems.join('\n')).toEqual([]);
  expect(errors.pageErrors, 'no uncaught page errors').toEqual([]);
  expect(errors.consoleErrors, 'no console errors').toEqual([]);
}

test('overview: every card opens its chart and back returns', async ({ page }) => {
  const errors = watchPage(page);
  const problems = [];

  await page.goto('/');
  await expect(page.locator('#overview')).toBeVisible();
  problems.push(...(await findLayoutProblems(page)).map((p) => `[overview] ${p}`));

  const cards = page.locator('.dataset-card button');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const id = await card.getAttribute('data-visual-id');
    await card.scrollIntoViewIfNeeded();
    await card.tap();
    await waitForChart(page, id);
    await expect(page.locator('#chart-view')).toBeVisible();
    // Opening a chart from far down the overview must land on the chart.
    await expect(page.locator('#chart-title')).toBeInViewport();
    await page.goBack();
    await expect(page.locator('#overview')).toBeVisible();
  }

  expectNoProblems(problems, errors);
});

test('navigation drawer: open, trap focus, close every way, navigate', async ({ page }) => {
  const errors = watchPage(page);
  const problems = [];
  await page.goto('/');

  const toggle = page.locator('#mobile-menu-toggle');
  test.skip(!(await toggle.isVisible()), 'this viewport shows the sidebar instead of a drawer');

  const sidebar = page.locator('#sidebar');
  const backdrop = page.locator('#sidebar-backdrop');

  // Open with the toggle: focus moves in, the page behind is hidden from AT.
  await toggle.tap();
  await expect(sidebar).toHaveClass(/\bopen\b/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.main-content')).toHaveAttribute('aria-hidden', 'true');
  // The drawer slides in; check its layout once it has arrived.
  await expect.poll(() => sidebar.evaluate((el) => el.getBoundingClientRect().left)).toBeGreaterThanOrEqual(0);
  await expect(sidebar).toBeInViewport({ ratio: 0.9 });
  problems.push(...(await findLayoutProblems(page)).map((p) => `[drawer open] ${p}`));

  // Every section tab is reachable and swaps the links.
  for (const tab of await page.locator('.section-tab-btn').all()) {
    await tab.tap();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    const name = await tab.textContent();
    problems.push(...(await findLayoutProblems(page)).map((p) => `[drawer tab ${name}] ${p}`));
  }

  // Focus stays inside the drawer while tabbing.
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => document.getElementById('sidebar').contains(document.activeElement));
    expect(inside, `focus left the drawer after ${i + 1} Tab presses`).toBe(true);
  }

  // Escape closes and returns focus to the toggle.
  await page.keyboard.press('Escape');
  await expect(sidebar).not.toHaveClass(/\bopen\b/);
  await expect(toggle).toBeFocused();

  // The backdrop closes it.
  await toggle.tap();
  await expect(backdrop).toBeVisible();
  const box = await backdrop.boundingBox();
  await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
  await expect(sidebar).not.toHaveClass(/\bopen\b/);

  // The close button closes it.
  await toggle.tap();
  await page.locator('#mobile-menu-close').tap();
  await expect(sidebar).not.toHaveClass(/\bopen\b/);

  // Choosing a chart opens it and closes the drawer.
  await toggle.tap();
  await page.locator('#tab-inequality').tap();
  const link = page.locator('#section-links-container .menu-button').first();
  await link.tap();
  await expect(sidebar).not.toHaveClass(/\bopen\b/);
  await expect(page.locator('#chart-view')).toBeVisible();
  await expect(page.locator('.main-content')).not.toHaveAttribute('aria-hidden', 'true');

  // ?mobile=1 opens the drawer on load.
  await page.goto('/?mobile=1');
  await expect(sidebar).toHaveClass(/\bopen\b/);

  expectNoProblems(problems, errors);
});

test('guided story: every step is readable and its buttons reachable', async ({ page }) => {
  const errors = watchPage(page);
  const problems = [];

  await page.goto('/');
  await page.locator('#start-tour-button').tap();
  await expect(page.locator('#tour-view')).toBeVisible();

  const steps = await page.evaluate(() => window.gallery.tourSteps.map((step) => step.visualId));
  const actions = page.locator('.tour-actions button');

  for (let index = 0; index < steps.length; index++) {
    await waitForChart(page, steps[index]);
    await expect(page.locator('#tour-progress')).toContainText(String(index + 1));
    const label = `step ${index + 1} ${steps[index]}`;
    problems.push(...(await findLayoutProblems(page)).map((p) => `[${label}] ${p}`));
    problems.push(...await chartProblems(page, label));
    for (const button of await actions.all()) {
      if (!(await button.isVisible())) continue;
      const inView = await button.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth;
      });
      if (!inView) problems.push(`[${label}] tour button off screen: ${await button.textContent()}`);
    }
    if (index < steps.length - 1) await page.locator('#tour-next').tap();
  }

  // Previous, annotations and exit all work from the last step.
  await page.locator('#tour-previous').tap();
  await waitForChart(page, steps[steps.length - 2]);
  const annotations = page.locator('#tour-annotations');
  await annotations.tap();
  await expect(annotations).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#tour-exit').tap();
  await expect(page.locator('#overview')).toBeVisible();
  problems.push(...(await findLayoutProblems(page)).map((p) => `[after exit] ${p}`));

  expectNoProblems(problems, errors);
});

test('comparison: panes, chart pickers, reset and exit', async ({ page }) => {
  const errors = watchPage(page);
  const problems = [];

  const checkPanes = async (label) => {
    const panes = page.locator('.comparison-pane');
    await expect(panes).toHaveCount(2);
    for (let index = 0; index < 2; index++) {
      const iframe = panes.nth(index).locator('iframe');
      await iframe.scrollIntoViewIfNeeded();
      const id = new URL(await iframe.getAttribute('src'), 'http://localhost').searchParams.get('vis');
      const child = await (await iframe.elementHandle()).contentFrame();
      await waitForChart(child, id);
      problems.push(...await chartProblems(child, `${label} pane ${index + 1} ${id}`));
    }
    problems.push(...(await findLayoutProblems(page)).map((p) => `[${label}] ${p}`));
  };

  await page.goto('/');
  await page.locator('.dataset-card button').first().tap();
  await page.getByRole('button', { name: 'Compare' }).tap();
  await expect(page.locator('#comparison-view')).toBeVisible();
  await checkPanes('default pair');

  // Change both pickers to other charts.
  const selects = page.locator('.comparison-select');
  for (let i = 0; i < 2; i++) {
    const values = await selects.nth(i).locator('option').evaluateAll((options) => options.map((o) => o.value));
    await selects.nth(i).selectOption(values[values.length - 1 - i]);
  }
  await checkPanes('changed pickers');

  await page.locator('#comparison-reset').tap();
  await checkPanes('after reset');

  await page.locator('#comparison-close').tap();
  await expect(page.locator('#overview')).toBeVisible();

  expectNoProblems(problems, errors);
});
