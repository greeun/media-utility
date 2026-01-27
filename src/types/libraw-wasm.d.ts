declare module 'libraw-wasm' {
  export default class LibRaw {
    constructor();
    open(buffer: ArrayBuffer): Promise<void>;
    close(): void;
    extractImage(): Promise<{ data: Uint8ClampedArray; width: number; height: number }>;
    readonly imageWidth: number;
    readonly imageHeight: number;
    readonly cameraModel?: string;
    readonly isoSpeed?: number;
    readonly shutterSpeed?: number;
    readonly aperture?: number;
    readonly focalLength?: number;
    readonly timestamp?: number;
  }
}
