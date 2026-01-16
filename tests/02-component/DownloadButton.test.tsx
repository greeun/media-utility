/**
 * DownloadButton 컴포넌트 테스트
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DownloadButton from '@/components/common/DownloadButton'

// file-saver mock
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

import { saveAs } from 'file-saver'

describe('DownloadButton', () => {
  const mockBlob = new Blob(['test content'], { type: 'image/png' })
  const mockFilename = 'test-image.png'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('기본 렌더링이 되어야 함', () => {
    render(<DownloadButton blob={mockBlob} filename={mockFilename} />)

    expect(screen.getByText('다운로드')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('클릭 시 saveAs를 호출해야 함', () => {
    render(<DownloadButton blob={mockBlob} filename={mockFilename} />)

    fireEvent.click(screen.getByRole('button'))

    expect(saveAs).toHaveBeenCalledWith(mockBlob, mockFilename)
  })

  it('다운로드 후 "다운로드됨" 텍스트로 변경되어야 함', () => {
    render(<DownloadButton blob={mockBlob} filename={mockFilename} />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('다운로드됨')).toBeInTheDocument()
  })

  it('2초 후 원래 텍스트로 돌아와야 함', async () => {
    render(<DownloadButton blob={mockBlob} filename={mockFilename} />)

    fireEvent.click(screen.getByRole('button'))

    expect(screen.getByText('다운로드됨')).toBeInTheDocument()

    // 2초 경과
    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText('다운로드')).toBeInTheDocument()
    })
  })

  it('disabled 상태일 때 클릭해도 동작하지 않아야 함', () => {
    render(<DownloadButton blob={mockBlob} filename={mockFilename} disabled={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    fireEvent.click(button)

    expect(saveAs).not.toHaveBeenCalled()
  })

  it('custom className이 적용되어야 함', () => {
    render(
      <DownloadButton
        blob={mockBlob}
        filename={mockFilename}
        className="custom-class"
      />
    )

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
