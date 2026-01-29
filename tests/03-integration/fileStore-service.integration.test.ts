/**
 * 파일 스토어와 서비스 간 통합 테스트
 *
 * fileStore와 각 서비스가 올바르게 연동되는지 확인
 */

// uuid mock (import 전에 mock해야 함)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}))

import { useFileStore } from '@/stores/fileStore';
import { convertImage } from '@/services/imageConverter';
import { cropImage, rotateImage } from '@/services/imageEditor';
import { compressImage } from '@/services/imageCompressor';
import { convertHeicToJpg } from '@/services/heicConverter';
import { act } from '@testing-library/react';

// URL mock
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

// 헬퍼 함수: 상태를 가져오는 함수 (test-helpers에서 import)
import { getStoreState } from './test-helpers';

describe('파일 스토어와 서비스 통합', () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 초기화
    act(() => {
      useFileStore.getState().clearFiles();
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 각 테스트 후에 스토어 정리
    act(() => {
      useFileStore.getState().clearFiles();
    });
  });

  describe('파일 업로드 → 변환 → 상태 업데이트 플로우', () => {
    it('이미지 파일을 업로드하고 변환하여 상태가 올바르게 업데이트되어야 함', async () => {
      const store = useFileStore.getState();

      // 1. 파일 업로드
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([file]);
      });

      // 상태 확인을 위해 다시 가져오기
      const currentState = useFileStore.getState();
      const files = currentState.files;
      expect(files).toHaveLength(1);
      expect(files[0].status).toBe('pending');
      expect(files[0].progress).toBe(0);

      const fileId = files[0].id;

      // 2. 변환 시작 (진행률 업데이트)
      const progressUpdates: number[] = [];
      act(() => {
        store.setProgress(fileId, 50);
      });

      const stateAfterProgress = useFileStore.getState();
      expect(stateAfterProgress.files[0].status).toBe('processing');
      expect(stateAfterProgress.files[0].progress).toBe(50);

      // 3. 변환 완료 (결과 설정)
      const resultBlob = new Blob(['converted'], { type: 'image/png' });
      act(() => {
        store.setResult(fileId, resultBlob);
      });

      const stateAfterResult = useFileStore.getState();
      expect(stateAfterResult.files[0].status).toBe('completed');
      expect(stateAfterResult.files[0].progress).toBe(100);
      expect(stateAfterResult.files[0].result).toBe(resultBlob);
    });

    it('여러 파일을 동시에 처리할 수 있어야 함', async () => {
      const store = useFileStore.getState();

      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      const file3 = new File(['test3'], 'test3.webp', { type: 'image/webp' });

      act(() => {
        store.addFiles([file1, file2, file3]);
      });

      const state1 = getStoreState();
      expect(state1.files).toHaveLength(3);

      // 각 파일에 대해 개별적으로 진행률 업데이트
      act(() => {
        store.setProgress(state1.files[0].id, 30);
        store.setProgress(state1.files[1].id, 60);
        store.setProgress(state1.files[2].id, 90);
      });

      const state2 = getStoreState();
      expect(state2.files[0].progress).toBe(30);
      expect(state2.files[1].progress).toBe(60);
      expect(state2.files[2].progress).toBe(90);

      // 각 파일 완료
      act(() => {
        store.setResult(state2.files[0].id, new Blob(['result1']));
        store.setResult(state2.files[1].id, new Blob(['result2']));
        store.setResult(state2.files[2].id, new Blob(['result3']));
      });

      const state3 = getStoreState();
      expect(state3.files.every(f => f.status === 'completed')).toBe(true);
    });

    it('파일 처리 중 에러가 발생하면 상태가 올바르게 업데이트되어야 함', async () => {
      const store = useFileStore.getState();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([file]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      // 처리 시작
      act(() => {
        store.setProgress(fileId, 50);
      });
      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('processing');

      // 에러 발생
      act(() => {
        store.setError(fileId, '변환 실패: 파일 형식 오류');
      });

      const state3 = getStoreState();
      expect(state3.files[0].status).toBe('error');
      expect(state3.files[0].error).toBe('변환 실패: 파일 형식 오류');
      expect(state3.files[0].progress).toBe(50); // 에러 발생 시점의 진행률 유지
    });
  });

  describe('서비스와 스토어 연동', () => {
    it('이미지 변환 서비스를 사용하여 파일을 변환하고 스토어에 결과를 저장해야 함', async () => {
      const store = useFileStore.getState();

      // Mock 이미지 파일 생성
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

      // 변환 진행률 추적
      const progressUpdates: number[] = [];

      // 이미지 변환 실행
      const resultBlob = await convertImage(
        file,
        { format: 'jpg', quality: 0.9 },
        (progress) => {
          progressUpdates.push(progress);
          act(() => {
            store.setProgress(fileId, progress);
          });
        }
      );

      // 결과를 스토어에 저장
      act(() => {
        store.setResult(fileId, resultBlob);
      });

      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('completed');
      expect(state2.files[0].result).toBe(resultBlob);
      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('이미지 편집 서비스를 사용하여 파일을 편집하고 스토어에 결과를 저장해야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, 200, 200);
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

      // 이미지 회전
      act(() => {
        store.setProgress(fileId, 30);
      });
      const rotatedBlob = await rotateImage(file, 90);
      act(() => {
        store.setResult(fileId, rotatedBlob);
      });

      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('completed');
      expect(state2.files[0].result).toBe(rotatedBlob);
    });

    it('이미지 압축 서비스를 사용하여 파일을 압축하고 스토어에 결과를 저장해야 함', async () => {
      const store = useFileStore.getState();

      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 0, 2000, 2000);
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

      const progressUpdates: number[] = [];

      // 이미지 압축
      const compressedBlob = await compressImage(
        file,
        { maxSizeMB: 1, maxWidthOrHeight: 1920 },
        (progress) => {
          progressUpdates.push(progress);
          act(() => {
            store.setProgress(fileId, progress);
          });
        }
      );

      act(() => {
        store.setResult(fileId, compressedBlob);
      });

      const state2 = getStoreState();
      expect(state2.files[0].status).toBe('completed');
      expect(state2.files[0].result).toBe(compressedBlob);
      // Blob size가 정의되어 있는 경우에만 비교
      if (compressedBlob.size && file.size) {
        expect(compressedBlob.size).toBeLessThanOrEqual(file.size);
      }
    });
  });

  describe('파일 제거 및 정리', () => {
    it('파일을 제거하면 preview URL이 해제되어야 함', () => {
      const store = useFileStore.getState();
      const revokeSpy = jest.spyOn(URL, 'revokeObjectURL');

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([file]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;
      const previewUrl = state1.files[0].preview;

      expect(previewUrl).toBeDefined();

      act(() => {
        store.removeFile(fileId);
      });

      const state2 = getStoreState();
      expect(state2.files).toHaveLength(0);
      expect(revokeSpy).toHaveBeenCalledWith(previewUrl);
    });

    it('모든 파일을 제거하면 모든 preview URL이 해제되어야 함', () => {
      const store = useFileStore.getState();
      const revokeSpy = jest.spyOn(URL, 'revokeObjectURL');

      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });

      act(() => {
        store.addFiles([file1, file2]);
      });

      const state1 = getStoreState();
      expect(state1.files).toHaveLength(2);

      act(() => {
        store.clearFiles();
      });

      const state2 = getStoreState();
      expect(state2.files).toHaveLength(0);
      expect(revokeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('파일 업데이트', () => {
    it('파일 정보를 업데이트할 수 있어야 함', () => {
      const store = useFileStore.getState();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([file]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      act(() => {
        store.updateFile(fileId, { name: 'updated.jpg' });
      });

      const state2 = getStoreState();
      expect(state2.files[0].name).toBe('updated.jpg');
    });

    it('여러 필드를 동시에 업데이트할 수 있어야 함', () => {
      const store = useFileStore.getState();

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      act(() => {
        store.addFiles([file]);
      });

      const state1 = getStoreState();
      const fileId = state1.files[0].id;

      act(() => {
        store.updateFile(fileId, {
          name: 'updated.jpg',
          progress: 75,
          status: 'processing',
        });
      });

      const state2 = getStoreState();
      expect(state2.files[0].name).toBe('updated.jpg');
      expect(state2.files[0].progress).toBe(75);
      expect(state2.files[0].status).toBe('processing');
    });
  });
});
