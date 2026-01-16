/**
 * FileUploader 컴포넌트 테스트
 */
import { render, screen, fireEvent } from '@testing-library/react'
import FileUploader from '@/components/upload/FileUploader'

// next-intl mock
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      dragOrClick: '파일을 드래그하거나 클릭하여 업로드',
      maxFiles: `최대 ${params?.count}개, ${params?.size}MB까지`,
      maxFilesError: `최대 ${params?.count}개 파일만 업로드 가능합니다`,
      fileSizeError: `파일 크기는 ${params?.size}MB를 초과할 수 없습니다`,
      image: '이미지',
      video: '비디오',
    }
    return translations[key] || key
  },
}))

describe('FileUploader', () => {
  const mockOnFilesSelected = jest.fn()

  beforeEach(() => {
    mockOnFilesSelected.mockClear()
  })

  it('컴포넌트가 정상적으로 렌더링되어야 함', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    expect(screen.getByText('파일을 드래그하거나 클릭하여 업로드')).toBeInTheDocument()
    expect(screen.getByText('이미지')).toBeInTheDocument()
    expect(screen.getByText('비디오')).toBeInTheDocument()
  })

  it('파일 입력 요소가 숨겨져 있어야 함', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const input = document.getElementById('file-input') as HTMLInputElement
    expect(input).toHaveClass('hidden')
  })

  it('파일 선택 시 콜백이 호출되어야 함', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const input = document.getElementById('file-input') as HTMLInputElement
    const file = new File(['test'], 'test.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(mockOnFilesSelected).toHaveBeenCalledWith([file])
  })

  it('최대 파일 개수 초과 시 경고 메시지 표시', () => {
    render(
      <FileUploader onFilesSelected={mockOnFilesSelected} maxFiles={2} />
    )

    const input = document.getElementById('file-input') as HTMLInputElement
    const files = [
      new File(['test1'], 'test1.png', { type: 'image/png' }),
      new File(['test2'], 'test2.png', { type: 'image/png' }),
      new File(['test3'], 'test3.png', { type: 'image/png' }),
    ]

    fireEvent.change(input, { target: { files } })

    expect(screen.getByText('최대 2개 파일만 업로드 가능합니다')).toBeInTheDocument()
    expect(mockOnFilesSelected).toHaveBeenCalledWith(files.slice(0, 2))
  })

  it('드래그 오버 시 스타일이 변경되어야 함', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const dropZone = screen.getByText('파일을 드래그하거나 클릭하여 업로드').closest('div[class*="border-dashed"]')!

    fireEvent.dragOver(dropZone)

    expect(dropZone).toHaveClass('border-[oklch(0.75_0.18_195)]')
  })

  it('드래그 리브 시 스타일이 원래대로 돌아와야 함', () => {
    render(<FileUploader onFilesSelected={mockOnFilesSelected} />)

    const dropZone = screen.getByText('파일을 드래그하거나 클릭하여 업로드').closest('div[class*="border-dashed"]')!

    fireEvent.dragOver(dropZone)
    fireEvent.dragLeave(dropZone)

    expect(dropZone).not.toHaveClass('border-[oklch(0.75_0.18_195)]')
  })
})
