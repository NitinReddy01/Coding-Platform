import { CheckCircle2 } from 'lucide-react';
import type { UserStats } from '../../constants/mockUserData';
import { cn } from '../../lib/utils';

interface StatsCardsProps {
  stats: UserStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const difficultyStats = [
    {
      label: 'Easy',
      count: stats.easy_solved,
      total: stats.easy_solved + 30, // Mock total count
      percentage: ((stats.easy_solved / (stats.easy_solved + 30)) * 100).toFixed(1),
      gradient: 'bg-gradient-success',
      border: 'border-success/30',
      textGradient: 'text-gradient-success',
      bgGlow: 'bg-success/10',
    },
    {
      label: 'Medium',
      count: stats.medium_solved,
      total: stats.medium_solved + 40, // Mock total count
      percentage: ((stats.medium_solved / (stats.medium_solved + 40)) * 100).toFixed(1),
      gradient: 'bg-gradient-primary',
      border: 'border-primary/30',
      textGradient: 'text-gradient-primary',
      bgGlow: 'bg-primary/10',
    },
    {
      label: 'Hard',
      count: stats.hard_solved,
      total: stats.hard_solved + 20, // Mock total count
      percentage: ((stats.hard_solved / (stats.hard_solved + 20)) * 100).toFixed(1),
      gradient: 'bg-destructive/90',
      border: 'border-destructive/30',
      textGradient: 'text-destructive',
      bgGlow: 'bg-destructive/10',
    },
    {
      label: 'Total',
      count: stats.problems_solved,
      total: stats.problems_solved + 90, // Mock total count
      percentage: ((stats.problems_solved / (stats.problems_solved + 90)) * 100).toFixed(1),
      gradient: 'bg-gradient-accent',
      border: 'border-accent/30',
      textGradient: 'text-gradient-accent',
      bgGlow: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {difficultyStats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'bg-gradient-card border rounded-xl p-5 shadow-card hover-lift relative overflow-hidden',
            stat.border
          )}
        >
          {/* Gradient Glow */}
          <div className={cn('absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl', stat.bgGlow)} />

          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn('text-sm font-semibold', stat.textGradient)}>
                {stat.label}
              </h3>
              <CheckCircle2 className={cn('w-5 h-5', stat.label === 'Easy' ? 'text-success' : stat.label === 'Medium' ? 'text-primary' : stat.label === 'Hard' ? 'text-destructive' : 'text-accent')} />
            </div>

            <div className="mb-2">
              <span className={cn('text-3xl font-bold', stat.textGradient)}>
                {stat.count}
              </span>
              <span className="text-muted-foreground text-sm ml-1">/ {stat.total}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden mb-2">
              <div
                className={cn('h-full transition-all duration-500', stat.gradient)}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {stat.percentage}% completion
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
