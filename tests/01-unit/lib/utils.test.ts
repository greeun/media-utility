/**
 * lib/utils 유닛 테스트
 */
import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (className merge)', () => {
    it('단일 클래스를 반환해야 함', () => {
      expect(cn('text-red-500')).toBe('text-red-500')
    })

    it('여러 클래스를 합쳐야 함', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('조건부 클래스를 처리해야 함', () => {
      expect(cn('base', true && 'active')).toBe('base active')
      expect(cn('base', false && 'hidden')).toBe('base')
    })

    it('Tailwind 충돌 클래스를 병합해야 함', () => {
      // tailwind-merge가 충돌하는 클래스를 해결
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
      expect(cn('p-4', 'p-8')).toBe('p-8')
    })

    it('undefined와 null을 무시해야 함', () => {
      expect(cn('base', undefined, null, 'active')).toBe('base active')
    })

    it('배열 형태의 클래스를 처리해야 함', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
    })

    it('객체 형태의 조건부 클래스를 처리해야 함', () => {
      expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
    })

    it('빈 입력에 대해 빈 문자열 반환', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })
  })
})
