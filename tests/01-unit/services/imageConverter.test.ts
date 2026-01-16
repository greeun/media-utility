/**
 * imageConverter 서비스 유닛 테스트
 */
import { getFileExtension, generateNewFilename } from '@/services/imageConverter'

describe('imageConverter', () => {
  describe('getFileExtension', () => {
    it('파일 확장자를 정상적으로 추출해야 함', () => {
      expect(getFileExtension('image.png')).toBe('png')
      expect(getFileExtension('photo.jpg')).toBe('jpg')
      expect(getFileExtension('image.WEBP')).toBe('webp')
    })

    it('확장자가 없는 경우 파일명 자체를 반환', () => {
      expect(getFileExtension('filename')).toBe('filename')
    })

    it('여러 점이 있는 파일명에서 마지막 확장자 추출', () => {
      expect(getFileExtension('my.photo.backup.jpg')).toBe('jpg')
    })
  })

  describe('generateNewFilename', () => {
    it('새 확장자로 파일명을 생성해야 함', () => {
      expect(generateNewFilename('image.png', 'webp')).toBe('image.webp')
      expect(generateNewFilename('photo.jpg', 'png')).toBe('photo.png')
    })

    it('여러 점이 있는 파일명도 처리해야 함', () => {
      expect(generateNewFilename('my.photo.png', 'jpg')).toBe('my.photo.jpg')
    })

    it('확장자가 없는 파일명도 처리해야 함', () => {
      expect(generateNewFilename('filename', 'png')).toBe('filename.png')
    })
  })
})
