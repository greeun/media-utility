# Media Utility 전체 테스트 계획서

> Version: 1.0.0
> Created: 2026-03-16
> Status: Draft
> Project: media-utility v0.1.1

---

## 1. 개요

### 1.1 목적

Media Utility 프로젝트의 모든 기능에 대한 테스트 전략과 케이스를 정의한다.
단위 테스트부터 E2E 테스트, 성능·접근성·보안 테스트까지 빠짐없이 커버한다.

### 1.2 범위

| 계층 | 대상 | 테스트 프레임워크 |
|------|------|-------------------|
| 01-unit | 서비스 15개, 스토어 1개, 유틸리티, 공유 훅 4개 | Jest + jsdom |
| 02-component | UI 컴포넌트 10+개, 디자인 시스템 v2 | Jest + React Testing Library |
| 03-integration | 스토어-서비스 연동, 서비스 체인, 에러 처리 | Jest |
| 04-e2e | 15개 도구 페이지 전체 워크플로우 | Playwright (3 브라우저) |
| 05-api | API 라우트 6개 | Jest (또는 Playwright API) |
| 06-performance | 대용량 파일 처리, 메모리 | Playwright + performance API |
| 07-accessibility | 키보드 네비게이션, 스크린리더, 색상 대비 | Playwright + axe-core |
| 08-i18n | 11개 언어 번역 완전성, 라우팅 | Jest + Playwright |
| 09-security | 파일 검증, CORS, XSS 방지 | Jest + Playwright |

### 1.3 테스트 환경

- **OS**: macOS / Linux (CI)
- **Node.js**: 20+
- **브라우저**: Chromium, Firefox, WebKit
- **뷰포트**: Desktop (1280x720), Tablet (768x1024), Mobile (375x667)

---

## 2. 현재 테스트 현황 및 갭 분석

### 2.1 기존 테스트 (구현 완료)

| 카테고리 | 파일 수 | 상태 |
|----------|---------|------|
| 01-unit/services | 16개 (15 서비스 + 1 luminance) | ✅ 완료 |
| 01-unit/stores | 1개 (fileStore) | ✅ 완료 |
| 01-unit/lib | 1개 (utils) | ✅ 완료 |
| 02-component | 10개 | ✅ 완료 |
| 03-integration | 4개 | ✅ 완료 |
| 04-e2e | 12개 | ⚠️ 부분 완료 |

### 2.2 누락된 테스트 (신규 필요)

| 카테고리 | 누락 항목 | 우선순위 |
|----------|-----------|---------|
| 01-unit/hooks | useFileManager, useBatchProcessor, useDragAndDrop, useDownloader | High |
| 01-unit/i18n | i18n config, 번역 키 완전성 | Medium |
| 02-component | 디자인 시스템 v2 컴포넌트 | Medium |
| 04-e2e | background-remover, face-blur, image-compressor, image-editor, image-upscaler, meme-generator, watermark, html-to-image, video-format-converter, video-resizer | High |
| 05-api | health, upload, upload/complete, files/[fileId], storage, storage/cleanup | High |
| 06-performance | 대용량 파일, 메모리 누수, 동시 처리 | Medium |
| 07-accessibility | WCAG 2.1 AA 준수 | Medium |
| 08-i18n | 번역 완전성, locale 라우팅, RTL(아랍어) | Medium |
| 09-security | 파일 타입 검증, 크기 제한, CORS | High |

---

## 3. 단위 테스트 (01-unit)

### 3.1 서비스 테스트 — 기존 15개 + 1개 (유지보수)

각 서비스별 테스트 범위:

#### 3.1.1 imageConverter.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-IC-001 | convertImage: PNG → JPG 변환 성공 | Critical |
| U-IC-002 | convertImage: JPG → WebP 변환 성공 | Critical |
| U-IC-003 | convertImage: 크기 조정 옵션 (width, height) | High |
| U-IC-004 | convertImage: maintainAspectRatio=true 비율 유지 | High |
| U-IC-005 | convertImage: 품질(quality) 옵션 0~1 적용 | High |
| U-IC-006 | convertImage: 잘못된 파일 입력 시 에러 | High |
| U-IC-007 | optimizeImage: 정상 최적화 및 크기 감소 | High |
| U-IC-008 | optimizeImage: 진행률 콜백 호출 | Medium |
| U-IC-009 | loadImage: File → HTMLImageElement 변환 | Medium |
| U-IC-010 | loadImage: 잘못된 파일 시 에러 | Medium |

#### 3.1.2 imageEditor.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-IE-001 | cropImage: 정상 자르기 (x, y, width, height) | Critical |
| U-IE-002 | cropImage: Blob 입력 처리 | High |
| U-IE-003 | cropImage: 출력 형식 및 품질 옵션 | High |
| U-IE-004 | rotateImage: 90도 회전 → 캔버스 가로/세로 교환 | Critical |
| U-IE-005 | rotateImage: 180도 회전 → 크기 유지 | High |
| U-IE-006 | rotateImage: 270도 회전 → 캔버스 가로/세로 교환 | High |
| U-IE-007 | flipImage: 좌우 뒤집기 (horizontal) | High |
| U-IE-008 | flipImage: 상하 뒤집기 (vertical) | High |
| U-IE-009 | resizeImage: 정상 리사이징 | High |
| U-IE-010 | resizeImage: 비율 유지 리사이징 | High |
| U-IE-011 | adjustBrightness: 밝기만 조절 (luminance=0) | Critical |
| U-IE-012 | adjustBrightness: 휘도만 조절 (brightness=0) | Critical |
| U-IE-013 | adjustBrightness: 밝기+휘도 동시 조절 | Critical |
| U-IE-014 | adjustBrightness: luminance 기본값 하위 호환성 | Critical |
| U-IE-015 | adjustBrightness: 경계값 (-100, 0, +100) | High |
| U-IE-016 | adjustBrightness: ITU-R BT.709 가중치 정확성 | High |
| U-IE-017 | adjustBrightness: 클램핑 (0~255 범위 유지) | High |
| U-IE-018 | 모든 함수: 에러 시 적절한 에러 메시지 | High |

#### 3.1.3 imageCompressor.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-CP-001 | compressImage: 정상 압축 및 Blob 반환 | Critical |
| U-CP-002 | compressImage: 품질 옵션 적용 | High |
| U-CP-003 | compressImage: CompressionResult에 압축률 포함 | High |
| U-CP-004 | compressImage: 진행률 콜백 | Medium |
| U-CP-005 | compressImage: 잘못된 파일 에러 | High |

#### 3.1.4 imageUpscaler.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-UP-001 | upscaleImage: 2배 업스케일 성공 | Critical |
| U-UP-002 | upscaleImage: 3배, 4배 업스케일 | High |
| U-UP-003 | upscaleImage: 진행률 콜백 | Medium |
| U-UP-004 | upscaleImage: 잘못된 파일 에러 | High |

#### 3.1.5 heicConverter.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-HC-001 | convertHeicToJpg: HEIC → JPG 변환 성공 | Critical |
| U-HC-002 | convertHeicToJpg: HEIC → PNG 변환 | High |
| U-HC-003 | convertHeicToJpg: 비-HEIC 파일 에러 처리 | High |
| U-HC-004 | convertHeicToJpg: 품질 옵션 | Medium |

#### 3.1.6 rawConverter.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-RC-001 | convertRawToImage: CR2 → JPG 변환 | Critical |
| U-RC-002 | convertRawToImage: NEF, ARW, DNG 지원 | High |
| U-RC-003 | convertRawToImage: RawMetadata 반환 (카메라 정보, ISO 등) | High |
| U-RC-004 | convertRawToImage: 출력 포맷 옵션 (JPG/PNG/WebP) | High |
| U-RC-005 | convertRawToImage: 잘못된 파일 에러 | High |

#### 3.1.7 psdConverter.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-PS-001 | convertPsdToImage: PSD → PNG 변환 | Critical |
| U-PS-002 | convertPsdToImage: PSD → JPG/WebP 변환 | High |
| U-PS-003 | convertPsdToImage: 잘못된 파일 에러 | High |

#### 3.1.8 htmlToImage.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-HI-001 | convertHtmlToImage: HTML → PNG 변환 | Critical |
| U-HI-002 | convertHtmlToImage: HTML → JPG 변환 | High |
| U-HI-003 | convertHtmlToImage: HTML → SVG 변환 | High |
| U-HI-004 | convertHtmlToImage: 빈 HTML 에러 | High |

#### 3.1.9 gifGenerator.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-GF-001 | createGifFromImages: 여러 이미지 → GIF 생성 | Critical |
| U-GF-002 | createGifFromImages: 옵션 (width, height, delay, quality) | High |
| U-GF-003 | createGifFromImages: repeat 옵션 (0=무한, -1=1회) | High |
| U-GF-004 | createGifFromImages: 진행률 콜백 | Medium |
| U-GF-005 | createGifFromImages: 이미지 1장만 입력 시 | Medium |
| U-GF-006 | createGifFromImages: 빈 배열 에러 | High |

#### 3.1.10 videoProcessor.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-VP-001 | initFFmpeg: 정상 초기화 (싱글톤) | Critical |
| U-VP-002 | initFFmpeg: 이미 초기화된 경우 재사용 | High |
| U-VP-003 | videoToGif: 비디오 → GIF 변환 | Critical |
| U-VP-004 | extractFrames: 프레임 추출 | High |
| U-VP-005 | convertVideo: 포맷 변환 (MP4 → WebM 등) | Critical |
| U-VP-006 | resizeVideo: 비디오 리사이징 | High |
| U-VP-007 | 모든 함수: 진행률 콜백 | Medium |
| U-VP-008 | 모든 함수: FFmpeg 미초기화 시 에러 | High |

#### 3.1.11 backgroundRemover.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-BR-001 | removeImageBackground: 정상 배경 제거 → PNG Blob | Critical |
| U-BR-002 | removeImageBackground: 진행률 콜백 | Medium |
| U-BR-003 | removeImageBackground: 잘못된 파일 에러 | High |

#### 3.1.12 faceBlur.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-FB-001 | detectFaces: 얼굴 감지 → DetectedFace[] 반환 | Critical |
| U-FB-002 | detectFaces: 얼굴 없는 이미지 → 빈 배열 | High |
| U-FB-003 | applyFaceBlur: Gaussian 블러 적용 | Critical |
| U-FB-004 | applyFaceBlur: Mosaic 블러 적용 | High |
| U-FB-005 | applyFaceBlur: 신뢰도(confidence) 필터링 | Medium |
| U-FB-006 | applyFaceBlur: 잘못된 파일 에러 | High |

#### 3.1.13 memeGenerator.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-MG-001 | addMemeText: 상단 텍스트 추가 | Critical |
| U-MG-002 | addMemeText: 하단 텍스트 추가 | Critical |
| U-MG-003 | addMemeText: 상단+하단 동시 추가 | High |
| U-MG-004 | addMemeText: 빈 텍스트 시 건너뛰기 | Medium |
| U-MG-005 | addMemeText: 잘못된 파일 에러 | High |

#### 3.1.14 watermark.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-WM-001 | addTextWatermark: 텍스트 워터마크 추가 | Critical |
| U-WM-002 | addTextWatermark: 위치 옵션 (9개 위치) | High |
| U-WM-003 | addTextWatermark: 불투명도, 회전 옵션 | High |
| U-WM-004 | addTextWatermark: 타일 모드 | Medium |
| U-WM-005 | addImageWatermark: 이미지 워터마크 추가 | Critical |
| U-WM-006 | addImageWatermark: 위치, 크기 옵션 | High |
| U-WM-007 | 잘못된 파일/옵션 에러 | High |

#### 3.1.15 urlGenerator.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-UG-001 | fileToDataUrl: File → Base64 Data URL | Critical |
| U-UG-002 | fileToDataUrl: 다양한 MIME 타입 | High |
| U-UG-003 | fileToDataUrl: 대용량 파일 | Medium |

### 3.2 스토어 테스트 (기존)

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-FS-001 | addFiles: 파일 추가 → MediaFile 생성, preview URL | Critical |
| U-FS-002 | addFiles: 최대 10개 제한 | High |
| U-FS-003 | removeFile: 파일 제거 + URL.revokeObjectURL 호출 | Critical |
| U-FS-004 | updateFile: 부분 업데이트 (Partial<MediaFile>) | High |
| U-FS-005 | clearFiles: 전체 초기화 + 메모리 해제 | High |
| U-FS-006 | setProgress: 진행률 0~100 업데이트 | High |
| U-FS-007 | setResult: 결과 Blob 저장 + status='completed' | Critical |
| U-FS-008 | setError: 에러 메시지 + status='error' | Critical |
| U-FS-009 | 초기 상태: files=[] | Medium |

### 3.3 유틸리티 테스트 (기존)

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-UT-001 | cn(): Tailwind 클래스 병합 | Medium |
| U-UT-002 | cn(): 조건부 클래스 처리 | Medium |
| U-UT-003 | cn(): 충돌 클래스 해결 | Medium |

### 3.4 공유 훅 테스트 (신규)

#### 3.4.1 useFileManager.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-FM-001 | addFiles: BaseFile 객체 생성 및 상태 추가 | Critical |
| U-FM-002 | addFiles: 중복 파일 처리 | High |
| U-FM-003 | updateFile: id로 특정 파일 업데이트 | High |
| U-FM-004 | removeFile: 파일 제거 | High |
| U-FM-005 | clearAll: 전체 초기화 | High |
| U-FM-006 | pendingFiles: pending 상태 파일 필터링 | High |
| U-FM-007 | completedFiles: completed 상태 파일 필터링 | High |
| U-FM-008 | pendingCount / completedCount: 정확한 카운트 | Medium |

#### 3.4.2 useBatchProcessor.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-BP-001 | processAll: 모든 pending 파일 순차 처리 | Critical |
| U-BP-002 | processAll: 처리 중 진행률 업데이트 | High |
| U-BP-003 | processAll: 개별 파일 에러 시 나머지 계속 처리 | High |
| U-BP-004 | processAll: 빈 파일 목록 시 즉시 완료 | Medium |
| U-BP-005 | isProcessing: 처리 중 상태 플래그 | High |

#### 3.4.3 useDragAndDrop.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-DD-001 | onDragOver: 드래그 오버 이벤트 처리 + preventDefault | High |
| U-DD-002 | onDrop: 드롭된 파일 추출 | Critical |
| U-DD-003 | onDrop: 지원하지 않는 파일 타입 필터링 | High |
| U-DD-004 | isDragging: 드래그 상태 플래그 | Medium |
| U-DD-005 | onDragLeave: 드래그 이탈 시 상태 초기화 | Medium |

#### 3.4.4 useDownloader.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-DL-001 | download: Blob → 파일 다운로드 트리거 | Critical |
| U-DL-002 | download: 파일명 지정 | High |
| U-DL-003 | downloadAll: 여러 파일 ZIP 다운로드 (해당 시) | Medium |

### 3.5 i18n 설정 테스트 (신규)

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| U-I18N-001 | config: 11개 locale 정의 확인 (ko,en,ja,zh,de,fr,es,pt,ru,ar,id) | High |
| U-I18N-002 | config: defaultLocale = 'ko' | High |
| U-I18N-003 | 번역 키 완전성: 모든 언어 파일에 동일한 키 구조 | High |
| U-I18N-004 | 번역 값: 빈 문자열 없음 | Medium |
| U-I18N-005 | 특수 키: luminanceLabel 11개 언어 존재 | Medium |

---

## 4. 컴포넌트 테스트 (02-component)

### 4.1 기존 컴포넌트 (유지보수)

| TC-ID | 컴포넌트 | 테스트 케이스 | 우선순위 |
|-------|---------|-------------|---------|
| C-FU-001 | FileUploader | 렌더링 (업로드 영역 표시) | Critical |
| C-FU-002 | FileUploader | 파일 선택 시 onFilesSelected 콜백 | Critical |
| C-FU-003 | FileUploader | 최대 파일 개수(10) 초과 검증 | High |
| C-FU-004 | FileUploader | 최대 파일 크기(100MB) 초과 검증 | High |
| C-FU-005 | FileUploader | accept 속성으로 파일 타입 필터링 | High |
| C-FU-006 | FileUploader | 드래그 오버 시 스타일 변경 | Medium |
| C-FU-007 | FileUploader | 드롭 시 파일 처리 | High |
| C-DB-001 | DownloadButton | 렌더링 (버튼 텍스트) | High |
| C-DB-002 | DownloadButton | 클릭 시 다운로드 트리거 | Critical |
| C-DB-003 | DownloadButton | disabled 상태 | Medium |
| C-PB-001 | ProgressBar | 0% 렌더링 | High |
| C-PB-002 | ProgressBar | 50% 렌더링 (너비 반영) | High |
| C-PB-003 | ProgressBar | 100% 완료 상태 | High |
| C-HU-001 | HowToUse | 사용법 단계 렌더링 | Medium |
| C-HU-002 | HowToUse | 접기/펼치기 | Medium |
| C-TC-001 | ToolConstraints | 제약사항 표시 (파일 수, 크기) | Medium |
| C-HD-001 | Header | 로고 및 네비게이션 렌더링 | High |
| C-HD-002 | Header | 언어 선택기 포함 | High |
| C-HD-003 | Header | 모바일 메뉴 토글 | Medium |
| C-FT-001 | Footer | 푸터 렌더링 | Low |
| C-LS-001 | LanguageSelector | 11개 언어 옵션 표시 | High |
| C-LS-002 | LanguageSelector | 언어 변경 시 locale 전환 | Critical |
| C-LG-001 | Logo | SVG 로고 렌더링 | Low |
| C-FI-001 | FeatureIcons | 도구별 아이콘 렌더링 | Low |

### 4.2 디자인 시스템 v2 컴포넌트 (신규)

| TC-ID | 컴포넌트 | 테스트 케이스 | 우선순위 |
|-------|---------|-------------|---------|
| C-UI-001 | Button | variant별 렌더링 (default, outline, ghost 등) | High |
| C-UI-002 | Button | size별 렌더링 (sm, md, lg) | Medium |
| C-UI-003 | Button | disabled, loading 상태 | High |
| C-UI-004 | Input | 텍스트 입력 및 onChange | High |
| C-UI-005 | Input | placeholder, disabled 상태 | Medium |
| C-UI-006 | Card | children 렌더링 | Medium |
| C-UI-007 | Slider | 값 변경 및 onValueChange | High |
| C-UI-008 | Slider | min/max/step 속성 | High |
| C-UI-009 | Checkbox | 체크/해제 토글 | Medium |
| C-UI-010 | Badge | variant별 렌더링 | Low |
| C-UI-011 | Label | htmlFor 연결 | Low |
| C-UI-012 | Progress | value에 따른 너비 | Medium |

### 4.3 페이지 훅 테스트 (신규)

| TC-ID | 훅 | 테스트 케이스 | 우선순위 |
|-------|-----|-------------|---------|
| C-HK-001 | useImageEditor | 초기 상태 검증 | High |
| C-HK-002 | useImageEditor | handleRotate: 회전 적용 후 상태 업데이트 | High |
| C-HK-003 | useImageEditor | handleFlip: 뒤집기 적용 후 상태 업데이트 | High |
| C-HK-004 | useImageEditor | handleCropApply: 자르기 적용 | High |
| C-HK-005 | useImageEditor | handleBrightnessApply: 밝기+휘도 적용 | Critical |
| C-HK-006 | useImageEditor | handleDownload: 파일 다운로드 | High |
| C-HK-007 | useImageEditor | editMode 전환 | Medium |

---

## 5. 통합 테스트 (03-integration)

### 5.1 기존 통합 테스트 (유지보수)

| TC-ID | 파일 | 테스트 케이스 | 우선순위 |
|-------|------|-------------|---------|
| I-FP-001 | file-processing | HEIC 업로드 → JPG 변환 워크플로우 | Critical |
| I-FP-002 | file-processing | RAW 업로드 → 이미지 변환 워크플로우 | High |
| I-FP-003 | file-processing | PSD 변환 워크플로우 | High |
| I-FP-004 | file-processing | 배경 제거 워크플로우 | High |
| I-FP-005 | file-processing | 얼굴 블러 워크플로우 | High |
| I-FS-001 | fileStore-service | 파일 추가 → 서비스 호출 → 결과 저장 | Critical |
| I-FS-002 | fileStore-service | 처리 중 상태 변화 (pending→processing→completed) | Critical |
| I-FS-003 | fileStore-service | 에러 시 상태 변화 (→error) | High |
| I-SC-001 | service-chain | 이미지 변환 → 압축 → 최적화 체인 | High |
| I-SC-002 | service-chain | 순차 처리 및 진행률 추적 | Medium |
| I-EH-001 | error-handling | 입력 검증 실패 처리 | High |
| I-EH-002 | error-handling | 처리 중 에러 복구 | High |
| I-EH-003 | error-handling | 에러 메시지 전파 | High |

### 5.2 추가 통합 테스트 (신규)

| TC-ID | 시나리오 | 테스트 케이스 | 우선순위 |
|-------|---------|-------------|---------|
| I-BC-001 | 배치 처리 | useBatchProcessor + useFileManager 연동 | High |
| I-BC-002 | 배치 처리 | 10개 파일 동시 처리 → 순차 완료 | High |
| I-BC-003 | 배치 처리 | 일부 파일 실패 시 나머지 계속 | High |
| I-DD-001 | 드래그앤드롭 | useDragAndDrop + FileUploader 연동 | High |
| I-DW-001 | 다운로드 | useDownloader + 처리 결과 다운로드 | High |
| I-ED-001 | 편집 체인 | 자르기 → 회전 → 밝기 조절 → 다운로드 | High |
| I-ED-002 | 편집 체인 | 밝기+휘도 → 리사이즈 → 다운로드 | High |
| I-MM-001 | 메모리 | 파일 추가/제거 반복 시 URL.revokeObjectURL 호출 | High |

---

## 6. API 테스트 (05-api, 신규)

### 6.1 Health API

| TC-ID | 엔드포인트 | 테스트 케이스 | 우선순위 |
|-------|-----------|-------------|---------|
| A-HE-001 | GET /api/health | 200 응답 + { status: "ok", timestamp } | Critical |
| A-HE-002 | GET /api/health | Content-Type: application/json | Medium |

### 6.2 Upload API

| TC-ID | 엔드포인트 | 테스트 케이스 | 우선순위 |
|-------|-----------|-------------|---------|
| A-UP-001 | POST /api/upload | 정상 파일 업로드 → presigned URL 반환 | Critical |
| A-UP-002 | POST /api/upload | 100MB 초과 파일 → 413 에러 | High |
| A-UP-003 | POST /api/upload | 지원하지 않는 파일 타입 → 415 에러 | High |
| A-UP-004 | POST /api/upload | 빈 요청 → 400 에러 | High |
| A-UP-005 | POST /api/upload/complete | 업로드 완료 처리 → 파일 정보 반환 | Critical |
| A-UP-006 | POST /api/upload/complete | 존재하지 않는 fileId → 404 에러 | High |

### 6.3 Files API

| TC-ID | 엔드포인트 | 테스트 케이스 | 우선순위 |
|-------|-----------|-------------|---------|
| A-FL-001 | GET /api/files/[fileId] | 존재하는 파일 조회 → 200 | Critical |
| A-FL-002 | GET /api/files/[fileId] | 존재하지 않는 fileId → 404 | High |
| A-FL-003 | DELETE /api/files/[fileId] | 파일 삭제 → 200 | High |
| A-FL-004 | DELETE /api/files/[fileId] | 존재하지 않는 fileId → 404 | High |

### 6.4 Storage API

| TC-ID | 엔드포인트 | 테스트 케이스 | 우선순위 |
|-------|-----------|-------------|---------|
| A-ST-001 | GET /api/storage | 스토리지 정보 조회 | High |
| A-ST-002 | DELETE /api/storage/cleanup | 만료 파일 정리 | High |

---

## 7. E2E 테스트 (04-e2e)

### 7.1 기존 E2E 테스트 (유지보수)

| TC-ID | 스펙 파일 | 범위 |
|-------|----------|------|
| E-HM-* | home.spec.ts | 홈페이지 로드, 도구 카드 표시 |
| E-NV-* | navigation.spec.ts | 전체 도구 페이지 네비게이션 |
| E-IC-* | image-converter.spec.ts | 이미지 포맷 변환 워크플로우 |
| E-LU-* | image-editor-luminance.spec.ts | 휘도 슬라이더 UI, 적용, 초기화 |
| E-GM-* | gif-maker.spec.ts | GIF 생성 워크플로우 |
| E-VC-* | video-converter.spec.ts | 비디오 변환 |
| E-UG-* | url-generator.spec.ts | URL 생성 |
| E-FF-* | ffmpeg-*.spec.ts | FFmpeg WASM 동작 |
| E-AF-* | all-features-test.spec.ts | 전체 기능 통합 |

### 7.2 누락 E2E 테스트 (신규 필요)

#### 7.2.1 image-editor.spec.ts (일반 편집 기능)

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-IE-001 | 이미지 업로드 → 편집기 로드 | Critical |
| E-IE-002 | 자르기: 영역 선택 → 적용 → 이미지 변경 | Critical |
| E-IE-003 | 회전: 90도 회전 → 이미지 변경 | High |
| E-IE-004 | 뒤집기: 좌우/상하 → 이미지 변경 | High |
| E-IE-005 | 리사이즈: 폭/높이 입력 → 적용 | High |
| E-IE-006 | 밝기 조절: 슬라이더 → 미리보기 → 적용 | Critical |
| E-IE-007 | 편집 후 다운로드 | Critical |
| E-IE-008 | 연속 편집 (자르기 → 회전 → 밝기) | High |

#### 7.2.2 image-compressor.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-CP-001 | 이미지 업로드 → 압축 실행 | Critical |
| E-CP-002 | 품질 슬라이더 조절 | High |
| E-CP-003 | 압축 결과 표시 (원본 vs 압축 크기) | High |
| E-CP-004 | 다운로드 | High |
| E-CP-005 | 여러 이미지 배치 압축 | High |

#### 7.2.3 image-upscaler.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-UP-001 | 이미지 업로드 → 업스케일 배율 선택 | Critical |
| E-UP-002 | 업스케일 실행 → 진행률 표시 | High |
| E-UP-003 | 결과 이미지 크기 확인 | High |
| E-UP-004 | 다운로드 | High |

#### 7.2.4 background-remover.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-BR-001 | 이미지 업로드 → 배경 제거 실행 | Critical |
| E-BR-002 | 진행률 표시 | Medium |
| E-BR-003 | 결과 이미지 미리보기 (투명 배경) | High |
| E-BR-004 | PNG 다운로드 | High |

#### 7.2.5 face-blur.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-FB-001 | 이미지 업로드 → 얼굴 감지 | Critical |
| E-FB-002 | 감지된 얼굴 표시 | High |
| E-FB-003 | 블러 유형 선택 (Gaussian / Mosaic) | High |
| E-FB-004 | 블러 적용 → 결과 미리보기 | Critical |
| E-FB-005 | 다운로드 | High |

#### 7.2.6 meme-generator.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-MG-001 | 이미지 업로드 → 텍스트 입력 | Critical |
| E-MG-002 | 상단/하단 텍스트 입력 | High |
| E-MG-003 | 미리보기 업데이트 | High |
| E-MG-004 | 다운로드 | High |

#### 7.2.7 watermark.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-WM-001 | 이미지 업로드 → 텍스트 워터마크 입력 | Critical |
| E-WM-002 | 위치 선택 (9개 옵션) | High |
| E-WM-003 | 불투명도, 회전 조절 | Medium |
| E-WM-004 | 이미지 워터마크 업로드 및 적용 | High |
| E-WM-005 | 타일 모드 적용 | Medium |
| E-WM-006 | 다운로드 | High |

#### 7.2.8 html-to-image.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-HI-001 | HTML 입력 → 미리보기 | Critical |
| E-HI-002 | 출력 포맷 선택 (PNG/JPG/SVG) | High |
| E-HI-003 | 변환 실행 → 결과 이미지 | Critical |
| E-HI-004 | 다운로드 | High |

#### 7.2.9 video-format-converter.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-VF-001 | 비디오 업로드 → 포맷 선택 | Critical |
| E-VF-002 | 변환 실행 → 진행률 표시 | High |
| E-VF-003 | 변환 완료 → 다운로드 | High |

#### 7.2.10 video-resizer.spec.ts

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| E-VR-001 | 비디오 업로드 → 해상도 선택 | Critical |
| E-VR-002 | 리사이즈 실행 → 진행률 | High |
| E-VR-003 | 다운로드 | High |

### 7.3 크로스 브라우저 테스트

모든 E2E 테스트는 3개 브라우저에서 실행:

| 브라우저 | 엔진 | 비고 |
|---------|------|------|
| Chromium | Desktop Chrome | 주 대상 |
| Firefox | Desktop Firefox | WebAssembly 호환성 |
| WebKit | Desktop Safari | macOS/iOS 호환성 |

---

## 8. 성능 테스트 (06-performance, 신규)

### 8.1 파일 처리 성능

| TC-ID | 테스트 케이스 | 기준 | 우선순위 |
|-------|-------------|------|---------|
| P-FP-001 | 1MB JPEG 이미지 변환 (PNG→JPG) | < 500ms | High |
| P-FP-002 | 5MB JPEG 이미지 압축 | < 1000ms | High |
| P-FP-003 | 4000x3000px 이미지 밝기+휘도 조절 | < 1000ms | High |
| P-FP-004 | 10MB RAW 파일 변환 | < 3000ms | Medium |
| P-FP-005 | 10장 이미지 → GIF 생성 (320x240) | < 5000ms | Medium |
| P-FP-006 | 50MB 비디오 → GIF 변환 | < 30000ms | Medium |
| P-FP-007 | 이미지 업스케일 2x (1024x768) | < 10000ms | Medium |
| P-FP-008 | 배경 제거 (1920x1080) | < 15000ms | Medium |

### 8.2 메모리 관리

| TC-ID | 테스트 케이스 | 기준 | 우선순위 |
|-------|-------------|------|---------|
| P-MM-001 | 10개 파일 추가/제거 반복 10회 → 메모리 누수 없음 | heap 증가 < 10MB | High |
| P-MM-002 | 대용량 이미지 처리 후 Object URL 해제 | revokeObjectURL 호출 확인 | High |
| P-MM-003 | FFmpeg WASM 초기화 후 메모리 사용량 | < 256MB | Medium |

### 8.3 페이지 로드 성능

| TC-ID | 테스트 케이스 | 기준 | 우선순위 |
|-------|-------------|------|---------|
| P-PL-001 | 홈페이지 FCP (First Contentful Paint) | < 1500ms | High |
| P-PL-002 | 도구 페이지 LCP (Largest Contentful Paint) | < 2500ms | High |
| P-PL-003 | FFmpeg 초기화 시간 | < 3000ms | Medium |

---

## 9. 접근성 테스트 (07-accessibility, 신규)

### 9.1 키보드 네비게이션

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| A-KB-001 | Tab 키로 모든 인터랙티브 요소 순회 가능 | High |
| A-KB-002 | Enter/Space 키로 버튼 활성화 | High |
| A-KB-003 | Escape 키로 모달/패널 닫기 | High |
| A-KB-004 | 슬라이더: 화살표 키로 값 변경 | High |
| A-KB-005 | 파일 업로드: 키보드로 파일 선택 트리거 | High |
| A-KB-006 | 포커스 트랩: 모달 내 포커스 유지 | Medium |

### 9.2 스크린리더 호환성

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| A-SR-001 | 모든 이미지에 alt 속성 | High |
| A-SR-002 | 폼 요소에 label 연결 | High |
| A-SR-003 | 진행률 바에 aria-valuenow/min/max | High |
| A-SR-004 | 파일 상태 변경 시 aria-live 알림 | Medium |
| A-SR-005 | 버튼에 의미 있는 텍스트/aria-label | High |

### 9.3 시각 접근성

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| A-VS-001 | 색상 대비 WCAG AA 기준 (4.5:1) 충족 | High |
| A-VS-002 | 포커스 표시자(focus indicator) 가시성 | High |
| A-VS-003 | 텍스트 확대 200%에서 레이아웃 유지 | Medium |

### 9.4 axe-core 자동화

| TC-ID | 페이지 | 우선순위 |
|-------|--------|---------|
| A-AX-001 | 홈페이지 axe 스캔 → 위반 0건 | High |
| A-AX-002 | 이미지 편집기 axe 스캔 → 위반 0건 | High |
| A-AX-003 | 비디오 변환기 axe 스캔 → 위반 0건 | High |
| A-AX-004 | 모든 도구 페이지 axe 스캔 → 위반 0건 | Medium |

---

## 10. i18n 테스트 (08-i18n, 신규)

### 10.1 번역 완전성

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| I18-001 | 11개 언어 파일 모두 동일한 최상위 키 보유 | Critical |
| I18-002 | 중첩 키 구조 동일성 (재귀 비교) | High |
| I18-003 | 빈 문자열("") 값 없음 | High |
| I18-004 | 플레이스홀더({variable}) 일관성 | Medium |

### 10.2 locale 라우팅

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| I18-005 | /ko/image-converter 접속 → 한국어 UI | Critical |
| I18-006 | /en/image-converter 접속 → 영어 UI | Critical |
| I18-007 | 언어 변경 시 URL locale 변경 | High |
| I18-008 | 미지원 locale 접속 → 기본 locale 리디렉트 | High |
| I18-009 | 루트 / 접속 → 기본 locale 리디렉트 | High |

### 10.3 RTL 지원 (아랍어)

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| I18-010 | /ar/* 페이지 dir="rtl" 속성 | Medium |
| I18-011 | RTL 레이아웃 정상 표시 | Medium |

---

## 11. 보안 테스트 (09-security, 신규)

### 11.1 파일 검증

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| S-FV-001 | 확장자 위조 파일 (exe→jpg) 거부 | Critical |
| S-FV-002 | 100MB 초과 파일 업로드 거부 | Critical |
| S-FV-003 | 10개 초과 파일 업로드 거부 | High |
| S-FV-004 | 빈 파일(0 bytes) 처리 | High |
| S-FV-005 | 손상된 이미지 파일 에러 처리 | High |

### 11.2 CORS 및 헤더

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| S-CR-001 | Cross-Origin-Embedder-Policy: require-corp 헤더 존재 | Critical |
| S-CR-002 | Cross-Origin-Opener-Policy: same-origin 헤더 존재 | Critical |
| S-CR-003 | API 응답에 적절한 Content-Type 헤더 | High |

### 11.3 XSS 방지

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| S-XS-001 | HTML-to-Image: 악성 스크립트 포함 HTML 무해화 | Critical |
| S-XS-002 | 파일명에 스크립트 태그 포함 시 이스케이프 | High |
| S-XS-003 | 밈 텍스트에 HTML 태그 입력 시 이스케이프 | High |

### 11.4 리소스 보호

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| S-RP-001 | API 엔드포인트 rate limiting (해당 시) | Medium |
| S-RP-002 | 업로드된 파일 접근 권한 (presigned URL 만료) | High |
| S-RP-003 | R2 스토리지 직접 접근 차단 | High |

---

## 12. 모바일 반응형 테스트 (신규)

### 12.1 뷰포트별 테스트

| TC-ID | 뷰포트 | 테스트 케이스 | 우선순위 |
|-------|--------|-------------|---------|
| M-VP-001 | 375x667 (iPhone SE) | 홈페이지 레이아웃 정상 | High |
| M-VP-002 | 375x667 | 파일 업로드 UI 사용 가능 | High |
| M-VP-003 | 375x667 | 슬라이더 조작 가능 | High |
| M-VP-004 | 768x1024 (iPad) | 2열 그리드 레이아웃 | Medium |
| M-VP-005 | 1280x720 (Desktop) | 전체 레이아웃 정상 | High |

### 12.2 터치 인터랙션

| TC-ID | 테스트 케이스 | 우선순위 |
|-------|-------------|---------|
| M-TI-001 | 파일 업로드: 탭으로 파일 선택 트리거 | High |
| M-TI-002 | 슬라이더: 터치 드래그로 값 변경 | High |
| M-TI-003 | 버튼: 탭 영역 최소 44x44px | Medium |

---

## 13. 테스트 실행 전략

### 13.1 실행 순서 및 빈도

| 단계 | 테스트 종류 | 실행 시점 | 예상 시간 |
|------|-----------|----------|----------|
| 1 | 01-unit | 매 커밋 (pre-commit hook) | ~30초 |
| 2 | 02-component | 매 커밋 | ~20초 |
| 3 | 03-integration | PR 생성 시 (CI) | ~1분 |
| 4 | 05-api | PR 생성 시 (CI) | ~30초 |
| 5 | 04-e2e | PR 생성 시 (CI, 3 브라우저) | ~5분 |
| 6 | 06-performance | 주 1회 또는 릴리스 전 | ~3분 |
| 7 | 07-accessibility | 주 1회 또는 릴리스 전 | ~2분 |
| 8 | 08-i18n | 번역 파일 변경 시 | ~1분 |
| 9 | 09-security | 릴리스 전 | ~2분 |

### 13.2 CI/CD 파이프라인

```
push/PR → lint → 01-unit → 02-component → 03-integration → 05-api → 04-e2e
                                                                        ↓
                                                               리포트 생성
                                                          (HTML, JSON, JUnit)
```

### 13.3 테스트 실행 명령어

```bash
# 단위 테스트
npm run test:01-unit

# 컴포넌트 테스트
npm run test:02-component

# 통합 테스트
npm run test:03-integration

# E2E 테스트
npm run test:04-e2e

# E2E (특정 브라우저)
npx playwright test --project=chromium

# E2E (특정 파일)
npx playwright test tests/04-e2e/image-editor.spec.ts

# 커버리지 포함
npm run test:coverage

# 전체 테스트
npm run test:01-unit && npm run test:02-component && npm run test:03-integration && npm run test:04-e2e
```

---

## 14. 테스트 데이터 및 Fixture

### 14.1 필요한 테스트 파일

| 파일 | 용도 | 경로 |
|------|------|------|
| test-image.png | 일반 이미지 테스트 | tests/fixtures/test-image.png |
| test-image.jpg | JPG 변환 테스트 | tests/fixtures/test-image.jpg |
| test-image-large.jpg | 대용량 이미지 (4000x3000) | tests/fixtures/test-image-large.jpg |
| test-image-small.png | 소형 이미지 (100x100) | tests/fixtures/test-image-small.png |
| test-heic.heic | HEIC 변환 테스트 | tests/fixtures/test-heic.heic |
| test-raw.cr2 | RAW 변환 테스트 | tests/fixtures/test-raw.cr2 |
| test-psd.psd | PSD 변환 테스트 | tests/fixtures/test-psd.psd |
| test-video.mp4 | 비디오 처리 테스트 | tests/fixtures/test-video.mp4 |
| test-face.jpg | 얼굴 감지 테스트 | tests/fixtures/test-face.jpg |
| test-corrupted.jpg | 손상된 파일 테스트 | tests/fixtures/test-corrupted.jpg |

### 14.2 Mock 전략

| 대상 | Mock 방식 | 비고 |
|------|----------|------|
| Canvas API | Jest setup.js 전역 Mock | toBlob, toDataURL, getContext |
| Image API | Jest setup.js 전역 Mock | onload 자동 트리거 |
| FileReader | Jest setup.js 전역 Mock | readAsDataURL |
| Worker | Jest setup.js 전역 Mock | postMessage |
| FFmpeg WASM | 서비스별 jest.mock() | initFFmpeg, exec |
| fetch | Jest setup.js 전역 Mock | API 호출 |
| next/navigation | Jest setup.js | useRouter, usePathname |
| next-intl | jest.mock() | useTranslations |
| UUID | 결정적 Mock (mock-uuid-N) | 테스트 재현성 |

---

## 15. 리포팅 및 품질 기준

### 15.1 합격 기준

| 기준 | 목표 |
|------|------|
| 단위 테스트 통과율 | 100% |
| 컴포넌트 테스트 통과율 | 100% |
| 통합 테스트 통과율 | 100% |
| E2E 테스트 통과율 | ≥ 95% (flaky 테스트 허용) |
| 코드 커버리지 (line) | ≥ 80% |
| 코드 커버리지 (branch) | ≥ 70% |
| 접근성 위반 | 0건 (Critical/Serious) |
| 보안 취약점 | 0건 (High/Critical) |

### 15.2 리포트 출력

```
test-results/
  └── [timestamp]/
      ├── 01-unit/
      │   ├── test-report.html
      │   ├── test-results.xml
      │   └── coverage/
      ├── 02-component/
      │   ├── test-report.html
      │   └── test-results.xml
      ├── 03-integration/
      │   ├── test-report.html
      │   └── test-results.xml
      └── 04-e2e/
          ├── html-report/
          ├── results.json
          ├── results.xml
          └── artifacts/
```

---

## 16. 전체 테스트 케이스 요약

| 카테고리 | 기존 | 신규 필요 | 총계 |
|----------|------|----------|------|
| 01-unit (서비스) | ~80개 | ~20개 | ~100개 |
| 01-unit (스토어) | ~9개 | 0 | ~9개 |
| 01-unit (유틸) | ~3개 | 0 | ~3개 |
| 01-unit (공유 훅) | 0 | ~21개 | ~21개 |
| 01-unit (i18n) | 0 | ~5개 | ~5개 |
| 02-component (기존) | ~24개 | 0 | ~24개 |
| 02-component (디자인 시스템) | 0 | ~12개 | ~12개 |
| 02-component (페이지 훅) | 0 | ~7개 | ~7개 |
| 03-integration | ~12개 | ~8개 | ~20개 |
| 04-e2e (기존) | ~40개 | 0 | ~40개 |
| 04-e2e (신규 페이지) | 0 | ~45개 | ~45개 |
| 05-api | 0 | ~12개 | ~12개 |
| 06-performance | 0 | ~11개 | ~11개 |
| 07-accessibility | 0 | ~15개 | ~15개 |
| 08-i18n | 0 | ~11개 | ~11개 |
| 09-security | 0 | ~12개 | ~12개 |
| 모바일 반응형 | 0 | ~8개 | ~8개 |
| **합계** | **~168개** | **~187개** | **~355개** |

---

## 17. 구현 우선순위 로드맵

### Phase 1: Critical (즉시)
1. 누락된 E2E 테스트 (image-editor, image-compressor, background-remover, face-blur)
2. API 라우트 테스트
3. 보안 테스트 (파일 검증, CORS)

### Phase 2: High (1주 내)
4. 공유 훅 단위 테스트
5. 나머지 E2E 테스트 (meme-generator, watermark, html-to-image, video-*)
6. 추가 통합 테스트

### Phase 3: Medium (2주 내)
7. 디자인 시스템 v2 컴포넌트 테스트
8. 접근성 테스트
9. i18n 번역 완전성 테스트
10. 성능 테스트

### Phase 4: Enhancement (지속적)
11. 모바일 반응형 테스트
12. 페이지 훅 테스트
13. 커버리지 목표 달성
