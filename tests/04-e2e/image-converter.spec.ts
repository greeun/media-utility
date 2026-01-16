import { test, expect } from '@playwright/test'

test.describe('이미지 변환 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-converter')
  })

  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 파일 업로더가 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
  })

  test('드래그 앤 드롭 영역이 표시되어야 함', async ({ page }) => {
    const dropZone = page.locator('[class*="border-dashed"]')
    await expect(dropZone).toBeVisible()
  })

  test('포맷 선택 옵션이 있어야 함', async ({ page }) => {
    // 변환 포맷 선택 영역 확인 (페이지 구조에 따라 조정 필요)
    const formatOptions = page.getByRole('button').or(page.locator('select'))
    await expect(formatOptions.first()).toBeVisible()
  })
})

test.describe('이미지 변환 상호작용', () => {
  test('업로드 영역 클릭 시 파일 선택 다이얼로그가 열려야 함', async ({ page }) => {
    await page.goto('/image-converter')

    // 파일 선택 이벤트 리스너 설정
    const fileChooserPromise = page.waitForEvent('filechooser')

    // 업로드 영역 클릭
    await page.locator('[class*="border-dashed"]').click()

    // 파일 선택 다이얼로그가 열림
    const fileChooser = await fileChooserPromise
    expect(fileChooser).toBeTruthy()
  })
})
