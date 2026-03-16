# Media Utility 기능 확장 개발계획

## 1. 개요

### 1.1 목적
iloveimg.com이 제공하는 이미지 처리 기능을 분석하여, 현재 Media Utility 프로젝트에 부족한 기능을 클라이언트 사이드 방식으로 추가 구현한다.

### 1.2 현재 프로젝트 현황
- **프레임워크**: Next.js 16, React 19, TypeScript
- **처리 방식**: 모든 미디어 처리를 브라우저에서 수행 (WebAssembly, Web Workers)
- **현재 버전**: 0.1.1

### 1.3 기존 제공 기능 (6개)

| 도구 | 경로 | 서비스 파일 |
|------|------|------------|
| 이미지 변환기 | `/image-converter` | `imageConverter.ts`, `heicConverter.ts` |
| 이미지 편집기 | `/image-editor` | `imageEditor.ts` |
| 배경 제거 | `/background-remover` | `backgroundRemover.ts` |
| GIF 제작기 | `/gif-maker` | `gifGenerator.ts` |
| 동영상 변환기 | `/video-converter` | `videoProcessor.ts` |
| URL 생성기 | `/url-generator` | `urlGenerator.ts` |

---

## 2. iloveimg.com 기능 비교 및 Gap 분석

| # | iloveimg.com 기능 | 현재 상태 | 구현 가능 | 난이도 | 추가 라이브러리 |
|---|---|---|---|---|---|
| 1 | 이미지 압축 | 부분 제공 | **가능** | 낮음 | 없음 (이미 설치됨) |
| 2 | 이미지 업스케일 (AI) | 미제공 | **조건부** | 높음 | UpscalerJS + TF.js |
| 3 | 배경 제거 | **제공** | - | - | - |
| 4 | 포토 에디터 (고급) | 부분 제공 | **가능** | 중간 | Fabric.js v6 |
| 5 | 밈 생성기 | 미제공 | **가능** | 낮음 | Fabric.js v6 |
| 6 | 이미지 크기 조정 | **제공** | - | - | - |
| 7 | 이미지 자르기 | **제공** | - | - | - |
| 8 | 이미지 회전 | **제공** | - | - | - |
| 9 | JPG로 변환 (PSD, SVG, RAW 추가) | 부분 제공 | **가능** | 중간 | @webtoon/psd, LibRaw-Wasm |
| 10 | JPG에서 변환 | **제공** | - | - | - |
| 11 | HTML → 이미지 | 미제공 | **가능** | 낮음 | html-to-image |
| 12 | 워터마크 | 미제공 | **가능** | 낮음 | Fabric.js v6 |
| 13 | 얼굴 블러 | 미제공 | **가능** | 중간 | MediaPipe Face Detection |

**추가 필요 기능: 8개** (부분 제공 포함)

---

## 3. 개발 단계별 계획

### Phase 1: 기존 자원 활용 (의존성 추가 없음)

기존에 설치된 라이브러리와 Canvas API만으로 구현 가능한 기능.

---

#### 1-1. 이미지 압축 전용 도구

**경로**: `/image-compressor`
**서비스**: `src/services/imageCompressor.ts`

| 항목 | 내용 |
|------|------|
| **설명** | JPG, PNG, WebP, GIF 이미지의 용량을 줄이는 전용 도구 |
| **핵심 라이브러리** | `browser-image-compression` (v2.0.2, 이미 설치됨) |
| **추가 의존성** | 없음 |
| **기능 요구사항** | |
| - 배치 압축 | 최대 20개 파일 동시 처리 |
| - 품질 설정 | 슬라이더로 10~100% 조절 |
| - 최대 크기 제한 | KB/MB 단위로 목표 용량 설정 |
| - 결과 비교 | 원본 vs 압축 용량, 압축률 표시 |
| - 일괄 다운로드 | 개별 및 ZIP 다운로드 |

**서비스 인터페이스**:
```typescript
interface CompressionOptions {
  quality: number;           // 0.1 ~ 1.0
  maxSizeMB?: number;        // 목표 최대 크기
  maxWidthOrHeight?: number; // 최대 가로/세로 픽셀
  format?: 'jpg' | 'png' | 'webp';
}

async function compressImage(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number) => void
): Promise<Blob>
```

**구현 작업**:
1. `src/services/imageCompressor.ts` 생성
2. `src/app/[locale]/image-compressor/page.tsx` 생성
3. 압축 결과 비교 UI 컴포넌트 구현
4. 헤더 네비게이션에 메뉴 추가
5. i18n 메시지 추가
6. 홈페이지 도구 카드 추가

---

#### 1-2. 이미지 변환기 포맷 확장 (SVG 입력 지원)

**경로**: 기존 `/image-converter` 확장
**서비스**: `src/services/imageConverter.ts` 수정

| 항목 | 내용 |
|------|------|
| **설명** | SVG 파일을 JPG/PNG/WebP로 변환하는 기능 추가 |
| **핵심 기술** | Canvas API (네이티브, 추가 의존성 없음) |
| **추가 의존성** | 없음 |

**구현 방법**:
```typescript
async function convertSvgToRaster(
  svgFile: File,
  format: 'png' | 'jpg' | 'webp',
  options?: { width?: number; height?: number; quality?: number }
): Promise<Blob>
// SVG → Data URL → Image 로드 → Canvas drawImage → toBlob
```

**구현 작업**:
1. `imageConverter.ts`에 SVG 변환 함수 추가
2. 업로드 컴포넌트의 accept에 `image/svg+xml` 추가
3. SVG 미리보기 렌더링 처리
4. 출력 크기 설정 옵션 추가 (SVG는 벡터이므로 사용자가 해상도 지정)

---

### Phase 2: Fabric.js 도입 (워터마크 + 밈 생성기 + 에디터 확장)

Fabric.js v6 하나를 추가하여 3개 기능을 동시에 구현.

**설치**: `npm install fabric`
**번들 크기**: ~96kB (min+gzip), 의존성 0개

---

#### 2-1. 워터마크 도구

**경로**: `/watermark`
**서비스**: `src/services/watermark.ts`

| 항목 | 내용 |
|------|------|
| **설명** | 이미지에 텍스트 또는 이미지 워터마크를 추가 |
| **핵심 라이브러리** | Fabric.js v6 |
| **기능 요구사항** | |
| - 텍스트 워터마크 | 폰트, 크기, 색상, 회전 각도 설정 |
| - 이미지 워터마크 | 로고/이미지 파일 오버레이 |
| - 투명도 조절 | 0~100% 슬라이더 |
| - 위치 설정 | 9-포인트 그리드 (좌상, 중앙, 우하 등) + 드래그 위치 지정 |
| - 타일 모드 | 반복 패턴으로 전체 이미지에 워터마크 적용 |
| - 배치 처리 | 동일 워터마크를 여러 이미지에 적용 |
| - 실시간 미리보기 | Fabric.js Canvas에서 즉시 미리보기 |

**서비스 인터페이스**:
```typescript
interface TextWatermarkOptions {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;        // 0 ~ 1
  rotation: number;       // 0 ~ 360
  position: WatermarkPosition;
  tileMode: boolean;
}

interface ImageWatermarkOptions {
  watermarkImage: File;
  scale: number;          // 0.1 ~ 1.0
  opacity: number;
  position: WatermarkPosition;
  tileMode: boolean;
}

type WatermarkPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'custom';

async function applyTextWatermark(
  file: File,
  options: TextWatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Blob>

async function applyImageWatermark(
  file: File,
  options: ImageWatermarkOptions,
  onProgress?: (progress: number) => void
): Promise<Blob>
```

**구현 작업**:
1. `src/services/watermark.ts` 생성 (Fabric.js 기반)
2. `src/app/[locale]/watermark/page.tsx` 생성
3. 워터마크 설정 패널 컴포넌트 구현
4. Fabric.js Canvas 미리보기 컴포넌트 구현
5. 배치 처리 로직 구현
6. 헤더/홈페이지 등록, i18n 추가

---

#### 2-2. 밈 생성기

**경로**: `/meme-generator`
**서비스**: `src/services/memeGenerator.ts`

| 항목 | 내용 |
|------|------|
| **설명** | 이미지 위에 텍스트를 배치하여 밈 이미지 생성 |
| **핵심 라이브러리** | Fabric.js v6 (워터마크와 공유) |
| **기능 요구사항** | |
| - 이미지 업로드 | 사용자 이미지 또는 빈 캔버스 |
| - 상단/하단 텍스트 | 밈 스타일 텍스트 입력 |
| - 텍스트 스타일링 | 폰트, 크기, 색상, 외곽선(stroke), 그림자 |
| - 드래그 편집 | 텍스트 위치를 드래그로 자유 배치 |
| - 캔버스 크기 | 출력 해상도 설정 |
| - 내보내기 | PNG/JPG로 다운로드 |

**서비스 인터페이스**:
```typescript
interface MemeTextOptions {
  topText?: string;
  bottomText?: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
}

async function generateMeme(
  file: File,
  options: MemeTextOptions
): Promise<Blob>
```

**구현 작업**:
1. `src/services/memeGenerator.ts` 생성
2. `src/app/[locale]/meme-generator/page.tsx` 생성
3. Fabric.js 기반 인터랙티브 편집 캔버스 구현
4. 텍스트 설정 패널 구현
5. 헤더/홈페이지 등록, i18n 추가

---

#### 2-3. 이미지 편집기 고급 기능 확장

**경로**: 기존 `/image-editor` 확장
**서비스**: `src/services/imageEditor.ts` 확장

| 항목 | 내용 |
|------|------|
| **설명** | 기존 편집기에 텍스트, 필터/효과, 그리기 기능 추가 |
| **핵심 라이브러리** | Fabric.js v6 |
| **추가 기능** | |
| - 텍스트 오버레이 | 텍스트 추가, 폰트/크기/색상 편집 |
| - 이미지 필터 | Grayscale, Sepia, Brightness, Contrast, Blur, Sharpen, Emboss |
| - 자유 그리기 | 브러시 크기/색상 설정 후 자유 드로잉 |
| - 스티커/도형 | 기본 도형(원, 사각형, 화살표) 및 아이콘 오버레이 |

**편집 모드 확장**:
```typescript
// 기존
type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize';

// 확장
type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize'
  | 'text' | 'filter' | 'draw' | 'sticker';
```

**구현 작업**:
1. Fabric.js 기반 캔버스 편집기로 전환 (기존 Canvas API 코드 호환 유지)
2. 필터 적용 패널 구현 (슬라이더 UI)
3. 텍스트 도구 패널 구현
4. 자유 그리기 도구 구현
5. 도형/스티커 팔레트 구현
6. Undo/Redo 기능 추가 (Fabric.js JSON 직렬화 활용)

---

### Phase 3: AI/WASM 기반 기능

외부 AI 모델이나 WASM 라이브러리를 활용하는 기능.

---

#### 3-1. 얼굴 블러 (개인정보 보호)

**경로**: `/face-blur`
**서비스**: `src/services/faceBlur.ts`

| 항목 | 내용 |
|------|------|
| **설명** | 이미지에서 얼굴을 자동 감지하여 블러/모자이크 처리 |
| **핵심 라이브러리** | `@mediapipe/tasks-vision` (Google MediaPipe) |
| **추가 의존성** | `@mediapipe/tasks-vision` |
| **번들 크기** | JS ~118kB + WASM 런타임 (CDN 로드) |
| **기능 요구사항** | |
| - 자동 얼굴 감지 | MediaPipe BlazeFace 모델로 얼굴 영역 검출 |
| - 블러 강도 | 가우시안 블러 강도 슬라이더 (5~50px) |
| - 모자이크 모드 | 블러 대신 모자이크(픽셀화) 선택 가능 |
| - 수동 영역 추가 | 얼굴 외 추가 영역을 드래그로 지정 |
| - 배치 처리 | 여러 이미지에서 동시 처리 |
| - 감지 결과 미리보기 | 감지된 얼굴에 박스 표시 후 사용자 확인 |

**서비스 인터페이스**:
```typescript
interface FaceBlurOptions {
  blurType: 'gaussian' | 'mosaic';
  blurIntensity: number;    // 5 ~ 50
  additionalRegions?: Array<{
    x: number; y: number; width: number; height: number;
  }>;
  autoDetect: boolean;
}

interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

async function detectFaces(file: File): Promise<DetectedFace[]>

async function applyFaceBlur(
  file: File,
  options: FaceBlurOptions,
  onProgress?: (progress: number) => void
): Promise<Blob>
```

**구현 작업**:
1. `npm install @mediapipe/tasks-vision`
2. `src/services/faceBlur.ts` 생성
3. MediaPipe Face Detector 초기화 (싱글톤, CDN 모델 로드)
4. Canvas API 가우시안 블러 / 모자이크 처리 함수 구현
5. `src/app/[locale]/face-blur/page.tsx` 생성
6. 감지 결과 미리보기 + 수동 영역 편집 UI 구현
7. 기존 CORS 헤더 설정 활용 (SharedArrayBuffer 호환)
8. 헤더/홈페이지 등록, i18n 추가

---

#### 3-2. 이미지 변환기 포맷 확장 (PSD 입력 지원)

**경로**: 기존 `/image-converter` 확장
**서비스**: `src/services/psdConverter.ts` 신규

| 항목 | 내용 |
|------|------|
| **설명** | PSD(Photoshop) 파일을 JPG/PNG/WebP로 변환 |
| **핵심 라이브러리** | `@webtoon/psd` |
| **추가 의존성** | `@webtoon/psd` (제로 디펜던시, TypeScript 네이티브) |
| **기능 요구사항** | |
| - PSD 파일 로드 | ArrayBuffer 기반 파싱 |
| - 병합 이미지 추출 | 전체 레이어 병합 결과를 래스터 이미지로 변환 |
| - 출력 형식 선택 | JPG, PNG, WebP |
| - 품질 설정 | 출력 품질 조절 |

**서비스 인터페이스**:
```typescript
async function convertPsdToImage(
  file: File,
  format: 'png' | 'jpg' | 'webp',
  options?: { quality?: number },
  onProgress?: (progress: number) => void
): Promise<Blob>
```

**구현 작업**:
1. `npm install @webtoon/psd`
2. `src/services/psdConverter.ts` 생성
3. PSD 파싱 → Canvas 렌더링 → Blob 변환 파이프라인 구현
4. 이미지 변환기 페이지에서 PSD 업로드 허용 추가
5. `accept` 속성에 `.psd` 확장자 추가

---

#### 3-3. HTML → 이미지 변환

**경로**: `/html-to-image`
**서비스**: `src/services/htmlToImage.ts`

| 항목 | 내용 |
|------|------|
| **설명** | HTML 코드를 입력받아 이미지로 변환 |
| **핵심 라이브러리** | `html-to-image` |
| **추가 의존성** | `html-to-image` (~9kB, 제로 디펜던시) |
| **기능 요구사항** | |
| - HTML 코드 입력 | 텍스트 에디터에 HTML/CSS 직접 입력 |
| - 실시간 미리보기 | iframe 또는 sandboxed div에서 렌더링 |
| - 출력 형식 | PNG, JPG, SVG |
| - 출력 크기 | 캡처 영역 너비/높이 설정 |
| - 배경색 설정 | 투명 또는 사용자 지정 배경색 |

**제한사항**: 외부 URL을 직접 캡처하는 기능은 CORS 제한으로 클라이언트 사이드에서 불가능. HTML 코드 입력 방식으로 구현.

**서비스 인터페이스**:
```typescript
interface HtmlToImageOptions {
  html: string;
  css?: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'svg';
  quality?: number;
  backgroundColor?: string;
}

async function convertHtmlToImage(
  options: HtmlToImageOptions
): Promise<Blob>
```

**구현 작업**:
1. `npm install html-to-image`
2. `src/services/htmlToImage.ts` 생성
3. `src/app/[locale]/html-to-image/page.tsx` 생성
4. HTML/CSS 코드 에디터 (textarea 기반, 구문 강조는 선택)
5. 샌드박스 미리보기 영역 구현
6. 캡처 및 다운로드 로직 구현
7. 헤더/홈페이지 등록, i18n 추가

---

### Phase 4: 선택적 고급 기능

구현 가능하나 트레이드오프가 존재하는 기능. 사용자 수요에 따라 선택적으로 구현.

---

#### 4-1. 이미지 변환기 포맷 확장 (RAW 입력 지원)

**경로**: 기존 `/image-converter` 확장
**서비스**: `src/services/rawConverter.ts` 신규

| 항목 | 내용 |
|------|------|
| **설명** | 카메라 RAW 파일(CR2, NEF, ARW, DNG 등)을 JPG/PNG로 변환 |
| **핵심 라이브러리** | LibRaw-Wasm |
| **추가 의존성** | `libraw-wasm` |
| **기능 요구사항** | |
| - RAW 파일 디코딩 | 1,284+ 카메라 포맷 지원 |
| - 출력 형식 선택 | JPG, PNG, WebP |
| - 메타데이터 표시 | 카메라 모델, ISO, 셔터 스피드 등 EXIF 표시 |

**트레이드오프**:
| 장점 | 단점 |
|------|------|
| 광범위한 카메라 포맷 지원 | RAW 파일 크기 20~80MB로 대형 |
| 완전 클라이언트 처리 | WASM 모듈 로딩 시간 존재 |
| 기존 CORS 설정 활용 가능 | 모바일 기기에서 메모리 부담 |

**구현 작업**:
1. LibRaw-Wasm 라이브러리 설치 및 WASM 파일 `/public/` 배치
2. `src/services/rawConverter.ts` 생성
3. Web Worker에서 RAW 디코딩 처리 (메인 스레드 차단 방지)
4. 이미지 변환기 페이지에서 RAW 업로드 허용 추가
5. EXIF 메타데이터 표시 UI 추가

---

#### 4-2. 이미지 업스케일 (AI 확대)

**경로**: `/image-upscaler`
**서비스**: `src/services/imageUpscaler.ts`

| 항목 | 내용 |
|------|------|
| **설명** | AI 모델을 사용하여 저해상도 이미지를 고해상도로 확대 |
| **핵심 라이브러리** | UpscalerJS + TensorFlow.js |
| **추가 의존성** | `upscaler`, `@upscalerjs/esrgan-slim` |
| **기능 요구사항** | |
| - 확대 배율 | 2x, 3x, 4x 선택 |
| - 모델 선택 | slim(빠른), standard(고품질) |
| - 진행률 표시 | 타일 단위 처리 진행률 |
| - 결과 비교 | 원본 vs 확대 결과 슬라이더 비교 |

**트레이드오프**:
| 장점 | 단점 |
|------|------|
| AI 기반 고품질 확대 | TF.js + 모델 다운로드 수십MB |
| 완전 클라이언트 처리 | 처리 시간 수초~수십초 |
| 프라이버시 보장 | 모바일 기기에서 비실용적 |

**구현 작업**:
1. `npm install upscaler @upscalerjs/esrgan-slim`
2. `src/services/imageUpscaler.ts` 생성
3. 모델 초기화 (싱글톤, 첫 사용 시 다운로드)
4. 타일 기반 처리로 대형 이미지 지원
5. `src/app/[locale]/image-upscaler/page.tsx` 생성
6. 처리 시간 안내 및 진행률 UI 구현
7. 원본/결과 비교 슬라이더 컴포넌트 구현
8. 데스크톱 전용 권장 안내 표시

---

## 4. 기술 아키텍처

### 4.1 공통 패턴

모든 새 기능은 기존 프로젝트 패턴을 따른다.

**서비스 함수 시그니처**:
```typescript
async function operation(
  file: File,
  options?: Options,
  onProgress?: (progress: number) => void
): Promise<Blob>
```

**페이지 컴포넌트 구조**:
```
src/app/[locale]/<tool-name>/
  └── page.tsx        // 'use client' 디렉티브, 도구 메인 페이지
```

**상태 관리**: 기존 `useFileStore` Zustand 스토어 활용

**SSR 방지**: Canvas/WASM 관련 모듈은 `dynamic import` 사용
```typescript
const fabric = await import('fabric');
```

### 4.2 Fabric.js 공통 모듈

Phase 2의 3개 기능(워터마크, 밈 생성기, 에디터 확장)이 Fabric.js를 공유하므로 공통 유틸리티를 구성한다.

```
src/services/
  └── fabric/
      ├── fabricCanvas.ts   // Fabric.js Canvas 초기화, 정리 유틸리티
      ├── textOverlay.ts    // 텍스트 추가/편집 공통 함수
      ├── imageOverlay.ts   // 이미지 오버레이 공통 함수
      └── filters.ts        // 필터 적용 공통 함수
```

### 4.3 신규 의존성 요약

| Phase | 라이브러리 | 크기 (min+gzip) | 용도 |
|-------|-----------|----------------|------|
| 2 | `fabric` v6 | ~96kB | 워터마크, 밈, 에디터 |
| 3 | `@mediapipe/tasks-vision` | ~118kB + WASM | 얼굴 블러 |
| 3 | `@webtoon/psd` | 경량 (0 deps) | PSD 변환 |
| 3 | `html-to-image` | ~9kB | HTML→이미지 |
| 4 | `libraw-wasm` | WASM 수MB | RAW 변환 |
| 4 | `upscaler` + TF.js | 수십MB | AI 업스케일 |

---

## 5. 페이지 및 네비게이션 구성

### 5.1 최종 도구 목록 (기존 6개 + 신규 5개 페이지)

| # | 도구 | 경로 | 색상 테마 | 상태 |
|---|------|------|----------|------|
| 1 | 이미지 변환기 | `/image-converter` | Cyan | 기존 (포맷 확장) |
| 2 | 이미지 편집기 | `/image-editor` | Violet | 기존 (기능 확장) |
| 3 | 배경 제거 | `/background-remover` | Purple | 기존 |
| 4 | GIF 제작기 | `/gif-maker` | Emerald | 기존 |
| 5 | 동영상 변환기 | `/video-converter` | Amber | 기존 |
| 6 | URL 생성기 | `/url-generator` | Magenta | 기존 |
| 7 | **이미지 압축** | `/image-compressor` | **Teal** | **Phase 1** |
| 8 | **워터마크** | `/watermark` | **Indigo** | **Phase 2** |
| 9 | **밈 생성기** | `/meme-generator` | **Orange** | **Phase 2** |
| 10 | **얼굴 블러** | `/face-blur` | **Rose** | **Phase 3** |
| 11 | **HTML → 이미지** | `/html-to-image` | **Sky** | **Phase 3** |

### 5.2 기존 도구 확장 (별도 페이지 없음)

| 도구 | 확장 내용 | Phase |
|------|----------|-------|
| 이미지 변환기 | SVG 입력 지원 | 1 |
| 이미지 변환기 | PSD 입력 지원 | 3 |
| 이미지 변환기 | RAW 입력 지원 | 4 |
| 이미지 편집기 | 텍스트, 필터, 그리기, 스티커 | 2 |

### 5.3 선택적 도구 (수요에 따라 결정)

| 도구 | 경로 | Phase |
|------|------|-------|
| 이미지 업스케일 | `/image-upscaler` | 4 |

---

## 6. i18n 키 구조

각 신규 도구에 대해 다음 키를 추가한다.

```
messages/ko/
  └── <tool-name>.json
```

**공통 키 패턴**:
```json
{
  "title": "도구 이름",
  "description": "도구 설명",
  "upload": {
    "title": "파일을 드래그하거나 클릭하여 업로드",
    "formats": "지원 형식: ...",
    "maxFiles": "최대 {count}개 파일",
    "maxSize": "파일당 최대 {size}"
  },
  "options": { ... },
  "result": {
    "download": "다운로드",
    "downloadAll": "모두 다운로드"
  },
  "howToUse": {
    "title": "사용 방법",
    "steps": [...]
  }
}
```

---

## 7. 테스트 계획

각 Phase 완료 시 다음 테스트를 수행한다.

### 7.1 단위 테스트 (`tests/01-unit/`)
- 서비스 함수의 입출력 검증
- 옵션 파라미터 유효성 검증
- 에러 처리 검증

### 7.2 컴포넌트 테스트 (`tests/02-component/`)
- 업로드 UI 동작
- 설정 패널 상태 변경
- 결과 표시 및 다운로드

### 7.3 E2E 테스트 (`tests/04-e2e/`)
- 파일 업로드 → 처리 → 다운로드 전체 플로우
- Playwright 기반

---

## 8. 개발 일정 (Phase별)

| Phase | 기능 | 신규 페이지 | 신규 의존성 |
|-------|------|-----------|------------|
| **Phase 1** | 이미지 압축 도구, SVG 변환 | 1개 | 없음 |
| **Phase 2** | 워터마크, 밈 생성기, 에디터 확장 | 2개 | fabric |
| **Phase 3** | 얼굴 블러, PSD 변환, HTML→이미지 | 2개 | @mediapipe/tasks-vision, @webtoon/psd, html-to-image |
| **Phase 4** | RAW 변환, AI 업스케일 | 0~1개 | libraw-wasm, upscaler |

---

## 9. 버전 계획

| 버전 | 내용 |
|------|------|
| v0.2.0 | Phase 1 완료 (이미지 압축, SVG 변환) |
| v0.3.0 | Phase 2 완료 (워터마크, 밈 생성기, 에디터 확장) |
| v0.4.0 | Phase 3 완료 (얼굴 블러, PSD 변환, HTML→이미지) |
| v0.5.0 | Phase 4 완료 (RAW 변환, AI 업스케일) |

---

## 10. 위험 요소 및 대응

| 위험 | 영향 | 대응 방안 |
|------|------|----------|
| Fabric.js SSR 오류 | Phase 2 전체 | `dynamic import` + `'use client'` 디렉티브로 방지 |
| MediaPipe WASM 로딩 실패 | 얼굴 블러 | CDN 폴백 + 에러 안내 UI |
| AI 업스케일 모바일 성능 | 업스케일 도구 | 데스크톱 전용 권장 안내 + 기기 감지 |
| RAW 파일 메모리 초과 | RAW 변환 | 파일 크기 제한(50MB) + 메모리 부족 에러 처리 |
| 번들 크기 증가 | 전체 | 코드 스플리팅 + 동적 import로 최소화 |
| html-to-image 외부 URL 제한 | HTML→이미지 | HTML 코드 입력 방식으로 한정, 제한 사항 명시 |
