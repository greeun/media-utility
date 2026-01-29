import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  ImageIcon,
  VideoIcon,
  Palette,
  Wind,
  Wand2,
  Frame,
  Type,
  Lightbulb,
} from 'lucide-react';

const tools = [
  { id: 1, name: 'Image Converter', desc: 'HEIC, PNG, JPG, WebP 변환' },
  { id: 2, name: 'Image Compressor', desc: '이미지 최적화 및 압축' },
  { id: 3, name: 'Image Editor', desc: '자르기, 회전, 필터' },
  { id: 4, name: 'Video Converter', desc: 'MP4, WebM 영상 변환' },
  { id: 5, name: 'GIF Maker', desc: '이미지/영상으로 GIF' },
  { id: 6, name: 'Meme Generator', desc: '텍스트를 추가하여 밈' },
  { id: 7, name: 'Watermark', desc: '워터마크 추가' },
  { id: 8, name: 'Background Remover', desc: 'AI 배경 제거' },
  { id: 9, name: 'Face Blur', desc: '얼굴 자동 감지 및 흐리기' },
  { id: 10, name: 'Image Upscaler', desc: '2x ~ 4x 이미지 확대' },
  { id: 11, name: 'HTML to Image', desc: 'HTML/CSS를 이미지로' },
  { id: 12, name: 'URL Generator', desc: 'Base64, Blob URL 생성' },
];

const features = [
  { title: '개인정보 보호', desc: '브라우저에서만 처리됨' },
  { title: '빠른 속도', desc: 'WebAssembly 기반 처리' },
  { title: '완전 무료', desc: '설치 없이 즉시 사용' },
];

export default function Home() {
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Header Navigation */}
      <header className="border-b border-black/10 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="font-serif text-2xl font-bold tracking-tight">
            Media<span className="font-normal"> Utility</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#tools" className="text-sm font-medium hover:text-black/60 transition">
              도구
            </a>
            <button className="px-5 py-2 border border-black rounded-md text-sm font-medium hover:bg-black hover:text-white transition">
              시작
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-mono uppercase tracking-widest text-black/60">
                미디어 처리 플랫폼
              </p>
              <h1 className="text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
                모든 미디어를<br />
                <span className="font-normal italic">간단하게</span>
              </h1>
              <p className="text-lg text-black/70 leading-relaxed max-w-lg">
                이미지 변환부터 영상 편집까지. 12가지 강력한 도구로 모든 작업을 처리하세요. 설치 없이, 가입 없이.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-black text-white rounded-md font-medium text-base hover:bg-black/90 transition inline-flex items-center gap-2">
                시작하기
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border border-black rounded-md font-medium text-base hover:bg-black/5 transition">
                자세히 보기
              </button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-black/10">
              {features.map((f, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-black/60">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-black/5 rounded-2xl p-12 aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-black/20 font-serif">12</div>
                <p className="text-sm text-black/40 font-medium mt-4">강력한 도구</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="bg-black/2 border-t border-b border-black/10 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-black/60 mb-4">
              기능
            </p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold">모든 도구를 만나보세요</h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="group border border-black/10 rounded-lg p-6 hover:border-black hover:bg-black/2 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="w-10 h-10 rounded-md bg-black/5 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="w-5 h-5 text-black/40 group-hover:text-black transition">
                      <Frame />
                    </div>
                  </div>
                  {hoveredTool === tool.id && (
                    <ArrowRight className="w-4 h-4 text-black/40 transition" />
                  )}
                </div>
                <h3 className="font-semibold text-base mb-1">{tool.name}</h3>
                <p className="text-sm text-black/60 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">지금 시작하세요</h2>
          <p className="text-lg text-black/70 mb-8 leading-relaxed">
            어떤 구독도, 어떤 설치도 필요 없습니다.<br />
            바로 사용해보세요.
          </p>
          <button className="px-8 py-4 bg-black text-white rounded-md font-semibold text-base hover:bg-black/90 transition inline-flex items-center gap-3">
            도구 사용하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-black/2 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-black/60">
            <div>
              <p className="font-semibold text-black mb-1">Media Utility</p>
              <p>모든 미디어 처리를 한 곳에서</p>
            </div>
            <p>© 2024. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
