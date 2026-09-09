import { defineConfig, devices } from '@playwright/test';

// Fixed port so the dev server, the baseURL and CI all agree on one address.
const PORT = 4173;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/browser',

  // The browser suite drives one shared page state, so it runs serially.
  workers: 1,
  fullyParallel: false,

  forbidOnly: isCI,
  retries: isCI ? 1 : 0,

  reporter: isCI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],

  use: {
    baseURL: BASE_URL,
    // Nothing is written for a passing run.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort --host ${HOST}`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !isCI,
    timeout: 60_000
  }
});
