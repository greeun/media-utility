# 대비/노출 기능 테스트 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이미지 에디터에 추가된 대비(Contrast)와 노출(Exposure) 기능에 대한 유닛 테스트 및 E2E 테스트 작성

**Architecture:** 기존 luminance 테스트 패턴(imageEditor.luminance.test.ts, image-editor-luminance.spec.ts)을 그대로 따라 대비/노출 전용 테스트 파일을 추가. 유닛 테스트는 Canvas 픽셀 데이터 직접 검증, E2E 테스트는 Playwright로 UI 인터랙션 검증.

**Tech Stack:** Jest 30 + jsdom, Playwright, TypeScript

---

## 파일 구조

| 동작 | 경로 | 역할 |
|------|------|------|
| Create | `tests/01-unit/services/imageEditor.contrast-exposure.test.ts` | 대비/노출 픽셀 처리 유닛 테스트 |
| Create | `tests/04-e2e/image-editor-contrast-exposure.spec.ts` | 대비/노출 UI E2E 테스트 |
| Modify | `tests/04-e2e/image-editor.spec.ts:135-146` | 기존 밝기 패널 슬라이더 개수 검증 업데이트 (2→4) |

---

## Chunk 1: 유닛 테스트

### Task 1: 대비/노출 유닛 테스트 작성

**Files:**
- Create: `tests/01-unit/services/imageEditor.contrast-exposure.test.ts`
- Reference: `tests/01-unit/services/imageEditor.luminance.test.ts` (패턴 참고)
- Reference: `src/services/imageEditor.ts:207-290` (구현 코드)

**테스트 케이스 설계:**

| ID | 테스트 | 검증 내용 |
|----|--------|----------|
| TC-UNIT-CE-001 | 대비만 적용 (양수) | RGB(100,100,100) + contrast=50 → 중간값(128) 기준으로 어두운 쪽은 더 어둡게, 밝은 쪽은 더 밝게 |
| TC-UNIT-CE-002 | 대비만 적용 (음수) | RGB(200,200,200) + contrast=-50 → 128에 가까워짐 |
| TC-UNIT-CE-003 | 노출만 적용 (양수) | RGB(100,100,100) + exposure=50 → 2^0.5 배율 적용 |
| TC-UNIT-CE-004 | 노출만 적용 (음수) | RGB(200,200,200) + exposure=-50 → 2^-0.5 배율 적용 |
| TC-UNIT-CE-005 | 4개 기능 동시 적용 | brightness + luminance + contrast + exposure 동시 적용 시 처리 순서 검증 |
| TC-UNIT-CE-006 | contrast=0, exposure=0 하위 호환성 | 기존 brightness+luminance 호출과 동일한 결과 |
| TC-UNIT-CE-007 | 경계값 테스트 | contrast/exposure 극단값(±100)에서 0~255 클램핑 |
| TC-UNIT-CE-008 | 알파 채널 보존 | 대비/노출 적용 시 알파 채널 변경 없음 |
| TC-UNIT-CE-009 | 11개 언어 번역 키 | contrastLabel, exposureLabel 키 존재 확인 |
| TC-UNIT-CE-010 | 에러 처리 | toBlob 실패 시 올바른 에러 메시지 |

- [ ] **Step 1: 테스트 파일 작성**

```typescript
/**
 * imageEditor 서비스 - 대비(Contrast)·노출(Exposure) 유닛 테스트
 *
 * TC-UNIT-CE-001 ~ TC-UNIT-CE-010 구현
 */
import { adjustBrightness } from '@/services/imageEditor';

jest.mock('@/services/imageConverter', () => ({
  loadImage: jest.fn(),
}));

import { loadImage } from '@/services/imageConverter';

describe('adjustBrightness - 대비·노출 기능', () => {
  const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });
  const mockImage = {
    width: 2,
    height: 1,
    naturalWidth: 2,
    naturalHeight: 1,
  } as HTMLImageElement;

  let mockCtx: Record<string, jest.Mock | boolean | string | Uint8ClampedArray>;
  let pixelData: Uint8ClampedArray;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  function createPixelData(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
    return new Uint8ClampedArray([r, g, b, a, r, g, b, a]);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    pixelData = createPixelData(128, 128, 128);

    mockCtx = {
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: pixelData,
        width: 2,
        height: 1,
      })),
      putImageData: jest.fn(),
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as never;

    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(mockBlob);
    }) as never;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  // =================================================================
  // TC-UNIT-CE-001: 대비만 적용 (양수) - 중간값 기준 확산
  // =================================================================
  describe('TC-UNIT-CE-001: 대비 양수 적용', () => {
    it('RGB(100,100,100)에 contrast=50 → 128보다 작으므로 더 어두워져야 함', async () => {
      pixelData = createPixelData(100, 100, 100);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 50, 0);

      // contrastFactor = (259*(50*2.55+255)) / (255*(259-50*2.55))
      // = (259*(127.5+255)) / (255*(259-127.5))
      // = (259*382.5) / (255*131.5)
      // = 99057.5 / 33532.5 ≈ 2.954
      // R' = 2.954*(100-128)+128 = 2.954*(-28)+128 = -82.71+128 = 45.29
      expect(pixelData[0]).toBeCloseTo(45, 0);
      expect(pixelData[0]).toBeLessThan(100); // 128 미만 → 더 어두워짐
    });

    it('RGB(200,200,200)에 contrast=50 → 128보다 크므로 더 밝아져야 함', async () => {
      pixelData = createPixelData(200, 200, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 50, 0);

      // R' = 2.954*(200-128)+128 = 2.954*72+128 = 212.7+128 = 340.7 → 255 (클램핑)
      expect(pixelData[0]).toBe(255);
    });
  });

  // =================================================================
  // TC-UNIT-CE-002: 대비 적용 (음수) - 중간값으로 수렴
  // =================================================================
  describe('TC-UNIT-CE-002: 대비 음수 적용', () => {
    it('RGB(200,200,200)에 contrast=-50 → 128에 가까워져야 함', async () => {
      pixelData = createPixelData(200, 200, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, -50, 0);

      // 음수 대비 → 128에 수렴
      expect(pixelData[0]).toBeGreaterThan(128);
      expect(pixelData[0]).toBeLessThan(200);
    });

    it('RGB(50,50,50)에 contrast=-50 → 128에 가까워져야 함', async () => {
      pixelData = createPixelData(50, 50, 50);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, -50, 0);

      expect(pixelData[0]).toBeGreaterThan(50);
      expect(pixelData[0]).toBeLessThan(128);
    });
  });

  // =================================================================
  // TC-UNIT-CE-003: 노출만 적용 (양수) - 2^(EV) 곱셈
  // =================================================================
  describe('TC-UNIT-CE-003: 노출 양수 적용', () => {
    it('RGB(100,100,100)에 exposure=100 → 2배로 밝아져야 함', async () => {
      pixelData = createPixelData(100, 100, 100);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 0, 100);

      // exposureMultiplier = 2^(100/100) = 2
      // R' = 100 * 2 = 200
      expect(pixelData[0]).toBe(200);
      expect(pixelData[1]).toBe(200);
      expect(pixelData[2]).toBe(200);
    });

    it('RGB(100,100,100)에 exposure=50 → √2배로 밝아져야 함', async () => {
      pixelData = createPixelData(100, 100, 100);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 0, 50);

      // exposureMultiplier = 2^0.5 ≈ 1.414
      // R' = 100 * 1.414 ≈ 141
      expect(pixelData[0]).toBeCloseTo(141, 0);
    });
  });

  // =================================================================
  // TC-UNIT-CE-004: 노출 적용 (음수) - 2^(-EV) 곱셈
  // =================================================================
  describe('TC-UNIT-CE-004: 노출 음수 적용', () => {
    it('RGB(200,200,200)에 exposure=-100 → 절반으로 어두워져야 함', async () => {
      pixelData = createPixelData(200, 200, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 0, -100);

      // exposureMultiplier = 2^(-1) = 0.5
      // R' = 200 * 0.5 = 100
      expect(pixelData[0]).toBe(100);
      expect(pixelData[1]).toBe(100);
      expect(pixelData[2]).toBe(100);
    });
  });

  // =================================================================
  // TC-UNIT-CE-005: 4개 기능 동시 적용 - 처리 순서 검증
  // =================================================================
  describe('TC-UNIT-CE-005: 4개 기능 동시 적용', () => {
    it('exposure→brightness→luminance→contrast 순서로 적용되어야 함', async () => {
      pixelData = createPixelData(100, 100, 100);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      // brightness=10, luminance=20, contrast=30, exposure=50
      await adjustBrightness(mockFile, 10, 20, 30, 50);

      // 1단계 노출: 100 * 2^0.5 ≈ 141.42
      // 2단계 밝기: 141.42 + (10*2.55) = 141.42 + 25.5 = 166.92
      // 3단계 휘도: L = 166.92 (균일), adjust = 166.92 * 0.2 = 33.38
      //   → 166.92 + 33.38 = 200.3
      // 4단계 대비: contrastFactor for 30 ≈ 1.627
      //   → 1.627 * (200.3 - 128) + 128 = 1.627 * 72.3 + 128 = 117.63 + 128 = 245.63
      expect(pixelData[0]).toBeGreaterThan(200);
      expect(pixelData[0]).toBeLessThanOrEqual(255);

      // Blob 반환 확인
      const result = await adjustBrightness(mockFile, 10, 20, 30, 50);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  // =================================================================
  // TC-UNIT-CE-006: contrast=0, exposure=0 하위 호환성
  // =================================================================
  describe('TC-UNIT-CE-006: 하위 호환성', () => {
    it('contrast/exposure 생략 시 기존 결과와 동일해야 함', async () => {
      const pixelData1 = createPixelData(128, 128, 128);
      const pixelData2 = createPixelData(128, 128, 128);

      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData1,
        width: 2,
        height: 1,
      });
      await adjustBrightness(mockFile, 50, 30);

      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData2,
        width: 2,
        height: 1,
      });
      await adjustBrightness(mockFile, 50, 30, 0, 0);

      expect(pixelData1[0]).toBe(pixelData2[0]);
      expect(pixelData1[1]).toBe(pixelData2[1]);
      expect(pixelData1[2]).toBe(pixelData2[2]);
    });
  });

  // =================================================================
  // TC-UNIT-CE-007: 경계값 테스트 - 극단값에서 클램핑
  // =================================================================
  describe('TC-UNIT-CE-007: 경계값 테스트', () => {
    it('contrast=100, exposure=100 적용 시 0~255 범위를 벗어나지 않아야 함', async () => {
      pixelData = createPixelData(250, 250, 250);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 100, 100, 100, 100);

      expect(pixelData[0]).toBeLessThanOrEqual(255);
      expect(pixelData[0]).toBeGreaterThanOrEqual(0);
      expect(pixelData[1]).toBeLessThanOrEqual(255);
      expect(pixelData[2]).toBeLessThanOrEqual(255);
    });

    it('contrast=-100, exposure=-100 적용 시 0~255 범위를 벗어나지 않아야 함', async () => {
      pixelData = createPixelData(10, 10, 10);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, -100, -100, -100, -100);

      expect(pixelData[0]).toBeLessThanOrEqual(255);
      expect(pixelData[0]).toBeGreaterThanOrEqual(0);
    });

    it('exposure=0 시 곱셈 연산이 생략되어야 함 (값 변경 없음)', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 0, 0);

      expect(pixelData[0]).toBe(128);
      expect(pixelData[1]).toBe(128);
      expect(pixelData[2]).toBe(128);
    });
  });

  // =================================================================
  // TC-UNIT-CE-008: 알파 채널 보존
  // =================================================================
  describe('TC-UNIT-CE-008: 알파 채널 보존', () => {
    it('대비/노출 적용 시 알파 채널이 변경되지 않아야 함', async () => {
      pixelData = createPixelData(128, 128, 128, 180);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 50, 50, 50, 50);

      expect(pixelData[3]).toBe(180);
      expect(pixelData[7]).toBe(180);
    });
  });

  // =================================================================
  // TC-UNIT-CE-009: 11개 언어 번역 키 존재 확인
  // =================================================================
  describe('TC-UNIT-CE-009: 11개 언어 contrast/exposure 번역 키 확인', () => {
    const languages = ['ko', 'en', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'id'];

    languages.forEach((lang) => {
      it(`${lang}.json에 contrastLabel, exposureLabel 키가 존재해야 함`, () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const messages = require(`../../../messages/${lang}.json`);
        expect(messages.imageEditor.brightness.contrastLabel).toBeDefined();
        expect(messages.imageEditor.brightness.contrastLabel).not.toBe('');
        expect(messages.imageEditor.brightness.exposureLabel).toBeDefined();
        expect(messages.imageEditor.brightness.exposureLabel).not.toBe('');
      });
    });
  });

  // =================================================================
  // TC-UNIT-CE-010: 에러 처리
  // =================================================================
  describe('TC-UNIT-CE-010: 에러 처리', () => {
    it('toBlob 실패 시 올바른 에러 메시지를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(adjustBrightness(mockFile, 0, 0, 50, 50)).rejects.toThrow(
        '이미지 명도 조절에 실패했습니다'
      );
    });
  });
});
```

- [ ] **Step 2: 유닛 테스트 실행 및 확인**

Run: `npm run test:01-unit -- --testPathPattern=imageEditor.contrast-exposure`
Expected: 모든 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add tests/01-unit/services/imageEditor.contrast-exposure.test.ts
git commit -m "test: 대비/노출 기능 유닛 테스트 추가 (TC-UNIT-CE-001~010)"
```

---

## Chunk 2: E2E 테스트

### Task 2: 대비/노출 E2E 테스트 작성

**Files:**
- Create: `tests/04-e2e/image-editor-contrast-exposure.spec.ts`
- Reference: `tests/04-e2e/image-editor-luminance.spec.ts` (패턴 참고)
- Reference: `tests/fixtures/test-image.png` (테스트 이미지)

**테스트 케이스 설계:**

| ID | 테스트 | 검증 내용 |
|----|--------|----------|
| TC-E2E-CE-001 | 명도 패널에 슬라이더 4개 표시 | 밝기+휘도+대비+노출 슬라이더 |
| TC-E2E-CE-002 | 대비 슬라이더 UI 조작 | 대비 라벨 표시, 값 변경, 적용 |
| TC-E2E-CE-003 | 노출 슬라이더 UI 조작 | 노출 라벨 표시, 값 변경, 적용 |
| TC-E2E-CE-004 | 4개 모두 0이면 적용 비활성 | 대비/노출 포함 전체 0 조건 |
| TC-E2E-CE-005 | 초기화 시 4개 모두 리셋 | 초기화 버튼으로 전체 0 복귀 |
| TC-E2E-CE-006 | CSS 필터 미리보기에 contrast 반영 | filter에 contrast() 포함 확인 |
| TC-E2E-CE-007 | 대비/노출 적용 후 연속 편집 | 적용 후 회전 등 다른 편집 가능 |

- [ ] **Step 1: E2E 테스트 파일 작성**

```typescript
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
    await expect(page.locator('img[alt="Edit preview"]')).toBeVisible({ timeout: 10000 })
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

    // 각 라벨 확인
    await expect(page.getByText('밝기 조절')).toBeVisible()
    await expect(page.getByText('휘도 조절')).toBeVisible()
    await expect(page.getByText('대비 조절')).toBeVisible()
    await expect(page.getByText('노출 조절')).toBeVisible()
  })

  // =================================================================
  // TC-E2E-CE-002: 대비 슬라이더 UI 조작 및 적용
  // =================================================================
  test('TC-E2E-CE-002: 대비 슬라이더 조작 후 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    // 대비는 3번째 슬라이더 (index 2)
    const contrastSlider = sliders.nth(2)
    await contrastSlider.fill('60')

    // 적용 버튼 활성화 확인
    const applyBtn = page.locator('button').filter({ hasText: '적용' })
    await expect(applyBtn).toBeEnabled()

    await applyBtn.click()

    // 패널 닫힘 확인
    await expect(sliders.first()).not.toBeVisible({ timeout: 10000 })

    // 편집 결과 표시
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })

  // =================================================================
  // TC-E2E-CE-003: 노출 슬라이더 UI 조작 및 적용
  // =================================================================
  test('TC-E2E-CE-003: 노출 슬라이더 조작 후 적용', async ({ page }) => {
    await uploadTestImage(page)
    await openBrightnessPanel(page)

    const sliders = page.locator('input[type="range"]')
    // 노출은 4번째 슬라이더 (index 3)
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

    // 4개 모두 값 설정
    await sliders.nth(0).fill('30')
    await sliders.nth(1).fill('-20')
    await sliders.nth(2).fill('50')
    await sliders.nth(3).fill('-40')

    // 초기화 버튼 클릭
    const resetBtn = page.locator('button').filter({ hasText: '초기화' })
    await resetBtn.click()

    // 4개 모두 0으로 리셋 확인
    await expect(sliders.nth(0)).toHaveValue('0')
    await expect(sliders.nth(1)).toHaveValue('0')
    await expect(sliders.nth(2)).toHaveValue('0')
    await expect(sliders.nth(3)).toHaveValue('0')

    // 적용 버튼 비활성화
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

    // 대비 +40, 노출 -20 적용
    const sliders = page.locator('input[type="range"]')
    await sliders.nth(2).fill('40')
    await sliders.nth(3).fill('-20')
    await page.locator('button').filter({ hasText: '적용' }).click()

    // 패널 닫힘 대기
    await expect(sliders.first()).not.toBeVisible({ timeout: 10000 })

    // 회전 실행
    const rotateBtn = page.locator('button').filter({ hasText: /회전/ }).first()
    await rotateBtn.click()

    // 편집 결과 유지 확인
    await expect(page.locator('span').filter({ hasText: /→.*KB/ })).toBeVisible({ timeout: 10000 })
  })
})
```

- [ ] **Step 2: E2E 테스트 실행 및 확인**

Run: `npx playwright test tests/04-e2e/image-editor-contrast-exposure.spec.ts --headed`
Expected: 모든 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add tests/04-e2e/image-editor-contrast-exposure.spec.ts
git commit -m "test: 대비/노출 기능 E2E 테스트 추가 (TC-E2E-CE-001~007)"
```

---

## Chunk 3: 기존 테스트 업데이트

### Task 3: 기존 테스트 호환성 수정

**Files:**
- Modify: `tests/04-e2e/image-editor.spec.ts:135-146` (슬라이더 개수 2→4)
- Modify: `tests/04-e2e/image-editor-luminance.spec.ts:46,73,101,127,154,177` (슬라이더 개수 2→4)
- Modify: `tests/01-unit/services/imageEditor.luminance.test.ts:373` (에러 메시지 변경 확인)

**변경 사항:**

| 파일 | 변경 | 이유 |
|------|------|------|
| image-editor.spec.ts:145 | `toHaveCount(2)` → `toHaveCount(4)` | 슬라이더 4개로 증가 |
| image-editor-luminance.spec.ts 전체 | `toHaveCount(2)` → `toHaveCount(4)` | 슬라이더 4개로 증가 |
| imageEditor.luminance.test.ts:373 | 에러 메시지 `'이미지 밝기 조절에 실패했습니다'` → `'이미지 명도 조절에 실패했습니다'` | 에러 메시지 변경됨 |

- [ ] **Step 1: image-editor.spec.ts 슬라이더 개수 업데이트**

```diff
- await expect(sliders).toHaveCount(2)
+ await expect(sliders).toHaveCount(4)
```

- [ ] **Step 2: image-editor-luminance.spec.ts 슬라이더 개수 업데이트**

모든 `toHaveCount(2)` → `toHaveCount(4)` 변경

- [ ] **Step 3: imageEditor.luminance.test.ts 에러 메시지 업데이트**

```diff
- await expect(adjustBrightness(mockFile, 0, 50)).rejects.toThrow(
-   '이미지 밝기 조절에 실패했습니다'
- );
+ await expect(adjustBrightness(mockFile, 0, 50)).rejects.toThrow(
+   '이미지 명도 조절에 실패했습니다'
+ );
```

- [ ] **Step 4: 기존 테스트 실행하여 모두 PASS 확인**

Run: `npm run test:01-unit -- --testPathPattern=imageEditor`
Run: `npx playwright test tests/04-e2e/image-editor.spec.ts tests/04-e2e/image-editor-luminance.spec.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add tests/04-e2e/image-editor.spec.ts tests/04-e2e/image-editor-luminance.spec.ts tests/01-unit/services/imageEditor.luminance.test.ts
git commit -m "fix: 기존 테스트 대비/노출 추가에 맞게 업데이트"
```

---

## 테스트 커버리지 요약

| 레벨 | 파일 | 테스트 수 | 범위 |
|------|------|-----------|------|
| Unit | imageEditor.contrast-exposure.test.ts | 14 (10 describe) | 대비/노출 픽셀 연산, 경계값, 호환성, i18n |
| E2E | image-editor-contrast-exposure.spec.ts | 7 | UI 슬라이더, 적용, 초기화, CSS 미리보기, 연속 편집 |
| Fix | 기존 3개 파일 | - | 슬라이더 개수, 에러 메시지 호환성 |
| **합계** | | **21+** | |
