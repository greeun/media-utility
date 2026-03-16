import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 워터마크 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 텍스트 워터마크 입력,
 * 위치/불투명도/회전 옵션, 적용, 다운로드를 검증한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('워터마크 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('워터마크 - 이미지 업로드', () => {
  test('이미지 업로드 후 설정 패널이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트/이미지 워터마크 타입 선택 버튼이 표시되어야 함
    await expect(page.locator('button').filter({ hasText: /Text/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('이미지 업로드 후 파일 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 이름이 표시되어야 함
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('워터마크 - 텍스트 워터마크 입력', () => {
  test('텍스트 입력 필드가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력 필드 확인
    const textInput = page.locator('input[type="text"]')
    await expect(textInput.first()).toBeVisible({ timeout: 10000 })
  })

  test('워터마크 텍스트를 입력할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력
    const textInput = page.locator('input[type="text"]')
    await expect(textInput.first()).toBeVisible({ timeout: 10000 })
    await textInput.first().fill('Sample Watermark')

    await expect(textInput.first()).toHaveValue('Sample Watermark')
  })
})

test.describe('워터마크 - 옵션 설정', () => {
  test('위치 선택 그리드가 표시되어야 함 (3x3)', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 위치 선택 버튼들이 표시되어야 함 (3x3 그리드 = 9개 위치 버튼)
    // 위치 버튼들은 w-12 h-12 클래스를 가짐
    const positionButtons = page.locator('button.w-12.h-12')
    await expect(positionButtons.first()).toBeVisible({ timeout: 10000 })
    const count = await positionButtons.count()
    expect(count).toBe(9)
  })

  test('불투명도 슬라이더가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 슬라이더들이 표시되어야 함 (폰트 크기, 회전, 불투명도 등)
    const sliders = page.locator('input[type="range"]')
    await expect(sliders.first()).toBeVisible({ timeout: 10000 })
    const sliderCount = await sliders.count()
    expect(sliderCount).toBeGreaterThanOrEqual(3) // fontSize, rotation, opacity
  })

  test('색상 선택기가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 색상 입력 확인
    const colorInput = page.locator('input[type="color"]')
    await expect(colorInput.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('워터마크 - 적용 및 다운로드', () => {
  test('텍스트 입력 후 적용 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력
    const textInput = page.locator('input[type="text"]')
    await expect(textInput.first()).toBeVisible({ timeout: 10000 })
    await textInput.first().fill('Watermark')

    // 적용 버튼 표시 확인 (Apply X files 등)
    const applyBtn = page.locator('button').filter({ hasText: /Apply/i })
    await expect(applyBtn.first()).toBeVisible()
  })

  test('적용 후 다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 텍스트 입력
    const textInput = page.locator('input[type="text"]')
    await expect(textInput.first()).toBeVisible({ timeout: 10000 })
    await textInput.first().fill('Watermark')

    // 적용 버튼 클릭
    const applyBtn = page.locator('button').filter({ hasText: /Apply/i })
    await applyBtn.first().click()

    // 다운로드 버튼 표시 대기
    const downloadBtn = page.locator('button').filter({ hasText: /Download/i })
    await expect(downloadBtn.first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe('워터마크 - 미리보기', () => {
  test('이미지 업로드 후 미리보기 캔버스가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/watermark')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 미리보기 캔버스 확인
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible({ timeout: 10000 })
  })
})
