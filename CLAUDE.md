# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 지침

**모든 응답과 결과는 한글로 작성한다.** 코드 주석, 커밋 메시지, 사용자와의 대화 모두 한글을 사용한다.

## Project Overview

Media Utility is a browser-based media file conversion tool built with Next.js 16, React 19, and TypeScript. All file processing happens client-side using WebAssembly and Web Workers—no server-side processing.

**Features:** Image Converter (HEIC/JPG/PNG/WebP), Image Editor, GIF Maker, Video Converter (FFmpeg WASM), URL Generator

## Development Commands

```bash
npm run dev      # Start dev server (uses webpack, not turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

**Note:** Webpack is required (not Turbopack) for FFmpeg WASM asset handling.

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages (each tool is a page)
- `src/components/` - React components (layout/, upload/, common/)
- `src/services/` - Business logic for media processing
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript definitions
- `public/workers/` - Web workers (gif.worker.js)

### Key Technologies
- **FFmpeg WASM** (`@ffmpeg/ffmpeg`) - Video processing loaded from CDN
- **gif.js** - GIF generation with web worker
- **heic2any** - HEIC/HEIF conversion
- **browser-image-compression** - Image optimization
- **Zustand** - State management via `useFileStore` hook

### Service Pattern
All service functions follow this signature:
```typescript
async function operation(
  file: File,
  options?: Options,
  onProgress?: (progress: number) => void
): Promise<Blob>
```

### State Management
The `useFileStore` Zustand hook manages file state with `MediaFile` objects containing: id, file, status ('pending'|'processing'|'completed'|'error'), progress, preview, result, error.

## Technical Notes

### Next.js Config
- CORS headers required for FFmpeg WASM: `Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Opener-Policy: same-origin`
- Webpack fallbacks: `fs` and `path` set to false for browser compatibility

### SSR Considerations
- gif.js and heic2any use dynamic imports to prevent SSR issues
- All page components use `'use client'` directive
- FFmpeg WASM initializes as singleton on first use

### File Limits
- Max files: 10 per upload
- Max size: 100MB per file
- Supported input: image/* (including HEIC/HEIF), video/* (MP4, WebM, MOV, AVI)

## UI Conventions

- Language: Korean
- Styling: Tailwind CSS v4
- Icons: Lucide React
- Cards: rounded-2xl, Inputs: rounded-lg
