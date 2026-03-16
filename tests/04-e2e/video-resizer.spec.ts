import { test, expect } from '@playwright/test'

/**
 * 비디오 리사이저 E2E 테스트
 *
 * 페이지 로드, 파일 업로드 영역, 해상도 선택 UI를 검증한다.
 * 비디오 리사이즈는 FFmpeg WASM 기반으로 무거우므로 UI 인터랙션 위주로 테스트한다.
 */

test.describe('비디오 리사이저 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('페이지 제목이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    // 페이지 제목 확인
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('비디오 리사이저 - 파일 업로드 영역', () => {
  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })

  test('파일 입력이 비디오 타입을 허용해야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    const fileInput = page.locator('input[type="file"]').first()
    const acceptAttr = await fileInput.getAttribute('accept')
    expect(acceptAttr).toContain('video')
  })

  test('드래그 앤 드롭 영역이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    const dropZone = page.locator('[class*="border-dashed"]')
    await expect(dropZone).toBeVisible()
  })

  test('지원 포맷 안내 텍스트가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    // MP4, WebM, MOV, AVI 포맷 안내
    await expect(page.getByText(/MP4.*WebM.*MOV.*AVI/)).toBeVisible()
  })
})

test.describe('비디오 리사이저 - 해상도 선택 UI', () => {
  // 실제 비디오 파일 없이는 해상도 선택 UI가 표시되지 않으므로
  // 업로드 전까지의 UI만 확인
  test('업로드 전에는 프리셋 선택 UI가 숨겨져 있어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    // 프리셋 버튼(4K, 1080p 등)은 업로드 후에만 표시됨
    const presetButtons = page.locator('button').filter({ hasText: /4K|1080p|720p|480p/ })
    await expect(presetButtons).toHaveCount(0)
  })

  test('업로드 전에는 너비/높이 입력이 숨겨져 있어야 함', async ({ page }) => {
    await page.goto('/en/video-resizer')

    // 사이즈 입력은 업로드 후에만 표시됨
    const numberInputs = page.locator('input[type="number"]')
    await expect(numberInputs).toHaveCount(0)
  })
})
