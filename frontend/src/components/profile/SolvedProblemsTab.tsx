import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Code2 } from 'lucide-react';
import type { SolvedProblem } from '../../constants/mockUserData';
import { cn } from '../../lib/utils';

interface SolvedProblemsTabProps {
  problems: SolvedProblem[];
}

export function SolvedProblemsTab({ problems }: SolvedProblemsTabProps) {
  const getDifficultyBadgeClass = (difficulty: string) => {
    const classes = {
      easy: 'bg-gradient-success text-success-foreground shadow-glow-sm',
      medium: 'bg-gradient-primary text-primary-foreground shadow-glow-sm',
      hard: 'bg-destructive/90 text-destructive-foreground border border-destructive',
    };
    return classes[difficulty as keyof typeof classes];
  };

  if (problems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No problems solved yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {problems.map((problem) => (
        <Link
          key={problem.id}
          to={`/problems/${problem.id}`}
          className="block p-4 rounded-lg bg-gradient-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift group"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-2">
                {problem.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn('capitalize font-semibold text-xs', getDifficultyBadgeClass(problem.difficulty))}
                >
                  {problem.difficulty}
                </Badge>
                {problem.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {problem.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{problem.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <Badge variant="secondary" className="text-xs mb-2">
                <Code2 className="w-3 h-3 mr-1" />
                {problem.language.charAt(0).toUpperCase() + problem.language.slice(1)}
              </Badge>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(problem.solved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
