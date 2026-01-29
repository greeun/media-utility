/**
 * 통합 테스트 헬퍼 함수
 */

import { useFileStore } from '@/stores/fileStore';
import { act } from '@testing-library/react';

/**
 * 스토어 상태를 가져오는 헬퍼 함수
 */
export const getStoreState = () => useFileStore.getState();

/**
 * 스토어 메서드를 act로 감싸서 실행하는 헬퍼 함수
 */
export const withAct = <T>(fn: () => T): T => {
  let result: T;
  act(() => {
    result = fn();
  });
  return result!;
};
