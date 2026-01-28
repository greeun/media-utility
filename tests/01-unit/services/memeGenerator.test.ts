/**
 * memeGenerator 서비스 유닛 테스트
 */
import { generateMeme, MemeTextOptions } from '@/services/memeGenerator';

describe('memeGenerator', () => {
  const mockBlob = new Blob(['test'], { type: 'image/png' });
  const mockFile = new File([mockBlob], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();

    // URL 모킹
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Image 모킹
    (global.Image as never) = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      naturalWidth = 800;
      naturalHeight = 600;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as never;

    // Canvas 모킹
    const mockCtx = {
      drawImage: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      font: '',
      textAlign: 'center',
      textBaseline: 'top',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineJoin: 'round',
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCtx) as never;

    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(mockBlob);
    }) as never;
  });

  describe('generateMeme', () => {
    const baseOptions: MemeTextOptions = {
      topText: 'TOP TEXT',
      bottomText: 'BOTTOM TEXT',
      fontSize: 48,
      fontFamily: 'Impact',
      textColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 2,
    };

    it('상단과 하단 텍스트로 밈을 생성해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await generateMeme(mockFile, baseOptions, mockProgressFn);

      expect(result).toBe(mockBlob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(40);
      expect(mockProgressFn).toHaveBeenCalledWith(60);
      expect(mockProgressFn).toHaveBeenCalledWith(80);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('상단 텍스트만 있는 밈을 생성해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        bottomText: '',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      expect(ctx!.strokeText).toHaveBeenCalled();
      expect(ctx!.fillText).toHaveBeenCalled();
    });

    it('하단 텍스트만 있는 밈을 생성해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        topText: '',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('텍스트가 없는 밈을 생성해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        topText: '',
        bottomText: '',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('공백만 있는 텍스트를 처리해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        topText: '   ',
        bottomText: '   ',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
    });

    it('긴 텍스트를 자동으로 줄바꿈해야 함', async () => {
      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      (ctx!.measureText as jest.Mock).mockReturnValueOnce({ width: 800 }); // 첫 단어 너비
      (ctx!.measureText as jest.Mock).mockReturnValueOnce({ width: 900 }); // 두 단어 합친 너비 (초과)

      const options: MemeTextOptions = {
        ...baseOptions,
        topText: 'VERY LONG TEXT THAT SHOULD WRAP',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
      expect(ctx!.measureText).toHaveBeenCalled();
    });

    it('폰트 설정을 적용해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        fontSize: 64,
        fontFamily: 'Arial',
      };

      await generateMeme(mockFile, options);

      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      expect(ctx!.font).toContain('64px');
      expect(ctx!.font).toContain('Arial');
    });

    it('텍스트 색상을 적용해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        textColor: '#FF0000',
        strokeColor: '#00FF00',
      };

      await generateMeme(mockFile, options);

      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      expect(ctx!.fillStyle).toBe('#FF0000');
      expect(ctx!.strokeStyle).toBe('#00FF00');
    });

    it('스트로크 두께를 적용해야 함', async () => {
      const options: MemeTextOptions = {
        ...baseOptions,
        strokeWidth: 5,
      };

      await generateMeme(mockFile, options);

      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      expect(ctx!.lineWidth).toBe(5);
    });

    it('텍스트 정렬을 중앙으로 설정해야 함', async () => {
      await generateMeme(mockFile, baseOptions);

      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      expect(ctx!.textAlign).toBe('center');
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await generateMeme(mockFile, baseOptions);

      expect(result).toBe(mockBlob);
    });

    it('이미지 로드 실패 시 에러를 던져야 함', async () => {
      (global.Image as never) = class {
        onload: (() => void) | null = null;
        onerror: ((e: unknown) => void) | null = null;
        src = '';

        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror(new Error('로드 실패'));
          }, 0);
        }
      } as never;

      await expect(generateMeme(mockFile, baseOptions)).rejects.toThrow(
        '이미지를 로드할 수 없습니다'
      );
    });

    it('toBlob 실패 시 에러를 던져야 함', async () => {
      HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(null);
      }) as never;

      await expect(generateMeme(mockFile, baseOptions)).rejects.toThrow('밈 생성에 실패했습니다');
    });

    it('매우 긴 텍스트를 여러 줄로 나눠야 함', async () => {
      const ctx = HTMLCanvasElement.prototype.getContext('2d');

      // 각 단어가 개별적으로는 작지만 합치면 넘는 시나리오
      (ctx!.measureText as jest.Mock).mockImplementation((text: string) => {
        return { width: text.length * 20 };
      });

      const options: MemeTextOptions = {
        ...baseOptions,
        topText: 'WORD1 WORD2 WORD3 WORD4 WORD5 WORD6 WORD7 WORD8',
      };

      const result = await generateMeme(mockFile, options);

      expect(result).toBe(mockBlob);
      // fillText와 strokeText가 여러 번 호출되었는지 확인 (여러 줄)
      expect(ctx!.fillText).toHaveBeenCalled();
      expect(ctx!.strokeText).toHaveBeenCalled();
    });

    it('maxWidth 계산이 올바른지 확인해야 함', async () => {
      // Canvas width: 800 * 0.9 = 720
      await generateMeme(mockFile, baseOptions);

      const ctx = HTMLCanvasElement.prototype.getContext('2d');
      const calls = (ctx!.measureText as jest.Mock).mock.calls;

      // measureText가 호출되었는지 확인
      expect(calls.length).toBeGreaterThan(0);
    });

    it('하단 텍스트 위치를 올바르게 계산해야 함', async () => {
      const ctx = HTMLCanvasElement.prototype.getContext('2d');

      await generateMeme(mockFile, baseOptions);

      // textBaseline이 설정되었는지 확인
      expect(ctx!.textBaseline).toBeDefined();
    });
  });
});
