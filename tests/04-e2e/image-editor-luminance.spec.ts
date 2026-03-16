import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 이미지 편집기 - 밝기·휘도(Luminance) E2E 테스트
 *
 * TC-E2E-001 ~ TC-E2E-007 구현
 */

// 테스트용 이미지 경로 (1x1 px PNG)
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

test.describe('이미지 편집기 - 휘도 조절', () => {
  /**
   * 테스트 이미지 업로드 헬퍼
   */
  async function uploadTestImage(page: ReturnType<typeof test['info']> extends never ? never : Awaited<ReturnType<typeof import('@playwright/test').Page['goto']>> extends never ? never : import('@playwright/test').Page) {
    await page.goto('/ko/image-editor')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(TEST_IMAGE_PATH)
    // 이미지 미리보기가 로드될 때까지 대기
    await expect(page.locator('img[alt="Edit preview"]')).toBeVisible({ timeout: 10000 })
  }

  /**
   * 밝기 패널 열기 헬퍼
   */
  async function openBrightnessPanel(page: import('@playwright/test').Page) {
    const brightnessBtn = page.locator('button').filter({ hasText: '밝기' })
    await brightnessBtn.click()
  }

  // =====================================================================
  // TC-E2E-001: 휘도 슬라이더 UI 조작 및 적용
  // =====================================================================
  test('TC-E2E-001: 휘도 슬라이더 UI 조작 및 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    // 밝기 패널이 표시되어야 함
    const panel = page.locator('div').filter({ has: page.locator('input[type="range"]') }).first()
    await expect(panel).toBeVisible()

    // 휘도 슬라이더 확인 (두 번째 range input)
    const sliders = page.locator('input[type="range"]')
    await expect(sliders).toHaveCount(4)

    // 휘도 라벨 확인
    await expect(page.getByText('휘도 조절')).toBeVisible()

    // 휘도 슬라이더를 50으로 조작
    const luminanceSlider = sliders.nth(1)
    await luminanceSlider.fill('50')

    // 값 표시 확인
    await expect(page.getByText('50').first()).toBeVisible()

    // 적용 버튼 클릭
    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await applyBtn.click()

    // 패널이 닫혀야 함 (밝기 패널의 슬라이더가 사라짐)
    await expect(sliders.first()).not.toBeVisible({ timeout: 10000 })
  })

  // =====================================================================
  // TC-E2E-002: 밝기 + 휘도 동시 조절 후 적용
  // =====================================================================
  test('TC-E2E-002: 밝기 + 휘도 동시 조절 후 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    const brightnessSlider = sliders.nth(0)
    const luminanceSlider = sliders.nth(1)

    // 밝기 +30
    await brightnessSlider.fill('30')

    // 휘도 -20
    await luminanceSlider.fill('-20')

    // 적용 버튼 활성화 확인
    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await expect(applyBtn).toBeEnabled()

    // 적용
    await applyBtn.click()

    // 편집 결과 크기 표시 확인
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  // =====================================================================
  // TC-E2E-003: 초기화 버튼으로 밝기·휘도 모두 리셋
  // =====================================================================
  test('TC-E2E-003: 초기화 버튼으로 밝기·휘도 모두 리셋', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')

    // 밝기 +50, 휘도 -30 설정
    await sliders.nth(0).fill('50')
    await sliders.nth(1).fill('-30')

    // 초기화 버튼 클릭
    const resetBtn = page.locator('button').filter({ hasText: '초기화' })
    await resetBtn.click()

    // 슬라이더 값이 0으로 리셋
    await expect(sliders.nth(0)).toHaveValue('0')
    await expect(sliders.nth(1)).toHaveValue('0')

    // 적용 버튼 비활성화
    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await expect(applyBtn).toBeDisabled()
  })

  // =====================================================================
  // TC-E2E-004: 적용 버튼 비활성 조건 — 둘 다 0
  // =====================================================================
  test('TC-E2E-004: 밝기·휘도 모두 0이면 적용 버튼 비활성', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    const applyBtn = page.locator('button').filter({ hasText: '적용' })

    // 초기 상태: 둘 다 0 → 비활성
    await expect(applyBtn).toBeDisabled()

    // 휘도만 +10 → 활성
    await sliders.nth(1).fill('10')
    await expect(applyBtn).toBeEnabled()

    // 휘도를 0으로 → 비활성
    await sliders.nth(1).fill('0')
    await expect(applyBtn).toBeDisabled()

    // 밝기만 -5 → 활성
    await sliders.nth(0).fill('-5')
    await expect(applyBtn).toBeEnabled()
  })

  // =====================================================================
  // TC-E2E-005: 휘도 적용 후 다른 편집 기능 연속 사용
  // =====================================================================
  test('TC-E2E-005: 휘도 적용 후 회전 등 연속 편집 가능', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    // 휘도 +40 적용
    const luminanceSlider = page.locator('input[type="range"]').nth(1)
    await luminanceSlider.fill('40')
    await page.locator('button').filter({ hasText: '적용' }).click()

    // 패널 닫힘 대기
    await expect(page.locator('input[type="range"]').first()).not.toBeVisible({ timeout: 10000 })

    // 회전 버튼 클릭 (한국어: "왼쪽 90°" 또는 "오른쪽 90°")
    const rotateBtn = page.locator('button').filter({ hasText: /90°/ }).first()
    await rotateBtn.click()

    // 편집 결과 크기가 여전히 표시됨 (이전 편집 유지)
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  // =====================================================================
  // TC-E2E-006: CSS 필터 미리보기 정확성
  // =====================================================================
  test('TC-E2E-006: CSS 필터 미리보기 적용 확인', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const img = page.locator('img[alt="Edit preview"]')
    const sliders = page.locator('input[type="range"]')

    // 초기: 필터 없음
    const initialStyle = await img.getAttribute('style')
    expect(initialStyle ?? '').not.toContain('filter')

    // 밝기 50 → 필터 적용됨
    await sliders.nth(0).fill('50')
    const style1 = await img.getAttribute('style')
    expect(style1).toContain('filter')
    expect(style1).toContain('brightness')

    // 밝기 0, 휘도 50 → 필터 적용됨
    await sliders.nth(0).fill('0')
    await sliders.nth(1).fill('50')
    const style2 = await img.getAttribute('style')
    expect(style2).toContain('filter')
    expect(style2).toContain('brightness')

    // 둘 다 0 → 필터 없음
    await sliders.nth(0).fill('0')
    await sliders.nth(1).fill('0')
    const style3 = await img.getAttribute('style')
    expect(style3 ?? '').not.toContain('filter')
  })

  // =====================================================================
  // TC-E2E-007: 파일 미업로드 상태에서 밝기 패널 미노출
  // =====================================================================
  test('TC-E2E-007: 파일 미업로드 시 툴바 미노출', async ({ page }) => {
    await page.goto('/ko/image-editor')

    // 업로드 영역만 표시
    await expect(page.locator('[class*="border-dashed"]')).toBeVisible()

    // 밝기 버튼 미노출
    const brightnessBtn = page.locator('button').filter({ hasText: '밝기' })
    await expect(brightnessBtn).not.toBeVisible()

    // 슬라이더 미노출
    const sliders = page.locator('input[type="range"]')
    await expect(sliders).toHaveCount(0)
  })
})
