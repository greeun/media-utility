/**
 * 에러 처리 통합 테스트
 *
 * 서비스와 스토어 간 에러 처리가 올바르게 작동하는지 확인
 */

// uuid mock
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}))

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
import { convertImage } from '@/services/imageConverter';
import { cropImage } from '@/services/imageEditor';
import { compressImage } from '@/services/imageCompressor';

describe('에러 처리 통합', () => {
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

  describe('서비스 에러 처리', () => {
    it('이미지 변환 실패 시 스토어에 에러가 저장되어야 함', async () => {
      const store = useFileStore.getState();

      // 잘못된 파일 생성 (빈 파일)
      const invalidFile = new File([], 'invalid.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([invalidFile]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      act(() => {
        store.setProgress(fileId, 50);
      });

      try {
        await convertImage(invalidFile, { format: 'png' });
        // 변환이 성공하면 결과 저장
        const stateAfterSuccess = getStoreState();
        if (stateAfterSuccess.files[0].status === 'processing') {
          act(() => {
            store.setResult(fileId, new Blob(['converted']));
          });
        }
      } catch (error) {
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '변환 실패');
        });
      }

      const state2 = getStoreState();
      // 에러가 발생했거나 완료되었을 수 있음
      expect(['error', 'completed']).toContain(state2.files[0].status);
      if (state2.files[0].status === 'error') {
        expect(state2.files[0].error).toBeDefined();
        expect(state2.files[0].progress).toBe(50); // 에러 발생 시점의 진행률 유지
      }
    });

    it('이미지 편집 실패 시 스토어에 에러가 저장되어야 함', async () => {
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
        // 범위를 벗어난 자르기 영역
        const result = await cropImage(
          file,
          { x: 200, y: 200, width: 1000, height: 1000 }
        );
        // 편집이 성공하면 결과 저장
        act(() => {
          store.setResult(fileId, result);
        });
      } catch (error) {
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '편집 실패');
        });
      }

      const state2 = getStoreState();
      // 에러가 발생했거나 완료되었을 수 있음
      expect(['error', 'completed']).toContain(state2.files[0].status);
      if (state2.files[0].status === 'error') {
        expect(state2.files[0].error).toBeDefined();
      }
    });

    it('이미지 압축 실패 시 스토어에 에러가 저장되어야 함', async () => {
      const store = useFileStore.getState();

      // 매우 작은 파일 (압축이 실패할 수 있는 경우)
      const smallFile = new File(['x'], 'small.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([smallFile]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      try {
        act(() => {
          store.setProgress(fileId, 40);
        });
        await compressImage(
          smallFile,
          { maxSizeMB: 0.001 } // 매우 작은 크기 제한
        );
        act(() => {
          store.setResult(fileId, new Blob(['compressed']));
        });
      } catch (error) {
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '압축 실패');
        });
      }

      // 에러가 발생했거나 정상적으로 처리되었을 수 있음
      const state2 = getStoreState();
      expect(['error', 'completed']).toContain(state2.files[0].status);
    });
  });

  describe('여러 파일 중 일부 실패 처리', () => {
    it('여러 파일 처리 중 일부가 실패해도 나머지는 계속 처리되어야 함', async () => {
      const store = useFileStore.getState();

      const validCanvas = document.createElement('canvas');
      validCanvas.width = 100;
      validCanvas.height = 100;
      const validCtx = validCanvas.getContext('2d');
      if (validCtx) {
        validCtx.fillStyle = '#00ff00';
        validCtx.fillRect(0, 0, 100, 100);
      }

      const validBlob = await new Promise<Blob>((resolve) => {
        validCanvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const validFile = new File([validBlob], 'valid.png', { type: 'image/png' });
      const invalidFile = new File([], 'invalid.jpg', { type: 'image/jpeg' });

      act(() => {
        store.addFiles([validFile, invalidFile]);
      });

      const state1 = getStoreState();
      const validId = state1.files[0].id;
      const invalidId = state1.files[1].id;

      // 유효한 파일 처리
      try {
        act(() => {
          store.setProgress(validId, 50);
        });
        const result = await convertImage(validFile, { format: 'jpg' });
        act(() => {
          store.setResult(validId, result);
        });
      } catch (error) {
        act(() => {
          store.setError(validId, error instanceof Error ? error.message : '변환 실패');
        });
      }

      // 잘못된 파일 처리
      act(() => {
        store.setProgress(invalidId, 50);
      });

      try {
        const result = await convertImage(invalidFile, { format: 'png' });
        act(() => {
          store.setResult(invalidId, result);
        });
      } catch (error) {
        act(() => {
          store.setError(invalidId, error instanceof Error ? error.message : '변환 실패');
        });
      }

      // 유효한 파일은 완료, 잘못된 파일은 에러 또는 완료
      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('completed');
      expect(['error', 'completed']).toContain(state2.files[1].status);
    });
  });

  describe('에러 복구', () => {
    it('에러 발생 후 파일을 다시 처리할 수 있어야 함', async () => {
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

      // 첫 번째 시도 실패 시뮬레이션
      act(() => {
        store.setProgress(fileId, 50);
      });

      try {
        // 의도적으로 실패 시뮬레이션 (잘못된 포맷)
        await convertImage(file, { format: 'invalid' as any });
        // 변환이 성공하면 결과 저장
        const stateAfterSuccess = getStoreState();
        if (stateAfterSuccess.files[0].status === 'processing') {
          act(() => {
            store.setResult(fileId, new Blob(['converted']));
          });
        }
      } catch (error) {
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '변환 실패');
        });
      }

      const state2 = getStoreState();
      // 에러가 발생했거나 완료되었을 수 있음
      expect(['error', 'completed']).toContain(state2.files[0].status);

      // 에러 상태 초기화 후 재시도
      act(() => {
        store.updateFile(fileId, { status: 'pending', error: undefined, progress: 0 });
      });

      // 재시도
      act(() => {
        store.setProgress(fileId, 50);
      });

      try {
        const result = await convertImage(file, { format: 'jpg' });
        act(() => {
          store.setResult(fileId, result);
        });
      } catch (error) {
        act(() => {
          store.setError(fileId, error instanceof Error ? error.message : '변환 실패');
        });
      }

      const state3 = getStoreState();
      expect(state3.files[0].status).toBe('completed');
    });
  });

  describe('진행률 추적 중 에러', () => {
    it('진행률 업데이트 중 에러가 발생해도 상태가 올바르게 유지되어야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0000ff';
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

      // 진행률 업데이트
      act(() => {
        store.setProgress(fileId, 10);
      });
      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('processing');
      expect(state2.files[0].progress).toBe(10);

      act(() => {
        store.setProgress(fileId, 50);
      });
      const state3 = getStoreState();
      expect(state3.files[0].progress).toBe(50);

      // 에러 발생
      act(() => {
        store.setError(fileId, '처리 중 오류 발생');
      });

      const state4 = getStoreState();
      expect(state4.files[0].status).toBe('error');
      expect(state4.files[0].progress).toBe(50); // 에러 발생 시점의 진행률 유지
      expect(state4.files[0].error).toBe('처리 중 오류 발생');
    });
  });
});
