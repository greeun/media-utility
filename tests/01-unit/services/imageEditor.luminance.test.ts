/**
 * imageEditor 서비스 - 밝기·휘도(Luminance) 유닛 테스트
 *
 * TC-UNIT-001 ~ TC-UNIT-006 구현
 */
import { adjustBrightness } from '@/services/imageEditor';

// imageConverter 모킹
jest.mock('@/services/imageConverter', () => ({
  loadImage: jest.fn(),
}));

import { loadImage } from '@/services/imageConverter';

describe('adjustBrightness - 휘도(Luminance) 기능', () => {
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

  /**
   * 테스트용 픽셀 데이터 생성 (2px: 동일한 RGBA 값)
   */
  function createPixelData(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
    // 2 pixels
    return new Uint8ClampedArray([r, g, b, a, r, g, b, a]);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    // 기본 픽셀 데이터: RGB(128, 128, 128)
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

  // =====================================================================
  // TC-UNIT-001: 휘도만 적용 시 가중치 기반 픽셀 변환
  // =====================================================================
  describe('TC-UNIT-001: 휘도만 적용 시 가중치 기반 픽셀 변환', () => {
    it('RGB(100,150,200)에 luminance=50 적용 시 가중치 기반으로 밝아져야 함', async () => {
      pixelData = createPixelData(100, 150, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 50);

      // L = 0.2126*100 + 0.7152*150 + 0.0722*200 = 21.26 + 107.28 + 14.44 = 142.98
      // luminanceFactor = 50/100 = 0.5
      // adjust = 142.98 * 0.5 = 71.49
      // R' = clamp(100 + 71.49) = 171
      // G' = clamp(150 + 71.49) = 221
      // B' = clamp(200 + 71.49) = 255 (클램핑)
      expect(pixelData[0]).toBeCloseTo(171, 0); // R
      expect(pixelData[1]).toBeCloseTo(221, 0); // G
      expect(pixelData[2]).toBe(255);            // B (클램핑)
      expect(pixelData[3]).toBe(255);            // A (변경 없음)

      expect(mockCtx.putImageData).toHaveBeenCalled();
    });

    it('Blob 반환이 정상이어야 함', async () => {
      const result = await adjustBrightness(mockFile, 0, 50);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  // =====================================================================
  // TC-UNIT-002: 밝기 + 휘도 동시 적용
  // =====================================================================
  describe('TC-UNIT-002: 밝기 + 휘도 동시 적용', () => {
    it('RGB(100,100,100)에 brightness=20, luminance=30 적용', async () => {
      pixelData = createPixelData(100, 100, 100);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 20, 30);

      // 1단계: 밝기 적용 - brightnessOffset = 20 * 2.55 = 51
      // R,G,B = 100 + 51 = 151
      // 2단계: 휘도 적용 - luminanceFactor = 30/100 = 0.3
      // L = 0.2126*151 + 0.7152*151 + 0.0722*151 = 151
      // adjust = 151 * 0.3 = 45.3
      // R',G',B' = clamp(151 + 45.3) = 196
      expect(pixelData[0]).toBeCloseTo(196, 0);
      expect(pixelData[1]).toBeCloseTo(196, 0);
      expect(pixelData[2]).toBeCloseTo(196, 0);
    });
  });

  // =====================================================================
  // TC-UNIT-003: luminance=0 하위 호환성
  // =====================================================================
  describe('TC-UNIT-003: luminance=0 하위 호환성', () => {
    it('luminance 파라미터 생략 시 기존 동작과 동일해야 함', async () => {
      const pixelData1 = createPixelData(128, 128, 128);
      const pixelData2 = createPixelData(128, 128, 128);

      // 첫 번째 호출: luminance 생략
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData1,
        width: 2,
        height: 1,
      });
      await adjustBrightness(mockFile, 50);

      // 두 번째 호출: luminance=0 명시
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData2,
        width: 2,
        height: 1,
      });
      await adjustBrightness(mockFile, 50, 0);

      // 두 결과가 동일해야 함
      expect(pixelData1[0]).toBe(pixelData2[0]);
      expect(pixelData1[1]).toBe(pixelData2[1]);
      expect(pixelData1[2]).toBe(pixelData2[2]);
    });

    it('brightness=50, luminance=0 시 기존 밝기 공식과 동일해야 함', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 50, 0);

      // offset = 50 * 2.55 = 127.5
      // R' = clamp(128 + 127.5) = 255 (클램핑)
      expect(pixelData[0]).toBe(255);
      expect(pixelData[1]).toBe(255);
      expect(pixelData[2]).toBe(255);
    });
  });

  // =====================================================================
  // TC-UNIT-004: 경계값 테스트 - 휘도 극단값
  // =====================================================================
  describe('TC-UNIT-004: 경계값 테스트 - 휘도 극단값', () => {
    it('luminance=-100: 회색(128) → 검은색(0)으로 변해야 함', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, -100);

      // luminanceFactor = -1
      // L = 128, adjust = 128 * (-1) = -128
      // R' = clamp(128 - 128) = 0
      expect(pixelData[0]).toBe(0);
      expect(pixelData[1]).toBe(0);
      expect(pixelData[2]).toBe(0);
    });

    it('luminance=0: 원본과 동일해야 함', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 0);

      expect(pixelData[0]).toBe(128);
      expect(pixelData[1]).toBe(128);
      expect(pixelData[2]).toBe(128);
    });

    it('luminance=+100: 회색(128) → 흰색(255)으로 변해야 함', async () => {
      pixelData = createPixelData(128, 128, 128);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 100);

      // luminanceFactor = 1
      // L = 128, adjust = 128 * 1 = 128
      // R' = clamp(128 + 128) = 255 (클램핑)
      expect(pixelData[0]).toBe(255);
      expect(pixelData[1]).toBe(255);
      expect(pixelData[2]).toBe(255);
    });

    it('알파 채널은 변경되지 않아야 함', async () => {
      pixelData = createPixelData(128, 128, 128, 200);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 50, 50);

      expect(pixelData[3]).toBe(200); // 알파 유지
      expect(pixelData[7]).toBe(200); // 두 번째 픽셀 알파 유지
    });

    it('모든 값이 0~255 범위를 벗어나지 않아야 함', async () => {
      pixelData = createPixelData(250, 250, 250);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 100, 100);

      // 오버플로 없음
      expect(pixelData[0]).toBeLessThanOrEqual(255);
      expect(pixelData[1]).toBeLessThanOrEqual(255);
      expect(pixelData[2]).toBeLessThanOrEqual(255);
      expect(pixelData[0]).toBeGreaterThanOrEqual(0);
    });
  });

  // =====================================================================
  // TC-UNIT-005: ITU-R BT.709 가중치 채널별 차등 적용 검증
  // =====================================================================
  describe('TC-UNIT-005: ITU-R BT.709 가중치 채널별 차등 적용', () => {
    it('순수 빨간색(255,0,0)의 휘도는 녹색보다 낮아야 함', async () => {
      // 빨간색 테스트
      const redPixels = createPixelData(255, 0, 0);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: redPixels,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 50);

      const redAdjust = redPixels[1]; // G 채널 변화량 확인

      // 녹색 테스트
      const greenPixels = createPixelData(0, 255, 0);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: greenPixels,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 50);

      const greenAdjust = greenPixels[0]; // R 채널 변화량 확인

      // 녹색(L=182.38)이 빨간색(L=54.21)보다 큰 adjust 값을 가져야 함
      // 빨간색: L = 0.2126*255 = 54.21, adjust = 27.11
      // 녹색: L = 0.7152*255 = 182.38, adjust = 91.19
      expect(greenAdjust).toBeGreaterThan(redAdjust);
    });

    it('순수 빨간색(255,0,0)에 luminance=50 적용 시 정확한 값', async () => {
      pixelData = createPixelData(255, 0, 0);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 50);

      // L = 0.2126*255 + 0.7152*0 + 0.0722*0 = 54.213
      // adjust = 54.213 * 0.5 = 27.1065
      // R' = clamp(255 + 27.1) = 255 (클램핑)
      // G' = clamp(0 + 27.1) ≈ 27
      // B' = clamp(0 + 27.1) ≈ 27
      expect(pixelData[0]).toBe(255);
      expect(pixelData[1]).toBeCloseTo(27, 0);
      expect(pixelData[2]).toBeCloseTo(27, 0);
    });

    it('순수 녹색(0,255,0)에 luminance=50 적용 시 정확한 값', async () => {
      pixelData = createPixelData(0, 255, 0);
      (mockCtx.getImageData as jest.Mock).mockReturnValue({
        data: pixelData,
        width: 2,
        height: 1,
      });

      await adjustBrightness(mockFile, 0, 50);

      // L = 0.7152*255 = 182.376
      // adjust = 182.376 * 0.5 = 91.188
      // R' = clamp(0 + 91.188) ≈ 91
      // G' = clamp(255 + 91.188) = 255 (클램핑)
      // B' = clamp(0 + 91.188) ≈ 91
      expect(pixelData[0]).toBeCloseTo(91, 0);
      expect(pixelData[1]).toBe(255);
      expect(pixelData[2]).toBeCloseTo(91, 0);
    });
  });

  // =====================================================================
  // TC-UNIT-006: 11개 언어 번역 키 존재 확인
  // =====================================================================
  describe('TC-UNIT-006: 11개 언어 luminanceLabel 번역 키 존재 확인', () => {
    const languages = ['ko', 'en', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'id'];

    languages.forEach((lang) => {
      it(`${lang}.json에 luminanceLabel 키가 존재해야 함`, () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const messages = require(`../../../messages/${lang}.json`);
        expect(messages.imageEditor.brightness.luminanceLabel).toBeDefined();
        expect(messages.imageEditor.brightness.luminanceLabel).not.toBe('');
      });
    });
  });

  // =====================================================================
  // 에러 처리 테스트
  // =====================================================================
  describe('에러 처리', () => {
    it('Canvas context 생성 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null) as never;

      await expect(adjustBrightness(mockFile, 0, 50)).rejects.toThrow(
        'Canvas context를 생성할 수 없습니다'
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
        callback(null);
      }) as never;

      await expect(adjustBrightness(mockFile, 0, 50)).rejects.toThrow(
        '이미지 밝기 조절에 실패했습니다'
      );
    });
  });
});
