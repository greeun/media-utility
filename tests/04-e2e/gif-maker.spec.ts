import { test, expect } from '@playwright/test'

test.describe('GIF 생성 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gif-maker')
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

  test('다중 파일 선택이 가능해야 함', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('multiple', '')
  })
})

test.describe('GIF 생성 옵션', () => {
  test('프레임 딜레이 설정이 가능해야 함', async ({ page }) => {
    await page.goto('/gif-maker')

    // 슬라이더 또는 입력 필드가 있어야 함
    const delayInput = page.locator('input[type="range"]').or(page.locator('input[type="number"]'))
    const inputCount = await delayInput.count()
    expect(inputCount).toBeGreaterThan(0)
  })
})
