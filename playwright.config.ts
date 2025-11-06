import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: '',

  testMatch: /server\/.*spec.ts/,

  outputDir: 'test_results/playwright',

  fullyParallel: true,
  workers: process.env['CI'] ? 3 : Number(process.env['PARALLEL_WORKERS']!) || 8,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env['CI'],

  // Retry on CI only.
  retries: process.env['CI'] ? 3 : 3,

  // Reporter to use
  reporter: [['html'], ['playwright-ctrf-json-reporter', { outputDir: 'ctrf', outputFile: 'ctrf-report.json' }]],

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://localhost:3007',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',

    testIdAttribute: 'data-qa',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 5000,
})
