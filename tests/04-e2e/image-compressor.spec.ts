import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 이미지 압축기 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 품질 설정, 압축 실행, 결과 확인을 검증한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('이미지 압축기 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('이미지 압축기 - 이미지 업로드', () => {
  test('이미지 업로드 후 설정 패널이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    // 파일 업로드
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 설정 패널(품질 슬라이더)이 표시될 때까지 대기
    const slider = page.locator('input[type="range"]')
    await expect(slider.first()).toBeVisible({ timeout: 10000 })
  })

  test('이미지 업로드 후 파일 목록이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 파일 이름이 표시되어야 함
    await expect(page.getByText('test-image.png')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('이미지 압축기 - 품질 조절 UI', () => {
  test('품질 슬라이더를 조작할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 품질 슬라이더 대기
    const slider = page.locator('input[type="range"]').first()
    await expect(slider).toBeVisible({ timeout: 10000 })

    // 슬라이더 값 변경
    await slider.fill('50')
    await expect(slider).toHaveValue('50')
  })

  test('최대 크기 옵션 체크박스가 존재해야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 최대 크기 체크박스 확인
    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox.first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('이미지 압축기 - 압축 실행 및 결과', () => {
  test('압축 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 압축 버튼이 표시되어야 함 (Compress 1 files 등)
    const compressBtn = page.locator('button').filter({ hasText: /Compress|Convert/ })
    await expect(compressBtn.first()).toBeVisible({ timeout: 10000 })
  })

  test('압축 실행 후 원본 vs 압축 크기가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 압축 버튼 클릭
    const compressBtn = page.locator('button').filter({ hasText: /Compress|Convert/ })
    await expect(compressBtn.first()).toBeVisible({ timeout: 10000 })
    await compressBtn.first().click()

    // 결과 통계 표시 대기 (압축 완료 후 결과 영역 표시)
    await expect(page.getByText(/\d+%/).first()).toBeVisible({ timeout: 15000 })
  })

  test('압축 완료 후 다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/image-compressor')

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)

    // 압축 실행
    const compressBtn = page.locator('button').filter({ hasText: /Compress|Convert/ })
    await expect(compressBtn.first()).toBeVisible({ timeout: 10000 })
    await compressBtn.first().click()

    // 다운로드 버튼 표시 대기
    const downloadBtn = page.locator('button').filter({ hasText: /Download/ })
    await expect(downloadBtn.first()).toBeVisible({ timeout: 15000 })
  })
})
