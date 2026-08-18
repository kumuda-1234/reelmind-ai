import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  flat?: boolean;
}

export function GlassCard({ children, className, hover = true, flat = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        flat ? 'glass-card-flat' : 'glass-card',
        hover && !flat && 'hover:scale-[1.01]',
        'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({ icon, title, subtitle, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-start gap-3 mb-4', className)}>
      {icon && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-violet-400/20 flex items-center justify-center text-pink-400">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
