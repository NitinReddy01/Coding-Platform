
import type { Problem, Difficulty } from '../../types';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface ProblemDescriptionProps {
  problem: Problem;
}

const difficultyColors: Record<Difficulty, 'success' | 'warning' | 'destructive'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'destructive',
};

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const acceptanceRate = problem.submissions > 0
    ? ((problem.accepted / problem.submissions) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Title and Difficulty */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <Badge variant={difficultyColors[problem.difficulty]}>
            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Acceptance: {acceptanceRate}%</span>
          <span>•</span>
          <span>Submissions: {problem.submissions.toLocaleString()}</span>
          <span>•</span>
          <span>Accepted: {problem.accepted.toLocaleString()}</span>
        </div>
      </div>

      {/* Tags */}
      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: problem.description.replace(/\n/g, '<br />').replace(/`([^`]+)`/g, '<code>$1</code>')
            }}
          />
        </CardContent>
      </Card>

      {/* Constraints */}
      {problem.constraints && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Constraints:</h3>
            <div
              className="text-sm text-muted-foreground space-y-1"
              dangerouslySetInnerHTML={{
                __html: problem.constraints.replace(/\n/g, '<br />')
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Execution Limits */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Execution Limits:</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Time Limit: {problem.time_limit}ms</div>
            <div>Memory Limit: {problem.memory_limit}MB</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
