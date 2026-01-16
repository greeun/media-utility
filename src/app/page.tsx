import Link from 'next/link';
import {
  Image,
  Crop,
  Film,
  Video,
  Link2,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

const tools = [
  {
    id: 'image-converter',
    name: '이미지 변환',
    description: 'PNG, JPG, WebP, HEIC 등 다양한 이미지 포맷 간 변환',
    icon: Image,
    href: '/image-converter',
    color: 'bg-blue-500',
    features: ['HEIC to JPG', 'PNG to WebP', '포맷 변환'],
  },
  {
    id: 'image-editor',
    name: '이미지 편집',
    description: '이미지 자르기, 회전, 뒤집기, 리사이즈, 최적화',
    icon: Crop,
    href: '/image-editor',
    color: 'bg-purple-500',
    features: ['자르기', '회전', '최적화'],
  },
  {
    id: 'gif-maker',
    name: 'GIF 만들기',
    description: '여러 이미지를 합쳐서 애니메이션 GIF 생성',
    icon: Film,
    href: '/gif-maker',
    color: 'bg-green-500',
    features: ['이미지 → GIF', '속도 조절', '크기 조절'],
  },
  {
    id: 'video-converter',
    name: '비디오 변환',
    description: '비디오를 GIF로, GIF를 MP4로, 프레임 추출',
    icon: Video,
    href: '/video-converter',
    color: 'bg-orange-500',
    features: ['비디오 → GIF', 'GIF → MP4', '프레임 추출'],
  },
  {
    id: 'url-generator',
    name: 'URL 생성',
    description: '이미지/비디오를 공유 가능한 URL로 변환',
    icon: Link2,
    href: '/url-generator',
    color: 'bg-pink-500',
    features: ['Base64 URL', 'Blob URL', '클립보드 복사'],
  },
];

const features = [
  {
    icon: Shield,
    title: '완전한 프라이버시',
    description: '모든 파일은 브라우저에서만 처리됩니다. 서버에 업로드되지 않습니다.',
  },
  {
    icon: Zap,
    title: '빠른 처리 속도',
    description: 'WebAssembly 기술로 네이티브에 가까운 처리 속도를 제공합니다.',
  },
  {
    icon: Globe,
    title: '무료 & 무제한',
    description: '모든 기능을 무료로, 파일 개수 제한 없이 사용할 수 있습니다.',
  },
];

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              미디어 파일 변환의
              <br />
              <span className="text-yellow-300">모든 것</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              이미지, 비디오, GIF 변환을 브라우저에서 안전하게 처리하세요.
              <br className="hidden sm:block" />
              서버 업로드 없이 완벽한 프라이버시를 보장합니다.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/image-converter"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
              >
                시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
              >
                기능 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">제공 기능</h2>
            <p className="mt-3 text-gray-600">필요한 도구를 선택하세요</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${tool.color} rounded-xl mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm">{tool.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    사용하기
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">지금 바로 시작하세요</h2>
          <p className="mt-4 text-gray-400">
            설치 없이 브라우저에서 바로 사용할 수 있습니다.
          </p>
          <Link
            href="/image-converter"
            className="mt-8 inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
