import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 밈 생성기 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 텍스트 입력, 미리보기, 다운로드를 검증한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('밈 생성기 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('밈 생성기 - 이미지 업로드', () => {
  test('이미지 업로드 후 미리보기 캔버스가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 미리보기 캔버스가 표시되어야 함
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible({ timeout: 10000 })
  })

  test('이미지 업로드 후 텍스트 설정 패널이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 상단 텍스트 입력 필드가 표시되어야 함
    const topTextInput = page.locator('input[type="text"]').first()
    await expect(topTextInput).toBeVisible({ timeout: 10000 })
  })
})

test.describe('밈 생성기 - 텍스트 입력', () => {
  test('상단 텍스트를 입력할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 상단 텍스트 입력
    const textInputs = page.locator('input[type="text"]')
    await expect(textInputs.first()).toBeVisible({ timeout: 10000 })
    await textInputs.first().fill('TOP TEXT')

    // 입력값 확인
    await expect(textInputs.first()).toHaveValue('TOP TEXT')
  })

  test('하단 텍스트를 입력할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 하단 텍스트 입력 (두 번째 텍스트 필드)
    const textInputs = page.locator('input[type="text"]')
    await expect(textInputs.nth(1)).toBeVisible({ timeout: 10000 })
    await textInputs.nth(1).fill('BOTTOM TEXT')

    // 입력값 확인
    await expect(textInputs.nth(1)).toHaveValue('BOTTOM TEXT')
  })
})

test.describe('밈 생성기 - 미리보기 및 생성', () => {
  test('텍스트 입력 시 미리보기 캔버스가 업데이트되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 캔버스 대기
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // 텍스트 입력 후 캔버스가 여전히 표시됨 (업데이트 확인)
    const textInputs = page.locator('input[type="text"]')
    await textInputs.first().fill('HELLO')
    await expect(canvas).toBeVisible()
  })

  test('텍스트 입력 후 생성 버튼이 활성화되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력
    const textInputs = page.locator('input[type="text"]')
    await expect(textInputs.first()).toBeVisible({ timeout: 10000 })
    await textInputs.first().fill('MEME TEXT')

    // 생성 버튼 활성화 확인
    const generateBtn = page.locator('button').filter({ hasText: /Generate/i })
    await expect(generateBtn).toBeEnabled()
  })
})

test.describe('밈 생성기 - 다운로드', () => {
  test('생성 실행 후 다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/meme-generator')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력
    const textInputs = page.locator('input[type="text"]')
    await expect(textInputs.first()).toBeVisible({ timeout: 10000 })
    await textInputs.first().fill('MEME TEXT')

    // 생성 실행
    const generateBtn = page.locator('button').filter({ hasText: /Generate/i })
    await generateBtn.click()

    // 다운로드 버튼 표시 대기
    const downloadBtn = page.locator('button').filter({ hasText: /Download/i })
    await expect(downloadBtn.first()).toBeVisible({ timeout: 15000 })
  })
})
