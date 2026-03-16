'use client';

interface ToolPageLayoutProps {
  maxWidth?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const widthMap = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

export default function ToolPageLayout({ maxWidth = 'lg', children }: ToolPageLayoutProps) {
  return (
    <div className="min-h-full py-8 lg:py-12">
      <div className={`mx-auto ${widthMap[maxWidth]} px-6 lg:px-12`}>
        {children}
      </div>
    </div>
  );
}
