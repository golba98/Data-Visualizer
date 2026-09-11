// Collects the diagnostics that are only visible inside the browser, so a
// failure reported from Node still explains what the page was doing.
export function watchPage(page) {
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
