'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Feature {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface HowToUseProps {
  title: string;
  description: string;
  steps: Step[];
  features?: Feature[];
  supportedFormats?: string[];
  faqs?: FAQ[];
  accentColor?: string;
}

export default function HowToUse({
  title,
  description,
  steps,
  features,
  supportedFormats,
  faqs,
  accentColor = 'cyan',
}: HowToUseProps) {
  const t = useTranslations('howToUse');

  // Swiss Modernism Color System
  const colorClasses: Record<string, {
    bg: string;
    text: string;
    textBright: string;
    border: string;
    badge: string;
    number: string;
  }> = {
    pink: {
      bg: 'bg-[#EC4899]/10',
      text: 'text-[#EC4899]',
      textBright: 'text-[#EC4899]',
      border: 'border-4 border-[#EC4899]',
      badge: 'bg-[#EC4899] text-white',
      number: 'bg-[#EC4899] text-white',
    },
    cyan: {
      bg: 'bg-[#06B6D4]/10',
      text: 'text-[#06B6D4]',
      textBright: 'text-[#06B6D4]',
      border: 'border-4 border-[#06B6D4]',
      badge: 'bg-[#06B6D4] text-white',
      number: 'bg-[#06B6D4] text-white',
    },
    orange: {
      bg: 'bg-[#F97316]/10',
      text: 'text-[#F97316]',
      textBright: 'text-[#F97316]',
      border: 'border-4 border-[#F97316]',
      badge: 'bg-[#F97316] text-white',
      number: 'bg-[#F97316] text-white',
    },
    purple: {
      bg: 'bg-[#A855F7]/10',
      text: 'text-[#A855F7]',
      textBright: 'text-[#A855F7]',
      border: 'border-4 border-[#A855F7]',
      badge: 'bg-[#A855F7] text-white',
      number: 'bg-[#A855F7] text-white',
    },
    emerald: {
      bg: 'bg-[#10B981]/10',
      text: 'text-[#10B981]',
      textBright: 'text-[#10B981]',
      border: 'border-4 border-[#10B981]',
      badge: 'bg-[#10B981] text-white',
      number: 'bg-[#10B981] text-white',
    },
    yellow: {
      bg: 'bg-[#FBBF24]/10',
      text: 'text-[#FBBF24]',
      textBright: 'text-[#FBBF24]',
      border: 'border-4 border-[#FBBF24]',
      badge: 'bg-[#FBBF24] text-white',
      number: 'bg-[#FBBF24] text-white',
    },
    sky: {
      bg: 'bg-[#06B6D4]/10',
      text: 'text-[#06B6D4]',
      textBright: 'text-[#06B6D4]',
      border: 'border-4 border-[#06B6D4]',
      badge: 'bg-[#06B6D4] text-white',
      number: 'bg-[#06B6D4] text-white',
    },
    teal: {
      bg: 'bg-[#06B6D4]/10',
      text: 'text-[#06B6D4]',
      textBright: 'text-[#06B6D4]',
      border: 'border-4 border-[#06B6D4]',
      badge: 'bg-[#06B6D4] text-white',
      number: 'bg-[#06B6D4] text-white',
    },
    violet: {
      bg: 'bg-[#A855F7]/10',
      text: 'text-[#A855F7]',
      textBright: 'text-[#A855F7]',
      border: 'border-4 border-[#A855F7]',
      badge: 'bg-[#A855F7] text-white',
      number: 'bg-[#A855F7] text-white',
    },
    rose: {
      bg: 'bg-[#EC4899]/10',
      text: 'text-[#EC4899]',
      textBright: 'text-[#EC4899]',
      border: 'border-4 border-[#EC4899]',
      badge: 'bg-[#EC4899] text-white',
      number: 'bg-[#EC4899] text-white',
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.pink;

  return (
    <div className="mt-16 space-y-12 bg-gray-50 py-12 px-6">
      {/* 소개 */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className={`text-4xl font-black uppercase tracking-wide ${colors.text} mb-4`}>{title}</h2>
        <p className="text-lg font-bold text-gray-900">{description}</p>
      </div>

      {/* 사용 방법 */}
      <div className="bg-white border-4 border-black p-8">
        <h3 className="text-2xl font-black uppercase tracking-wide mb-6">{t('howToUse')}</h3>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 ${colors.number} flex items-center justify-center font-black text-xl border-4 border-black`}
              >
                {step.number}
              </div>
              <div>
                <h3 className={`font-black text-lg uppercase tracking-wide ${colors.textBright} mb-2`}>{step.title}</h3>
                <p className="text-sm font-bold text-gray-900">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 지원 포맷 */}
      {supportedFormats && supportedFormats.length > 0 && (
        <div className="bg-white border-4 border-black p-8">
          <h3 className="text-2xl font-black uppercase tracking-wide mb-6">{t('supportedFormats')}</h3>
          <div className="flex flex-wrap gap-3">
            {supportedFormats.map((format) => (
              <span
                key={format}
                className={`px-4 py-2 text-sm font-black uppercase tracking-wide ${colors.badge} border-2 border-black`}
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 주요 기능 */}
      {features && features.length > 0 && (
        <div className="bg-white border-4 border-black p-8">
          <h3 className="text-2xl font-black uppercase tracking-wide mb-6">{t('keyFeatures')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className={`p-6 ${colors.border} bg-white`}>
                <h3 className={`font-black text-lg uppercase tracking-wide ${colors.textBright} mb-2`}>{feature.title}</h3>
                <p className="text-sm font-bold text-gray-900">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <div className="bg-white border-4 border-black p-8">
          <h3 className="text-2xl font-black uppercase tracking-wide mb-6">{t('faq')}</h3>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b-4 border-gray-200 pb-6 last:border-0 last:pb-0">
                <h3 className="font-black text-lg uppercase tracking-wide text-black mb-2">{faq.question}</h3>
                <p className="text-sm font-bold text-gray-900">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 개인정보 안내 */}
      <div className="text-center text-sm font-bold text-gray-800 py-4">
        <p>{t('privacyNotice')}</p>
      </div>
    </div>
  );
}
