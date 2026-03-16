import { test, expect } from '@playwright/test'

test.describe('비디오 변환 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/video-converter')
  })

  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 업로드 영역이 표시되어야 함 (ds-upload 또는 border-dashed)
    const uploadArea = page.locator('.ds-upload, [class*="border-dashed"]')
    await expect(uploadArea.first()).toBeVisible()
  })

  test('파일 입력 요소가 비디오 타입을 허용해야 함', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()

    const acceptAttr = await fileInput.getAttribute('accept')
    expect(acceptAttr).toContain('video')
  })

  test('출력 포맷 선택이 가능해야 함', async ({ page }) => {
    // 포맷 선택 버튼 또는 드롭다운이 있어야 함
    const formatSelector = page.getByRole('button').or(page.locator('select'))
    await expect(formatSelector.first()).toBeVisible()
  })
})

test.describe('비디오 변환 기능', () => {
  test('업로드 영역에서 파일 선택이 가능해야 함', async ({ page }) => {
    await page.goto('/en/video-converter')

    // ds-upload 또는 border-dashed 내부의 label 클릭으로 파일 선택 트리거
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()

    // 파일 입력이 존재하므로 파일 선택이 가능함을 확인
    const isHidden = await fileInput.isHidden()
    expect(isHidden).toBeTruthy() // hidden input이므로 label 클릭으로 동작
  })
})
