import { test, expect } from '@playwright/test'

test.describe('URL 생성 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/url-generator')
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
})

test.describe('URL 생성 옵션', () => {
  test('만료 기간 설정이 가능해야 함', async ({ page }) => {
    await page.goto('/url-generator')

    // 만료 기간 선택 요소가 있어야 함
    const expiryInput = page
      .locator('input[type="number"]')
      .or(page.locator('select'))
      .or(page.getByRole('slider'))
    const inputCount = await expiryInput.count()
    expect(inputCount).toBeGreaterThan(0)
  })
})
