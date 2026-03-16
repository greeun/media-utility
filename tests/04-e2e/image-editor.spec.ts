import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * 이미지 편집기 E2E 테스트
 *
 * 페이지 로드, 이미지 업로드, 편집 도구 인터랙션을 검증한다.
 */

// 테스트용 이미지 경로
const TEST_IMAGE_PATH = path.join(__dirname, '../fixtures/test-image.png')

/**
 * 테스트 이미지 업로드 헬퍼
 */
async function uploadTestImage(page: import('@playwright/test').Page) {
  await page.goto('/en/image-editor')
  const fileInput = page.locator('input[type="file"]').first()
  await fileInput.setInputFiles(TEST_IMAGE_PATH)
  // 이미지 미리보기가 로드될 때까지 대기
  await expect(page.locator('img[alt="Edit preview"]')).toBeVisible({ timeout: 10000 })
}

test.describe('이미지 편집기 - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/image-editor')

    // 업로드 영역이 표시되어야 함
    const uploadArea = page.locator('[class*="border-dashed"]')
    await expect(uploadArea).toBeVisible()
  })

  test('파일 입력 요소가 존재해야 함', async ({ page }) => {
    await page.goto('/en/image-editor')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput.first()).toBeAttached()
  })
})

test.describe('이미지 편집기 - 이미지 업로드 후 편집 도구', () => {
  test('이미지 업로드 후 툴바가 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 툴바 버튼들이 표시되어야 함
    await expect(page.locator('button').filter({ hasText: 'Crop' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Left 90' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Right 90' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Horizontal' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Vertical' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Resize' })).toBeVisible()
    await expect(page.locator('button').filter({ hasText: 'Brightness' })).toBeVisible()
  })

  test('다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    const downloadBtn = page.locator('button').filter({ hasText: 'Download' })
    await expect(downloadBtn).toBeVisible()
  })
})

test.describe('이미지 편집기 - 회전', () => {
  test('왼쪽 회전 버튼 클릭 시 처리되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    const rotateLeftBtn = page.locator('button').filter({ hasText: 'Left 90' })
    await rotateLeftBtn.click()

    // 편집 결과 크기가 표시되어야 함 (편집 완료 확인)
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  test('오른쪽 회전 버튼 클릭 시 처리되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    const rotateRightBtn = page.locator('button').filter({ hasText: 'Right 90' })
    await rotateRightBtn.click()

    // 편집 결과 크기가 표시되어야 함
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('이미지 편집기 - 뒤집기', () => {
  test('수평 뒤집기 버튼 클릭 시 처리되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    const flipHBtn = page.locator('button').filter({ hasText: 'Horizontal' })
    await flipHBtn.click()

    // 편집 결과 크기가 표시되어야 함
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  test('수직 뒤집기 버튼 클릭 시 처리되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    const flipVBtn = page.locator('button').filter({ hasText: 'Vertical' })
    await flipVBtn.click()

    // 편집 결과 크기가 표시되어야 함
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('이미지 편집기 - 자르기', () => {
  test('자르기 모드 진입 시 자르기 패널이 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 자르기 버튼 클릭
    const cropBtn = page.locator('button').filter({ hasText: 'Crop' })
    await cropBtn.click()

    // 자르기 적용 버튼이 표시되어야 함
    const applyCropBtn = page.locator('button').filter({ hasText: 'Apply Crop' })
    await expect(applyCropBtn).toBeVisible()
  })

  test('자르기 모드 토글: 다시 클릭하면 패널이 닫혀야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 자르기 모드 진입
    const cropBtn = page.locator('button').filter({ hasText: 'Crop' }).first()
    await cropBtn.click()

    const applyCropBtn = page.locator('button').filter({ hasText: 'Apply Crop' })
    await expect(applyCropBtn).toBeVisible()

    // 다시 클릭하면 패널 닫힘 (Apply Crop이 아닌 Crop 툴바 버튼 클릭)
    // Apply Crop 버튼이 있는 상태에서 첫 번째 Crop 버튼(툴바)을 클릭
    await cropBtn.click()
    await expect(applyCropBtn).not.toBeVisible()
  })
})

test.describe('이미지 편집기 - 밝기 조절', () => {
  test('밝기 패널 열기 시 슬라이더가 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 밝기 버튼 클릭
    const brightnessBtn = page.locator('button').filter({ hasText: 'Brightness' })
    await brightnessBtn.click()

    // 밝기 슬라이더와 휘도 슬라이더 (2개)
    const sliders = page.locator('input[type="range"]')
    await expect(sliders).toHaveCount(4)
  })

  test('밝기 슬라이더 조작 후 적용 버튼이 활성화되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 밝기 패널 열기
    await page.locator('button').filter({ hasText: 'Brightness' }).click()

    const sliders = page.locator('input[type="range"]')
    const applyBtn = page.locator('button').filter({ hasText: 'Apply' })

    // 초기: 둘 다 0이면 비활성
    await expect(applyBtn).toBeDisabled()

    // 밝기 슬라이더를 30으로 변경
    await sliders.nth(0).fill('30')

    // 적용 버튼 활성화
    await expect(applyBtn).toBeEnabled()
  })

  test('밝기 적용 시 결과가 반영되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 밝기 패널 열기
    await page.locator('button').filter({ hasText: 'Brightness' }).click()

    // 밝기 +50 설정 후 적용
    await page.locator('input[type="range"]').nth(0).fill('50')
    await page.locator('button').filter({ hasText: 'Apply' }).click()

    // 편집 결과 크기가 표시되어야 함
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('이미지 편집기 - 리사이즈', () => {
  test('리사이즈 모드 진입 시 너비/높이 입력이 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 리사이즈 버튼 클릭
    await page.locator('button').filter({ hasText: 'Resize' }).click()

    // 너비, 높이 입력 필드가 표시되어야 함
    const numberInputs = page.locator('input[type="number"]')
    const inputCount = await numberInputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(2)

    // 비율 유지 체크박스가 표시되어야 함
    const keepRatioCheckbox = page.locator('input[type="checkbox"]')
    await expect(keepRatioCheckbox).toBeVisible()
  })
})

test.describe('이미지 편집기 - 다운로드 및 연속 편집', () => {
  test('편집 후 다운로드 버튼이 계속 표시되어야 함', async ({ page }) => {
    await uploadTestImage(page)

    // 회전 실행
    await page.locator('button').filter({ hasText: 'Right 90' }).click()
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })

    // 다운로드 버튼 표시 확인
    const downloadBtn = page.locator('button').filter({ hasText: 'Download' })
    await expect(downloadBtn).toBeVisible()
  })

  test('연속 편집: 회전 → 밝기 → 다운로드 버튼 활성', async ({ page }) => {
    await uploadTestImage(page)

    // 1단계: 회전
    await page.locator('button').filter({ hasText: 'Right 90' }).click()
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })

    // 2단계: 밝기 조절
    await page.locator('button').filter({ hasText: 'Brightness' }).click()
    await page.locator('input[type="range"]').nth(0).fill('20')
    await page.locator('button').filter({ hasText: 'Apply' }).click()

    // 슬라이더 패널이 닫혀야 함
    await expect(page.locator('input[type="range"]').first()).not.toBeVisible({ timeout: 10000 })

    // 3단계: 다운로드 버튼 표시 확인
    const downloadBtn = page.locator('button').filter({ hasText: 'Download' })
    await expect(downloadBtn).toBeVisible()
  })
})
