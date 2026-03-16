# Media Utility 테스트 시나리오 및 케이스 — Part 1: 단위 테스트

## 개요

| 항목 | 내용 |
|------|------|
| 대상 | 서비스 15개, 공유 훅 4개, 스토어 1개, i18n 11개 언어, R2/Middleware/Navigation/Request → Part 3 참조 |
| 테스트 유형 | Unit |
| 프레임워크 | Jest + jsdom |
| 작성일 | 2026-03-16 |

---

## 1. 서비스 단위 테스트

### 1.1 imageConverter

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-IC-001 | PNG→JPG 변환 성공 | Happy Path | Critical |
| SC-IC-002 | WebP→PNG 변환 성공 | Happy Path | High |
| SC-IC-003 | 리사이즈 포함 변환 | Happy Path | High |
| SC-IC-004 | getFileExtension 정확성 | Utility | Critical |
| SC-IC-005 | generateNewFilename 정확성 | Utility | High |
| SC-IC-006 | optimizeImage 압축 동작 | Happy Path | High |
| SC-IC-007 | Canvas context 생성 실패 | Error | Medium |
| SC-IC-008 | 비율 유지 리사이즈 계산 | Edge Case | High |

#### TC-UNIT-IC-001: getFileExtension 정확성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 없음 |
| 테스트 데이터 | `"photo.JPG"`, `"image.heic"`, `"no-extension"`, `".hidden"` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `getFileExtension("photo.JPG")` 호출 | `"jpg"` 반환 (소문자) |
| 2 | `getFileExtension("no-extension")` 호출 | `""` 또는 기본값 반환 |
| 3 | `getFileExtension(".hidden")` 호출 | `"hidden"` 반환 |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: 파일 확장자 기반 포맷 판별

#### TC-UNIT-IC-002: generateNewFilename 포맷 변환 반영

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 없음 |
| 테스트 데이터 | 원본명 `"photo.png"`, 대상 포맷 `"jpg"` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `generateNewFilename("photo.png", "jpg")` 호출 | `"photo.jpg"` 반환 |
| 2 | 확장자 없는 파일명 입력 | 새 확장자가 추가됨 |

- 자동화: 가능
- 관련 요구사항: 변환 후 파일명 생성 규칙

#### TC-UNIT-IC-003: convertImage 포맷 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas, toBlob 모킹 |
| 테스트 데이터 | 100x100 PNG File 객체 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | PNG 파일로 `convertImage(file, { format: 'jpg' })` 호출 | Blob 반환, MIME `image/jpeg` |
| 2 | `onProgress` 콜백 전달 | 30, 60, 100 순서로 호출 |
| 3 | `width` 지정 + `maintainAspectRatio: true` | 비율 유지된 크기 |

- 자동화: 가능 (Canvas 모킹 필요)
- 관련 요구사항: 이미지 포맷 변환 기능

#### TC-UNIT-IC-004: optimizeImage 압축

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | `browser-image-compression` 모킹 |
| 테스트 데이터 | 1MB 이미지 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `optimizeImage(file, { maxSizeMB: 0.5 })` 호출 | 압축된 Blob 반환 |
| 2 | `onProgress` 콜백 전달 | 진행률 콜백 호출됨 |

- 자동화: 가능
- 관련 요구사항: 이미지 최적화 기능

---

### 1.2 imageEditor

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-IE-001 | cropImage 정상 자르기 | Happy Path | Critical |
| SC-IE-002 | rotateImage 90도 회전 | Happy Path | Critical |
| SC-IE-003 | rotateImage 180도 회전 | Happy Path | High |
| SC-IE-004 | flipImage 수평 뒤집기 | Happy Path | High |
| SC-IE-005 | flipImage 수직 뒤집기 | Happy Path | High |
| SC-IE-006 | resizeImage 비율 유지 | Happy Path | Critical |
| SC-IE-007 | adjustBrightness 밝기 조절 | Happy Path | Critical |
| SC-IE-008 | adjustBrightness 휘도(luminance) 조절 | Happy Path | Critical |

#### TC-UNIT-IE-001: cropImage 영역 자르기

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹, loadImage 모킹 |
| 테스트 데이터 | 200x200 이미지, crop `{ x: 50, y: 50, width: 100, height: 100 }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `cropImage(file, crop)` 호출 | 100x100 Blob 반환 |
| 2 | Canvas `drawImage` 호출 인자 확인 | `(img, 50, 50, 100, 100, 0, 0, 100, 100)` |

- 자동화: 가능
- 관련 요구사항: 이미지 자르기

#### TC-UNIT-IE-002: rotateImage 90도 회전 시 캔버스 크기 변경

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | 200x100 이미지, 90도 회전 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `rotateImage(file, 90)` 호출 | Canvas 크기 100x200 (가로↔세로 교환) |
| 2 | `ctx.translate`, `ctx.rotate` 호출 확인 | 중심점 이동 + 라디안 변환 |

- 자동화: 가능
- 관련 요구사항: 이미지 회전

#### TC-UNIT-IE-003: adjustBrightness 밝기+휘도 픽셀 조작

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹, getImageData/putImageData 모킹 |
| 테스트 데이터 | 1x1 이미지, RGB(128, 128, 128), brightness=50, luminance=0 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | brightness=50 적용 | 각 채널 += 127.5, 클램핑 후 255 |
| 2 | brightness=0, luminance=50 적용 | BT.709 가중치 기반 휘도 보정 적용 |
| 3 | brightness=-100 적용 | 모든 채널 0 (클램핑) |

- 자동화: 가능
- 관련 요구사항: 밝기/휘도 조절

#### TC-UNIT-IE-004: resizeImage 비율 유지 계산

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | 400x200 이미지, target 100x100, maintainAspectRatio=true |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `resizeImage(file, 100, 100, true)` 호출 | Canvas 크기 100x50 (비율 2:1 유지) |
| 2 | `maintainAspectRatio=false`로 호출 | Canvas 크기 100x100 (강제) |

- 자동화: 가능
- 관련 요구사항: 이미지 리사이즈

---

### 1.3 imageCompressor

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-CP-001 | quality 기반 압축 성공 | Happy Path | Critical |
| SC-CP-002 | maxSizeMB 지정 압축 | Happy Path | High |
| SC-CP-003 | maxWidthOrHeight 제한 | Happy Path | Medium |
| SC-CP-004 | 압축률(ratio) 계산 정확성 | Utility | High |
| SC-CP-005 | formatFileSize 유틸 동작 | Utility | Medium |
| SC-CP-006 | 0바이트 파일 입력 | Edge Case | Low |

#### TC-UNIT-CP-001: compressImage 압축률 반환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `browser-image-compression` 모킹 |
| 테스트 데이터 | 원본 1MB, 압축 후 500KB |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `compressImage(file, { quality: 0.5 })` 호출 | `CompressionResult` 반환 |
| 2 | `result.ratio` 확인 | 50 (%) |
| 3 | `result.originalSize` / `result.compressedSize` 확인 | 정확한 바이트 값 |

- 자동화: 가능
- 관련 요구사항: 이미지 압축

#### TC-UNIT-CP-002: formatFileSize 단위 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | 없음 |
| 테스트 데이터 | 500, 2048, 1572864 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `formatFileSize(500)` | `"500 B"` |
| 2 | `formatFileSize(2048)` | `"2.0 KB"` |
| 3 | `formatFileSize(1572864)` | `"1.50 MB"` |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: UI 파일 크기 표시

---

### 1.4 imageUpscaler

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-UP-001 | 2x 업스케일 성공 | Happy Path | Critical |
| SC-UP-002 | 3x/4x 모델 전환 | Happy Path | High |
| SC-UP-003 | 출력 포맷(PNG/JPG/WebP) 지정 | Happy Path | High |
| SC-UP-004 | 진행률 콜백 호출 | Happy Path | Medium |
| SC-UP-005 | 업스케일러 싱글톤 재사용 | Optimization | Medium |
| SC-UP-006 | 이미지 로드 실패 | Error | High |

#### TC-UNIT-UP-001: upscaleImage 2x 업스케일

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | UpscalerJS 모킹, Canvas 모킹 |
| 테스트 데이터 | 100x100 이미지 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `upscaleImage(file, { scale: 2, format: 'png' })` 호출 | Blob 반환 |
| 2 | `onProgress` 호출 순서 확인 | 5 → 10 → 20 → ... → 85 → 100 |
| 3 | 동일 scale로 재호출 | 기존 upscaler 인스턴스 재사용 |

- 자동화: 가능 (AI 모델 모킹 필수)
- 관련 요구사항: AI 이미지 업스케일

#### TC-UNIT-UP-002: 이미지 로드 실패 에러 처리

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | loadImage가 reject하도록 모킹 |
| 테스트 데이터 | 손상된 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 손상된 파일로 `upscaleImage` 호출 | Error throw |
| 2 | 에러 메시지 확인 | "이미지를 로드할 수 없습니다." 포함 |

- 자동화: 가능
- 관련 요구사항: 에러 핸들링

---

### 1.5 heicConverter

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-HC-001 | HEIC→JPG 변환 성공 | Happy Path | Critical |
| SC-HC-002 | HEIC→PNG 변환 성공 | Happy Path | High |
| SC-HC-003 | quality 옵션 적용 | Happy Path | Medium |
| SC-HC-004 | isHeicFile 확장자 판별 | Utility | Critical |
| SC-HC-005 | isHeicFile MIME 타입 판별 | Utility | High |
| SC-HC-006 | 변환 실패 시 에러 메시지 | Error | High |

#### TC-UNIT-HC-001: convertHeicToJpg 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `heic-to` 모킹 |
| 테스트 데이터 | HEIC 파일 객체 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertHeicToJpg(file)` 호출 | Blob 반환 |
| 2 | `onProgress` 확인 | 10 → 30 → 100 |
| 3 | `toType: 'image/png'` 옵션 | PNG Blob 반환 |

- 자동화: 가능
- 관련 요구사항: HEIC 변환

#### TC-UNIT-HC-002: isHeicFile 판별 정확성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 없음 |
| 테스트 데이터 | 다양한 확장자·MIME 타입 조합 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 확장자 `.heic` 파일 | `true` |
| 2 | 확장자 `.heif` 파일 | `true` |
| 3 | MIME `image/heic` 파일 | `true` |
| 4 | 확장자 `.jpg` 파일 | `false` |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: HEIC 파일 식별

---

### 1.6 rawConverter

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-RC-001 | CR2→JPG 변환 성공 | Happy Path | Critical |
| SC-RC-002 | RAW→PNG 변환 | Happy Path | High |
| SC-RC-003 | 메타데이터 추출 | Happy Path | High |
| SC-RC-004 | isRawFile 확장자 판별 | Utility | Critical |
| SC-RC-005 | 지원하지 않는 RAW 형식 | Error | Medium |
| SC-RC-006 | 메타데이터 추출 실패 시 무시 | Edge Case | Medium |

#### TC-UNIT-RC-001: convertRawToImage 변환 및 메타데이터

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `libraw-wasm` 모킹 |
| 테스트 데이터 | CR2 파일 객체 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertRawToImage(file, { format: 'jpg' })` 호출 | `{ blob, metadata }` 반환 |
| 2 | `metadata.width`, `metadata.height` 확인 | 양의 정수 |
| 3 | `onProgress` 확인 | 5 → 15 → 25 → ... → 100 |

- 자동화: 가능
- 관련 요구사항: RAW 파일 변환

#### TC-UNIT-RC-002: isRawFile 판별

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 없음 |
| 테스트 데이터 | `.cr2`, `.nef`, `.arw`, `.dng`, `.jpg` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `isRawFile(cr2File)` | `true` |
| 2 | `isRawFile(jpgFile)` | `false` |
| 3 | 대소문자 혼합 `.CR2` | 확장자 소문자 변환 후 `true` |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: RAW 파일 식별

---

### 1.7 psdConverter

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-PS-001 | PSD→PNG 변환 성공 | Happy Path | Critical |
| SC-PS-002 | PSD→JPG 흰색 배경 추가 | Happy Path | High |
| SC-PS-003 | PSD→WebP 변환 | Happy Path | Medium |
| SC-PS-004 | quality 옵션 적용 | Happy Path | Medium |
| SC-PS-005 | 진행률 콜백 호출 | Happy Path | Medium |
| SC-PS-006 | 손상된 PSD 파일 | Error | High |

#### TC-UNIT-PS-001: convertPsdToImage PNG 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `@webtoon/psd` 모킹, Canvas 모킹 |
| 테스트 데이터 | PSD 파일 (100x100) |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertPsdToImage(file, 'png')` 호출 | PNG Blob 반환 |
| 2 | Canvas 크기 확인 | `psd.width x psd.height` |
| 3 | `onProgress` 확인 | 10 → 20 → 40 → 60 → 80 → 100 |

- 자동화: 가능
- 관련 요구사항: PSD 변환

#### TC-UNIT-PS-002: PSD→JPG 흰색 배경

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | 투명 배경 PSD 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertPsdToImage(file, 'jpg')` 호출 | JPG Blob 반환 |
| 2 | 배경 캔버스 `fillStyle` 확인 | `#ffffff` |
| 3 | 배경 캔버스에 원본 합성 확인 | `drawImage` 호출됨 |

- 자동화: 가능
- 관련 요구사항: JPG 투명도 미지원 대응

---

### 1.8 htmlToImage

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-HI-001 | HTML→PNG 변환 성공 | Happy Path | Critical |
| SC-HI-002 | HTML→JPG 변환 | Happy Path | High |
| SC-HI-003 | HTML→SVG 변환 | Happy Path | High |
| SC-HI-004 | CSS 포함 렌더링 | Happy Path | Medium |
| SC-HI-005 | 배경색 지정 | Happy Path | Medium |
| SC-HI-006 | DOM 정리 (컨테이너 제거) | Cleanup | High |

#### TC-UNIT-HI-001: convertHtmlToImage PNG 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `html-to-image` 모킹, DOM 환경 |
| 테스트 데이터 | `{ html: "<h1>테스트</h1>", width: 400, height: 300, format: 'png' }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertHtmlToImage(options)` 호출 | PNG Blob 반환 |
| 2 | `html-to-image.toPng` 호출 확인 | 올바른 옵션 전달 |
| 3 | 실행 후 DOM에서 컨테이너 제거 확인 | `document.body.removeChild` 호출 |

- 자동화: 가능
- 관련 요구사항: HTML→이미지 변환

#### TC-UNIT-HI-002: SVG 변환 시 Blob 타입

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | `html-to-image.toSvg` 모킹 |
| 테스트 데이터 | format `'svg'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertHtmlToImage({ ..., format: 'svg' })` 호출 | Blob 반환 |
| 2 | Blob MIME 타입 확인 | `image/svg+xml` |

- 자동화: 가능
- 관련 요구사항: SVG 출력 지원

---

### 1.9 gifGenerator

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-GF-001 | 다수 이미지로 GIF 생성 | Happy Path | Critical |
| SC-GF-002 | 옵션(크기/딜레이/품질) 적용 | Happy Path | High |
| SC-GF-003 | 이미지 비율 유지 중앙 정렬 | Happy Path | Medium |
| SC-GF-004 | 반복 횟수(repeat) 설정 | Happy Path | Medium |
| SC-GF-005 | 진행률 콜백 호출 | Happy Path | Medium |
| SC-GF-006 | 이미지 로드 실패 시 건너뛰기 | Error Recovery | High |

#### TC-UNIT-GF-001: createGifFromImages 기본 생성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `gif.js` 모킹, Canvas 모킹, `loadImage` 모킹 |
| 테스트 데이터 | 3개 이미지 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `createGifFromImages(files)` 호출 | GIF Blob 반환 |
| 2 | `gif.addFrame` 호출 횟수 확인 | 3회 |
| 3 | `onProgress` 순서 확인 | 0~80 (이미지 처리) → 80~100 (렌더링) |

- 자동화: 가능
- 관련 요구사항: GIF 생성

#### TC-UNIT-GF-002: 이미지 비율 유지 + 여백 채움

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | 800x400 이미지, GIF 크기 400x400 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | Canvas `fillRect` 호출 확인 | 흰색 배경 채움 |
| 2 | `drawImage` 위치 확인 | 중앙 정렬 (x=0, y=100 부근) |

- 자동화: 가능
- 관련 요구사항: GIF 이미지 비율 유지

---

### 1.10 videoProcessor

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-VP-001 | initFFmpeg 초기화 성공 | Happy Path | Critical |
| SC-VP-002 | initFFmpeg 싱글톤 동작 | Optimization | High |
| SC-VP-003 | videoToGif 변환 성공 | Happy Path | Critical |
| SC-VP-004 | extractFrames 프레임 추출 | Happy Path | High |
| SC-VP-005 | convertVideo 포맷 변환 | Happy Path | High |
| SC-VP-006 | resizeVideo 크기 변환 | Happy Path | Medium |
| SC-VP-007 | CDN 폴백 로드 | Fallback | Medium |
| SC-VP-008 | 진행률 콜백 호출 | Happy Path | Medium |

#### TC-UNIT-VP-001: initFFmpeg 초기화 및 싱글톤

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `@ffmpeg/ffmpeg` 모킹 |
| 테스트 데이터 | 없음 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `initFFmpeg()` 최초 호출 | FFmpeg 인스턴스 반환, `load` 호출됨 |
| 2 | `initFFmpeg()` 재호출 | 동일 인스턴스 반환, `load` 미호출 |

- 자동화: 가능
- 관련 요구사항: FFmpeg WASM 초기화

#### TC-UNIT-VP-002: videoToGif 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | FFmpeg 모킹 (writeFile, exec, readFile) |
| 테스트 데이터 | MP4 파일, `{ fps: 10, duration: 5, width: 480 }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `videoToGif(file, options)` 호출 | GIF Blob 반환 |
| 2 | FFmpeg `exec` 호출 인자 확인 | `-vf` 에 fps, scale 포함 |
| 3 | `onProgress` 호출 확인 | 10 → 30 → 100 |

- 자동화: 가능
- 관련 요구사항: 비디오→GIF 변환

#### TC-UNIT-VP-003: convertVideo 포맷 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | FFmpeg 모킹 |
| 테스트 데이터 | MOV 파일, 출력 포맷 MP4 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `convertVideo(file, { format: 'mp4' })` 호출 | MP4 Blob 반환 |
| 2 | 출력 파일 확장자 확인 | `.mp4` |

- 자동화: 가능
- 관련 요구사항: 비디오 포맷 변환

---

### 1.11 backgroundRemover

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-BR-001 | 배경 제거 성공 | Happy Path | Critical |
| SC-BR-002 | 진행률 콜백 매핑 (10%~90%) | Happy Path | Medium |
| SC-BR-003 | 에러 발생 시 메시지 전파 | Error | High |
| SC-BR-004 | generateNewFilename 접미사 | Utility | High |
| SC-BR-005 | 출력 형식 PNG 확인 | Happy Path | Medium |

#### TC-UNIT-BR-001: removeImageBackground 성공

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `@imgly/background-removal` 모킹 |
| 테스트 데이터 | JPG 이미지 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `removeImageBackground(file)` 호출 | PNG Blob 반환 |
| 2 | `onProgress` 범위 확인 | 10 → ... → 100 |
| 3 | 출력 config 확인 | `format: 'image/png'`, `quality: 1.0` |

- 자동화: 가능
- 관련 요구사항: 이미지 배경 제거

#### TC-UNIT-BR-002: generateNewFilename

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 없음 |
| 테스트 데이터 | `"photo.jpg"` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `generateNewFilename("photo.jpg")` | `"photo-no-bg.png"` |
| 2 | 확장자 없는 입력 | `"filename-no-bg.png"` |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: 결과 파일명 생성

---

### 1.12 faceBlur

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-FB-001 | detectFaces 얼굴 감지 성공 | Happy Path | Critical |
| SC-FB-002 | applyFaceBlur 가우시안 블러 | Happy Path | Critical |
| SC-FB-003 | applyFaceBlur 모자이크 블러 | Happy Path | High |
| SC-FB-004 | 얼굴 미감지 시 빈 배열 | Edge Case | High |
| SC-FB-005 | additionalRegions 수동 영역 | Happy Path | Medium |
| SC-FB-006 | blurIntensity 범위 검증 | Edge Case | Medium |

#### TC-UNIT-FB-001: detectFaces 얼굴 감지

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | MediaPipe Face Detection 모킹 |
| 테스트 데이터 | 얼굴 포함 이미지 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `detectFaces(file)` 호출 | `DetectedFace[]` 반환 |
| 2 | 결과 속성 확인 | `x`, `y`, `width`, `height`, `confidence` 포함 |
| 3 | 얼굴 없는 이미지 | 빈 배열 `[]` |

- 자동화: 가능 (MediaPipe 모킹 필요)
- 관련 요구사항: 얼굴 감지

#### TC-UNIT-FB-002: applyFaceBlur 블러 적용

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹, detectFaces 모킹 |
| 테스트 데이터 | 이미지 + `{ blurType: 'gaussian', blurIntensity: 20, autoDetect: true }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `applyFaceBlur(file, options)` 호출 | 블러 적용된 Blob 반환 |
| 2 | `blurType: 'mosaic'`로 변경 | 모자이크 처리된 Blob 반환 |

- 자동화: 가능
- 관련 요구사항: 얼굴 블러 처리

---

### 1.13 memeGenerator

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-MG-001 | 상단+하단 텍스트 밈 생성 | Happy Path | Critical |
| SC-MG-002 | 상단만 텍스트 | Happy Path | High |
| SC-MG-003 | 하단만 텍스트 | Happy Path | High |
| SC-MG-004 | 긴 텍스트 줄바꿈 처리 | Edge Case | High |
| SC-MG-005 | 폰트/색상/스트로크 옵션 | Happy Path | Medium |
| SC-MG-006 | 빈 텍스트 | Edge Case | Medium |

#### TC-UNIT-MG-001: generateMeme 텍스트 오버레이

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹, loadImage 모킹 |
| 테스트 데이터 | 이미지 + `{ topText: "상단", bottomText: "하단", fontSize: 40 }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `generateMeme(file, options)` 호출 | Blob 반환 |
| 2 | `ctx.fillText` 호출 확인 | 상단·하단 텍스트 각각 호출 |
| 3 | `ctx.strokeText` 호출 확인 | 외곽선 렌더링 |

- 자동화: 가능
- 관련 요구사항: 밈 이미지 생성

#### TC-UNIT-MG-002: 긴 텍스트 줄바꿈

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | Canvas `measureText` 모킹 |
| 테스트 데이터 | maxWidth 초과 텍스트 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 긴 텍스트 입력 | `fillText` 다수 호출 (줄 수만큼) |
| 2 | 줄 간격 확인 | `fontSize * 1.15` 간격 |

- 자동화: 가능
- 관련 요구사항: 텍스트 줄바꿈

---

### 1.14 watermark

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-WM-001 | 텍스트 워터마크 단일 배치 | Happy Path | Critical |
| SC-WM-002 | 텍스트 워터마크 타일 모드 | Happy Path | High |
| SC-WM-003 | 이미지 워터마크 단일 배치 | Happy Path | Critical |
| SC-WM-004 | 이미지 워터마크 타일 모드 | Happy Path | High |
| SC-WM-005 | 9개 위치(position) 정확성 | Utility | High |
| SC-WM-006 | 투명도(opacity) 적용 | Happy Path | Medium |
| SC-WM-007 | 회전(rotation) 적용 | Happy Path | Medium |

#### TC-UNIT-WM-001: applyTextWatermark 텍스트 워터마크

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹, loadImage 모킹 |
| 테스트 데이터 | 이미지 + `{ text: "SAMPLE", position: 'bottom-right', opacity: 0.5 }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `applyTextWatermark(file, options)` 호출 | Blob 반환 |
| 2 | `ctx.globalAlpha` 확인 | 0.5 |
| 3 | `ctx.fillText` 위치 확인 | 우하단 좌표 |

- 자동화: 가능
- 관련 요구사항: 텍스트 워터마크

#### TC-UNIT-WM-002: applyImageWatermark 이미지 워터마크

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | 원본 이미지 + 워터마크 이미지 + `{ position: 'center', scale: 0.3 }` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `applyImageWatermark(file, options)` 호출 | Blob 반환 |
| 2 | 워터마크 `drawImage` 크기 확인 | 원본 대비 30% 크기 |
| 3 | 위치 확인 | 중앙 좌표 |

- 자동화: 가능
- 관련 요구사항: 이미지 워터마크

#### TC-UNIT-WM-003: 타일 모드 반복 배치

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | Canvas 모킹 |
| 테스트 데이터 | `tileMode: true` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 텍스트 워터마크 타일 모드 | `fillText` 다수 호출 (격자 반복) |
| 2 | 이미지 워터마크 타일 모드 | `drawImage` 다수 호출 (격자 반복) |

- 자동화: 가능
- 관련 요구사항: 타일형 워터마크

---

### 1.15 urlGenerator

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-UG-001 | fileToDataUrl 변환 성공 | Happy Path | Critical |
| SC-UG-002 | fileToBlobUrl 생성 | Happy Path | Critical |
| SC-UG-003 | revokeBlobUrl 해제 | Cleanup | High |
| SC-UG-004 | base64ToBlob 변환 | Utility | High |
| SC-UG-005 | copyToClipboard 성공 | Happy Path | Medium |
| SC-UG-006 | copyToClipboard 폴백 | Fallback | Medium |

#### TC-UNIT-UG-001: fileToDataUrl 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | FileReader 모킹 |
| 테스트 데이터 | 텍스트 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `fileToDataUrl(file)` 호출 | `data:` 접두사 문자열 반환 |
| 2 | FileReader `readAsDataURL` 호출 확인 | 1회 호출 |

- 자동화: 가능
- 관련 요구사항: Data URL 생성

#### TC-UNIT-UG-002: base64ToBlob 변환

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 없음 |
| 테스트 데이터 | Base64 문자열 `"data:image/png;base64,iVBOR..."` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | Data URL 형식 입력 | Blob 반환, MIME `image/png` |
| 2 | 순수 Base64 문자열 입력 | Blob 반환, 기본 MIME `image/png` |

- 자동화: 가능 (순수 함수)
- 관련 요구사항: Base64→Blob 변환

#### TC-UNIT-UG-003: copyToClipboard 및 폴백

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | `navigator.clipboard` 모킹 |
| 테스트 데이터 | 문자열 `"https://example.com"` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | clipboard API 성공 시 | `true` 반환 |
| 2 | clipboard API 실패 → execCommand 폴백 | `true` 반환 |
| 3 | 모두 실패 | `false` 반환 |

- 자동화: 가능
- 관련 요구사항: URL 복사

---

## 2. 공유 훅 단위 테스트

### 2.1 useFileManager

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-FM-001 | addFiles로 파일 추가 | Happy Path | Critical |
| SC-FM-002 | removeFile로 파일 제거 + URL 해제 | Happy Path | Critical |
| SC-FM-003 | updateFile 상태 업데이트 | Happy Path | Critical |
| SC-FM-004 | clearAll 전체 초기화 + URL 해제 | Happy Path | High |
| SC-FM-005 | pendingFiles 필터링 정확성 | Derived State | High |
| SC-FM-006 | completedFiles 필터링 정확성 | Derived State | High |

#### TC-UNIT-FM-001: addFiles 및 removeFile

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `@testing-library/react-hooks` |
| 테스트 데이터 | BaseFile 객체 2개 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `addFiles([file1, file2])` 호출 | `files.length === 2` |
| 2 | `removeFile(file1.id)` 호출 | `files.length === 1`, `URL.revokeObjectURL` 호출 |
| 3 | `clearAll()` 호출 | `files.length === 0` |

- 자동화: 가능
- 관련 요구사항: 파일 목록 관리

#### TC-UNIT-FM-002: 파생 상태 정확성

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 다양한 status를 가진 파일 목록 |
| 테스트 데이터 | pending 2개, completed 1개, error 1개 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `pendingFiles` 확인 | 3개 (pending + error) |
| 2 | `completedFiles` 확인 | 1개 |
| 3 | `pendingCount`, `completedCount` 확인 | 3, 1 |

- 자동화: 가능
- 관련 요구사항: 파일 상태 필터링

---

### 2.2 useBatchProcessor

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-BP-001 | processAll 전체 파일 순차 처리 | Happy Path | Critical |
| SC-BP-002 | 처리 중 isProcessing 상태 | State | High |
| SC-BP-003 | 개별 파일 에러 시 계속 진행 | Error Recovery | Critical |
| SC-BP-004 | 진행률 콜백 전달 | Happy Path | Medium |
| SC-BP-005 | 빈 pendingFiles 시 즉시 완료 | Edge Case | Medium |

#### TC-UNIT-BP-001: processAll 순차 처리

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `useFileManager` 연동 |
| 테스트 데이터 | pending 파일 3개, processFn 모킹 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `processAll(processFn)` 호출 | `isProcessing === true` |
| 2 | 각 파일 처리 완료 | `updateFile` 호출: status `processing` → `completed` |
| 3 | 전체 완료 후 | `isProcessing === false` |

- 자동화: 가능
- 관련 요구사항: 일괄 처리

#### TC-UNIT-BP-002: 개별 에러 시 계속 진행

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 2번째 파일에서 에러 발생하도록 모킹 |
| 테스트 데이터 | 3개 파일, processFn이 2번째에서 throw |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `processAll` 실행 | 1번 파일: completed |
| 2 | 2번 파일 에러 | status `error`, error 메시지 설정 |
| 3 | 3번 파일 계속 처리 | status `completed` |

- 자동화: 가능
- 관련 요구사항: 에러 격리

---

### 2.3 useDragAndDrop

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-DD-001 | 드래그 앤 드롭으로 파일 추가 | Happy Path | Critical |
| SC-DD-002 | isDragging 상태 토글 | State | High |
| SC-DD-003 | handleFileSelect input 선택 | Happy Path | High |
| SC-DD-004 | input value 초기화 | Cleanup | Medium |
| SC-DD-005 | 빈 파일 드롭 무시 | Edge Case | Medium |

#### TC-UNIT-DD-001: 드래그 앤 드롭 이벤트 처리

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | DragEvent 모킹 |
| 테스트 데이터 | File 객체 2개를 포함한 DataTransfer |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `handleDragEnter` 호출 | `isDragging === true` |
| 2 | `handleDrop` 호출 | `onFiles` 콜백에 파일 배열 전달, `isDragging === false` |
| 3 | `handleDragLeave` 호출 | `isDragging === false` |

- 자동화: 가능
- 관련 요구사항: 드래그 앤 드롭 업로드

#### TC-UNIT-DD-002: handleFileSelect input 처리

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | ChangeEvent 모킹 |
| 테스트 데이터 | input.files에 파일 1개 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `handleFileSelect(event)` 호출 | `onFiles` 콜백 호출 |
| 2 | `event.target.value` 확인 | `""` (초기화됨) |

- 자동화: 가능
- 관련 요구사항: 파일 선택 UI

---

### 2.4 useDownloader

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-DL-001 | downloadFile 단일 다운로드 | Happy Path | Critical |
| SC-DL-002 | downloadAll 전체 다운로드 | Happy Path | Critical |
| SC-DL-003 | result 없는 파일 무시 | Edge Case | High |
| SC-DL-004 | generateFilename 콜백 사용 | Happy Path | High |

#### TC-UNIT-DL-001: downloadFile 및 downloadAll

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `file-saver` `saveAs` 모킹 |
| 테스트 데이터 | completed 파일 2개, error 파일 1개 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `downloadFile(completedFile)` 호출 | `saveAs` 1회 호출 |
| 2 | `downloadAll(allFiles)` 호출 | `saveAs` 2회 호출 (completed만) |
| 3 | result 없는 파일로 `downloadFile` 호출 | `saveAs` 미호출 |

- 자동화: 가능
- 관련 요구사항: 파일 다운로드

---

## 3. 스토어 단위 테스트

### 3.1 fileStore (Zustand)

#### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-FS-001 | addFiles 파일 추가 + UUID 생성 | Happy Path | Critical |
| SC-FS-002 | removeFile 파일 제거 + URL 해제 | Happy Path | Critical |
| SC-FS-003 | updateFile 부분 업데이트 | Happy Path | Critical |
| SC-FS-004 | setProgress 진행률 + status 변경 | Happy Path | High |
| SC-FS-005 | setResult 완료 처리 | Happy Path | High |
| SC-FS-006 | setError 에러 처리 | Happy Path | High |
| SC-FS-007 | clearFiles 전체 초기화 + URL 해제 | Happy Path | High |

#### TC-UNIT-FS-001: addFiles 파일 추가

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | Zustand 스토어 초기화 |
| 테스트 데이터 | File 객체 2개 (이미지 1, 비이미지 1) |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `addFiles([imgFile, txtFile])` 호출 | `files.length === 2` |
| 2 | 이미지 파일 preview 확인 | `blob:` URL 생성됨 |
| 3 | 비이미지 파일 preview 확인 | `undefined` |
| 4 | 각 파일 초기 상태 확인 | `status: 'pending'`, `progress: 0` |

- 자동화: 가능
- 관련 요구사항: 파일 상태 관리

#### TC-UNIT-FS-002: setProgress → setResult → setError 흐름

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 파일 1개 추가된 상태 |
| 테스트 데이터 | 추가된 파일의 id |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `setProgress(id, 50)` | `progress: 50`, `status: 'processing'` |
| 2 | `setResult(id, blob)` | `status: 'completed'`, `progress: 100` |
| 3 | 다른 파일에 `setError(id2, msg)` | `status: 'error'`, `error` 메시지 설정 |

- 자동화: 가능
- 관련 요구사항: 파일 처리 상태 전이

#### TC-UNIT-FS-003: clearFiles URL 해제

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | preview URL이 있는 파일 2개 |
| 테스트 데이터 | 이미지 파일 2개 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `clearFiles()` 호출 | `files.length === 0` |
| 2 | `URL.revokeObjectURL` 호출 확인 | 2회 호출 |

- 자동화: 가능
- 관련 요구사항: 메모리 누수 방지

---

## 4. i18n 번역 완전성 테스트

### 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-I18N-001 | 모든 언어 파일의 키 완전성 | Completeness | Critical |
| SC-I18N-002 | 기준 언어(ko) 대비 누락 키 검출 | Completeness | Critical |
| SC-I18N-003 | 빈 문자열 값 검출 | Validation | High |
| SC-I18N-004 | JSON 파싱 가능 여부 | Validation | Critical |
| SC-I18N-005 | 중첩 키 구조 일치 | Structure | High |

#### TC-UNIT-I18N-001: 전체 언어 키 완전성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 11개 언어 파일 로드 (ar, de, en, es, fr, id, ja, ko, pt, ru, zh) |
| 테스트 데이터 | `ko.json`을 기준 언어로 사용 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `ko.json`의 전체 키 목록 추출 (중첩 포함) | 기준 키 셋 생성 |
| 2 | 각 언어 파일의 키 목록과 비교 | 누락 키 없음 |
| 3 | 각 언어 파일에 있지만 기준에 없는 키 확인 | 불필요 키 없음 |
| 4 | 모든 값이 빈 문자열이 아닌지 확인 | 빈 값 없음 |

- 자동화: 가능 (파일 시스템 읽기 + 재귀 키 비교)
- 관련 요구사항: 다국어 지원 완전성

#### TC-UNIT-I18N-002: JSON 유효성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 없음 |
| 테스트 데이터 | 11개 언어 파일 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 각 파일 `JSON.parse` 시도 | 에러 없음 |
| 2 | 결과 타입 확인 | `object` (배열 아님) |

- 자동화: 가능
- 관련 요구사항: i18n 파일 무결성

---

## 부록: 시나리오 요약 통계

| 범주 | 시나리오 수 | 테스트 케이스 수 |
|------|-----------|---------------|
| 서비스 (15개) | 97 | 44 |
| 공유 훅 (4개) | 20 | 8 |
| 스토어 (1개) | 7 | 3 |
| i18n | 5 | 2 |
| **합계** | **129** | **57** |

| 우선순위 | 시나리오 수 |
|---------|-----------|
| Critical | 42 |
| High | 58 |
| Medium | 24 |
| Low | 5 |
