interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Media Utility 브랜드 로고
 *
 * 디자인 컨셉:
 * - 미디어 변환을 상징하는 두 개의 겹친 프레임
 * - 재생 버튼으로 미디어 특성 표현
 * - AI slop 회피: 그라데이션 없음, 단순하지만 독특한 형태
 */
export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 - 기울어진 사각형으로 역동성 표현 */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="#0F172A"
      />

      {/* 뒤쪽 프레임 (출력) - 약간 기울어진 */}
      <rect
        x="14"
        y="8"
        width="12"
        height="12"
        rx="2"
        fill="#3B82F6"
        transform="rotate(3 20 14)"
      />

      {/* 앞쪽 프레임 (입력) */}
      <rect
        x="6"
        y="12"
        width="12"
        height="12"
        rx="2"
        fill="#fff"
      />

      {/* 재생 버튼 - 변환/처리 상징 */}
      <path
        d="M10 15v6l5-3z"
        fill="#0F172A"
      />

      {/* 변환 화살표 */}
      <path
        d="M19 18l3-3m0 0h-2.5m2.5 0v2.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 대형 로고 - 히어로 섹션용
 */
export function LogoLarge({ className = '', size = 64 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 */}
      <rect
        width="64"
        height="64"
        rx="14"
        fill="#0F172A"
      />

      {/* 뒤쪽 프레임들 - 여러 레이어로 변환 과정 표현 */}
      <rect
        x="32"
        y="14"
        width="22"
        height="22"
        rx="3"
        fill="#1E40AF"
        opacity="0.5"
        transform="rotate(6 43 25)"
      />
      <rect
        x="30"
        y="16"
        width="22"
        height="22"
        rx="3"
        fill="#3B82F6"
        transform="rotate(3 41 27)"
      />

      {/* 앞쪽 프레임 (메인) */}
      <rect
        x="10"
        y="26"
        width="24"
        height="24"
        rx="3"
        fill="#fff"
      />

      {/* 재생 버튼 */}
      <path
        d="M18 32v12l10-6z"
        fill="#0F172A"
      />

      {/* 이미지 심볼 - 산과 해 */}
      <circle cx="46" cy="24" r="3" fill="#FCD34D" />
      <path
        d="M34 34l5-5 3 3 6-7 4 6v3H34z"
        fill="#fff"
        opacity="0.8"
      />

      {/* 변환 화살표 */}
      <path
        d="M38 40l6-6m0 0h-4m4 0v4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 로고 마크 - 파비콘, 작은 공간용
 */
export function LogoMark({ className = '', size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 */}
      <rect
        width="24"
        height="24"
        rx="6"
        fill="#0F172A"
      />

      {/* 뒤쪽 프레임 */}
      <rect
        x="11"
        y="5"
        width="8"
        height="8"
        rx="1.5"
        fill="#3B82F6"
        transform="rotate(3 15 9)"
      />

      {/* 앞쪽 프레임 */}
      <rect
        x="5"
        y="11"
        width="8"
        height="8"
        rx="1.5"
        fill="#fff"
      />

      {/* 재생 버튼 */}
      <path
        d="M7.5 13v4l3.5-2z"
        fill="#0F172A"
      />
    </svg>
  );
}

/**
 * 다크모드용 로고
 */
export function LogoDark({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 - 밝은 색 */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="#F8FAFC"
      />

      {/* 뒤쪽 프레임 */}
      <rect
        x="14"
        y="8"
        width="12"
        height="12"
        rx="2"
        fill="#3B82F6"
        transform="rotate(3 20 14)"
      />

      {/* 앞쪽 프레임 */}
      <rect
        x="6"
        y="12"
        width="12"
        height="12"
        rx="2"
        fill="#0F172A"
      />

      {/* 재생 버튼 */}
      <path
        d="M10 15v6l5-3z"
        fill="#fff"
      />

      {/* 변환 화살표 */}
      <path
        d="M19 18l3-3m0 0h-2.5m2.5 0v2.5"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 애니메이션 로고 (CSS 애니메이션 클래스 필요)
 */
export function LogoAnimated({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="#0F172A"
      />

      {/* 뒤쪽 프레임 - pulse 애니메이션 대상 */}
      <rect
        x="14"
        y="8"
        width="12"
        height="12"
        rx="2"
        fill="#3B82F6"
        transform="rotate(3 20 14)"
        className="animate-pulse"
      />

      {/* 앞쪽 프레임 */}
      <rect
        x="6"
        y="12"
        width="12"
        height="12"
        rx="2"
        fill="#fff"
      />

      {/* 재생 버튼 */}
      <path
        d="M10 15v6l5-3z"
        fill="#0F172A"
      />

      {/* 변환 화살표 */}
      <path
        d="M19 18l3-3m0 0h-2.5m2.5 0v2.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
