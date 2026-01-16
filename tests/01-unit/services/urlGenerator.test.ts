/**
 * urlGenerator 서비스 유닛 테스트
 */
import { formatFileSize, getDataUrlSize } from '@/services/urlGenerator'

describe('urlGenerator', () => {
  describe('formatFileSize', () => {
    it('0 바이트를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('바이트 단위를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
    })

    it('KB 단위를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(10240)).toBe('10 KB')
    })

    it('MB 단위를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
      expect(formatFileSize(100 * 1024 * 1024)).toBe('100 MB')
    })

    it('GB 단위를 올바르게 포맷해야 함', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
    })
  })

  describe('getDataUrlSize', () => {
    it('Data URL의 크기를 올바르게 계산해야 함', () => {
      // Base64: 4글자 = 3바이트
      const base64 = 'data:image/png;base64,AAAA'
      const size = getDataUrlSize(base64)
      expect(size).toBe(3) // 4 * 3 / 4 = 3
    })

    it('긴 Data URL의 크기를 올바르게 계산해야 함', () => {
      // 16글자 base64 = 12바이트
      const base64 = 'data:image/png;base64,AAAAAAAAAAAAAAAA'
      const size = getDataUrlSize(base64)
      expect(size).toBe(12) // 16 * 3 / 4 = 12
    })

    it('쉼표 없는 순수 base64 문자열도 처리해야 함', () => {
      const base64 = 'AAAAAAAA' // 8글자 = 6바이트
      const size = getDataUrlSize(base64)
      expect(size).toBe(6)
    })
  })
})
