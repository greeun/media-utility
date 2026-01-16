/**
 * ProgressBar 컴포넌트 테스트
 */
import { render, screen } from '@testing-library/react'
import ProgressBar from '@/components/common/ProgressBar'

describe('ProgressBar', () => {
  it('기본 렌더링이 되어야 함', () => {
    render(<ProgressBar progress={50} status="processing" />)

    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('처리 중...')).toBeInTheDocument()
  })

  describe('상태별 텍스트 표시', () => {
    it('pending 상태일 때 "대기 중" 표시', () => {
      render(<ProgressBar progress={0} status="pending" />)
      expect(screen.getByText('대기 중')).toBeInTheDocument()
    })

    it('processing 상태일 때 "처리 중..." 표시', () => {
      render(<ProgressBar progress={50} status="processing" />)
      expect(screen.getByText('처리 중...')).toBeInTheDocument()
    })

    it('completed 상태일 때 "완료" 표시', () => {
      render(<ProgressBar progress={100} status="completed" />)
      expect(screen.getByText('완료')).toBeInTheDocument()
    })

    it('error 상태일 때 "오류" 표시', () => {
      render(<ProgressBar progress={30} status="error" />)
      expect(screen.getByText('오류')).toBeInTheDocument()
    })
  })

  describe('progress 표시', () => {
    it('진행률을 퍼센트로 표시해야 함', () => {
      render(<ProgressBar progress={75} status="processing" />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('소수점 진행률을 반올림해서 표시해야 함', () => {
      render(<ProgressBar progress={33.7} status="processing" />)
      expect(screen.getByText('34%')).toBeInTheDocument()
    })

    it('0% 진행률을 표시해야 함', () => {
      render(<ProgressBar progress={0} status="pending" />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('100% 진행률을 표시해야 함', () => {
      render(<ProgressBar progress={100} status="completed" />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('showLabel prop', () => {
    it('showLabel이 true일 때 레이블을 표시해야 함', () => {
      render(<ProgressBar progress={50} status="processing" showLabel={true} />)
      expect(screen.getByText('처리 중...')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('showLabel이 false일 때 레이블을 숨겨야 함', () => {
      render(<ProgressBar progress={50} status="processing" showLabel={false} />)
      expect(screen.queryByText('처리 중...')).not.toBeInTheDocument()
      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })
  })

  describe('progress bar width', () => {
    it('진행률에 따라 너비가 설정되어야 함', () => {
      const { container } = render(<ProgressBar progress={75} status="processing" />)

      const progressBarFill = container.querySelector('[style*="width"]')
      expect(progressBarFill).toHaveStyle({ width: '75%' })
    })
  })
})
