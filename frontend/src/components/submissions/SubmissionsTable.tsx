import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, Code2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { toggleSort, openModal } from '../../store/slices/submissionsSlice';
import type { SubmissionDetail } from '../../constants/mockSubmissionsData';
import type { SubmissionsSort } from '../../store/slices/submissionsSlice';
import { getLanguageDisplay, formatDate } from '../../constants/mockSubmissionsData';
import { cn } from '../../lib/utils';

interface SubmissionsTableProps {
  submissions: SubmissionDetail[];
  sort: SubmissionsSort;
}

export function SubmissionsTable({ submissions, sort }: SubmissionsTableProps) {
  const dispatch = useDispatch();

  const handleSort = (field: SubmissionsSort['field']) => {
    dispatch(toggleSort(field));
  };

  const handleRowClick = (submission: SubmissionDetail) => {
    dispatch(openModal(submission));
  };

  const handleKeyDown = (e: React.KeyboardEvent, submission: SubmissionDetail) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dispatch(openModal(submission));
    }
  };

  const SortIcon = ({ field }: { field: SubmissionsSort['field'] }) => {
    if (sort.field !== field) {
      return <ChevronUp className="w-4 h-4 text-muted-text opacity-0 group-hover:opacity-50" />;
    }
    return sort.order === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  const StatusBadge = ({ status }: { status: SubmissionDetail['status'] }) => {
    const statusConfig = {
      accepted: {
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        label: 'Accepted',
        className: 'bg-success/20 text-success border border-success/30 shadow-glow-sm',
      },
      wrong_answer: {
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: 'Wrong Answer',
        className: 'bg-destructive/20 text-destructive border border-destructive/30',
      },
      time_limit_exceeded: {
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Time Limit',
        className: 'bg-warning/20 text-warning border border-warning/30',
      },
      memory_limit_exceeded: {
        icon: <Zap className="w-3.5 h-3.5" />,
        label: 'Memory Limit',
        className: 'bg-warning/20 text-warning border border-warning/30',
      },
      runtime_error: {
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: 'Runtime Error',
        className: 'bg-destructive/20 text-destructive border border-destructive/30',
      },
      compilation_error: {
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        label: 'Compilation Error',
        className: 'bg-destructive/20 text-destructive border border-destructive/30',
      },
    };

    const config = statusConfig[status];

    return (
      <Badge variant="secondary" className={cn('flex items-center gap-1 font-medium', config.className)}>
        {config.icon}
        <span className="text-xs">{config.label}</span>
      </Badge>
    );
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-text">
        <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium mb-2">No submissions found</p>
        <p className="text-sm">Try adjusting your filters or start solving problems!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10">
          <tr className="border-b border-primary/20">
            {/* Status */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('status')}
              role="button"
              tabIndex={0}
              aria-label="Sort by status"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('status')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Status</span>
                <SortIcon field="status" />
              </div>
            </th>

            {/* Problem */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('problem_title')}
              role="button"
              tabIndex={0}
              aria-label="Sort by problem"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('problem_title')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Problem</span>
                <SortIcon field="problem_title" />
              </div>
            </th>

            {/* Language */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('language')}
              role="button"
              tabIndex={0}
              aria-label="Sort by language"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('language')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Language</span>
                <SortIcon field="language" />
              </div>
            </th>

            {/* Time */}
            <th className="px-4 py-3 text-left hidden md:table-cell">
              <span className="text-sm font-medium text-muted-text">Time</span>
            </th>

            {/* Memory */}
            <th className="px-4 py-3 text-left hidden md:table-cell">
              <span className="text-sm font-medium text-muted-text">Memory</span>
            </th>

            {/* Date */}
            <th
              className="px-4 py-3 text-left cursor-pointer group hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('submitted_at')}
              role="button"
              tabIndex={0}
              aria-label="Sort by date"
              onKeyDown={(e) => e.key === 'Enter' && handleSort('submitted_at')}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-muted-text">Submitted</span>
                <SortIcon field="submitted_at" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              onClick={() => handleRowClick(submission)}
              onKeyDown={(e) => handleKeyDown(e, submission)}
              tabIndex={0}
              role="button"
              aria-label={`View submission for ${submission.problem_title}`}
              className="border-b border-border hover:bg-gradient-to-r hover:from-primary/5 hover:via-transparent hover:to-success/5 hover:shadow-glow-sm focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer transition-all duration-300 group"
            >
              {/* Status */}
              <td className="px-4 py-4">
                <StatusBadge status={submission.status} />
              </td>

              {/* Problem */}
              <td className="px-4 py-4">
                <Link
                  to={`/problems/${submission.problem_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-text group-hover:text-primary transition-colors hover:underline"
                >
                  {submission.problem_title}
                </Link>
              </td>

              {/* Language */}
              <td className="px-4 py-4">
                <Badge variant="secondary" className="text-xs">
                  <Code2 className="w-3 h-3 mr-1" />
                  {getLanguageDisplay(submission.language)}
                </Badge>
              </td>

              {/* Time */}
              <td className="px-4 py-4 hidden md:table-cell">
                {submission.execution_time ? (
                  <span className="text-sm text-muted-text flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {submission.execution_time}ms
                  </span>
                ) : (
                  <span className="text-sm text-muted-text">-</span>
                )}
              </td>

              {/* Memory */}
              <td className="px-4 py-4 hidden md:table-cell">
                {submission.memory_used ? (
                  <span className="text-sm text-muted-text flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {submission.memory_used}MB
                  </span>
                ) : (
                  <span className="text-sm text-muted-text">-</span>
                )}
              </td>

              {/* Date */}
              <td className="px-4 py-4">
                <span className="text-sm text-muted-text whitespace-nowrap">
                  {formatDate(submission.submitted_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
