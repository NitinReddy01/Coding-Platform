import { MapPin, Globe, Github, Calendar, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import type { UserProfile, UserStats } from '../../constants/mockUserData';
import { formatProfileDate, getDaysSinceJoining, formatNumber } from '../../constants/mockUserData';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStats;
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const daysSinceJoining = getDaysSinceJoining(profile.joined_date);

  return (
    <div className="bg-gradient-card border border-border rounded-xl p-6 shadow-card border-gradient-l-primary overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-primary opacity-10 blur-3xl rounded-full" />

      <div className="relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-30" />
              <Avatar
                src={profile.avatar_url}
                fallback={profile.name}
                size="xl"
                className="ring-4 ring-primary/20 ring-offset-4 ring-offset-background relative"
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            {/* Name and Username */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gradient-primary mb-1">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground mb-4 max-w-2xl">{profile.bio}</p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>{profile.github}</span>
                </a>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatProfileDate(profile.joined_date)}</span>
                <span className="text-xs ml-1">({daysSinceJoining} days ago)</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-2xl font-bold text-gradient-success">{stats.problems_solved}</p>
                <p className="text-xs text-muted-foreground">Problems Solved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient-primary">{stats.acceptance_rate}%</p>
                <p className="text-xs text-muted-foreground">Acceptance Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient-warning">{stats.current_streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              {stats.rank && (
                <div>
                  <p className="text-2xl font-bold text-gradient-accent">#{formatNumber(stats.rank)}</p>
                  <p className="text-xs text-muted-foreground">Global Rank</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button (own profile only) */}
          {profile.is_own_profile && (
            <div className="flex-shrink-0">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
