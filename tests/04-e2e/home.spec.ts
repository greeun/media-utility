import { test, expect } from '@playwright/test'

test.describe('홈페이지', () => {
  test('홈페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/')

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Media Utility/)
  })

  test('메인 네비게이션이 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    // 헤더 존재 확인
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('푸터가 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    // 푸터 존재 확인
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})

test.describe('이미지 변환 페이지', () => {
  test('이미지 변환 페이지로 이동 가능해야 함', async ({ page }) => {
    await page.goto('/image-converter')

    // 파일 업로더 컴포넌트가 있어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })
})

test.describe('GIF 생성 페이지', () => {
  test('GIF 메이커 페이지로 이동 가능해야 함', async ({ page }) => {
    await page.goto('/gif-maker')

    // 파일 업로더 컴포넌트가 있어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })
})

test.describe('비디오 변환 페이지', () => {
  test('비디오 변환 페이지로 이동 가능해야 함', async ({ page }) => {
    await page.goto('/video-converter')

    // 파일 업로더 컴포넌트가 있어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })
})
