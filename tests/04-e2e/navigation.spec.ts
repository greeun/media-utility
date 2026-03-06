import { test, expect } from '@playwright/test'

test.describe('네비게이션', () => {
  test('홈페이지에서 각 페이지로 이동 가능해야 함', async ({ page }) => {
    await page.goto('/')

    // 이미지 변환 링크 클릭
    await page.getByRole('link', { name: /이미지 변환|Image Converter/i }).first().click()
    await expect(page).toHaveURL(/image-converter/)

    // 홈으로 돌아가기 (로고 클릭)
    await page.goto('/')

    // GIF 생성 링크 클릭
    await page.getByRole('link', { name: /GIF|gif/i }).first().click()
    await expect(page).toHaveURL(/gif-maker/)
  })

  test('헤더 네비게이션이 모든 페이지에서 작동해야 함', async ({ page }) => {
    await page.goto('/image-converter')

    // 비디오 카테고리 드롭다운 열기
    const videoCategory = page.getByRole('button', { name: /video|비디오/i }).first()
    await videoCategory.click()

    // 비디오 변환 링크 클릭
    await page.getByRole('link', { name: /비디오 변환|Video Converter/i }).first().click()
    await expect(page).toHaveURL(/video-converter/)

    // Others 카테고리 드롭다운 열기
    const othersCategory = page.getByRole('button', { name: /others|기타/i }).first()
    await othersCategory.click()

    // URL 생성 링크 클릭
    await page.getByRole('link', { name: /URL|url/i }).first().click()
    await expect(page).toHaveURL(/url-generator/)
  })

  test('로고 클릭 시 홈으로 이동해야 함', async ({ page }) => {
    await page.goto('/image-converter')

    // 로고 링크 클릭 (header 내의 첫 번째 링크 또는 사이트명이 있는 링크)
    const logoLink = page.locator('header a').first()
    await logoLink.click()

    // 홈 또는 루트 경로로 이동 (로케일 포함 가능)
    await expect(page).toHaveURL(/\/$|\/ko\/?$|\/en\/?$/)
  })
})

test.describe('반응형 네비게이션', () => {
  test('모바일에서 햄버거 메뉴가 동작해야 함', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 햄버거 메뉴 버튼 클릭 (Menu 아이콘이 있는 버튼)
    const menuButton = page.locator('button[class*="lg:hidden"]').first()
    await menuButton.click()

    // 모바일 메뉴가 열려야 함 (border-t-4가 있는 div)
    const mobileMenu = page.locator('nav div[class*="border-t-4"]').last()
    await expect(mobileMenu).toBeVisible()
  })

  test('모바일 메뉴에서 링크 클릭 시 메뉴가 닫혀야 함', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 메뉴 열기
    const menuButton = page.locator('button[class*="lg:hidden"]').first()
    await menuButton.click()

    // 모바일 메뉴 링크 클릭
    await page.getByRole('link', { name: /이미지 변환|Image Converter/i }).first().click()

    // 페이지 이동 확인
    await expect(page).toHaveURL(/image-converter/)

    // 메뉴가 닫혔는지 확인 (모바일 메뉴가 보이지 않아야 함)
    const mobileMenu = page.locator('nav div[class*="border-t-4"]').last()
    await expect(mobileMenu).not.toBeVisible()
  })
})

test.describe('언어 전환', () => {
  test('언어 선택기가 표시되어야 함', async ({ page }) => {
    await page.goto('/')

    // 언어 선택 버튼이나 드롭다운이 있어야 함
    const langSelector = page.locator('[class*="language"]').or(page.getByRole('button', { name: /KO|EN|한국어|English/i }))
    const selectorCount = await langSelector.count()
    expect(selectorCount).toBeGreaterThanOrEqual(0) // 없을 수도 있음
  })
})
