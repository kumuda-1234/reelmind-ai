// Utility helpers

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function scoreColor(score: number): string {
  if (score >= 75) return 'from-emerald-400 to-green-500';
  if (score >= 50) return 'from-amber-400 to-orange-500';
  if (score >= 25) return 'from-pink-400 to-rose-500';
  return 'from-red-400 to-red-600';
}

export function scoreTextColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  if (score >= 25) return 'text-pink-400';
  return 'text-red-400';
}

export function confidenceColor(label: string): string {
  if (label === 'High') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (label === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
}

export function difficultyColor(level: string): string {
  if (level === 'Beginner') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (level === 'Intermediate') return 'text-violet-400 bg-violet-500/10 border-violet-500/30';
  return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
}
