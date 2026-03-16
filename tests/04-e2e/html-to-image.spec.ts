import { test, expect } from '@playwright/test'

/**
 * HTML to Image E2E 테스트
 *
 * 페이지 로드, HTML 입력 영역, 출력 포맷 선택, 변환 실행, 다운로드를 검증한다.
 */

test.describe('HTML to Image - 페이지 로드', () => {
  test('페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // HTML 탭 버튼이 표시되어야 함
    await expect(page.locator('button').filter({ hasText: 'HTML' })).toBeVisible()
  })

  test('CSS 탭 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    await expect(page.locator('button').filter({ hasText: 'CSS' })).toBeVisible()
  })
})

test.describe('HTML to Image - HTML 입력 영역', () => {
  test('HTML 입력 텍스트 영역이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // textarea가 표시되어야 함
    const textarea = page.locator('textarea')
    await expect(textarea.first()).toBeVisible()
  })

  test('HTML 코드를 입력할 수 있어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()

    // 기본 HTML 내용을 지우고 새 내용 입력
    await textarea.clear()
    await textarea.fill('<h1>Hello World</h1>')

    await expect(textarea).toHaveValue('<h1>Hello World</h1>')
  })

  test('CSS 탭 전환 시 CSS 입력 영역이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // CSS 탭 클릭
    await page.locator('button').filter({ hasText: 'CSS' }).click()

    // textarea가 여전히 표시 (CSS 입력 영역)
    const textarea = page.locator('textarea')
    await expect(textarea.first()).toBeVisible()
  })
})

test.describe('HTML to Image - 출력 포맷 선택', () => {
  test('포맷 선택 드롭다운이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // select 요소가 표시되어야 함
    const formatSelect = page.locator('select')
    await expect(formatSelect.first()).toBeVisible()
  })

  test('너비/높이 입력 필드가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // number 입력이 있어야 함 (width, height, quality)
    const numberInputs = page.locator('input[type="number"]')
    const count = await numberInputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('배경색 선택기가 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // 색상 입력이 있어야 함
    const colorInput = page.locator('input[type="color"]')
    await expect(colorInput.first()).toBeVisible()
  })
})

test.describe('HTML to Image - 미리보기', () => {
  test('미리보기 iframe이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // iframe 미리보기 영역이 표시되어야 함
    const iframe = page.locator('iframe[title="HTML Preview"]')
    await expect(iframe).toBeVisible()
  })
})

test.describe('HTML to Image - 변환 실행', () => {
  test('변환 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // 변환 버튼이 표시되어야 함
    const convertBtn = page.locator('button').filter({ hasText: /Convert/i })
    await expect(convertBtn.first()).toBeVisible()
  })

  test('HTML 미입력 시 변환 버튼이 비활성화되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // HTML textarea 비우기
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible({ timeout: 10000 })
    await textarea.clear()
    await page.waitForTimeout(500)

    // 변환 버튼 비활성화 확인 (버튼 텍스트: "Convert to Image")
    const convertBtn = page.locator('button').filter({ hasText: /Convert/i })
    await expect(convertBtn.first()).toBeDisabled({ timeout: 10000 })
  })

  test('HTML 입력 후 변환 실행 시 다운로드 버튼이 표시되어야 함', async ({ page }) => {
    await page.goto('/en/html-to-image')

    // HTML 입력 (기본값 지우고 새 입력)
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.clear()
    await textarea.fill('<h1 style="color: red;">Test</h1>')

    // 변환 실행
    const convertBtn = page.locator('button').filter({ hasText: /Convert/i })
    await expect(convertBtn.first()).toBeEnabled({ timeout: 5000 })
    await convertBtn.first().click()

    // 다운로드 버튼 표시 대기 (Firefox에서는 시간이 더 걸릴 수 있음)
    const downloadBtn = page.locator('button').filter({ hasText: /Download/i })
    await expect(downloadBtn.first()).toBeVisible({ timeout: 30000 })
  })
})
