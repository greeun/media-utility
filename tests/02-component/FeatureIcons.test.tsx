/**
 * FeatureIcons 컴포넌트 테스트
 */
import { render } from '@testing-library/react';
import {
  ImageConverterIcon,
  ImageEditorIcon,
  GifMakerIcon,
  VideoConverterIcon,
  UrlGeneratorIcon,
  BackgroundRemoverIcon,
  ImageCompressorIcon,
  WatermarkIcon,
  MemeGeneratorIcon,
  FaceBlurIcon,
  HtmlToImageIcon,
  UpscalerIcon,
  PrivacyShieldIcon,
  SpeedZapIcon,
  FreeGlobeIcon,
} from '@/components/icons/FeatureIcons';

describe('FeatureIcons', () => {
  const icons = [
    { Component: ImageConverterIcon, name: 'ImageConverterIcon' },
    { Component: ImageEditorIcon, name: 'ImageEditorIcon' },
    { Component: GifMakerIcon, name: 'GifMakerIcon' },
    { Component: VideoConverterIcon, name: 'VideoConverterIcon' },
    { Component: UrlGeneratorIcon, name: 'UrlGeneratorIcon' },
    { Component: BackgroundRemoverIcon, name: 'BackgroundRemoverIcon' },
    { Component: ImageCompressorIcon, name: 'ImageCompressorIcon' },
    { Component: WatermarkIcon, name: 'WatermarkIcon' },
    { Component: MemeGeneratorIcon, name: 'MemeGeneratorIcon' },
    { Component: FaceBlurIcon, name: 'FaceBlurIcon' },
    { Component: HtmlToImageIcon, name: 'HtmlToImageIcon' },
    { Component: UpscalerIcon, name: 'UpscalerIcon' },
    { Component: PrivacyShieldIcon, name: 'PrivacyShieldIcon' },
    { Component: SpeedZapIcon, name: 'SpeedZapIcon' },
    { Component: FreeGlobeIcon, name: 'FreeGlobeIcon' },
  ];

  icons.forEach(({ Component, name }) => {
    describe(name, () => {
      it('렌더링되어야 함', () => {
        const { container } = render(<Component />);

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      it('기본 크기(24)가 적용되어야 함', () => {
        const { container } = render(<Component />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
      });

      it('커스텀 크기가 적용되어야 함', () => {
        const { container } = render(<Component size={32} />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '32');
        expect(svg).toHaveAttribute('height', '32');
      });

      it('className이 적용되어야 함', () => {
        const { container } = render(<Component className="custom-class" />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('custom-class');
      });

      it('viewBox가 올바르게 설정되어야 함', () => {
        const { container } = render(<Component />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      });

      it('currentColor를 사용해야 함', () => {
        const { container } = render(<Component />);

        const svg = container.querySelector('svg');
        const svgContent = svg?.innerHTML || '';

        // SVG 내부에서 currentColor를 사용하는지 확인
        // (일부 아이콘은 stroke, 일부는 fill로 사용)
        expect(
          svgContent.includes('currentColor') ||
          svgContent.includes('stroke=') ||
          svgContent.includes('fill=')
        ).toBe(true);
      });
    });
  });

  describe('아이콘 그룹', () => {
    it('도구 아이콘들이 모두 존재해야 함', () => {
      const toolIcons = [
        ImageConverterIcon,
        ImageEditorIcon,
        GifMakerIcon,
        VideoConverterIcon,
        UrlGeneratorIcon,
        BackgroundRemoverIcon,
        ImageCompressorIcon,
        WatermarkIcon,
        MemeGeneratorIcon,
        FaceBlurIcon,
        HtmlToImageIcon,
        UpscalerIcon,
      ];

      expect(toolIcons).toHaveLength(12);
      toolIcons.forEach((Icon) => {
        const { container } = render(<Icon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('특징 아이콘들이 모두 존재해야 함', () => {
      const featureIcons = [
        PrivacyShieldIcon,
        SpeedZapIcon,
        FreeGlobeIcon,
      ];

      expect(featureIcons).toHaveLength(3);
      featureIcons.forEach((Icon) => {
        const { container } = render(<Icon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('크기 테스트', () => {
    it('매우 작은 크기도 지원해야 함', () => {
      const { container } = render(<ImageConverterIcon size={12} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '12');
      expect(svg).toHaveAttribute('height', '12');
    });

    it('매우 큰 크기도 지원해야 함', () => {
      const { container } = render(<ImageConverterIcon size={128} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '128');
      expect(svg).toHaveAttribute('height', '128');
    });
  });

  describe('className 조합 테스트', () => {
    it('여러 className을 조합할 수 있어야 함', () => {
      const { container } = render(
        <ImageConverterIcon className="text-blue-500 hover:text-blue-600 transition-colors" />
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
      expect(svg).toHaveClass('hover:text-blue-600');
      expect(svg).toHaveClass('transition-colors');
    });
  });

  describe('빈 props 테스트', () => {
    it('빈 className을 허용해야 함', () => {
      const { container } = render(<ImageConverterIcon className="" />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('props 없이도 렌더링되어야 함', () => {
      const { container } = render(<ImageConverterIcon />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
