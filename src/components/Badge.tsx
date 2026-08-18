import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'category' | 'confidence' | 'difficulty' | 'hype' | 'success' | 'warning';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'text-gray-300 bg-white/5 border-white/10',
  category: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
  confidence: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  difficulty: 'text-pink-300 bg-pink-500/10 border-pink-500/30',
  hype: 'text-red-300 bg-red-500/10 border-red-500/30',
  success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  warning: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
