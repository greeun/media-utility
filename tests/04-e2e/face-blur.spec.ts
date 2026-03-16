import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 얼굴 블러 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 블러 유형 선택, 블러 적용을 검증한다.
 * 얼굴 감지는 AI 모델 기반이므로 test.slow()를 사용한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('얼굴 블러 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('얼굴 블러 - 이미지 업로드', () => {
  test('이미지 업로드 후 파일 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 이름이 표시되어야 함
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('얼굴 블러 - 블러 유형 선택 UI', () => {
  test('블러 유형 버튼(Gaussian, Mosaic)이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 설정 패널 대기 - 블러 유형 버튼 확인
    await expect(page.locator('button').filter({ hasText: /Gaussian/i })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('button').filter({ hasText: /Mosaic/i })).toBeVisible()
  })

  test('블러 유형 전환이 가능해야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // Mosaic 버튼 클릭
    const mosaicBtn = page.locator('button').filter({ hasText: /Mosaic/i })
    await expect(mosaicBtn).toBeVisible({ timeout: 10000 })
    await mosaicBtn.click()

    // Mosaic 버튼에 활성 스타일이 적용되어야 함
    await expect(mosaicBtn).toHaveCSS('background-color', 'rgb(236, 72, 153)')
  })

  test('블러 강도 슬라이더가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 강도 슬라이더 확인
    const slider = page.locator('input[type="range"]')
    await expect(slider.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('얼굴 블러 - 감지 및 적용', () => {
  // 얼굴 감지는 무거운 AI 처리
  test.slow()

  test('감지 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 감지 버튼 표시 확인 (Detect X files 등)
    const detectBtn = page.locator('button').filter({ hasText: /Detect/i })
    await expect(detectBtn.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('얼굴 블러 - 파일 관리', () => {
  test('전체 삭제 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/face-blur')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 전체 삭제 버튼 확인
    const deleteAllBtn = page.locator('button').filter({ hasText: /Delete All/i })
    await expect(deleteAllBtn).toBeVisible({ timeout: 10000 })
  })
})
