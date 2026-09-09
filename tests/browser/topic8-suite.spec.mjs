import { expect, test } from '@playwright/test';

// Collects the diagnostics that are only visible inside the browser, so a
// failure reported from Node still explains what the page was doing.
function watchPage(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.stack || error.message || String(error));
  });

  return { consoleErrors, pageErrors };
}

// Waits for the signal published by src/topic8-testing.js under ?test=1.
async function waitForSuite(page) {
  await page.waitForFunction(
    () => !!window.cm1010TestResults && window.cm1010TestResults.complete === true,
    undefined,
    { timeout: 60_000 }
  );

  return page.evaluate(() => window.cm1010TestResults);
}

function formatFailures(results, consoleErrors, pageErrors) {
  const lines = [
    `${results.failed} of ${results.total} application tests failed.`,
    ''
  ];

  for (const failure of results.failures) {
    lines.push(`FAIL  [${failure.suite}] ${failure.name}`);
    lines.push(`      ${failure.message}`);
  }

  if (pageErrors.length > 0) {
    lines.push('', 'Uncaught page errors:');
    for (const error of pageErrors) {
      lines.push(`      ${error}`);
    }
  }

  if (consoleErrors.length > 0) {
    lines.push('', 'Browser console errors:');
    for (const error of consoleErrors) {
      lines.push(`      ${error}`);
    }
  }

  return lines.join('\n');
}

test.describe('topic 8 browser test suite', () => {
  test('the in-page suite reports no failures', async ({ page }, testInfo) => {
    const { consoleErrors, pageErrors } = watchPage(page);

    await page.goto('/?test=1');

    const results = await waitForSuite(page);

    await testInfo.attach('cm1010TestResults.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json'
    });

    // Surfaces the in-page totals in the runner output, so a terminal run shows
    // the same numbers a person would read from the browser console.
    process.stdout.write(
      `\n    application suite: ${results.passed}/${results.total} passed, `
      + `${results.failed} failed\n`);

    // Guards against a suite that silently stopped registering tests.
    expect(results.total, 'the suite registered at least one test').toBeGreaterThan(0);

    if (results.failed > 0) {
      throw new Error(formatFailures(results, consoleErrors, pageErrors));
    }

    expect(results.passed).toBe(results.total);
    expect(pageErrors, 'no uncaught page errors during the run').toEqual([]);
  });

  test('the app is unaffected without ?test=1', async ({ page }) => {
    const { pageErrors } = watchPage(page);

    await page.goto('/');

    // setup() builds the gallery, which is what puts the overview on screen.
    await expect(page.locator('#overview')).toBeVisible();
    await expect(page.locator('#chart-view')).toBeHidden();
    await expect(page.locator('h1')).toHaveText('South African Inequality, Explained');

    // The harness must stay dormant in normal use.
    const testResults = await page.evaluate(() => window.cm1010TestResults);
    expect(testResults, 'the test suite did not run without ?test=1').toBeUndefined();

    expect(pageErrors, 'no uncaught page errors on a normal load').toEqual([]);
  });
});
