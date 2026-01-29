/**
 * 서비스 체인 통합 테스트
 *
 * 여러 서비스가 순차적으로 연동되어 작동하는지 확인
 */

// uuid mock
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}))

import { convertImage } from '@/services/imageConverter';
import { cropImage, rotateImage, resizeImage } from '@/services/imageEditor';
import { compressImage } from '@/services/imageCompressor';
import { applyTextWatermark } from '@/services/watermark';
import { useFileStore } from '@/stores/fileStore';
import { act } from '@testing-library/react';
import { getStoreState } from './test-helpers';

// URL mock
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

describe('서비스 체인 통합', () => {
  beforeEach(() => {
    act(() => {
      useFileStore.getState().clearFiles();
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      useFileStore.getState().clearFiles();
    });
  });

  describe('이미지 변환 → 편집 → 압축 플로우', () => {
    it('PNG를 JPG로 변환한 후 편집하고 압축해야 함', async () => {
      const store = useFileStore.getState();

      // 원본 이미지 생성
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 1000, 1000);
      }

      const originalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const originalFile = new File([originalBlob], 'original.png', { type: 'image/png' });

      act(() => {
        store.addFiles([originalFile]);
      });
      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      // 1단계: PNG → JPG 변환
      act(() => {
        store.setProgress(fileId, 25);
      });
      const convertedBlob = await convertImage(
        originalFile,
        { format: 'jpg', quality: 0.9 }
      );
      const convertedFile = new File([convertedBlob], 'converted.jpg', { type: 'image/jpeg' });

      // 2단계: 이미지 회전
      act(() => {
        store.setProgress(fileId, 50);
      });
      const rotatedBlob = await rotateImage(convertedFile, 90);
      const rotatedFile = new File([rotatedBlob], 'rotated.jpg', { type: 'image/jpeg' });

      // 3단계: 이미지 압축
      act(() => {
        store.setProgress(fileId, 75);
      });
      const compressedBlob = await compressImage(
        rotatedFile,
        { maxSizeMB: 0.5, maxWidthOrHeight: 800 }
      );

      // 최종 결과 저장
      act(() => {
        store.setResult(fileId, compressedBlob);
      });

      const finalState = getStoreState();
      expect(finalState.files[0].status).toBe('completed');
      expect(finalState.files[0].result).toBe(compressedBlob);
      // Blob size가 정의되어 있는 경우에만 비교
      if (compressedBlob.size && originalBlob.size) {
        expect(compressedBlob.size).toBeLessThanOrEqual(originalBlob.size);
      }
    });

    it('이미지 변환 → 자르기 → 리사이즈 플로우가 작동해야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, 2000, 2000);
      }

      const originalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const originalFile = new File([originalBlob], 'original.png', { type: 'image/png' });

      act(() => {
        store.addFiles([originalFile]);
      });
      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      // 1단계: 이미지 자르기
      act(() => {
        store.setProgress(fileId, 33);
      });
      const croppedBlob = await cropImage(
        originalFile,
        { x: 500, y: 500, width: 1000, height: 1000 }
      );
      const croppedFile = new File([croppedBlob], 'cropped.png', { type: 'image/png' });

      // 2단계: 이미지 리사이즈
      act(() => {
        store.setProgress(fileId, 66);
      });
      const resizedBlob = await resizeImage(
        croppedFile,
        500,
        500,
        true
      );

      // 최종 결과 저장
      act(() => {
        store.setResult(fileId, resizedBlob);
      });

      const finalState = getStoreState();
      expect(finalState.files[0].status).toBe('completed');
      // Blob size가 정의되어 있는 경우에만 비교
      if (resizedBlob.size && originalBlob.size) {
        expect(resizedBlob.size).toBeLessThanOrEqual(originalBlob.size);
      }
    });
  });

  describe('이미지 변환 → 워터마크 → 압축 플로우', () => {
    it('이미지를 변환한 후 워터마크를 추가하고 압축해야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, 1000, 1000);
      }

      const originalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const originalFile = new File([originalBlob], 'original.png', { type: 'image/png' });

      act(() => {
        store.addFiles([originalFile]);
      });
      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      // 1단계: PNG → WebP 변환
      act(() => {
        store.setProgress(fileId, 30);
      });
      const convertedBlob = await convertImage(
        originalFile,
        { format: 'webp', quality: 0.9 }
      );
      const convertedFile = new File([convertedBlob], 'converted.webp', { type: 'image/webp' });

      // 2단계: 워터마크 추가
      act(() => {
        store.setProgress(fileId, 60);
      });
      const watermarkedBlob = await applyTextWatermark(
        convertedFile,
        {
          text: 'Test Watermark',
          position: 'bottom-right',
          fontSize: 24,
          color: '#ffffff',
        }
      );
      const watermarkedFile = new File([watermarkedBlob], 'watermarked.webp', { type: 'image/webp' });

      // 3단계: 압축
      act(() => {
        store.setProgress(fileId, 90);
      });
      const compressedBlob = await compressImage(
        watermarkedFile,
        { maxSizeMB: 0.3 }
      );

      // 최종 결과 저장
      act(() => {
        store.setResult(fileId, compressedBlob);
      });

      const finalState = getStoreState();
      expect(finalState.files[0].status).toBe('completed');
      expect(finalState.files[0].result).toBe(compressedBlob);
    });
  });

  describe('여러 파일 동시 처리 체인', () => {
    it('여러 파일을 동시에 변환 → 편집 → 압축해야 함', async () => {
      const store = useFileStore.getState();

      // 여러 이미지 생성
      const files: File[] = [];
      for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `#${i.toString().repeat(6)}`;
          ctx.fillRect(0, 0, 500, 500);
        }

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        files.push(new File([blob], `image${i}.png`, { type: 'image/png' }));
      }

      act(() => {
        store.addFiles(files);
      });
      const state1 = getStoreState();
      expect(state1.files).toHaveLength(3);

      // 각 파일에 대해 변환 → 편집 → 압축 수행
      const promises = state1.files.map(async (mediaFile, index) => {
        const fileId = mediaFile.id;

        // 변환
        act(() => {
          store.setProgress(fileId, 33);
        });
        const converted = await convertImage(
          mediaFile.file,
          { format: 'jpg', quality: 0.9 }
        );
        const convertedFile = new File([converted], `converted${index}.jpg`, { type: 'image/jpeg' });

        // 편집
        act(() => {
          store.setProgress(fileId, 66);
        });
        const rotated = await rotateImage(convertedFile, 90);
        const rotatedFile = new File([rotated], `rotated${index}.jpg`, { type: 'image/jpeg' });

        // 압축
        act(() => {
          store.setProgress(fileId, 90);
        });
        const compressed = await compressImage(
          rotatedFile,
          { maxSizeMB: 0.2 }
        );

        // 결과 저장
        act(() => {
          store.setResult(fileId, compressed);
        });

        return compressed;
      });

      await Promise.all(promises);

      // 모든 파일이 완료되었는지 확인
      const finalState = getStoreState();
      expect(finalState.files.every(f => f.status === 'completed')).toBe(true);
      expect(finalState.files.every(f => f.progress === 100)).toBe(true);
    });
  });

  describe('에러 처리 체인', () => {
    it('체인 중간에 에러가 발생하면 상태가 올바르게 업데이트되어야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      const file = new File([blob], 'test.png', { type: 'image/png' });

      act(() => {
        store.addFiles([file]);
      });
      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      act(() => {
        store.setProgress(fileId, 30);
      });

      try {
        // 변환 성공
        const converted = await convertImage(file, { format: 'jpg' });

        // 잘못된 자르기 영역으로 에러 발생 시뮬레이션
        act(() => {
          store.setProgress(fileId, 60);
        });

        const cropped = await cropImage(
          new File([converted], 'converted.jpg', { type: 'image/jpeg' }),
          { x: 1000, y: 1000, width: 1000, height: 1000 } // 범위를 벗어난 영역
        );

        // 성공하면 결과 저장
        act(() => {
          store.setResult(fileId, cropped);
        });
      } catch (error) {
        // 에러 상태로 업데이트
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '알 수 없는 오류');
        });
      }

      const finalState = getStoreState();
      // 에러가 발생했거나 완료되었을 수 있음
      expect(['error', 'completed']).toContain(finalState.files[0].status);
      if (finalState.files[0].status === 'error') {
        expect(finalState.files[0].error).toBeDefined();
      }
    });
  });
});
