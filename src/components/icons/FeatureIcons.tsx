interface IconProps {
  className?: string;
  size?: number;
}

// 이미지 변환 - 두 포맷 간 변환을 표현
export function ImageConverterIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 원본 이미지 */}
      <rect x="2" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <path d="M3 10l2-2 1.5 1.5L9 7v3H3v-1z" fill="currentColor" fillOpacity="0.3" />

      {/* 변환 화살표 */}
      <path
        d="M13 7.5h3m0 0l-1.5-1.5M16 7.5l-1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 결과 이미지 */}
      <rect x="13" y="12" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
      <path d="M14 19l2-2 1.5 1.5L20 16v3h-6v-1z" fill="currentColor" fillOpacity="0.3" />

      {/* 대각선 점선 */}
      <path
        d="M9 14l2-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
        opacity="0.5"
      />
    </svg>
  );
}

// 이미지 편집 - 크롭과 조절 도구
export function ImageEditorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 크롭 마커 - L자 형태 */}
      <path
        d="M6 2v4H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 22v-4h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 이미지 영역 */}
      <rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />

      {/* 이미지 내용 */}
      <circle cx="10" cy="10" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <path d="M7 16l3-3 2 2 4-4 2 2.5v2.5H7z" fill="currentColor" fillOpacity="0.3" />

      {/* 조절 슬라이더 힌트 */}
      <path
        d="M21 9v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="21" cy="12" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

// GIF 메이커 - 프레임 스택과 애니메이션
export function GifMakerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 프레임 스택 */}
      <rect x="7" y="2" width="10" height="10" rx="1.5" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <rect x="5" y="4" width="10" height="10" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <rect x="3" y="6" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="white" fillOpacity="0.05" />

      {/* 재생 심볼 */}
      <path d="M6 9v4l3.5-2z" fill="currentColor" />

      {/* GIF 텍스트 배지 */}
      <rect x="14" y="14" width="8" height="8" rx="2" fill="currentColor" />
      <text
        x="18"
        y="19.5"
        fontSize="5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="white"
        textAnchor="middle"
      >
        GIF
      </text>
    </svg>
  );
}

// 비디오 변환 - 필름과 변환
export function VideoConverterIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 필름 프레임 */}
      <rect x="2" y="4" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />

      {/* 필름 구멍 왼쪽 */}
      <rect x="3.5" y="6" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="3.5" y="10.5" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="3.5" y="15" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />

      {/* 필름 구멍 오른쪽 */}
      <rect x="11.5" y="6" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="11.5" y="10.5" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="11.5" y="15" width="2" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />

      {/* 재생 버튼 */}
      <path d="M7 10v4l3.5-2z" fill="currentColor" />

      {/* 출력 화살표 */}
      <path
        d="M17 12h5m0 0l-2-2m2 2l-2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// URL 생성 - 링크와 공유
export function UrlGeneratorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 파일/이미지 */}
      <rect x="3" y="4" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="8" r="1" fill="currentColor" fillOpacity="0.5" />
      <path d="M4 14l2.5-2 2 1.5 3-3v4.5H4z" fill="currentColor" fillOpacity="0.25" />

      {/* 링크 체인 */}
      <path
        d="M15 9a3 3 0 013 3v0a3 3 0 01-3 3h-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19 9a3 3 0 013 3v0a3 3 0 01-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* 공유 노드 */}
      <circle cx="20" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18.5 6.5l-4 3m4 5l-4-3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

// === 특징 섹션 아이콘 ===

// 프라이버시/보안
export function PrivacyShieldIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2l8 3v6c0 5.5-3.5 10.5-8 12-4.5-1.5-8-6.5-8-12V5l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 속도
export function SpeedZapIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

// 무료/글로벌
export function FreeGlobeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* ∞ 심볼로 무제한 표현 */}
      <circle cx="19" cy="5" r="4" fill="currentColor" />
      <text
        x="19"
        y="7"
        fontSize="6"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="white"
        textAnchor="middle"
      >
        ∞
      </text>
    </svg>
  );
}
