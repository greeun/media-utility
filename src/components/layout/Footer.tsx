export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Media Utility. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              브라우저에서 안전하게 파일을 변환하세요. 서버에 업로드되지 않습니다.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              클라이언트 측 처리
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              무료 사용
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
