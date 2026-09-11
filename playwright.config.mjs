import { defineConfig, devices } from '@playwright/test';

// Fixed port so the dev server, the baseURL and CI all agree on one address.
const PORT = 4173;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/browser',

  // The in-page suite drives one shared page state, so each file runs its
  // tests in order; the chart and phone specs opt in to running in parallel.
  workers: isCI ? 2 : undefined,
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
      testIgnore: /mobile-.*\.spec\.mjs/,
      use: { ...devices['Desktop Chrome'] }
    },
    // Every iOS browser runs on WebKit and Android Chrome/Samsung Internet on
    // Chromium, so each phone is emulated on its real engine. The range runs
    // from the narrowest common width (320px) to the largest phones, plus
    // landscape, where the viewport is short and Pixel 7 crosses the 820px
    // desktop breakpoint.
    ...[
      ['iphone-se', 'iPhone SE (3rd gen)'],
      ['iphone-15', 'iPhone 15'],
      ['iphone-15-pro-max', 'iPhone 15 Pro Max'],
      ['iphone-15-landscape', 'iPhone 15 landscape'],
      ['galaxy-s9', 'Galaxy S9+'],
      ['galaxy-s24', 'Galaxy S24'],
      ['pixel-7', 'Pixel 7'],
      ['pixel-7-landscape', 'Pixel 7 landscape']
    ].map(([name, device]) => ({
      name,
      testMatch: /mobile-.*\.spec\.mjs/,
      use: { ...devices[device] }
    }))
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort --host ${HOST}`,
    url: `${BASE_URL}/`,
    reuseExistingServer: !isCI,
    timeout: 60_000
  }
});
