import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { VideoOptions } from '@/types';

let ffmpeg: FFmpeg | null = null;

/**
 * FFmpeg 인스턴스 초기화
 */
export async function initFFmpeg(onProgress?: (message: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(`처리 중... ${Math.round(progress * 100)}%`);
  });

  // FFmpeg WASM 로드 (로컬 파일 사용)
  const baseURL = '/ffmpeg';

  try {
    console.log('[FFmpeg] Loading from local files...');
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('[FFmpeg] Successfully loaded from local files');
  } catch (error) {
    console.error('[FFmpeg] Local load error:', error);
    
    // Fallback: CDN에서 로드 시도
    try {
      console.log('[FFmpeg] Trying CDN fallback...');
      const cdnURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${cdnURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${cdnURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('[FFmpeg] Successfully loaded from CDN');
    } catch (cdnError) {
      console.error('[FFmpeg] CDN fallback error:', cdnError);
      throw cdnError;
    }
  }

  return ffmpeg;
}

/**
 * 비디오를 GIF로 변환
 */
export async function videoToGif(
  file: File,
  options: VideoOptions = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const {
    fps = 10,
    startTime = 0,
    duration = 5,
    width = 480,
  } = options;

  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  // 파일 쓰기
  const inputName = 'input' + getExtension(file.name);
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress?.(30);

  // 변환 실행
  const outputName = 'output.gif';

  await ff.exec([
    '-i', inputName,
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
    '-loop', '0',
    outputName,
  ]);

  onProgress?.(80);

  // 결과 읽기
  const data = await ff.readFile(outputName);
  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'image/gif' });

  // 정리
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  onProgress?.(100);

  return blob;
}

/**
 * GIF를 MP4로 변환
 */
export async function gifToMp4(
  file: File,
  options: VideoOptions = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  // 파일 쓰기
  await ff.writeFile('input.gif', await fetchFile(file));

  onProgress?.(30);

  // 변환 실행
  await ff.exec([
    '-i', 'input.gif',
    '-movflags', 'faststart',
    '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    'output.mp4',
  ]);

  onProgress?.(80);

  // 결과 읽기
  const data = await ff.readFile('output.mp4');
  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

  // 정리
  await ff.deleteFile('input.gif');
  await ff.deleteFile('output.mp4');

  onProgress?.(100);

  return blob;
}

/**
 * 비디오에서 프레임 추출
 */
export async function extractFrames(
  file: File,
  options: {
    fps?: number;
    startTime?: number;
    duration?: number;
    maxFrames?: number;
  } = {},
  onProgress?: (progress: number) => void
): Promise<Blob[]> {
  const { fps = 1, startTime = 0, duration = 10, maxFrames = 30 } = options;

  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  const inputName = 'input' + getExtension(file.name);
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress?.(30);

  // 프레임 추출
  await ff.exec([
    '-i', inputName,
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    '-vf', `fps=${fps}`,
    '-frames:v', maxFrames.toString(),
    'frame_%04d.png',
  ]);

  onProgress?.(70);

  // 프레임 파일들 읽기
  const frames: Blob[] = [];
  for (let i = 1; i <= maxFrames; i++) {
    const frameName = `frame_${i.toString().padStart(4, '0')}.png`;
    try {
      const data = await ff.readFile(frameName);
      frames.push(new Blob([new Uint8Array(data as Uint8Array)], { type: 'image/png' }));
      await ff.deleteFile(frameName);
    } catch {
      // 더 이상 프레임이 없음
      break;
    }
  }

  // 정리
  await ff.deleteFile(inputName);

  onProgress?.(100);

  return frames;
}

/**
 * 비디오 썸네일 생성
 */
export async function createThumbnail(
  file: File,
  time: number = 0,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  const inputName = 'input' + getExtension(file.name);
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress?.(30);

  await ff.exec([
    '-i', inputName,
    '-ss', time.toString(),
    '-frames:v', '1',
    'thumbnail.png',
  ]);

  onProgress?.(80);

  const data = await ff.readFile('thumbnail.png');
  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'image/png' });

  await ff.deleteFile(inputName);
  await ff.deleteFile('thumbnail.png');

  onProgress?.(100);

  return blob;
}

/**
 * 비디오 포맷 변환 (MP4, WebM, MOV, AVI 간)
 */
export async function convertVideoFormat(
  file: File,
  outputFormat: 'mp4' | 'webm' | 'mov' | 'avi',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  const inputName = 'input' + getExtension(file.name);
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress?.(30);

  const outputName = `output.${outputFormat}`;
  const args: string[] = ['-i', inputName];

  switch (outputFormat) {
    case 'mp4':
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
      args.push('-c:a', 'aac', '-b:a', '128k');
      args.push('-movflags', 'faststart');
      args.push('-pix_fmt', 'yuv420p');
      break;
    case 'webm':
      args.push('-c:v', 'libvpx', '-crf', '30', '-b:v', '0');
      args.push('-c:a', 'libvorbis');
      break;
    case 'mov':
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
      args.push('-c:a', 'aac', '-b:a', '128k');
      args.push('-pix_fmt', 'yuv420p');
      break;
    case 'avi':
      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
      args.push('-c:a', 'aac', '-b:a', '128k');
      break;
  }

  args.push(outputName);

  await ff.exec(args);

  onProgress?.(80);

  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  };

  const data = await ff.readFile(outputName);
  const blob = new Blob([new Uint8Array(data as Uint8Array)], {
    type: mimeTypes[outputFormat],
  });

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  onProgress?.(100);

  return blob;
}

/**
 * 비디오 크기 변경
 */
export async function resizeVideo(
  file: File,
  width: number,
  height: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const ff = await initFFmpeg((msg) => console.log(msg));

  onProgress?.(10);

  const inputName = 'input' + getExtension(file.name);
  await ff.writeFile(inputName, await fetchFile(file));

  onProgress?.(30);

  const ext = getExtension(file.name).replace('.', '');
  const outputExt = ['mp4', 'webm', 'mov', 'avi'].includes(ext) ? ext : 'mp4';
  const outputName = `output.${outputExt}`;

  // 짝수 크기로 맞추기 (인코딩 요구사항)
  const w = Math.round(width / 2) * 2;
  const h = Math.round(height / 2) * 2;

  await ff.exec([
    '-i', inputName,
    '-vf', `scale=${w}:${h}`,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'copy',
    '-pix_fmt', 'yuv420p',
    outputName,
  ]);

  onProgress?.(80);

  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  };

  const data = await ff.readFile(outputName);
  const blob = new Blob([new Uint8Array(data as Uint8Array)], {
    type: mimeTypes[outputExt] || 'video/mp4',
  });

  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  onProgress?.(100);

  return blob;
}

/**
 * 파일 확장자 추출
 */
function getExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? `.${ext}` : '.mp4';
}
