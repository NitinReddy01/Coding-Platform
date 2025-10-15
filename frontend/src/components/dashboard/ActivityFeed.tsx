import { Link } from 'react-router-dom';
import { Clock, Code2, CheckCircle2, XCircle, AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { mockActivityData, getRelativeTime, getLanguageDisplay } from '../../constants/mockActivityData';
import type { ActivityItem } from '../../constants/mockActivityData';
import { cn } from '../../lib/utils';

export function ActivityFeed() {
  // Show only the 5 most recent activities to keep the dashboard compact
  const activities = mockActivityData.slice(0, 5);

  const StatusBadge = ({ status }: { status: ActivityItem['status'] }) => {
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

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
        <p className="text-sm mt-1">Start solving problems to see your activity here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-gradient-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift-sm group"
          >
            {/* Status Icon with Glow */}
            <div className="flex-shrink-0 mt-1">
              <StatusBadge status={activity.status} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Problem Title */}
              <Link
                to={`/problems/${activity.problem_id}`}
                className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1"
              >
                {activity.problem_title}
              </Link>

              {/* Metadata Row */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {/* Language Badge */}
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  <Code2 className="w-3 h-3 mr-1" />
                  {getLanguageDisplay(activity.language)}
                </Badge>

                {/* Execution Time (if accepted) */}
                {activity.status === 'accepted' && activity.execution_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.execution_time}ms
                  </span>
                )}

                {/* Memory Used (if accepted) */}
                {activity.status === 'accepted' && activity.memory_used && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {activity.memory_used}MB
                  </span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
              {getRelativeTime(activity.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {/* View All Submissions Link */}
      <div className="pt-2 border-t border-border">
        <Link to="/submissions" className="block">
          <Button variant="ghost" className="w-full group">
            <span>View All Submissions</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
