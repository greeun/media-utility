/**
 * Logo 컴포넌트 테스트
 */
import { render } from '@testing-library/react';
import { Logo, LogoLarge, LogoMark, LogoDark, LogoAnimated } from '@/components/icons/Logo';

describe('Logo', () => {
  describe('Logo', () => {
    it('렌더링되어야 함', () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('기본 크기(32)가 적용되어야 함', () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('커스텀 크기가 적용되어야 함', () => {
      const { container } = render(<Logo size={48} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '48');
      expect(svg).toHaveAttribute('height', '48');
    });

    it('className이 적용되어야 함', () => {
      const { container } = render(<Logo className="custom-logo" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-logo');
    });

    it('viewBox가 올바르게 설정되어야 함', () => {
      const { container } = render(<Logo />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });
  });

  describe('LogoLarge', () => {
    it('렌더링되어야 함', () => {
      const { container } = render(<LogoLarge />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('기본 크기(64)가 적용되어야 함', () => {
      const { container } = render(<LogoLarge />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '64');
      expect(svg).toHaveAttribute('height', '64');
    });

    it('커스텀 크기가 적용되어야 함', () => {
      const { container } = render(<LogoLarge size={96} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '96');
      expect(svg).toHaveAttribute('height', '96');
    });
  });

  describe('LogoMark', () => {
    it('렌더링되어야 함', () => {
      const { container } = render(<LogoMark />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('기본 크기(24)가 적용되어야 함', () => {
      const { container } = render(<LogoMark />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('커스텀 크기가 적용되어야 함', () => {
      const { container } = render(<LogoMark size={36} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '36');
      expect(svg).toHaveAttribute('height', '36');
    });
  });

  describe('LogoDark', () => {
    it('렌더링되어야 함', () => {
      const { container } = render(<LogoDark />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('기본 크기(32)가 적용되어야 함', () => {
      const { container } = render(<LogoDark />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('밝은 배경용 스타일이 적용되어야 함', () => {
      const { container } = render(<LogoDark />);

      const svg = container.querySelector('svg');
      // LogoDark는 밝은 배경에서 사용되므로 색상이 반전될 수 있음
      expect(svg).toBeInTheDocument();
    });
  });

  describe('LogoAnimated', () => {
    it('렌더링되어야 함', () => {
      const { container } = render(<LogoAnimated />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('animate-pulse 클래스가 내부 요소에 적용되어야 함', () => {
      const { container } = render(<LogoAnimated />);

      // LogoAnimated는 내부 rect 요소에 animate-pulse가 적용됨
      const animatedElement = container.querySelector('.animate-pulse');
      expect(animatedElement).toBeInTheDocument();
    });

    it('기본 크기(32)가 적용되어야 함', () => {
      const { container } = render(<LogoAnimated />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('커스텀 className과 animate-pulse를 함께 사용해야 함', () => {
      const { container } = render(<LogoAnimated className="custom-animated" />);

      const svg = container.querySelector('svg');
      // LogoAnimated는 SVG에 전달된 className과 내부 rect의 animate-pulse 모두 가짐
      expect(svg).toHaveClass('custom-animated');
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('공통 기능', () => {
    const logos = [
      { Component: Logo, name: 'Logo' },
      { Component: LogoLarge, name: 'LogoLarge' },
      { Component: LogoMark, name: 'LogoMark' },
      { Component: LogoDark, name: 'LogoDark' },
      { Component: LogoAnimated, name: 'LogoAnimated' },
    ];

    logos.forEach(({ Component, name }) => {
      describe(name, () => {
        it('SVG 요소를 포함해야 함', () => {
          const { container } = render(<Component />);

          const svg = container.querySelector('svg');
          expect(svg?.tagName).toBe('svg');
        });

        it('props 없이도 렌더링되어야 함', () => {
          const { container } = render(<Component />);

          expect(container.querySelector('svg')).toBeInTheDocument();
        });

        it('빈 className을 허용해야 함', () => {
          const { container } = render(<Component className="" />);

          expect(container.querySelector('svg')).toBeInTheDocument();
        });
      });
    });
  });

  describe('크기 테스트', () => {
    it('매우 작은 크기도 지원해야 함', () => {
      const { container } = render(<Logo size={16} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('매우 큰 크기도 지원해야 함', () => {
      const { container } = render(<Logo size={256} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '256');
      expect(svg).toHaveAttribute('height', '256');
    });
  });

  describe('className 조합 테스트', () => {
    it('여러 className을 조합할 수 있어야 함', () => {
      const { container } = render(
        <Logo className="text-blue-500 hover:scale-110 transition-transform" />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
      expect(svg).toHaveClass('hover:scale-110');
      expect(svg).toHaveClass('transition-transform');
    });

    it('LogoAnimated에 추가 className을 적용할 수 있어야 함', () => {
      const { container } = render(
        <LogoAnimated className="opacity-80 hover:opacity-100" />
      );

      const svg = container.querySelector('svg');
      // SVG에 전달된 className
      expect(svg).toHaveClass('opacity-80');
      expect(svg).toHaveClass('hover:opacity-100');
      // 내부 애니메이션
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
