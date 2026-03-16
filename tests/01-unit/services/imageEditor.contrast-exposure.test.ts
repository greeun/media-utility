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

      expect(pixelData[0]).toBeLessThan(100);
    });

    it('RGB(200,200,200)에 contrast=50 → 128보다 크므로 더 밝아져야 함', async () => {
      pixelData = createPixelData(200, 200, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 50, 0);

      expect(pixelData[0]).toBeGreaterThan(200);
    });

    it('RGB(128,128,128)에 contrast=50 → 중간값이므로 변하지 않아야 함', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0, 50, 0);

      expect(pixelData[0]).toBe(128);
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

      await adjustBrightness(mockFile, 10, 20, 30, 50);

      // 처리 순서: 노출 → 밝기 → 휘도 → 대비
      // 1단계 노출: 100 * 2^0.5 ≈ 141.42
      // 2단계 밝기: 141.42 + 25.5 = 166.92
      // 3단계 휘도: L = 166.92, adjust = 166.92 * 0.2 = 33.38 → 200.3
      // 4단계 대비: factor * (200.3 - 128) + 128
      expect(pixelData[0]).toBeGreaterThan(200);
      expect(pixelData[0]).toBeLessThanOrEqual(255);
    });

    it('Blob 반환이 정상이어야 함', async () => {
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

    it('exposure=0 시 원본 값이 유지되어야 함', async () => {
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
