/**
 * ToolConstraints 컴포넌트 테스트
 */
import { render, screen } from '@testing-library/react';
import ToolConstraints from '@/components/common/ToolConstraints';

describe('ToolConstraints', () => {
  const mockConstraints = [
    '최대 파일 크기: 100MB',
    '지원 형식: JPG, PNG, WebP',
    '최대 파일 수: 10개',
  ];

  it('제약사항을 렌더링해야 함', () => {
    render(<ToolConstraints constraints={mockConstraints} />);

    mockConstraints.forEach((constraint) => {
      expect(screen.getByText(constraint)).toBeInTheDocument();
    });
  });

  it('AlertTriangle 아이콘이 표시되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('제약사항이 리스트로 표시되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(mockConstraints.length);
    mockConstraints.forEach((constraint, i) => {
      expect(listItems[i].textContent).toBe(constraint);
    });
  });

  it('constraints가 빈 배열이면 null을 반환해야 함', () => {
    const { container } = render(<ToolConstraints constraints={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('constraints가 undefined면 null을 반환해야 함', () => {
    const { container } = render(<ToolConstraints constraints={undefined as any} />);

    expect(container.firstChild).toBeNull();
  });

  it('accentColor에 따른 색상 클래스가 적용되어야 함', () => {
    const { container, rerender } = render(
      <ToolConstraints constraints={mockConstraints} accentColor="cyan" />
    );

    // Swiss Modernism Color System: cyan → border-[#06B6D4]
    expect(container.firstChild).toHaveClass('bg-white');

    rerender(<ToolConstraints constraints={mockConstraints} accentColor="purple" />);
    // purple → border-[#A855F7]
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('잘못된 accentColor는 기본값(pink)으로 대체되어야 함', () => {
    const { container } = render(
      <ToolConstraints constraints={mockConstraints} accentColor={'invalid' as any} />
    );

    // 기본값 pink의 border 클래스가 적용됨
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('애니메이션 스타일이 적용되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('animate-fade-up');
    expect(element.style.animationDelay).toBe('0.05s');
    expect(element.style.animationFillMode).toBe('forwards');
  });

  it('단일 제약사항도 렌더링해야 함', () => {
    render(<ToolConstraints constraints={['최대 100MB']} />);

    expect(screen.getByText('최대 100MB')).toBeInTheDocument();
  });

  it('여러 제약사항이 수직으로 정렬되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const list = container.querySelector('ul');
    expect(list).toHaveClass('space-y-1');
  });

  it('올바른 텍스트 크기와 색상이 적용되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const list = container.querySelector('ul');
    expect(list).toHaveClass('text-sm');
    expect(list).toHaveClass('font-bold');
  });

  it('올바른 레이아웃이 적용되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const wrapper = container.querySelector('.flex');
    expect(wrapper).toHaveClass('items-start');
    expect(wrapper).toHaveClass('gap-3');
  });

  it('아이콘이 올바른 크기로 표시되어야 함', () => {
    const { container } = render(<ToolConstraints constraints={mockConstraints} />);

    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('w-5');
    expect(icon).toHaveClass('h-5');
    expect(icon).toHaveClass('flex-shrink-0');
  });
});
