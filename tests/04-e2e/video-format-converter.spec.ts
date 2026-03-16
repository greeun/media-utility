import { test, expect } from '@playwright/test'

/**
 * 비디오 포맷 변환기 E2E 테스트
 *
 * 페이지 로드, 파일 업로드 영역, 출력 포맷 선택 UI를 검증한다.
 * 비디오 변환은 FFmpeg WASM 기반으로 무거우므로 UI 인터랙션 위주로 테스트한다.
 */

test.describe('비디오 포맷 변환기 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('페이지 제목이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    // 페이지 제목 확인
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('비디오 포맷 변환기 - 파일 업로드 영역', () => {
  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })

  test('파일 입력이 비디오 타입을 허용해야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    const fileInput = page.locator('input[type="file"]').first()
    const acceptAttr = await fileInput.getAttribute('accept')
    expect(acceptAttr).toContain('video')
  })

  test('드래그 앤 드롭 영역이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    // 드래그 앤 드롭 안내 텍스트 확인
    const dropZone = page.locator('[class*="border-dashed"]')
    await expect(dropZone).toBeVisible()
  })

  test('지원 포맷 안내 텍스트가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    // 업로드 영역 내 포맷 안내 텍스트 확인 ("MP4, WebM, MOV, AVI")
    const uploadSection = page.locator('[class*="border-dashed"]').first()
    await expect(uploadSection).toBeVisible()
    // 업로드 영역 부모 내에서 포맷 텍스트 존재 확인
    const formatHint = page.locator('span', { hasText: 'MP4, WebM, MOV, AVI' })
    await expect(formatHint).toBeVisible()
  })
})

test.describe('비디오 포맷 변환기 - 출력 포맷 선택 UI', () => {
  // 실제 비디오 파일 없이는 포맷 선택 UI가 표시되지 않으므로
  // 파일 업로드 직전까지의 UI만 확인
  test('업로드 전에는 포맷 선택 UI가 숨겨져 있어야 함', async ({ page }) => {
    await page.goto('/en/video-format-converter')

    // 포맷 버튼(MP4, WebM 등)은 업로드 후에만 표시됨
    const formatButtons = page.locator('button').filter({ hasText: /^MP4$|^WebM$|^MOV$|^AVI$/ })
    await expect(formatButtons).toHaveCount(0)
  })
})
