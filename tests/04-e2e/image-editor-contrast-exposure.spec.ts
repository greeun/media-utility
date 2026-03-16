import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 이미지 편집기 - 대비(Contrast)·노출(Exposure) E2E 테스트
 *
 * TC-E2E-CE-001 ~ TC-E2E-CE-007 구현
 */

const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('이미지 편집기 - 대비·노출 조절', () => {
  async function uploadTestImage(page: import('@playwright/test').Page) {
    await page.goto('/ko/image-editor')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)
    await expect(page.locator('img[alt="Edit preview"]')).toBeVisible({ timeout: 15000 })
  }

  async function openBrightnessPanel(page: import('@playwright/test').Page) {
    const brightnessBtn = page.locator('button').filter({ hasText: '밝기' })
    await brightnessBtn.click()
  }

  // =================================================================
  // TC-E2E-CE-001: 명도 패널에 슬라이더 4개 표시
  // =================================================================
  test('TC-E2E-CE-001: 명도 패널에 슬라이더 4개가 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    await expect(sliders).toHaveCount(4)

    // label 요소 내에서만 검색 (페이지 설명 텍스트와 구분)
    await expect(page.locator('label').filter({ hasText: '밝기 조절:' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: '휘도 조절:' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: '대비 조절:' })).toBeVisible()
    await expect(page.locator('label').filter({ hasText: '노출 조절:' })).toBeVisible()
  })

  // =================================================================
  // TC-E2E-CE-002: 대비 슬라이더 UI 조작 및 적용
  // =================================================================
  test('TC-E2E-CE-002: 대비 슬라이더 조작 후 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    const contrastSlider = sliders.nth(2)
    await contrastSlider.fill('60')

    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await expect(applyBtn).toBeEnabled()

    await applyBtn.click()

    await expect(sliders.first()).not.toBeVisible({ timeout: 10000 })
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  // =================================================================
  // TC-E2E-CE-003: 노출 슬라이더 UI 조작 및 적용
  // =================================================================
  test('TC-E2E-CE-003: 노출 슬라이더 조작 후 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    const exposureSlider = sliders.nth(3)
    await exposureSlider.fill('-30')

    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await expect(applyBtn).toBeEnabled()

    await applyBtn.click()

    await expect(sliders.first()).not.toBeVisible({ timeout: 10000 })
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  // =================================================================
  // TC-E2E-CE-004: 4개 모두 0이면 적용 버튼 비활성
  // =================================================================
  test('TC-E2E-CE-004: 4개 슬라이더 모두 0이면 적용 버튼 비활성', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    const applyBtn = page.locator('button').filter({ hasText: '적용' })

    // 초기 상태: 모두 0 → 비활성
    await expect(applyBtn).toBeDisabled()

    // 대비만 +20 → 활성
    await sliders.nth(2).fill('20')
    await expect(applyBtn).toBeEnabled()

    // 대비 0으로 복귀 → 비활성
    await sliders.nth(2).fill('0')
    await expect(applyBtn).toBeDisabled()

    // 노출만 -10 → 활성
    await sliders.nth(3).fill('-10')
    await expect(applyBtn).toBeEnabled()
  })

  // =================================================================
  // TC-E2E-CE-005: 초기화 버튼으로 4개 모두 리셋
  // =================================================================
  test('TC-E2E-CE-005: 초기화 시 4개 슬라이더 모두 0으로 리셋', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')

    await sliders.nth(0).fill('30')
    await sliders.nth(1).fill('-20')
    await sliders.nth(2).fill('50')
    await sliders.nth(3).fill('-40')

    const resetBtn = page.locator('button').filter({ hasText: '초기화' })
    await resetBtn.click()

    await expect(sliders.nth(0)).toHaveValue('0')
    await expect(sliders.nth(1)).toHaveValue('0')
    await expect(sliders.nth(2)).toHaveValue('0')
    await expect(sliders.nth(3)).toHaveValue('0')

    await expect(page.locator('button').filter({ hasText: '적용' })).toBeDisabled()
  })

  // =================================================================
  // TC-E2E-CE-006: CSS 필터 미리보기에 contrast 반영
  // =================================================================
  test('TC-E2E-CE-006: CSS 필터 미리보기에 contrast가 포함되어야 함', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const img = page.locator('img[alt="Edit preview"]')
    const sliders = page.locator('input[type="range"]')

    // 초기: 필터 없음
    const initialStyle = await img.getAttribute('style')
    expect(initialStyle ?? '').not.toContain('filter')

    // 대비만 +50 → filter에 contrast 포함
    await sliders.nth(2).fill('50')
    const styleWithContrast = await img.getAttribute('style')
    expect(styleWithContrast).toContain('filter')
    expect(styleWithContrast).toContain('contrast')

    // 대비 0, 노출 +30 → filter에 brightness 포함
    await sliders.nth(2).fill('0')
    await sliders.nth(3).fill('30')
    const styleWithExposure = await img.getAttribute('style')
    expect(styleWithExposure).toContain('filter')
    expect(styleWithExposure).toContain('brightness')

    // 모두 0 → 필터 없음
    await sliders.nth(3).fill('0')
    const styleReset = await img.getAttribute('style')
    expect(styleReset ?? '').not.toContain('filter')
  })

  // =================================================================
  // TC-E2E-CE-007: 대비/노출 적용 후 연속 편집 가능
  // =================================================================
  test('TC-E2E-CE-007: 대비/노출 적용 후 연속 편집 가능', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    await sliders.nth(2).fill('40')
    await sliders.nth(3).fill('-20')
    await page.locator('button').filter({ hasText: '적용' }).click()

    await expect(sliders.first()).not.toBeVisible({ timeout: 15000 })

    const rotateBtn = page.locator('button').filter({ hasText: '왼쪽 90°' })
    await expect(rotateBtn).toBeVisible({ timeout: 10000 })
    await rotateBtn.click()

    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 15000 })
  })
})
