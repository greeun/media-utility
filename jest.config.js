const nextJest = require('next/jest')

/**
 * 테스트 결과 경로 헬퍼
 * 구조: test-results/[timestamp]/[테스트종류]
 */
const TEST_CATEGORY_MAP = {
  'unit': '01-unit',
  'component': '02-component',
  'integration': '03-integration',
}

function generateTimestampDir() {
  if (process.env.TEST_RESULTS_TIMESTAMP) {
    return process.env.TEST_RESULTS_TIMESTAMP
  }
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  process.env.TEST_RESULTS_TIMESTAMP = timestamp
  return timestamp
}

function detectTestCategory() {
  for (const arg of process.argv) {
    if (arg.includes('tests/03-integration') || arg.includes('03-integration')) return 'integration'
    if (arg.includes('tests/02-component') || arg.includes('02-component')) return 'component'
    if (arg.includes('tests/01-unit') || arg.includes('01-unit')) return 'unit'
  }
  return 'unit'
}

function getTestResultsDir(category) {
  const categoryDir = TEST_CATEGORY_MAP[category] || category
  return `test-results/${generateTimestampDir()}/${categoryDir}`
}

const testCategory = detectTestCategory()
const resultsDir = getTestResultsDir(testCategory)
const isComponent = testCategory === 'component'
const isIntegration = testCategory === 'integration'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testEnvironment: isComponent ? 'jsdom' : 'node',
  testMatch: isComponent
    ? [
        '<rootDir>/tests/02-component/**/*.test.ts',
        '<rootDir>/tests/02-component/**/*.test.tsx',
      ]
    : isIntegration
      ? [
          '<rootDir>/tests/03-integration/**/*.test.ts',
          '<rootDir>/tests/03-integration/**/*.test.tsx',
        ]
      : [
          '<rootDir>/tests/01-unit/**/*.test.ts',
          '<rootDir>/tests/01-unit/**/*.test.tsx',
        ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testTimeout: isIntegration ? 30000 : 10000,
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: `${testCategory.charAt(0).toUpperCase() + testCategory.slice(1)} Tests Report`,
        outputPath: `${resultsDir}/test-report.html`,
        includeFailureMsg: true,
        includeConsoleLog: false,
        dateFormat: 'yyyy-mm-dd HH:MM:ss',
        sort: 'status'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: resultsDir,
        outputName: 'test-results.xml',
        suiteName: `${testCategory.charAt(0).toUpperCase() + testCategory.slice(1)} Tests`,
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > '
      }
    ]
  ],
  collectCoverage: false,
  coverageDirectory: `${resultsDir}/coverage`,
  testPathIgnorePatterns: [
    '<rootDir>/tests/04-e2e/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(gif.js|heic-to|browser-image-compression|uuid)/)'
  ],
  forceExit: true,
  detectOpenHandles: false,
}

module.exports = createJestConfig(customJestConfig)
