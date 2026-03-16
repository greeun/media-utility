'use client';

interface PageHeaderProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
}

export default function PageHeader({ icon, iconBgColor, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-start gap-6">
        <div
          className="ds-card flex-shrink-0 w-16 h-16 flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight ds-text mb-2">{title}</h1>
          <p className="text-lg font-bold ds-text-muted">{description}</p>
        </div>
      </div>
    </div>
  );
}
