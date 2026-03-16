import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 이미지 업스케일러 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 배율 선택, 업스케일 실행을 검증한다.
 * 업스케일은 WASM 기반으로 무거우므로 test.slow()를 사용한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('이미지 업스케일러 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('이미지 업스케일러 - 이미지 업로드 및 설정', () => {
  test('이미지 업로드 후 배율 선택 UI가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 배율 버튼들이 표시되어야 함 (2x, 3x, 4x)
    await expect(page.locator('button').filter({ hasText: '2x' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button').filter({ hasText: '3x' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: '4x' })).toBeVisible()
  })

  test('이미지 업로드 후 출력 형식 선택 UI가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 포맷 버튼들이 표시되어야 함 (png, jpg, webp)
    await expect(page.locator('button').filter({ hasText: 'png' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button').filter({ hasText: 'jpg' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'webp' })).toBeVisible()
  })

  test('배율 변경 시 버튼 활성 상태가 전환되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 기본 2x가 활성 → 4x 클릭
    const btn4x = page.locator('button').filter({ hasText: '4x' })
    await expect(btn4x).toBeVisible({ timeout: 10000 })
    await btn4x.click()

    // 4x 버튼의 배경색이 활성 상태 스타일을 가져야 함
    // (활성 버튼에는 backgroundColor가 inline으로 지정됨)
    await expect(btn4x).toHaveCSS('background-color', 'rgb(6, 182, 212)')
  })
})

test.describe('이미지 업스케일러 - 업스케일 실행', () => {
  // 업스케일은 무거운 연산이므로 타임아웃 확장
  test.slow()

  test('업스케일 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 업스케일 버튼이 표시되어야 함
    const upscaleBtn = page.locator('button').filter({ hasText: /Upscale|upscale/ })
    await expect(upscaleBtn.first()).toBeVisible({ timeout: 10000 })
  })

  test('파일 목록에 파일이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-upscaler')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 이름이 표시되어야 함
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })
  })
})
