# Media Utility 테스트 시나리오 및 케이스 — Part 3: 누락분 보완

> Version: 1.0.0
> Created: 2026-03-16
> Status: Approved
> Project: media-utility v0.1.1
> 근거: test-plan.md 섹션 2.2 갭 분석 조치 결과

---

## 개요

이 문서는 테스트 계획 누락분 조사 결과에 따라 **신규 추가된 테스트 영역**의 시나리오와 케이스를 정의한다.
Part 1(단위/컴포넌트), Part 2(API/통합/E2E/비기능)에서 누락된 영역을 보완한다.

### 문서 구조

| 섹션 | 범위 | 테스트 파일 | 케이스 수 |
|------|------|------------|----------|
| 1. R2 스토리지 유틸리티 | S3Client 생성, 환경 변수 | `01-unit/lib/r2.test.ts` | 6 |
| 2. Middleware | locale 라우팅 미들웨어 | `01-unit/middleware/middleware.test.ts` | 5 |
| 3. i18n Navigation | next-intl navigation 래퍼 | `01-unit/i18n/navigation.test.ts` | 2 |
| 4. i18n Request Config | 서버 요청 locale 결정 | `01-unit/i18n/request.test.ts` | 5 |
| 5. ThemeSelector 컴포넌트 | 테마 전환 UI | `02-component/ThemeSelector.test.tsx` | 13 |
| 6. 파일 뷰어 E2E | /view/[fileId] 페이지 | `04-e2e/file-view.spec.ts` | 8 |

---

## 1. R2 스토리지 유틸리티 (`src/lib/r2.ts`)

### 1.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-R2-001 | 환경 변수가 모두 설정된 상태에서 S3Client 정상 생성 | Happy Path | Critical |
| SC-R2-002 | R2_ACCOUNT_ID 미설정 시 경고 출력 | Error | Medium |
| SC-R2-003 | 선택적 환경 변수 미설정 시 빈 문자열 기본값 | Edge Case | High |
| SC-R2-004 | 모듈 내보내기 정확성 (r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL) | Utility | High |

### 1.2 테스트 케이스

#### TC-UNIT-R2-001: S3Client 정상 생성

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `@aws-sdk/client-s3` 모킹, 환경 변수 설정 |
| 테스트 데이터 | `R2_ACCOUNT_ID=test-account-id`, `R2_ACCESS_KEY_ID=test-key`, `R2_SECRET_ACCESS_KEY=test-secret` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 환경 변수 설정 후 `require('@/lib/r2')` | S3Client 생성자 호출됨 |
| 2 | 생성자 인자 확인 | `region: 'auto'`, `endpoint: 'https://test-account-id.r2.cloudflarestorage.com'` |
| 3 | `credentials` 인자 확인 | `accessKeyId: 'test-key'`, `secretAccessKey: 'test-secret'` |

- 자동화: 가능 (모듈 모킹)
- 관련 요구사항: R2 스토리지 연동

#### TC-UNIT-R2-002: R2_BUCKET_NAME / R2_PUBLIC_URL 내보내기

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 환경 변수 설정 |
| 테스트 데이터 | `R2_BUCKET_NAME=my-bucket`, `R2_PUBLIC_URL=https://cdn.example.com` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `R2_BUCKET_NAME` 내보내기 확인 | `'my-bucket'` |
| 2 | `R2_PUBLIC_URL` 내보내기 확인 | `'https://cdn.example.com'` |

- 자동화: 가능
- 관련 요구사항: R2 설정 참조

#### TC-UNIT-R2-003: 환경 변수 미설정 시 기본값

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | `R2_BUCKET_NAME`, `R2_PUBLIC_URL` 환경 변수 삭제 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `R2_BUCKET_NAME` 확인 | `''` (빈 문자열) |
| 2 | `R2_PUBLIC_URL` 확인 | `''` (빈 문자열) |
| 3 | S3Client credentials 확인 | `accessKeyId: ''`, `secretAccessKey: ''` |

- 자동화: 가능
- 관련 요구사항: 환경 변수 미설정 시 안전한 폴백

#### TC-UNIT-R2-004: R2_ACCOUNT_ID 미설정 시 경고

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | `R2_ACCOUNT_ID` 환경 변수 삭제, `console.warn` 스파이 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `R2_ACCOUNT_ID` 삭제 후 모듈 로드 | `console.warn` 호출됨 |
| 2 | 경고 메시지 확인 | `'R2_ACCOUNT_ID 환경 변수가 설정되지 않았습니다.'` |

- 자동화: 가능 (console.warn 스파이)
- 관련 요구사항: 설정 누락 진단

#### TC-UNIT-R2-005: r2Client 내보내기 확인

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | 모킹된 S3Client |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `r2Client` 내보내기 확인 | `defined` (S3Client 인스턴스) |

- 자동화: 가능
- 관련 요구사항: R2 클라이언트 싱글톤

---

## 2. Middleware (`src/middleware.ts`)

### 2.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-MW-001 | createMiddleware에 올바른 locale 옵션 전달 | Happy Path | Critical |
| SC-MW-002 | config.matcher에 루트 경로 포함 | Configuration | High |
| SC-MW-003 | config.matcher에 11개 locale 경로 패턴 포함 | Configuration | High |
| SC-MW-004 | config.matcher에 12개 도구 페이지 경로 포함 | Configuration | High |
| SC-MW-005 | default export가 미들웨어 함수 | Utility | Medium |

### 2.2 테스트 케이스

#### TC-UNIT-MW-001: createMiddleware 옵션 전달

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `next-intl/middleware` 모킹, `@/i18n/config` 모킹 |
| 테스트 데이터 | locales: 11개 locale 배열, defaultLocale: 'en' |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `require('@/middleware')` 실행 | `createMiddleware` 호출됨 |
| 2 | 호출 인자 확인 | `{ locales: [...11개], defaultLocale: 'en', localePrefix: 'as-needed' }` |

- 자동화: 가능
- 관련 요구사항: next-intl locale 라우팅

#### TC-UNIT-MW-002: config.matcher 루트 경로

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | 없음 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `config.matcher` 배열 확인 | `'/'` 포함 |
| 2 | `config` 객체 존재 확인 | `defined`, `matcher`가 배열 |

- 자동화: 가능
- 관련 요구사항: 루트 경로 locale 리디렉트

#### TC-UNIT-MW-003: config.matcher locale 패턴

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | locale 패턴 문자열 찾기 | `(en|ko` 포함 패턴 존재 |
| 2 | 11개 locale 모두 포함 확인 | en, ko, zh, es, ar, pt, id, fr, ja, ru, de |

- 자동화: 가능
- 관련 요구사항: 다국어 라우팅

#### TC-UNIT-MW-004: config.matcher 도구 페이지 패턴

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 도구 페이지 패턴 문자열 찾기 | `image-converter` 포함 패턴 존재 |
| 2 | 12개 도구 모두 포함 확인 | image-converter, image-editor, gif-maker, video-converter, url-generator, background-remover, image-compressor, watermark, meme-generator, face-blur, html-to-image, image-upscaler |

- 자동화: 가능
- 관련 요구사항: locale prefix 없는 도구 페이지 직접 접근

#### TC-UNIT-MW-005: default export 함수 확인

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `typeof middleware.default` 확인 | `'function'` |

- 자동화: 가능
- 관련 요구사항: Next.js middleware 규약

---

## 3. i18n Navigation (`src/i18n/navigation.ts`)

### 3.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-NAV-001 | createNavigation에 올바른 옵션 전달 | Happy Path | High |
| SC-NAV-002 | Link, redirect, usePathname, useRouter 정상 내보내기 | Utility | High |

### 3.2 테스트 케이스

#### TC-UNIT-NAV-001: createNavigation 옵션 전달

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | `next-intl/navigation` 모킹, `@/i18n/config` 모킹 |
| 테스트 데이터 | locales, defaultLocale, localePrefix |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 모듈 로드 시 `createNavigation` 호출 확인 | 1회 호출 |
| 2 | 옵션 확인 | `{ locales, defaultLocale, localePrefix: 'as-needed' }` |

- 자동화: 가능
- 관련 요구사항: 다국어 네비게이션 헬퍼

#### TC-UNIT-NAV-002: 내보내기 확인

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `Link` 내보내기 확인 | `defined` |
| 2 | `redirect` 내보내기 확인 | `defined` |
| 3 | `usePathname` 내보내기 확인 | `defined` |
| 4 | `useRouter` 내보내기 확인 | `defined` |

- 자동화: 가능
- 관련 요구사항: 클라이언트 네비게이션 API

---

## 4. i18n Request Config (`src/i18n/request.ts`)

### 4.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-REQ-001 | 유효한 locale 전달 시 해당 locale 사용 | Happy Path | Critical |
| SC-REQ-002 | 유효하지 않은 locale 전달 시 defaultLocale 폴백 | Edge Case | Critical |
| SC-REQ-003 | undefined locale 시 defaultLocale 폴백 | Edge Case | High |
| SC-REQ-004 | 응답에 messages 포함 | Happy Path | High |
| SC-REQ-005 | getRequestConfig 호출 확인 | Utility | High |

### 4.2 테스트 케이스

#### TC-UNIT-REQ-001: 유효한 locale 처리

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | `next-intl/server` 모킹, `@/i18n/config` 모킹 |
| 테스트 데이터 | `requestLocale: 'ko'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `configFn({ requestLocale: Promise.resolve('ko') })` 호출 | result 반환 |
| 2 | `result.locale` 확인 | `'ko'` |
| 3 | `result.messages` 확인 | `defined` (해당 locale의 메시지 번들) |

- 자동화: 가능
- 관련 요구사항: 서버사이드 locale 결정

#### TC-UNIT-REQ-002: 유효하지 않은 locale 폴백

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 테스트 데이터 | `requestLocale: 'zz'` (미지원 locale) |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 미지원 locale `'zz'` 전달 | result 반환 |
| 2 | `result.locale` 확인 | `'en'` (defaultLocale) |

- 자동화: 가능
- 관련 요구사항: 미지원 locale 안전 처리

#### TC-UNIT-REQ-003: undefined locale 폴백

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 테스트 데이터 | `requestLocale: undefined` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `undefined` locale 전달 | result 반환 |
| 2 | `result.locale` 확인 | `'en'` (defaultLocale) |

- 자동화: 가능
- 관련 요구사항: 초기 요청 시 locale 미결정 상태

#### TC-UNIT-REQ-004: getRequestConfig 호출 확인

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 모듈 로드 | `getRequestConfig` 호출됨 |
| 2 | 인자 확인 | 함수 타입 인자 |

- 자동화: 가능
- 관련 요구사항: next-intl 서버 설정

#### TC-UNIT-REQ-005: 응답에 locale과 messages 포함

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 테스트 데이터 | 유효한 locale `'en'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | config 함수 실행 결과 확인 | `locale` 필드 존재 |
| 2 | `messages` 필드 확인 | `defined` |

- 자동화: 가능
- 관련 요구사항: 서버사이드 번역 번들 로딩

---

## 5. ThemeSelector 컴포넌트 (`src/components/common/ThemeSelector.tsx`)

### 5.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-TS-001 | 컴포넌트 기본 렌더링 | Happy Path | High |
| SC-TS-002 | localStorage에서 저장된 테마 복원 | Happy Path | High |
| SC-TS-003 | 저장된 테마 없을 때 DEFAULT_THEME 적용 | Edge Case | High |
| SC-TS-004 | 드롭다운 토글 (열기/닫기) | Happy Path | High |
| SC-TS-005 | 모든 테마 옵션 표시 | Happy Path | High |
| SC-TS-006 | 테마 선택 시 data-theme 및 localStorage 업데이트 | Happy Path | Critical |
| SC-TS-007 | 테마 선택 후 드롭다운 자동 닫힘 | Happy Path | Medium |
| SC-TS-008 | 외부 클릭 시 드롭다운 닫힘 | Edge Case | Medium |
| SC-TS-009 | 색상 프리뷰 원형 표시 | UI | Medium |
| SC-TS-010 | 현재 활성 테마 인디케이터 | UI | Medium |
| SC-TS-011 | 테마 설명 텍스트 표시 | UI | Low |
| SC-TS-012 | ChevronDown 아이콘 회전 애니메이션 | UI | Low |
| SC-TS-013 | Palette 아이콘 표시 | UI | Low |

### 5.2 테스트 케이스

#### TC-COMP-TS-001: 기본 렌더링

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | `@/design-system/themes` 모킹 (3개 테마), localStorage 모킹 |
| 테스트 데이터 | themes: swiss, soft, dark |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `<ThemeSelector />` 렌더링 | 화면에 표시됨 |
| 2 | 토글 버튼 존재 확인 | `role="button"` 요소 1개 |
| 3 | Palette 아이콘 확인 | SVG 요소 존재 |

- 자동화: 가능 (React Testing Library)
- 관련 요구사항: 테마 전환 UI

#### TC-COMP-TS-002: localStorage 테마 복원

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | localStorage에 `theme: 'dark'` 저장 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | localStorage `'dark'` 반환 설정 | 설정 완료 |
| 2 | 컴포넌트 렌더링 | `document.documentElement` data-theme 확인 |
| 3 | `data-theme` 값 | `'dark'` |

- 자동화: 가능 (localStorage mock)
- 관련 요구사항: 테마 영속성

#### TC-COMP-TS-003: DEFAULT_THEME 적용

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | localStorage 비어있음 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | localStorage `null` 반환 | 저장된 테마 없음 |
| 2 | 컴포넌트 렌더링 후 `data-theme` 확인 | `'swiss'` (DEFAULT_THEME) |

- 자동화: 가능
- 관련 요구사항: 기본 테마 설정

#### TC-COMP-TS-004: 드롭다운 열기/닫기

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 토글 버튼 클릭 | 드롭다운 열림, '테마 선택' 헤더 표시 |
| 2 | 토글 버튼 다시 클릭 | 드롭다운 닫힘, '테마 선택' 사라짐 |

- 자동화: 가능 (fireEvent.click)
- 관련 요구사항: 드롭다운 UI 인터랙션

#### TC-COMP-TS-005: 모든 테마 옵션 표시

| 항목 | 내용 |
|------|------|
| 우선순위 | High |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | 3개 테마 버튼 표시 |
| 2 | 버튼 수 확인 | 토글 버튼(1) + 테마 버튼(3) = 4개 |

- 자동화: 가능
- 관련 요구사항: 테마 목록 완전성

#### TC-COMP-TS-006: 테마 선택 시 상태 업데이트

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 테스트 데이터 | 'Dark Mode' 테마 선택 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | 테마 목록 표시 |
| 2 | 'Dark Mode' 버튼 클릭 | `document.documentElement.getAttribute('data-theme')` = `'dark'` |
| 3 | localStorage 확인 | `setItem('theme', 'dark')` 호출됨 |

- 자동화: 가능
- 관련 요구사항: 테마 전환 기능

#### TC-COMP-TS-007: 테마 선택 후 드롭다운 닫힘

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 → 테마 선택 | 드롭다운 닫힘 |
| 2 | '테마 선택' 텍스트 확인 | DOM에서 사라짐 |

- 자동화: 가능 (waitFor)
- 관련 요구사항: 드롭다운 UX

#### TC-COMP-TS-008: 외부 클릭 시 드롭다운 닫힘

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | '테마 선택' 표시 |
| 2 | `document.body`에 mousedown 이벤트 | 드롭다운 닫힘 |

- 자동화: 가능 (fireEvent.mouseDown)
- 관련 요구사항: 외부 클릭 감지

#### TC-COMP-TS-009: 색상 프리뷰

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | 각 테마에 4개 색상 원형 표시 |
| 2 | `.rounded-full` 요소 수 확인 | 3 테마 × 4 색상 = 12개 |

- 자동화: 가능 (CSS 셀렉터)
- 관련 요구사항: 테마 시각 미리보기

#### TC-COMP-TS-010: 활성 테마 인디케이터

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | 현재 테마에 `.rotate-45` 인디케이터 표시 |
| 2 | 비활성 테마 | 인디케이터 없음 |

- 자동화: 가능
- 관련 요구사항: 현재 테마 시각 표시

#### TC-COMP-TS-011: 테마 설명 표시

| 항목 | 내용 |
|------|------|
| 우선순위 | Low |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 드롭다운 열기 | 각 테마의 description 텍스트 표시 |
| 2 | 설명 텍스트 확인 | '흑백 대비, 굵은 테두리', '따뜻한 배경, 부드러운 테두리', '다크 테마' |

- 자동화: 가능
- 관련 요구사항: 테마 정보 제공

#### TC-COMP-TS-012: ChevronDown 아이콘 회전

| 항목 | 내용 |
|------|------|
| 우선순위 | Low |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 닫힘 상태 | ChevronDown 아이콘에 `rotate-180` 클래스 없음 |
| 2 | 열림 상태 | ChevronDown 아이콘에 `rotate-180` 클래스 있음 |

- 자동화: 가능 (CSS 클래스 검증)
- 관련 요구사항: 드롭다운 상태 시각 피드백

---

## 6. 파일 뷰어 E2E (`/view/[fileId]`)

### 6.1 시나리오 목록

| ID | 시나리오 | 유형 | 우선순위 |
|----|---------|------|---------|
| SC-FV-001 | 존재하지 않는 파일 접근 시 오류 표시 | Error | Critical |
| SC-FV-002 | 로딩 중 스피너 표시 | UI | Medium |
| SC-FV-003 | 비밀번호 보호 파일 접근 시 입력 폼 표시 | Happy Path | Critical |
| SC-FV-004 | 이미지 파일 미리보기 (`<img>`) | Happy Path | Critical |
| SC-FV-005 | 비디오 파일 미리보기 (`<video>`) | Happy Path | High |
| SC-FV-006 | 비지원 파일 형식 안내 | Edge Case | High |
| SC-FV-007 | 만료일 정보 표시 | UI | Medium |
| SC-FV-008 | 잘못된 비밀번호 입력 시 오류 | Error | High |

### 6.2 테스트 케이스

#### TC-E2E-FV-001: 존재하지 않는 파일 접근

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | 없음 |
| 테스트 데이터 | 유효하지 않은 fileId: `'nonexistent-file-id'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `/view/nonexistent-file-id` 접속 | 페이지 로드 |
| 2 | API 404 응답 수신 | 오류 카드 표시 |
| 3 | 오류 메시지 확인 | '파일을 찾을 수 없습니다' 또는 '오류' 텍스트 표시 |

- 자동화: 가능 (Playwright)
- 관련 요구사항: 파일 뷰어 오류 처리

#### TC-E2E-FV-002: 로딩 스피너

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | API 응답 2초 지연 (route intercept) |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 페이지 접속 | 로딩 상태 진입 |
| 2 | `.animate-spin` 요소 확인 | 스피너 표시됨 |
| 3 | API 응답 수신 후 | 스피너 사라짐, 컨텐츠 표시 |

- 자동화: 가능 (route 지연 모킹)
- 관련 요구사항: 로딩 UX

#### TC-E2E-FV-003: 비밀번호 보호 파일

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | API 모킹: `hasPassword: true` 응답 |
| 테스트 데이터 | fileId: `'protected-file'`, originalName: `'secret-image.png'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `/view/protected-file` 접속 | 비밀번호 입력 폼 표시 |
| 2 | '비밀번호 필요' 텍스트 확인 | 표시됨 |
| 3 | 비밀번호 입력 필드 확인 | `placeholder="비밀번호 입력"` 요소 존재 |
| 4 | 파일명 표시 확인 | 'secret-image.png' 표시됨 |
| 5 | 제출 버튼 확인 | '확인' 버튼 존재 |

- 자동화: 가능 (API route intercept)
- 관련 요구사항: 비밀번호 보호 파일 뷰어

#### TC-E2E-FV-004: 이미지 파일 미리보기

| 항목 | 내용 |
|------|------|
| 우선순위 | Critical |
| 전제조건 | API 모킹: `hasPassword: false`, `contentType: 'image/jpeg'`, `directUrl` 포함 |
| 테스트 데이터 | fileId: `'public-image'`, originalName: `'test-photo.jpg'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `/view/public-image` 접속 | 파일 정보 카드 표시 |
| 2 | 파일명 확인 | 'test-photo.jpg' 표시 |
| 3 | `<img>` 요소 확인 | `alt="test-photo.jpg"` 이미지 표시 |
| 4 | 다운로드 버튼 확인 | '다운로드' 버튼 표시 |

- 자동화: 가능
- 관련 요구사항: 이미지 미리보기

#### TC-E2E-FV-005: 비디오 파일 미리보기

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | API 모킹: `contentType: 'video/mp4'` |
| 테스트 데이터 | fileId: `'public-video'`, originalName: `'test-video.mp4'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `/view/public-video` 접속 | 파일 정보 표시 |
| 2 | `<video>` 요소 확인 | 비디오 플레이어 표시 |
| 3 | `controls` 속성 확인 | 재생 컨트롤 표시 |

- 자동화: 가능
- 관련 요구사항: 비디오 미리보기

#### TC-E2E-FV-006: 비지원 파일 형식 안내

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | API 모킹: `contentType: 'application/pdf'` |
| 테스트 데이터 | fileId: `'public-doc'`, originalName: `'document.pdf'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | `/view/public-doc` 접속 | 파일 정보 표시 |
| 2 | 안내 메시지 확인 | '미리보기를 지원하지 않는 파일 형식입니다.' 표시 |
| 3 | 다운로드 버튼 확인 | 다운로드 버튼 활성 |

- 자동화: 가능
- 관련 요구사항: 비지원 파일 처리

#### TC-E2E-FV-007: 만료일 표시

| 항목 | 내용 |
|------|------|
| 우선순위 | Medium |
| 전제조건 | API 모킹: `expiresAt: '2026-04-01T00:00:00.000Z'` 포함 |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 페이지 접속 | 파일 정보 표시 |
| 2 | 만료 정보 확인 | '만료' 텍스트 포함 날짜 표시 |

- 자동화: 가능
- 관련 요구사항: 파일 유효기간 표시

#### TC-E2E-FV-008: 잘못된 비밀번호

| 항목 | 내용 |
|------|------|
| 우선순위 | High |
| 전제조건 | API 모킹: GET → hasPassword: true, POST → 401 응답 |
| 테스트 데이터 | password: `'wrong-password'` |

| # | 단계 | 예상 결과 |
|---|------|----------|
| 1 | 비밀번호 입력 폼 표시 | 정상 |
| 2 | 'wrong-password' 입력 후 제출 | 인증 요청 전송 |
| 3 | 401 응답 수신 | 오류 메시지 표시 |
| 4 | 오류 메시지 확인 | '비밀번호가 일치하지 않' 또는 '인증 실패' 텍스트 |
| 5 | 폼 유지 확인 | 비밀번호 입력 필드 여전히 표시, 재시도 가능 |

- 자동화: 가능 (route intercept + form interaction)
- 관련 요구사항: 비밀번호 인증 실패 처리

---

## 부록: 테스트 ID 체계 추가

| 접두사 | 영역 |
|--------|------|
| TC-UNIT-R2 | R2 스토리지 유틸리티 |
| TC-UNIT-MW | Middleware |
| TC-UNIT-NAV | i18n Navigation |
| TC-UNIT-REQ | i18n Request Config |
| TC-COMP-TS | ThemeSelector 컴포넌트 |
| TC-E2E-FV | 파일 뷰어 (File View) |

---

## 부록: Fixture 파일 현황

| 파일 | 용도 | 상태 | 비고 |
|------|------|------|------|
| `tests/fixtures/test-image.png` | 일반 이미지 테스트 | ✅ 기존 | 77B 최소 PNG |
| `tests/fixtures/test-image.jpg` | JPG 변환 테스트 | ✅ 신규 | 332B 최소 유효 JPEG |
| `tests/fixtures/test-image-small.png` | 소형 이미지 (100x100) | ✅ 신규 | 286B 흰색 PNG |
| `tests/fixtures/test-corrupted.jpg` | 손상된 파일 테스트 | ✅ 신규 | 260B JPEG 헤더만 유효 |
| `tests/fixtures/test-image-large.jpg` | 대용량 이미지 (4000x3000) | ⏳ 추후 | 실제 고해상도 이미지 필요 |
| `tests/fixtures/test-heic.heic` | HEIC 변환 테스트 | ⏳ 추후 | 실제 HEIC 파일 필요 |
| `tests/fixtures/test-raw.cr2` | RAW 변환 테스트 | ⏳ 추후 | 실제 RAW 파일 필요 |
| `tests/fixtures/test-psd.psd` | PSD 변환 테스트 | ⏳ 추후 | 실제 PSD 파일 필요 |
| `tests/fixtures/test-video.mp4` | 비디오 처리 테스트 | ⏳ 추후 | 실제 동영상 파일 필요 |
| `tests/fixtures/test-face.jpg` | 얼굴 감지 테스트 | ⏳ 추후 | 얼굴 포함 이미지 필요 |
