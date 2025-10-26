import { Check, X, Clock, MemoryStick, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SubmissionStatus } from '../../types';

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      text: 'In Queue',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/40',
      glowColor: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]',
    },
    running: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      text: 'Running...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      glowColor: 'shadow-[0_0_12px_rgba(255,161,22,0.5)]',
    },
    accepted: {
      icon: <Check className="w-3.5 h-3.5 stroke-[3]" />,
      text: 'Accepted',
      color: 'text-success',
      bgColor: 'bg-success/10',
      glowColor: 'shadow-[0_0_12px_rgba(0,184,163,0.5)]',
    },
    wrong_answer: {
      icon: <X className="w-3.5 h-3.5 stroke-[3]" />,
      text: 'Wrong Answer',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      glowColor: 'shadow-[0_0_12px_rgba(239,71,67,0.5)]',
    },
    time_limit_exceeded: {
      icon: <Clock className="w-3.5 h-3.5" />,
      text: 'Time Limit',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      glowColor: 'shadow-[0_0_12px_rgba(255,192,30,0.5)]',
    },
    memory_limit_exceeded: {
      icon: <MemoryStick className="w-3.5 h-3.5" />,
      text: 'Memory Limit',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      glowColor: 'shadow-[0_0_12px_rgba(255,192,30,0.5)]',
    },
    runtime_error: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: 'Runtime Error',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      glowColor: 'shadow-[0_0_12px_rgba(239,71,67,0.5)]',
    },
    compilation_error: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: 'Compilation Error',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      glowColor: 'shadow-[0_0_12px_rgba(239,71,67,0.5)]',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
        config.color,
        config.bgColor,
        config.glowColor,
        className
      )}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
