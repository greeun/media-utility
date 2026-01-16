declare module 'gif.js' {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    repeat?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | null;
    debug?: boolean;
    dither?: boolean | string;
  }

  interface FrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: HTMLCanvasElement | HTMLImageElement | CanvasRenderingContext2D | ImageData,
      options?: FrameOptions
    ): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: 'start' | 'abort', callback: () => void): void;
    render(): void;
    abort(): void;
    running: boolean;
  }

  export default GIF;
}
