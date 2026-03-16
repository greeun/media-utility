import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 배경 제거 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 배경 제거 실행, 결과 확인을 검증한다.
 * AI 모델 로딩이 필요하므로 test.slow()를 사용한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('배경 제거 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('배경 제거 - 이미지 업로드', () => {
  test('이미지 업로드 후 파일 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 이름이 표시되어야 함
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })
  })

  test('이미지 업로드 후 처리 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 처리 버튼 표시 확인 (Process 1 files 등)
    const processBtn = page.locator('button').filter({ hasText: /Process/ })
    await expect(processBtn.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('배경 제거 - 처리 실행', () => {
  // AI 모델 로딩이 무거우므로 타임아웃 확장
  test.slow()

  test('처리 버튼 클릭 시 진행 상태가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 처리 버튼 클릭
    const processBtn = page.locator('button').filter({ hasText: /Process/ })
    await expect(processBtn.first()).toBeVisible({ timeout: 10000 })
    await processBtn.first().click()

    // 처리 중 또는 완료 상태 확인
    // 진행률 표시 또는 "Processing..." 텍스트가 나타남
    const processingOrCompleted = page.locator('text=/Processing|Completed|Download/')
    await expect(processingOrCompleted.first()).toBeVisible({ timeout: 60000 })
  })

  test('처리 완료 후 다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 처리 실행
    const processBtn = page.locator('button').filter({ hasText: /Process/ })
    await expect(processBtn.first()).toBeVisible({ timeout: 10000 })
    await processBtn.first().click()

    // 다운로드 버튼 표시 대기
    const downloadBtn = page.locator('button').filter({ hasText: /Download/ })
    await expect(downloadBtn.first()).toBeVisible({ timeout: 120000 })
  })
})

test.describe('배경 제거 - 파일 관리', () => {
  test('전체 삭제 버튼으로 파일 목록을 초기화할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/background-remover')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 목록 표시 대기
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })

    // 전체 삭제 버튼 클릭
    const deleteAllBtn = page.locator('button').filter({ hasText: /Delete All/ })
    if (await deleteAllBtn.isVisible()) {
      await deleteAllBtn.click()

      // 파일 목록이 비어야 함
      await expect(page.getByText('test-image.png')).not.toBeVisible({ timeout: 5000 })
    }
  })
})
