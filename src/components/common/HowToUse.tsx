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

  // OKLCH 색상 시스템 - 다크 테마에 최적화
  const colorClasses: Record<string, {
    bg: string;
    text: string;
    textBright: string;
    border: string;
    badge: string;
    number: string;
  }> = {
    cyan: {
      bg: 'bg-[oklch(0.75_0.18_195/0.08)]',
      text: 'text-[oklch(0.75_0.18_195)]',
      textBright: 'text-[oklch(0.85_0.15_195)]',
      border: 'border-[oklch(0.75_0.18_195/0.2)]',
      badge: 'bg-[oklch(0.75_0.18_195/0.15)] text-[oklch(0.85_0.15_195)]',
      number: 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)]',
    },
    sky: {
      bg: 'bg-[oklch(0.75_0.18_195/0.08)]',
      text: 'text-[oklch(0.75_0.18_195)]',
      textBright: 'text-[oklch(0.85_0.15_195)]',
      border: 'border-[oklch(0.75_0.18_195/0.2)]',
      badge: 'bg-[oklch(0.75_0.18_195/0.15)] text-[oklch(0.85_0.15_195)]',
      number: 'bg-[oklch(0.75_0.18_195)] text-[oklch(0.08_0.01_240)]',
    },
    violet: {
      bg: 'bg-[oklch(0.65_0.22_290/0.08)]',
      text: 'text-[oklch(0.65_0.22_290)]',
      textBright: 'text-[oklch(0.80_0.18_290)]',
      border: 'border-[oklch(0.65_0.22_290/0.2)]',
      badge: 'bg-[oklch(0.65_0.22_290/0.15)] text-[oklch(0.80_0.18_290)]',
      number: 'bg-[oklch(0.65_0.22_290)] text-[oklch(0.08_0.01_240)]',
    },
    emerald: {
      bg: 'bg-[oklch(0.72_0.17_160/0.08)]',
      text: 'text-[oklch(0.72_0.17_160)]',
      textBright: 'text-[oklch(0.82_0.14_160)]',
      border: 'border-[oklch(0.72_0.17_160/0.2)]',
      badge: 'bg-[oklch(0.72_0.17_160/0.15)] text-[oklch(0.82_0.14_160)]',
      number: 'bg-[oklch(0.72_0.17_160)] text-[oklch(0.08_0.01_240)]',
    },
    amber: {
      bg: 'bg-[oklch(0.80_0.18_80/0.08)]',
      text: 'text-[oklch(0.80_0.18_80)]',
      textBright: 'text-[oklch(0.88_0.14_80)]',
      border: 'border-[oklch(0.80_0.18_80/0.2)]',
      badge: 'bg-[oklch(0.80_0.18_80/0.15)] text-[oklch(0.88_0.14_80)]',
      number: 'bg-[oklch(0.80_0.18_80)] text-[oklch(0.08_0.01_240)]',
    },
    rose: {
      bg: 'bg-[oklch(0.70_0.20_330/0.08)]',
      text: 'text-[oklch(0.70_0.20_330)]',
      textBright: 'text-[oklch(0.82_0.16_330)]',
      border: 'border-[oklch(0.70_0.20_330/0.2)]',
      badge: 'bg-[oklch(0.70_0.20_330/0.15)] text-[oklch(0.82_0.16_330)]',
      number: 'bg-[oklch(0.70_0.20_330)] text-[oklch(0.08_0.01_240)]',
    },
  };

  const colors = colorClasses[accentColor] || colorClasses.cyan;

  return (
    <div className="mt-12 space-y-8">
      {/* 소개 */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className={`text-2xl font-bold ${colors.text} mb-3`}>{title}</h2>
        <p className="text-[oklch(0.65_0.02_240)]">{description}</p>
      </div>

      {/* 사용 방법 */}
      <Card className="border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
        <CardHeader>
          <CardTitle className="text-lg text-[oklch(0.95_0.01_80)]">{t('howToUse')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.number} flex items-center justify-center font-bold text-sm`}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className={`font-semibold ${colors.textBright}`}>{step.title}</h3>
                  <p className="text-sm text-[oklch(0.60_0.02_240)] mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 지원 포맷 */}
      {supportedFormats && supportedFormats.length > 0 && (
        <Card className="border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
          <CardHeader>
            <CardTitle className="text-lg text-[oklch(0.95_0.01_80)]">{t('supportedFormats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {supportedFormats.map((format) => (
                <span
                  key={format}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}
                >
                  {format}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주요 기능 */}
      {features && features.length > 0 && (
        <Card className="border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
          <CardHeader>
            <CardTitle className="text-lg text-[oklch(0.95_0.01_80)]">{t('keyFeatures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
                  <h3 className={`font-semibold ${colors.textBright}`}>{feature.title}</h3>
                  <p className="text-sm text-[oklch(0.60_0.02_240)] mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <Card className="border-[oklch(1_0_0/0.06)] bg-[oklch(0.10_0.015_250)]">
          <CardHeader>
            <CardTitle className="text-lg text-[oklch(0.95_0.01_80)]">{t('faq')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-[oklch(1_0_0/0.06)] pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-[oklch(0.90_0.01_80)]">{faq.question}</h3>
                  <p className="text-sm text-[oklch(0.60_0.02_240)] mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 개인정보 안내 */}
      <div className="text-center text-sm text-[oklch(0.50_0.02_240)] py-4">
        <p>{t('privacyNotice')}</p>
      </div>
    </div>
  );
}
