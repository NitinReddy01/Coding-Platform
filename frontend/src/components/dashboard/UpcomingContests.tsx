import { Trophy, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * Placeholder component for upcoming contests
 * Full functionality will be implemented in Phase 3
 */
export function UpcomingContests() {
  // Mock data for upcoming contest (placeholder)
  const upcomingContest = {
    id: 'contest-1',
    title: 'Weekly Contest 125',
    date: 'November 16, 2025',
    time: '10:30 AM EST',
    duration: '90 minutes',
    participants: 1247,
    prize: '🎁 Premium Badge',
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent/10 via-primary/10 to-warning/10 border border-primary/30 p-6 shadow-card hover-lift">
      {/* Gradient Blobs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-primary opacity-20 blur-3xl rounded-full animate-float" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-success opacity-20 blur-3xl rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="relative">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Title and Badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xl font-bold text-gradient-primary mb-1">
                  {upcomingContest.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compete with developers worldwide and showcase your skills!
                </p>
              </div>
              <Badge variant="secondary" className="bg-success/20 text-success border border-success/30 font-semibold whitespace-nowrap">
                Coming Soon
              </Badge>
            </div>

            {/* Contest Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-5">
              {/* Date */}
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{upcomingContest.date}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Clock className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-medium text-foreground">{upcomingContest.time}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">{upcomingContest.duration}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-success/20">
                  <Users className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="font-medium text-foreground">{upcomingContest.participants}+</p>
                </div>
              </div>
            </div>

            {/* Prize */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-card border border-warning/30 mb-4">
              <span className="text-sm font-medium text-foreground">
                Prize: {upcomingContest.prize}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" className="shadow-glow">
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            🚧 Contest system is under development (Phase 3). This is a preview of what's coming!
          </p>
        </div>
      </div>
    </div>
  );
}
