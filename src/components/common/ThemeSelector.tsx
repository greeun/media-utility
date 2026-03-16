'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import { themes, DEFAULT_THEME } from '@/design-system/themes';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // localStorage에서 테마 복원
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setCurrentTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
    }
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('theme', themeId);
    setIsOpen(false);
  };

  const current = themes.find((t) => t.id === currentTheme);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all duration-200"
        style={{
          border: `var(--border-width) solid transparent`,
          borderRadius: 'var(--radius)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
      >
        <Palette className="w-5 h-5" strokeWidth={2.5} />
        <span className="hidden md:inline text-xs uppercase tracking-wider">{current?.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-64 z-50"
          style={{
            background: 'var(--card)',
            border: `var(--border-width) solid var(--border)`,
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <div
            className="px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] font-bold"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              borderBottom: `2px solid var(--border)`,
              borderRadius: `var(--radius) var(--radius) 0 0`,
            }}
          >
            테마 선택
          </div>
          <div className="py-1">
            {themes.map((theme) => {
              const isActive = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => switchTheme(theme.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--foreground)' : 'transparent',
                    color: isActive ? 'var(--background)' : 'var(--foreground)',
                    borderBottom: '1px solid var(--muted)',
                  }}
                >
                  {/* 색상 프리뷰 */}
                  <div className="flex gap-1 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: theme.preview.bg }} />
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: theme.preview.card }} />
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: theme.preview.accent }} />
                    <div className="w-4 h-4 rounded-full border border-gray-300" style={{ background: theme.preview.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wide">{theme.name}</div>
                    <div className="text-[10px] opacity-60 truncate">{theme.description}</div>
                  </div>
                  {isActive && (
                    <span
                      className="w-2 h-2 rotate-45 flex-shrink-0"
                      style={{ background: isActive ? 'var(--background)' : 'var(--foreground)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
