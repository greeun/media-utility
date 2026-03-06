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

    // 파일 업로드 (URL 타입 선택이 표시되려면 파일이 필요)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    })

    // 파일 업로드 후 URL 타입 선택 섹션이 나타날 때까지 대기
    await page.waitForSelector('button:has-text("Cloud Storage"), button:has-text("r2"), button:has-text("클라우드")', { timeout: 5000 }).catch(() => {})

    // Cloud Storage 타입 선택 버튼 클릭 (R2)
    const r2Button = page.locator('button').filter({ hasText: /cloud|storage|r2|클라우드/i }).first()
    await r2Button.click({ timeout: 5000 })

    // 만료 기간 버튼들이 표시되어야 함 (7일, 30일, 90일, 영구)
    await page.waitForSelector('button:has-text("일"), button:has-text("day"), button:has-text("week"), button:has-text("permanent"), button:has-text("영구")', { timeout: 5000 })
    const expiryButtons = page.locator('button').filter({ hasText: /일|day|week|permanent|영구/i })
    const buttonCount = await expiryButtons.count()
    expect(buttonCount).toBeGreaterThanOrEqual(4)
  })
})
