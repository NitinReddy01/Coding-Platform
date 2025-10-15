import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { mockRecommendedProblems, getDifficultyColorClass } from '../../constants/mockRecommendedProblems';
import { cn } from '../../lib/utils';

export function RecommendedProblems() {
  const problems = mockRecommendedProblems;

  if (problems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No recommendations available</p>
        <p className="text-sm mt-1">Solve more problems to get personalized recommendations!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {problems.map((problem) => (
        <Link
          key={problem.id}
          to={`/problems/${problem.id}`}
          className="block group"
        >
          <div className="h-full p-5 rounded-xl bg-gradient-card border border-border hover:border-primary/40 shadow-card hover:shadow-glow transition-all duration-300 hover-lift relative overflow-hidden">
            {/* Gradient Blob Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-gradient-primary transition-colors line-clamp-1 mb-2">
                    {problem.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={cn('capitalize text-xs font-semibold shadow-sm', getDifficultyColorClass(problem.difficulty))}
                    >
                      {problem.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {problem.acceptance_rate}% acceptance
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {problem.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {problem.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Reason Badge */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary font-medium">{problem.reason}</p>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="sm"
                className="w-full group-hover:shadow-glow transition-shadow"
              >
                <span>Solve Now</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
