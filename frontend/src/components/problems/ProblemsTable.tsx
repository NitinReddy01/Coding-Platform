import { useAppDispatch } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { ProblemListItem, SortField } from '../../types/problemList';
import type { ProblemSort } from '../../types/problemList';
import { toggleSort } from '../../store/slices/problemsSlice';
import { cn } from '../../lib/utils';

interface ProblemsTableProps {
  problems: ProblemListItem[];
  sort: ProblemSort;
  currentPage: number;
  pageSize: number;
}

export function ProblemsTable({ problems, sort, currentPage, pageSize }: ProblemsTableProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    dispatch(toggleSort(field));
  };

  const handleRowClick = (problemTitle: string) => {
    // URL encode the title to handle spaces and special characters
    navigate(`/problems/${encodeURIComponent(problemTitle)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, problemTitle: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // URL encode the title to handle spaces and special characters
      navigate(`/problems/${encodeURIComponent(problemTitle)}`);
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
            {/* Serial Number */}
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">#</span>
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
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => {
            const serialNumber = (currentPage - 1) * pageSize + index + 1;
            return (
              <tr
                key={problem.id}
                onClick={() => handleRowClick(problem.title)}
                onKeyDown={(e) => handleKeyDown(e, problem.title)}
                tabIndex={0}
                role="button"
                aria-label={`View problem: ${problem.title}`}
                className="border-b border-border hover:bg-gradient-to-r hover:from-primary/5 hover:via-transparent hover:to-success/5 hover:shadow-glow-sm focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all duration-300 group"
              >
                {/* Serial Number */}
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-muted-text">{serialNumber}</span>
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
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
