/**
 * 이미지 편집 체인 통합 테스트
 *
 * imageEditor 서비스의 연속 편집 검증:
 * cropImage → rotateImage → adjustBrightness 순차 처리
 * 각 단계의 결과가 다음 단계 입력으로 사용됨
 */

// imageConverter 모킹
jest.mock('@/services/imageConverter', () => ({
  loadImage: jest.fn(),
}));

import { cropImage, rotateImage, adjustBrightness } from '@/services/imageEditor';
import { loadImage } from '@/services/imageConverter';

describe('이미지 편집 체인 통합 테스트', () => {
  const mockImage = {
    width: 800,
    height: 600,
    naturalWidth: 800,
    naturalHeight: 600,
  } as HTMLImageElement;

  let mockCtx: Record<string, jest.Mock | boolean | string | object>;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToBlob: typeof HTMLCanvasElement.prototype.toBlob;

  beforeEach(() => {
    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    // Canvas Context 모킹
    mockCtx = {
      drawImage: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray([128, 128, 128, 255, 200, 200, 200, 255]),
        width: 2,
        height: 1,
      })),
      putImageData: jest.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      canvas: { width: 800, height: 600 },
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as never;

    originalToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(new Blob(['processed-data'], { type: 'image/jpeg' }));
    }) as never;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it('crop → rotate → brightness 순차 편집 체인이 정상 동작해야 함', async () => {
    const originalFile = new File(
      [new Blob(['original-image'])],
      'test.jpg',
      { type: 'image/jpeg' }
    );

    // 1단계: 이미지 자르기
    const croppedResult = await cropImage(
      originalFile,
      { x: 100, y: 100, width: 400, height: 300 }
    );
    expect(croppedResult).toBeInstanceOf(Blob);
    expect(loadImage).toHaveBeenCalledTimes(1);

    // 2단계: 자른 이미지 회전 (이전 단계 결과 사용)
    const rotatedResult = await rotateImage(croppedResult, 90);
    expect(rotatedResult).toBeInstanceOf(Blob);
    expect(loadImage).toHaveBeenCalledTimes(2);

    // 3단계: 회전된 이미지 밝기 조절 (이전 단계 결과 사용)
    const brightnessResult = await adjustBrightness(rotatedResult, 20);
    expect(brightnessResult).toBeInstanceOf(Blob);
    expect(loadImage).toHaveBeenCalledTimes(3);

    // 최종 결과 확인
    expect(brightnessResult.size).toBeGreaterThan(0);
  });

  it('각 단계에서 올바른 Canvas 연산이 수행되어야 함', async () => {
    const file = new File([new Blob(['test'])], 'test.jpg', {
      type: 'image/jpeg',
    });

    // 1단계: crop - drawImage 확인
    await cropImage(file, { x: 50, y: 50, width: 200, height: 200 });
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockImage,
      50, 50, 200, 200,
      0, 0, 200, 200
    );

    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    // 2단계: rotate - translate + rotate 확인
    await rotateImage(file, 90);
    expect(mockCtx.translate).toHaveBeenCalled();
    expect(mockCtx.rotate).toHaveBeenCalledWith((90 * Math.PI) / 180);

    jest.clearAllMocks();
    (loadImage as jest.Mock).mockResolvedValue(mockImage);

    // 3단계: brightness - getImageData + putImageData 확인
    await adjustBrightness(file, 10);
    expect(mockCtx.getImageData).toHaveBeenCalled();
    expect(mockCtx.putImageData).toHaveBeenCalled();
  });

  it('중간 단계 실패 시 에러가 전파되어야 함', async () => {
    const file = new File([new Blob(['test'])], 'test.jpg', {
      type: 'image/jpeg',
    });

    // 첫 번째 단계 성공
    const croppedResult = await cropImage(
      file,
      { x: 0, y: 0, width: 100, height: 100 }
    );
    expect(croppedResult).toBeInstanceOf(Blob);

    // 두 번째 단계에서 toBlob 실패 시뮬레이션
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback: BlobCallback) => {
      callback(null);
    }) as never;

    // 에러가 전파되는지 확인
    await expect(rotateImage(croppedResult, 90)).rejects.toThrow(
      '이미지 회전에 실패했습니다'
    );
  });

  it('다양한 형식으로 체인 편집이 가능해야 함', async () => {
    const file = new File([new Blob(['test'])], 'test.png', {
      type: 'image/png',
    });

    // PNG로 자르기
    const cropped = await cropImage(
      file,
      { x: 0, y: 0, width: 100, height: 100 },
      'image/png',
      1.0
    );

    // JPEG로 회전
    const rotated = await rotateImage(cropped, 180, 'image/jpeg', 0.8);

    // WebP로 밝기 조절
    const final = await adjustBrightness(rotated, 5, 0, 'image/webp', 0.9);

    expect(final).toBeInstanceOf(Blob);
  });
});
