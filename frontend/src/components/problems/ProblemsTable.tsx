import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { ProblemListItem, SortField } from '../../types/problemList';
import type { ProblemSort } from '../../types/problemList';
import { toggleSort } from '../../store/slices/problemsSlice';
import { cn } from '../../lib/utils';

interface ProblemsTableProps {
  problems: ProblemListItem[];
  sort: ProblemSort;
}

export function ProblemsTable({ problems, sort }: ProblemsTableProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    dispatch(toggleSort(field));
  };

  const handleRowClick = (problemId: string) => {
    navigate(`/problems/${problemId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, problemId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/problems/${problemId}`);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) {
      return <ChevronUp className="w-4 h-4 text-muted-text opacity-0 group-hover:opacity-50" />;
    }
    return sort.order === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  const StatusIcon = ({ status }: { status: ProblemListItem['solve_status'] }) => {
    switch (status) {
      case 'solved':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-success opacity-20 blur-md rounded-full" />
            <CheckCircle2 className="w-6 h-6 text-success relative" />
          </div>
        );
      case 'attempted':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-warning opacity-20 blur-md rounded-full" />
            <AlertCircle className="w-6 h-6 text-warning relative" />
          </div>
        );
      case 'unsolved':
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const DifficultyBadge = ({ difficulty }: { difficulty: ProblemListItem['difficulty'] }) => {
    const variants = {
      easy: 'bg-gradient-success text-success-foreground shadow-glow-sm hover:shadow-glow',
      medium: 'bg-gradient-primary text-primary-foreground shadow-glow-sm hover:shadow-glow',
      hard: 'bg-destructive/90 text-destructive-foreground shadow-glow-sm hover:shadow-glow border border-destructive',
    };

    return (
      <Badge variant="secondary" className={cn('capitalize font-semibold transition-smooth', variants[difficulty])}>
        {difficulty}
      </Badge>
    );
  };

  if (problems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-text">
        No problems found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10">
          <tr className="border-b border-primary/20">
            {/* Status */}
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">Status</span>
            </th>

            {/* ID */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('id')}
              role="button"
              tabIndex={0}
              aria-label="Sort by ID"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('id')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">#</span>
                <SortIcon field="id" />
              </div>
            </th>

            {/* Title */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('title')}
              role="button"
              tabIndex={0}
              aria-label="Sort by title"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('title')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Title</span>
                <SortIcon field="title" />
              </div>
            </th>

            {/* Difficulty */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('difficulty')}
              role="button"
              tabIndex={0}
              aria-label="Sort by difficulty"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('difficulty')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Difficulty</span>
                <SortIcon field="difficulty" />
              </div>
            </th>

            {/* Acceptance */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('acceptance_rate')}
              role="button"
              tabIndex={0}
              aria-label="Sort by acceptance rate"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('acceptance_rate')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Acceptance</span>
                <SortIcon field="acceptance_rate" />
              </div>
            </th>

            {/* Tags */}
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              <span className="text-sm font-medium text-muted-text">Tags</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr
              key={problem.id}
              onClick={() => handleRowClick(problem.id)}
              onKeyDown={(e) => handleKeyDown(e, problem.id)}
              tabIndex={0}
              role="button"
              aria-label={`View problem: ${problem.title}`}
              className="border-b border-border hover:bg-gradient-to-r hover:from-primary/5 hover:via-transparent hover:to-success/5 hover:shadow-glow-sm focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all duration-300 group"
            >
              {/* Status */}
              <td className="px-4 py-4">
                <StatusIcon status={problem.solve_status} />
              </td>

              {/* ID */}
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-muted-text">{problem.id}</span>
              </td>

              {/* Title */}
              <td className="px-4 py-4">
                <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                  {problem.title}
                </span>
              </td>

              {/* Difficulty */}
              <td className="px-4 py-4">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>

              {/* Acceptance */}
              <td className="px-4 py-4">
                <span className="text-sm text-muted-text">{problem.acceptance_rate}%</span>
              </td>

              {/* Tags */}
              <td className="px-4 py-4 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {problem.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{problem.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
