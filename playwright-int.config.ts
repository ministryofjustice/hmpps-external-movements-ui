import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: '',

  testMatch: /integration_tests\/.*spec.ts/,

  outputDir: 'test_results/playwright',

  fullyParallel: false,
  workers: 1,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env['CI'],

  // Retry on CI only.
  retries: process.env['CI'] ? 2 : 0,

  // Reporter to use
  reporter: [['html'], ['playwright-ctrf-json-reporter', { outputDir: 'ctrf', outputFile: 'int-report.json' }]],

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
