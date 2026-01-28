/**
 * videoProcessor 서비스 유닛 테스트
 */
import { initFFmpeg, videoToGif, gifToMp4, extractFrames, createThumbnail } from '@/services/videoProcessor';

// @ffmpeg/ffmpeg 모킹
const mockFFmpeg = {
  loaded: false,
  load: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  deleteFile: jest.fn(),
  exec: jest.fn(),
  on: jest.fn(),
};

jest.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: jest.fn(() => mockFFmpeg),
}));

jest.mock('@ffmpeg/util', () => ({
  fetchFile: jest.fn((file) => Promise.resolve(new Uint8Array([1, 2, 3]))),
  toBlobURL: jest.fn((url) => Promise.resolve(url)),
}));

describe('videoProcessor', () => {
  const mockBlob = new Blob(['test'], { type: 'video/mp4' });
  const mockFile = new File([mockBlob], 'test.mp4', { type: 'video/mp4' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFFmpeg.loaded = false;
    mockFFmpeg.load.mockResolvedValue(undefined);
    mockFFmpeg.exec.mockResolvedValue(undefined);
    mockFFmpeg.readFile.mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]));
  });

  describe('initFFmpeg', () => {
    it('FFmpeg을 초기화해야 함', async () => {
      const result = await initFFmpeg();

      expect(result).toBe(mockFFmpeg);
      expect(mockFFmpeg.load).toHaveBeenCalled();
    });

    it('이미 로드된 경우 재사용해야 함', async () => {
      mockFFmpeg.loaded = true;

      const result1 = await initFFmpeg();
      const result2 = await initFFmpeg();

      expect(result1).toBe(result2);
      expect(mockFFmpeg.load).not.toHaveBeenCalled();
    });

    it('로컬 파일로 로드를 시도해야 함', async () => {
      await initFFmpeg();

      expect(mockFFmpeg.load).toHaveBeenCalledWith({
        coreURL: expect.stringContaining('/ffmpeg/ffmpeg-core.js'),
        wasmURL: expect.stringContaining('/ffmpeg/ffmpeg-core.wasm'),
      });
    });

    it('로컬 실패 시 CDN으로 폴백해야 함', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockFFmpeg.load.mockRejectedValueOnce(new Error('로컬 로드 실패')).mockResolvedValueOnce(undefined);

      await initFFmpeg();

      expect(mockFFmpeg.load).toHaveBeenCalledTimes(2);
      consoleError.mockRestore();
    });

    it('진행률 콜백을 등록해야 함', async () => {
      const mockProgressFn = jest.fn();

      await initFFmpeg(mockProgressFn);

      expect(mockFFmpeg.on).toHaveBeenCalledWith('log', expect.any(Function));
      expect(mockFFmpeg.on).toHaveBeenCalledWith('progress', expect.any(Function));
    });

    it('로드 실패 시 에러를 던져야 함', async () => {
      mockFFmpeg.load.mockRejectedValue(new Error('로드 실패'));

      await expect(initFFmpeg()).rejects.toThrow('로드 실패');
    });
  });

  describe('videoToGif', () => {
    it('비디오를 GIF로 변환해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await videoToGif(mockFile, {}, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/gif');
      expect(mockFFmpeg.writeFile).toHaveBeenCalled();
      expect(mockFFmpeg.exec).toHaveBeenCalled();
      expect(mockFFmpeg.readFile).toHaveBeenCalledWith('output.gif');
      expect(mockFFmpeg.deleteFile).toHaveBeenCalledWith(expect.stringContaining('input'));
      expect(mockFFmpeg.deleteFile).toHaveBeenCalledWith('output.gif');
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(30);
      expect(mockProgressFn).toHaveBeenCalledWith(80);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('커스텀 옵션으로 변환해야 함', async () => {
      await videoToGif(mockFile, {
        fps: 15,
        startTime: 5,
        duration: 10,
        width: 640,
      });

      // exec가 올바른 인자로 호출되었는지 확인
      expect(mockFFmpeg.exec).toHaveBeenCalled();
      const execArgs = mockFFmpeg.exec.mock.calls[0][0];
      expect(execArgs).toContain('-ss');
      expect(execArgs).toContain('5');
      expect(execArgs).toContain('-t');
      expect(execArgs).toContain('10');
      expect(execArgs).toContain('-loop');
      expect(execArgs).toContain('0');
      expect(execArgs).toContain('output.gif');
    });

    it('기본 옵션으로 변환해야 함', async () => {
      await videoToGif(mockFile);

      expect(mockFFmpeg.exec).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('-vf'),
          expect.stringMatching(/fps=10/),
        ])
      );
    });

    it('진행률 콜백이 없어도 정상 동작해야 함', async () => {
      const result = await videoToGif(mockFile);

      expect(result).toBeInstanceOf(Blob);
    });

    it('exec 실패 시 에러를 던져야 함', async () => {
      mockFFmpeg.exec.mockRejectedValue(new Error('변환 실패'));

      await expect(videoToGif(mockFile)).rejects.toThrow('변환 실패');
    });
  });

  describe('gifToMp4', () => {
    it('GIF를 MP4로 변환해야 함', async () => {
      const gifFile = new File([mockBlob], 'test.gif', { type: 'image/gif' });
      const mockProgressFn = jest.fn();

      const result = await gifToMp4(gifFile, {}, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('video/mp4');
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith('input.gif', expect.anything());
      expect(mockFFmpeg.exec).toHaveBeenCalled();
      expect(mockFFmpeg.readFile).toHaveBeenCalledWith('output.mp4');
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('올바른 FFmpeg 인자를 사용해야 함', async () => {
      const gifFile = new File([mockBlob], 'test.gif', { type: 'image/gif' });

      await gifToMp4(gifFile);

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i',
        'input.gif',
        '-movflags',
        'faststart',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        'output.mp4',
      ]);
    });
  });

  describe('extractFrames', () => {
    it('비디오에서 프레임을 추출해야 함', async () => {
      mockFFmpeg.readFile.mockImplementation((fileName: string) => {
        if (fileName.startsWith('frame_')) {
          return Promise.resolve(new Uint8Array([1, 2, 3]));
        }
        throw new Error('파일 없음');
      });

      const mockProgressFn = jest.fn();

      const result = await extractFrames(mockFile, {}, mockProgressFn);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Blob);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('커스텀 옵션으로 프레임을 추출해야 함', async () => {
      mockFFmpeg.readFile.mockRejectedValue(new Error('파일 없음'));

      await extractFrames(mockFile, {
        fps: 2,
        startTime: 10,
        duration: 5,
        maxFrames: 10,
      });

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i',
        expect.any(String),
        '-ss',
        '10',
        '-t',
        '5',
        '-vf',
        'fps=2',
        '-frames:v',
        '10',
        'frame_%04d.png',
      ]);
    });

    it('프레임이 없으면 빈 배열을 반환해야 함', async () => {
      mockFFmpeg.readFile.mockRejectedValue(new Error('파일 없음'));

      const result = await extractFrames(mockFile);

      expect(result).toEqual([]);
    });
  });

  describe('createThumbnail', () => {
    it('비디오 썸네일을 생성해야 함', async () => {
      const mockProgressFn = jest.fn();

      const result = await createThumbnail(mockFile, 5, mockProgressFn);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('image/png');
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i',
        expect.any(String),
        '-ss',
        '5',
        '-frames:v',
        '1',
        'thumbnail.png',
      ]);
      expect(mockProgressFn).toHaveBeenCalledWith(10);
      expect(mockProgressFn).toHaveBeenCalledWith(100);
    });

    it('기본 시간(0초)으로 썸네일을 생성해야 함', async () => {
      await createThumbnail(mockFile);

      expect(mockFFmpeg.exec).toHaveBeenCalledWith(
        expect.arrayContaining(['-ss', '0'])
      );
    });
  });
});
