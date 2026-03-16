# Design: 이미지 휘도(Luminance) 조절 기능

> Feature: luminance
> Created: 2026-03-15
> Status: Draft
> Phase: Design
> Plan Reference: `docs/01-plan/features/luminance.plan.md`

---

## 1. 설계 개요

기존 밝기(Brightness) 조절 패널에 **휘도(Luminance) 슬라이더**를 추가한다. 밝기와 휘도는 하나의 패널에서 독립적으로 조절하며, "적용" 버튼 한 번으로 동시에 처리한다.

---

## 2. 변경 파일 및 상세 설계

### 2.1 서비스 레이어: `src/services/imageEditor.ts`

#### 변경 사항: `adjustBrightness()` 함수 시그니처 확장

**현재:**
```typescript
export async function adjustBrightness(
  file: File | Blob,
  brightness: number,
  outputFormat?: string,
  quality?: number
): Promise<Blob>
```

**변경 후:**
```typescript
export async function adjustBrightness(
  file: File | Blob,
  brightness: number,
  luminance: number = 0,       // 새 파라미터 (기본값 0 = 하위 호환)
  outputFormat: string = 'image/jpeg',
  quality: number = 0.92
): Promise<Blob>
```

#### 픽셀 처리 로직 변경

**현재 로직 (라인 228~234):**
```typescript
const offset = brightness * 2.55;
for (let i = 0; i < data.length; i += 4) {
  data[i]     = Math.max(0, Math.min(255, data[i]     + offset));
  data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + offset));
  data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + offset));
}
```

**변경 후 로직:**
```typescript
const brightnessOffset = brightness * 2.55;
const luminanceFactor = luminance / 100;

// ITU-R BT.709 가중치
const LR = 0.2126;
const LG = 0.7152;
const LB = 0.0722;

for (let i = 0; i < data.length; i += 4) {
  let r = data[i];
  let g = data[i + 1];
  let b = data[i + 2];

  // 1단계: 밝기 적용 (균등 오프셋)
  r += brightnessOffset;
  g += brightnessOffset;
  b += brightnessOffset;

  // 2단계: 휘도 적용 (가중치 기반)
  if (luminanceFactor !== 0) {
    const currentLuminance = LR * r + LG * g + LB * b;
    const luminanceAdjust = currentLuminance * luminanceFactor;
    r += luminanceAdjust;
    g += luminanceAdjust;
    b += luminanceAdjust;
  }

  // 클램핑
  data[i]     = Math.max(0, Math.min(255, r));
  data[i + 1] = Math.max(0, Math.min(255, g));
  data[i + 2] = Math.max(0, Math.min(255, b));
}
```

**설계 근거:**
- 밝기(brightness): 모든 채널에 동일한 값을 더하여 전체적인 밝기 변경
- 휘도(luminance): 현재 픽셀의 인지 밝기(ITU-R BT.709)를 기준으로 비율 조절 → 밝은 영역은 더 밝게, 어두운 영역은 적게 변화하여 자연스러운 결과
- `luminanceFactor !== 0` 조건으로 휘도 미사용 시 성능 저하 없음
- luminance 기본값 0 → 기존 호출 코드 변경 불필요 (하위 호환)

---

### 2.2 훅 레이어: `src/app/[locale]/image-editor/_hooks/useImageEditor.ts`

#### 2.2.1 상태 추가

```typescript
// 기존 (라인 44)
const [brightness, setBrightness] = useState(0);

// 추가
const [luminance, setLuminance] = useState(0);
```

#### 2.2.2 핸들러 수정: `handleBrightnessApply()`

**현재 (라인 198~211):**
```typescript
const handleBrightnessApply = async () => {
  if ((!file && !editedBlob) || brightness === 0) return;
  ...
  const result = await adjustBrightness(getCurrentSource(), brightness);
  ...
  setBrightness(0);
  setEditMode(null);
};
```

**변경 후:**
```typescript
const handleBrightnessApply = async () => {
  if ((!file && !editedBlob) || (brightness === 0 && luminance === 0)) return;
  setIsProcessing(true);
  try {
    const result = await adjustBrightness(getCurrentSource(), brightness, luminance);
    setEditedBlob(result);
    setPreview(URL.createObjectURL(result));
    setBrightness(0);
    setLuminance(0);
    setEditMode(null);
  } catch (error) {
    console.error('Brightness/Luminance error:', error);
  }
  setIsProcessing(false);
};
```

**변경 포인트:**
- 조건: `brightness === 0` → `brightness === 0 && luminance === 0`
- 호출: `adjustBrightness(source, brightness)` → `adjustBrightness(source, brightness, luminance)`
- 리셋: `setLuminance(0)` 추가

#### 2.2.3 초기화 관련 수정

`processFile()` (라인 50~66)과 `handleReset()` (라인 224~232)에 `setLuminance(0)` 추가.

#### 2.2.4 반환값 추가

```typescript
return {
  ...
  luminance,
  setLuminance,
  ...
};
```

---

### 2.3 UI 레이어: `src/app/[locale]/image-editor/page.tsx`

#### 2.3.1 훅 반환값 구조분해에 추가

```typescript
const {
  ...
  luminance,
  setLuminance,
  ...
} = useImageEditor();
```

#### 2.3.2 밝기 패널 UI 확장 (라인 251~292)

기존 밝기 슬라이더 아래에 휘도 슬라이더 추가. 기존 레이아웃 패턴을 그대로 따른다.

```
┌─────────────────────────────────────────────────────┐
│ 밝기 패널 (editMode === 'brightness')               │
│                                                     │
│  밝기 조절: [값]                                     │
│  ──────────[슬라이더]──────────                      │
│  -100        0        +100                          │
│                                                     │
│  휘도 조절: [값]                        ← 새로 추가  │
│  ──────────[슬라이더]──────────          ← 새로 추가  │
│  -100        0        +100              ← 새로 추가  │
│                                                     │
│  [초기화]  [적용]                                     │
└─────────────────────────────────────────────────────┘
```

**구체적 UI 코드:**

```tsx
{editMode === 'brightness' && (
  <div className="p-4 bg-white border-4 border-black">
    <div className="flex flex-wrap items-end gap-6">
      {/* 밝기 슬라이더 (기존) */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
          {t('imageEditor.brightness.label')}:{' '}
          <span style={{ color: ACCENT }}>{brightness}</span>
        </label>
        <input type="range" min={-100} max={100} value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))} ... />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
          <span>-100</span><span>0</span><span>+100</span>
        </div>
      </div>

      {/* 휘도 슬라이더 (신규) */}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">
          {t('imageEditor.brightness.luminanceLabel')}:{' '}
          <span style={{ color: ACCENT }}>{luminance}</span>
        </label>
        <input type="range" min={-100} max={100} value={luminance}
          onChange={(e) => setLuminance(Number(e.target.value))} ... />
        <div className="flex justify-between text-xs text-gray-400 mt-1 font-bold">
          <span>-100</span><span>0</span><span>+100</span>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-2">
        <button onClick={() => { setBrightness(0); setLuminance(0); }}>
          {t('imageEditor.brightness.reset')}
        </button>
        <button onClick={handleBrightnessApply}
          disabled={isProcessing || (brightness === 0 && luminance === 0)}>
          {t('imageEditor.brightness.apply')}
        </button>
      </div>
    </div>
  </div>
)}
```

#### 2.3.3 미리보기 CSS 필터 수정 (라인 317~321)

**현재:**
```typescript
style={
  editMode === 'brightness' && brightness !== 0
    ? { filter: `brightness(${1 + brightness / 100})` }
    : undefined
}
```

**변경 후:**
```typescript
style={
  editMode === 'brightness' && (brightness !== 0 || luminance !== 0)
    ? { filter: `brightness(${(1 + brightness / 100) * (1 + luminance / 200)})` }
    : undefined
}
```

**설계 근거:**
- CSS `brightness()` 필터로 밝기+휘도 효과를 근사 표현
- 휘도는 밝기보다 부드러운 효과이므로 `/200`으로 반감 적용
- 정확한 가중치 처리는 "적용" 시 Canvas에서 수행

---

### 2.4 다국어 번역: `messages/*.json` (11개 파일)

기존 `imageEditor.brightness` 객체에 `luminanceLabel` 키 추가.

| 언어 | 파일 | `luminanceLabel` 값 |
|------|------|---------------------|
| ko | ko.json | `"휘도 조절"` |
| en | en.json | `"Luminance"` |
| ja | ja.json | `"輝度調整"` |
| zh | zh.json | `"亮度调整"` |
| de | de.json | `"Leuchtdichte"` |
| fr | fr.json | `"Luminance"` |
| es | es.json | `"Luminancia"` |
| pt | pt.json | `"Luminância"` |
| ru | ru.json | `"Яркость свечения"` |
| ar | ar.json | `"الإضاءة"` |
| id | id.json | `"Luminansi"` |

---

## 3. 타입 변경

### `_types/index.ts` — 변경 없음

`EditMode`에 새 모드를 추가할 필요 없음. 휘도는 기존 `'brightness'` 모드 내에서 함께 동작한다.

---

## 4. 구현 순서 및 의존성

```
Step 1: 서비스 함수 확장 (imageEditor.ts)
  ├─ adjustBrightness()에 luminance 파라미터 추가
  ├─ 가중치 기반 픽셀 조작 로직 추가
  └─ 의존: 없음

Step 2: 훅 확장 (useImageEditor.ts)
  ├─ luminance 상태 추가
  ├─ handleBrightnessApply() 수정
  ├─ processFile(), handleReset()에 setLuminance(0) 추가
  ├─ 반환값에 luminance, setLuminance 추가
  └─ 의존: Step 1

Step 3: UI 확장 (page.tsx)
  ├─ 훅 구조분해에 luminance, setLuminance 추가
  ├─ 밝기 패널에 휘도 슬라이더 추가
  ├─ 초기화 버튼에 setLuminance(0) 추가
  ├─ 적용 버튼 disabled 조건 수정
  ├─ CSS 필터 미리보기 수정
  └─ 의존: Step 2

Step 4: 다국어 번역 (messages/*.json)
  ├─ 11개 언어 파일에 luminanceLabel 키 추가
  └─ 의존: 없음 (Step 3과 병행 가능)
```

---

## 5. 하위 호환성 검증

| 검증 항목 | 기대 동작 |
|-----------|----------|
| `adjustBrightness(file, 50)` 기존 호출 | luminance 기본값 0 → 기존과 동일 동작 |
| 밝기만 조절 (luminance=0) | 기존 밝기 결과와 동일 |
| 휘도만 조절 (brightness=0) | 밝기 오프셋 0, 휘도만 적용 |
| 둘 다 0 | 적용 버튼 비활성, 처리 안 함 |
| 둘 다 조절 | 밝기 오프셋 + 휘도 가중치 순차 적용 |

---

## 6. 설계 체크리스트

- [ ] `adjustBrightness()` luminance 파라미터 추가 (기본값 0)
- [ ] ITU-R BT.709 가중치 기반 픽셀 처리 로직
- [ ] luminance 상태 및 setter 훅에 추가
- [ ] handleBrightnessApply()에 luminance 전달 및 리셋
- [ ] processFile(), handleReset()에 setLuminance(0)
- [ ] 밝기 패널에 휘도 슬라이더 UI 추가
- [ ] 초기화 버튼: 밝기+휘도 모두 리셋
- [ ] 적용 버튼 disabled: `brightness === 0 && luminance === 0`
- [ ] CSS 필터 미리보기에 휘도 근사값 반영
- [ ] 11개 언어 파일에 luminanceLabel 번역 추가
