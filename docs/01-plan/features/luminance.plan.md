# Plan: 이미지 휘도(Luminance) 조절 기능

> Feature: luminance
> Created: 2026-03-15
> Status: Draft
> Phase: Plan

---

## 1. 개요

### 1.1 목적
이미지 편집기의 밝기 조절 패널에 **휘도(Luminance)** 슬라이더를 추가하여, 밝기와 휘도를 동시에 조절할 수 있도록 한다.

### 1.2 배경
현재 밝기(Brightness) 기능은 모든 RGB 채널에 동일한 오프셋을 더하는 단순 방식이다. 이 방식은 빠르지만, 인간의 시각 인지 특성을 반영하지 않아 자연스럽지 않은 결과를 낼 수 있다.

**밝기 vs 휘도 차이:**
| 구분 | 밝기 (Brightness) | 휘도 (Luminance) |
|------|-------------------|------------------|
| 방식 | RGB 동일 오프셋 가감 | 인간 시각 가중치 기반 조절 |
| 공식 | R±offset, G±offset, B±offset | ITU-R BT.709 가중치 적용 |
| 특징 | 단순, 빠름 | 자연스러운 밝기 변화, 색상 보존 |
| 용도 | 전체적인 밝기 변경 | 인지적으로 자연스러운 명도 조절 |

### 1.3 목표
- 기존 밝기 조절 패널에 휘도 슬라이더를 추가
- 밝기와 휘도를 독립적으로 또는 동시에 조절 가능
- 하나의 "적용" 버튼으로 밝기 + 휘도를 한 번에 처리
- 실시간 미리보기 제공

---

## 2. 기능 요구사항

### 2.1 핵심 기능
| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| FR-01 | 휘도 슬라이더 추가 (-100 ~ +100, 기본값 0) | 필수 |
| FR-02 | 휘도 조절 실시간 미리보기 | 필수 |
| FR-03 | 밝기 + 휘도 동시 적용 (하나의 "적용" 버튼) | 필수 |
| FR-04 | "초기화" 버튼으로 밝기·휘도 모두 0으로 복원 | 필수 |
| FR-05 | 밝기만, 휘도만, 또는 둘 다 조절 가능 | 필수 |
| FR-06 | 적용 버튼 활성 조건: 밝기 또는 휘도 중 하나라도 0이 아닐 때 | 필수 |

### 2.2 비기능 요구사항
| ID | 요구사항 | 기준 |
|----|---------|------|
| NFR-01 | 밝기+휘도 동시 처리 시간 | 2000x2000px 이미지 기준 500ms 이내 |
| NFR-02 | 미리보기 반응 지연 | 슬라이더 조작 시 200ms 이내 |
| NFR-03 | 기존 밝기 기능과의 하위 호환성 | 휘도 0일 때 기존 밝기 동작과 동일 |

---

## 3. 기술 분석

### 3.1 휘도 조절 알고리즘

ITU-R BT.709 가중치를 사용한 luminance 기반 조절:

```
Luminance 가중치 (ITU-R BT.709):
  Lr = 0.2126
  Lg = 0.7152
  Lb = 0.0722

현재 픽셀의 휘도값 계산:
  L = Lr * R + Lg * G + Lb * B

휘도 조절 적용 (luminanceValue: -100 ~ +100):
  factor = 1 + (luminanceValue / 100)
  R' = clamp(R + (L * factor - L) * Lr_inv, 0, 255)

  간소화 방식:
  delta = luminanceValue * 2.55
  R' = clamp(R + delta * Lr_ratio, 0, 255)
  G' = clamp(G + delta * Lg_ratio, 0, 255)
  B' = clamp(B + delta * Lb_ratio, 0, 255)
```

**구현 방식 선택: 가중치 기반 RGB 조절**

```typescript
// 각 채널별 가중 오프셋
const luminanceOffset = luminance * 2.55;
const rOffset = luminanceOffset * 0.2126 / 0.3333;  // 녹색 대비 적색 가중
const gOffset = luminanceOffset * 0.7152 / 0.3333;  // 인간 시각에 민감한 녹색 강조
const bOffset = luminanceOffset * 0.0722 / 0.3333;  // 청색 최소 반영
```

이 방식은 녹색 채널에 더 큰 가중치를 부여하여 인간의 시각 인지에 맞는 자연스러운 밝기 변화를 만든다.

### 3.2 밝기 + 휘도 통합 처리

기존 `adjustBrightness()` 함수를 확장하여 한 번의 픽셀 루프에서 밝기와 휘도를 동시에 처리한다.

```
픽셀 처리 루프 (1회):
  brightnessOffset = brightness * 2.55
  luminanceOffset = luminance * 2.55

  for each pixel:
    // 밝기: 균등 오프셋
    R' = R + brightnessOffset
    G' = G + brightnessOffset
    B' = B + brightnessOffset

    // 휘도: 가중 오프셋 (순차 적용)
    R'' = R' + luminanceOffset * 0.6378
    G'' = G' + luminanceOffset * 2.1456
    B'' = B' + luminanceOffset * 0.2166

    // 클램핑
    R_final = clamp(R'', 0, 255)
    G_final = clamp(G'', 0, 255)
    B_final = clamp(B'', 0, 255)
```

**성능 이점:** 별도 함수가 아닌 기존 루프 확장으로 추가 성능 비용 거의 없음

### 3.3 실시간 미리보기 전략

CSS 필터로 밝기와 휘도를 근사 미리보기:

```css
/* 밝기: CSS brightness() 필터 */
filter: brightness(1 + brightness/100);

/* 휘도: CSS brightness() + contrast() 조합으로 근사 */
filter: brightness(1 + brightness/100) brightness(1 + luminance/200) contrast(1 + luminance/400);
```

> **참고:** CSS 필터로 정확한 가중치 기반 휘도를 재현하기 어려우므로, 근사값으로 미리보기를 제공하고 "적용" 시 정확한 Canvas 처리를 수행한다.

### 3.4 영향 범위

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/services/imageEditor.ts` | 수정 | `adjustBrightness()` → 파라미터에 luminance 추가 |
| `src/app/[locale]/image-editor/_hooks/useImageEditor.ts` | 수정 | luminance 상태 추가, 핸들러 수정 |
| `src/app/[locale]/image-editor/page.tsx` | 수정 | 휘도 슬라이더 UI 추가, 미리보기 필터 수정 |
| `messages/ko.json` (및 기타 언어 파일) | 수정 | 휘도 관련 번역 키 추가 |

---

## 4. 구현 계획

### 4.1 구현 순서

```
Step 1: 서비스 함수 확장
  └─ adjustBrightness()에 luminance 파라미터 추가 (기본값 0, 하위 호환)
  └─ 가중치 기반 픽셀 조작 로직 추가

Step 2: 훅 확장
  └─ luminance 상태 추가 (useState(0))
  └─ handleBrightnessApply()에 luminance 전달
  └─ 초기화 시 luminance도 0으로 리셋
  └─ 적용 버튼 활성 조건: brightness !== 0 || luminance !== 0

Step 3: UI 확장
  └─ 밝기 패널에 휘도 슬라이더 추가 (기존 밝기 슬라이더 아래)
  └─ 초기화 버튼: 밝기·휘도 모두 리셋
  └─ CSS filter 미리보기에 휘도 근사값 반영

Step 4: 다국어 번역
  └─ 각 언어 파일에 "휘도" 관련 키 추가
```

### 4.2 예상 작업량
- 서비스 수정: 소규모 (기존 루프에 가중 오프셋 추가, 약 10줄)
- 훅 수정: 소규모 (상태 1개, 핸들러 조건 수정)
- UI 수정: 소규모 (슬라이더 1개 추가, 기존 패널 레이아웃 내)
- 번역: 소규모 (키 2~3개 추가)

---

## 5. 리스크 및 고려사항

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 밝기+휘도 동시 적용 시 색상 클리핑 | 극단값에서 색 왜곡 | 각 슬라이더 범위 -100~+100 제한, 클램핑 처리 |
| CSS 미리보기와 Canvas 결과 차이 | 사용자 혼란 | 패널에 "미리보기는 근사값" 안내 텍스트 (선택사항) |
| 기존 밝기 기능과의 하위 호환성 깨짐 | 기존 동작 변경 | luminance 기본값 0으로 설정, 0일 때 기존 동작과 동일 |
| 가중치 계산으로 인한 성능 저하 | 처리 시간 증가 | 동일 루프 내 처리로 추가 비용 최소화 |

---

## 6. 성공 기준

- [ ] 밝기 패널에 휘도 슬라이더가 표시된다
- [ ] 휘도 슬라이더 조작 시 실시간 미리보기가 반영된다
- [ ] 밝기만 조절, 휘도만 조절, 둘 다 조절 모두 정상 동작한다
- [ ] "적용" 버튼으로 밝기+휘도 변경이 editedBlob에 반영된다
- [ ] 휘도만 조절할 경우 녹색 채널 중심의 자연스러운 밝기 변화가 확인된다
- [ ] 휘도 0일 때 기존 밝기 기능과 동일하게 동작한다 (하위 호환)
- [ ] 초기화 버튼으로 밝기·휘도 모두 0으로 복원된다
- [ ] 기존 편집 기능(자르기, 회전 등)과 충돌 없이 동작한다
