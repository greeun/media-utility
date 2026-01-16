/**
 * fileStore Zustand 스토어 유닛 테스트
 */

// uuid mock
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}))

import { useFileStore } from '@/stores/fileStore'
import { act } from '@testing-library/react'

// URL mock
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = jest.fn()

beforeAll(() => {
  global.URL.createObjectURL = mockCreateObjectURL
  global.URL.revokeObjectURL = mockRevokeObjectURL
})

beforeEach(() => {
  // 스토어 초기화
  act(() => {
    useFileStore.getState().clearFiles()
  })
  jest.clearAllMocks()
})

describe('fileStore', () => {
  describe('addFiles', () => {
    it('파일을 추가해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const { files } = useFileStore.getState()
      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('test.png')
      expect(files[0].status).toBe('pending')
      expect(files[0].progress).toBe(0)
    })

    it('여러 파일을 추가해야 함', () => {
      const files = [
        new File(['test1'], 'test1.png', { type: 'image/png' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]

      act(() => {
        useFileStore.getState().addFiles(files)
      })

      expect(useFileStore.getState().files).toHaveLength(2)
    })

    it('이미지/비디오 파일에 대해 preview URL을 생성해야 함', () => {
      const imageFile = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([imageFile])
      })

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(useFileStore.getState().files[0].preview).toBe('blob:mock-url')
    })
  })

  describe('removeFile', () => {
    it('파일을 제거해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id

      act(() => {
        useFileStore.getState().removeFile(fileId)
      })

      expect(useFileStore.getState().files).toHaveLength(0)
    })

    it('제거 시 preview URL을 해제해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id

      act(() => {
        useFileStore.getState().removeFile(fileId)
      })

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('updateFile', () => {
    it('파일 정보를 업데이트해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id

      act(() => {
        useFileStore.getState().updateFile(fileId, { name: 'updated.png' })
      })

      expect(useFileStore.getState().files[0].name).toBe('updated.png')
    })
  })

  describe('clearFiles', () => {
    it('모든 파일을 제거해야 함', () => {
      const files = [
        new File(['test1'], 'test1.png', { type: 'image/png' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]

      act(() => {
        useFileStore.getState().addFiles(files)
      })

      act(() => {
        useFileStore.getState().clearFiles()
      })

      expect(useFileStore.getState().files).toHaveLength(0)
    })

    it('모든 preview URL을 해제해야 함', () => {
      const files = [
        new File(['test1'], 'test1.png', { type: 'image/png' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ]

      act(() => {
        useFileStore.getState().addFiles(files)
      })

      act(() => {
        useFileStore.getState().clearFiles()
      })

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2)
    })
  })

  describe('setProgress', () => {
    it('진행률을 설정하고 상태를 processing으로 변경해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id

      act(() => {
        useFileStore.getState().setProgress(fileId, 50)
      })

      const updatedFile = useFileStore.getState().files[0]
      expect(updatedFile.progress).toBe(50)
      expect(updatedFile.status).toBe('processing')
    })
  })

  describe('setResult', () => {
    it('결과를 설정하고 상태를 completed로 변경해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id
      const resultBlob = new Blob(['result'], { type: 'image/png' })

      act(() => {
        useFileStore.getState().setResult(fileId, resultBlob)
      })

      const updatedFile = useFileStore.getState().files[0]
      expect(updatedFile.result).toBe(resultBlob)
      expect(updatedFile.status).toBe('completed')
      expect(updatedFile.progress).toBe(100)
    })
  })

  describe('setError', () => {
    it('에러를 설정하고 상태를 error로 변경해야 함', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' })

      act(() => {
        useFileStore.getState().addFiles([file])
      })

      const fileId = useFileStore.getState().files[0].id

      act(() => {
        useFileStore.getState().setError(fileId, '변환 실패')
      })

      const updatedFile = useFileStore.getState().files[0]
      expect(updatedFile.error).toBe('변환 실패')
      expect(updatedFile.status).toBe('error')
    })
  })
})
