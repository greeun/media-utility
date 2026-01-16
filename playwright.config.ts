import { defineConfig, devices } from '@playwright/test'

/**
 * 테스트 결과 경로 헬퍼
 * 구조: test-results/[timestamp]/04-e2e
 */
function generateTimestampDir(): string {
  if (process.env.TEST_RESULTS_TIMESTAMP) {
    return process.env.TEST_RESULTS_TIMESTAMP
  }
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  process.env.TEST_RESULTS_TIMESTAMP = timestamp
  return timestamp
}

const timestampDir = generateTimestampDir()

/**
 * Media Utility E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/04-e2e',
  testMatch: ['**/*.spec.ts'],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,

  timeout: 60 * 1000,

  expect: {
    timeout: 15000,
  },

  outputDir: `test-results/${timestampDir}/04-e2e/artifacts`,

  reporter: [
    ['html', { outputFolder: `test-results/${timestampDir}/04-e2e/html-report` }],
    ['json', { outputFile: `test-results/${timestampDir}/04-e2e/results.json` }],
    ['junit', { outputFile: `test-results/${timestampDir}/04-e2e/results.xml` }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'retain-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
