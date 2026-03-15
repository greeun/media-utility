interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
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

// 배경 제거 - 이미지 레이어 분리
export function BackgroundRemoverIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 배경 레이어 (점선) */}
      <rect
        x="3"
        y="5"
        width="12"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        opacity="0.3"
      />
      
      {/* 전경 이미지 (사람 실루엣) */}
      <path
        d="M17 8a2 2 0 100-4 2 2 0 000 4z"
        fill="currentColor"
      />
      <path
        d="M13 11c0-1.5 1.5-2 2.5-2h3c1 0 2.5.5 2.5 2v8H13v-8z"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* 지우개/분리 효과 */}
      <path
        d="M8 9l-3 3m0 0l3 3m-3-3h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

// 이미지 압축 - 파일 크기 줄이기
export function ImageCompressorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 이미지 프레임 */}
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 산/풍경 */}
      <circle cx="8" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
      <path d="M4 17l4-4 3 3 5-5 4 4v3H4z" fill="currentColor" fillOpacity="0.2" />
      {/* 압축 화살표 (위아래로 누르기) */}
      <path
        d="M12 6v4m0 0l-1.5-1.5M12 10l1.5-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18v-4m0 0l-1.5 1.5M12 14l1.5 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 워터마크 - 이미지 위에 텍스트/이미지 오버레이
export function WatermarkIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 이미지 프레임 */}
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 산 풍경 */}
      <path d="M3 17l5-5 3 3 5-5 5 4v4H3z" fill="currentColor" fillOpacity="0.15" />
      {/* 워터마크 텍스트 라인 (대각선) */}
      <path
        d="M5 18L19 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
        strokeDasharray="3 2"
      />
      <path
        d="M8 20L22 8"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
        strokeDasharray="3 2"
      />
      {/* 드롭 아이콘 */}
      <circle cx="18" cy="7" r="3" fill="currentColor" />
      <text
        x="18"
        y="9"
        fontSize="5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="white"
        textAnchor="middle"
      >
        W
      </text>
    </svg>
  );
}

// 밈 생성기 - 이미지 위에 밈 텍스트
export function MemeGeneratorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 이미지 프레임 */}
      <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 이미지 내용 */}
      <circle cx="8" cy="10" r="2" fill="currentColor" fillOpacity="0.3" />
      <path d="M3 16l4-4 3 3 4-4 5 4v3H3z" fill="currentColor" fillOpacity="0.15" />
      {/* 상단 텍스트 바 */}
      <rect x="5" y="5" width="14" height="3" rx="1" fill="currentColor" fillOpacity="0.7" />
      {/* 하단 텍스트 바 */}
      <rect x="5" y="16" width="14" height="3" rx="1" fill="currentColor" fillOpacity="0.7" />
      {/* 텍스트 라인 */}
      <line x1="7" y1="6.5" x2="17" y2="6.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="17.5" x2="17" y2="17.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// 얼굴 블러 - 얼굴 감지 및 블러 처리
export function FaceBlurIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 얼굴 윤곽 */}
      <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      {/* 눈 */}
      <circle cx="9.5" cy="9" r="1" fill="currentColor" fillOpacity="0.4" />
      <circle cx="14.5" cy="9" r="1" fill="currentColor" fillOpacity="0.4" />
      {/* 블러 효과 (수평선) */}
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="7.5" y1="13.5" x2="16.5" y2="13.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      {/* 방패/보호 표시 */}
      <path d="M17 17l3 1v3c0 1.5-1 3-3 3.5-2-.5-3-2-3-3.5v-3l3-1z" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="1" />
      <path d="M16 20.5l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// HTML → 이미지 - 코드를 이미지로 변환
export function HtmlToImageIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 코드 문서 */}
      <rect x="2" y="2" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 코드 라인 */}
      <path d="M5 6l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      {/* 변환 화살표 */}
      <path d="M16 10h3m0 0l-1.5-1.5M19 10l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 결과 이미지 */}
      <rect x="14" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="15.5" r="1" fill="currentColor" fillOpacity="0.5" />
      <path d="M15 19l2-2 1.5 1 2.5-2v2.5h-6z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// 이미지 업스케일 - AI 기반 확대
export function UpscalerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 작은 이미지 (원본) */}
      <rect x="2" y="10" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.5" cy="12.5" r="0.8" fill="currentColor" fillOpacity="0.5" />
      <path d="M3 16l2-2 1 1 2-2v3H3z" fill="currentColor" fillOpacity="0.3" />
      {/* 확대 화살표 */}
      <path d="M12 14h3m0 0l-1.5-1.5M15 14l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 큰 이미지 (결과) */}
      <rect x="11" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="5" r="1.2" fill="currentColor" fillOpacity="0.5" />
      <path d="M12 10l3-3 2 2 3-3v4h-8z" fill="currentColor" fillOpacity="0.3" />
      {/* AI 배지 */}
      <circle cx="19" cy="18" r="4" fill="currentColor" />
      <text x="19" y="20" fontSize="5" fontWeight="700" fontFamily="system-ui, sans-serif" fill="white" textAnchor="middle">AI</text>
    </svg>
  );
}

// RAW 변환 - 카메라 RAW 파일
export function RawConverterIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 카메라 본체 */}
      <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      {/* 렌즈 */}
      <circle cx="9" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" fillOpacity="0.4" />
      {/* 플래시 */}
      <rect x="5" y="7.5" width="3" height="1.5" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      {/* 변환 화살표 */}
      <path d="M18 12h4m0 0l-1.5-1.5M22 12l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* RAW 배지 */}
      <rect x="14" y="17" width="9" height="5" rx="1.5" fill="currentColor" />
      <text x="18.5" y="21" fontSize="4" fontWeight="700" fontFamily="system-ui, sans-serif" fill="white" textAnchor="middle">RAW</text>
    </svg>
  );
}

// 비디오 포맷 변환 - 포맷 간 변환
export function VideoFormatIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 왼쪽 파일 */}
      <rect x="2" y="4" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 7v3l2.5-1.5z" fill="currentColor" />
      {/* 포맷 라벨 */}
      <rect x="3" y="11" width="6" height="2" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      {/* 양방향 화살표 */}
      <path d="M12 7h2m0 0l-1-1m1 1l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11h-2m0 0l1 1m-1-1l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      {/* 오른쪽 파일 */}
      <rect x="14" y="4" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 7v3l2.5-1.5z" fill="currentColor" />
      {/* 포맷 라벨 */}
      <rect x="15" y="11" width="6" height="2" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      {/* 하단 포맷 목록 */}
      <text x="6" y="20" fontSize="4" fontWeight="700" fontFamily="system-ui, sans-serif" fill="currentColor" textAnchor="middle" opacity="0.6">MP4</text>
      <text x="18" y="20" fontSize="4" fontWeight="700" fontFamily="system-ui, sans-serif" fill="currentColor" textAnchor="middle" opacity="0.6">WebM</text>
    </svg>
  );
}

// 비디오 크기 변경 - 리사이즈
export function VideoResizerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 작은 비디오 */}
      <rect x="2" y="8" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10v2.5l2-1.25z" fill="currentColor" fillOpacity="0.5" />
      {/* 크기 변경 화살표 */}
      <path d="M12 11h3m0 0l-1.5-1.5M15 11l-1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 큰 비디오 */}
      <rect x="11" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.5 5.5v3l2.5-1.5z" fill="currentColor" />
      {/* 크기 표시 */}
      <path d="M18 14v5m0 0h-5m5 0l-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 치수 표시 */}
      <text x="6" y="21" fontSize="3.5" fontWeight="700" fontFamily="system-ui, sans-serif" fill="currentColor" textAnchor="middle" opacity="0.5">HD</text>
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
