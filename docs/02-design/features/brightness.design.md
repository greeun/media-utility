# Design: 이미지 밝기 조절 기능

> Feature: brightness
> Created: 2026-03-15
> Status: Draft
> Phase: Design
> Plan Reference: `docs/01-plan/features/brightness.plan.md`

---

## 1. 아키텍처 개요

기존 이미지 편집기의 패턴(Canvas 기반 서비스 → 훅 상태 관리 → 페이지 UI)을 그대로 따른다.

```
┌─────────────────────────────────────────────────────────────┐
│  page.tsx (UI Layer)                                        │
│  ┌───────────────────────┐  ┌────────────────────────────┐  │
│  │ 툴바: Sun 아이콘 버튼 │  │ 밝기 패널                  │  │
│  │ (editMode 토글)       │  │ - 슬라이더 (-100 ~ +100)   │  │
│  └───────────┬───────────┘  │ - 현재 값 표시             │  │
│              │              │ - 적용 / 초기화 버튼        │  │
│              │              └──────────────┬─────────────┘  │
│              │                             │                │
│  ┌───────────▼─────────────────────────────▼──────────────┐ │
│  │ 이미지 미리보기                                        │ │
│  │ CSS filter: brightness() 실시간 적용                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────┘
                                  │ "적용" 클릭
┌─────────────────────────────────▼───────────────────────────┐
│  useImageEditor Hook                                        │
│  - brightness: number (상태)                                │
│  - handleBrightnessApply(): 서비스 호출 → editedBlob 갱신  │
│  - handleBrightnessReset(): 밝기 값 0 복원                 │
└─────────────────────────────────┬───────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────┐
│  imageEditor.ts Service                                     │
│  adjustBrightness(file, brightness) → Promise<Blob>         │
│  - Canvas ImageData 픽셀 조작                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 상세 설계

### 2.1 타입 변경

**파일:** `src/app/[locale]/image-editor/_types/index.ts`

```typescript
// 변경 전
export type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | null;

// 변경 후
export type EditMode = 'crop' | 'rotate' | 'resize' | 'optimize' | 'brightness' | null;
```

### 2.2 서비스 함수

**파일:** `src/services/imageEditor.ts`

**함수:** `adjustBrightness()`

```typescript
/**
 * 이미지 밝기 조절
 * @param file - 원본 이미지 (File 또는 Blob)
 * @param brightness - 밝기 값 (-100 ~ +100, 0은 원본)
 * @param outputFormat - 출력 포맷 (기본: image/jpeg)
 * @param quality - 출력 품질 (기본: 0.92)
 * @returns 밝기 조절된 이미지 Blob
 */
export async function adjustBrightness(
  file: File | Blob,
  brightness: number,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob>
```

**알고리즘:**
1. `loadImage()`로 이미지를 HTMLImageElement로 로드
2. Canvas에 이미지를 그림
3. `ctx.getImageData()`로 픽셀 데이터 추출
4. 각 픽셀의 RGB에 오프셋 적용: `offset = brightness * 2.55`
5. `ctx.putImageData()`로 수정된 픽셀 데이터 적용
6. `canvas.toBlob()`으로 Blob 반환

**구현 코드:**

```typescript
export async function adjustBrightness(
  file: File | Blob,
  brightness: number,
  outputFormat: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(file instanceof File ? file : new File([file], 'image'));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const offset = brightness * 2.55;

  for (let i = 0; i < data.length; i += 4) {
    data[i]     = Math.max(0, Math.min(255, data[i]     + offset)); // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + offset)); // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + offset)); // B
    // data[i + 3] = Alpha (변경 없음)
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 밝기 조절에 실패했습니다.'));
        }
      },
      outputFormat,
      quality
    );
  });
}
```

### 2.3 훅 변경

**파일:** `src/app/[locale]/image-editor/_hooks/useImageEditor.ts`

#### 2.3.1 추가할 import

```typescript
import { Sun } from 'lucide-react';
import { adjustBrightness } from '@/services/imageEditor';
```

#### 2.3.2 추가할 상태

```typescript
// 밝기 상태
const [brightness, setBrightness] = useState(0);
```

#### 2.3.3 추가할 핸들러

```typescript
// 밝기 적용
const handleBrightnessApply = async () => {
  if ((!file && !editedBlob) || brightness === 0) return;
  setIsProcessing(true);
  try {
    const result = await adjustBrightness(getCurrentSource(), brightness);
    setEditedBlob(result);
    setPreview(URL.createObjectURL(result));
    setBrightness(0);
    setEditMode(null);
  } catch (error) {
    console.error('Brightness error:', error);
  }
  setIsProcessing(false);
};
```

#### 2.3.4 processFile 수정

`processFile` 내 초기화 로직에 밝기 초기화 추가:

```typescript
setBrightness(0);
```

#### 2.3.5 handleReset 수정

`handleReset` 내 초기화 로직에 밝기 초기화 추가:

```typescript
setBrightness(0);
```

#### 2.3.6 툴바 버튼 추가

`toolbarButtons` 배열의 optimize 버튼 뒤에 추가:

```typescript
{
  mode: 'brightness',
  icon: Sun,
  label: t('imageEditor.toolbar.brightness'),
  action: () => setEditMode(editMode === 'brightness' ? null : 'brightness'),
},
```

#### 2.3.7 return 객체에 추가

```typescript
return {
  // ... 기존 상태
  brightness,
  setBrightness,

  // ... 기존 핸들러
  handleBrightnessApply,

  // ... 기존 툴바
  toolbarButtons,
};
```

### 2.4 페이지 UI 변경

**파일:** `src/app/[locale]/image-editor/page.tsx`

#### 2.4.1 훅 디스트럭처링에 추가

```typescript
const {
  // ... 기존 값들
  brightness,
  setBrightness,
  handleBrightnessApply,
} = useImageEditor();
```

#### 2.4.2 밝기 편집 패널 (optimize 패널 아래에 추가)

```tsx
{/* 편집 패널 - 밝기 */}
{editMode === 'brightness' && (
  <div className="p-4 bg-white border-4 border-black">
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
          {t('imageEditor.brightness.label')}:{' '}
          <span style={{ color: ACCENT }}>{brightness}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
          <span>-100</span>
          <span>0</span>
          <span>+100</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setBrightness(0)}
          className="px-4 py-2 border-4 border-black text-sm font-black uppercase tracking-wide bg-white text-black hover:bg-black hover:text-white transition-all"
        >
          {t('imageEditor.brightness.reset')}
        </button>
        <button
          onClick={handleBrightnessApply}
          disabled={isProcessing || brightness === 0}
          style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
          className="px-4 py-2 border-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {t('imageEditor.brightness.apply')}
        </button>
      </div>
    </div>
  </div>
)}
```

#### 2.4.3 이미지 미리보기에 CSS filter 적용

미리보기 `<img>` 태그 (crop 모드가 아닌 경우)에 CSS filter 추가:

```tsx
// 변경 전
<img
  ref={imgRef}
  src={preview}
  alt="Edit preview"
  className="max-h-[600px] object-contain"
/>

// 변경 후
<img
  ref={imgRef}
  src={preview}
  alt="Edit preview"
  className="max-h-[600px] object-contain"
  style={
    editMode === 'brightness' && brightness !== 0
      ? { filter: `brightness(${1 + brightness / 100})` }
      : undefined
  }
/>
```

**CSS filter brightness 변환 공식:**
- 밝기 값 0 → `brightness(1)` (원본)
- 밝기 값 +100 → `brightness(2)` (2배 밝기)
- 밝기 값 -100 → `brightness(0)` (완전히 어두움)
- 공식: `brightness(1 + value / 100)`

---

## 3. i18n 번역 키

추가해야 할 번역 키 (한국어 기준):

```json
{
  "imageEditor": {
    "toolbar": {
      "brightness": "밝기"
    },
    "brightness": {
      "label": "밝기 조절",
      "apply": "적용",
      "reset": "초기화"
    }
  }
}
```

---

## 4. 구현 순서 (체크리스트)

```
□ Step 1: 타입 확장
  └─ _types/index.ts: EditMode에 'brightness' 추가

□ Step 2: 서비스 함수 구현
  └─ services/imageEditor.ts: adjustBrightness() 추가

□ Step 3: i18n 번역 키 추가
  └─ 해당 메시지 파일에 brightness 관련 키 추가

□ Step 4: 훅 확장
  └─ _hooks/useImageEditor.ts:
     - Sun 아이콘 import
     - adjustBrightness import
     - brightness 상태 추가
     - handleBrightnessApply 핸들러 추가
     - processFile, handleReset에 setBrightness(0) 추가
     - toolbarButtons에 밝기 버튼 추가
     - return 객체에 brightness, setBrightness, handleBrightnessApply 추가

□ Step 5: UI 구현
  └─ page.tsx:
     - 훅에서 brightness, setBrightness, handleBrightnessApply 추출
     - 밝기 편집 패널 추가 (optimize 패널 아래)
     - 미리보기 img에 CSS filter 적용
```

---

## 5. 설계 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| 미리보기 방식 | CSS `filter: brightness()` | 슬라이더 조작 시 0ms 지연, 성능 최적 |
| 최종 적용 방식 | Canvas `getImageData` 픽셀 조작 | Blob 출력 필요, 기존 패턴과 일치 |
| 출력 품질 | 0.92 (기존 0.9보다 약간 높음) | 밝기 변환 시 품질 보존을 위해 |
| 슬라이더 범위 | -100 ~ +100 (정수) | 직관적, 과도한 왜곡 방지 |
| 아이콘 | `Sun` (lucide-react) | 밝기를 직관적으로 표현 |
| 패널 위치 | optimize 패널 아래 | 색상 보정 계열 기능으로 최적화 근처 배치 |
| 적용 후 동작 | brightness를 0으로 리셋, editMode를 null로 | 다른 편집 기능(crop, resize)과 동일한 패턴 |
