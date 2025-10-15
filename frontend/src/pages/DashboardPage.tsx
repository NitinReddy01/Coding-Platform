import { LayoutDashboard, Activity, Lightbulb, Trophy } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { RecommendedProblems } from '../components/dashboard/RecommendedProblems';
import { UpcomingContests } from '../components/dashboard/UpcomingContests';

export function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header with Gradient */}
        <div className="mb-8 relative overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-success opacity-20 blur-3xl rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-purple opacity-20 blur-3xl rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl icon-container-success">
                <LayoutDashboard className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-success">Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Welcome back! Here's an overview of your progress.
            </p>
          </div>
        </div>

        {/* Vibrant Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Problems Solved Card */}
          <div className="bg-gradient-card border border-success/30 rounded-xl p-6 shadow-card hover-lift border-gradient-l-success relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-success">Problems Solved</h3>
                <div className="p-2 rounded-lg bg-success/20">
                  <span className="text-success text-lg">✓</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-success mb-2">4</p>
              <p className="text-xs text-muted-foreground">Out of 60 total problems</p>
            </div>
          </div>

          {/* Acceptance Rate Card */}
          <div className="bg-gradient-card border border-primary/30 rounded-xl p-6 shadow-card hover-lift border-gradient-l-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-primary">Acceptance Rate</h3>
                <div className="p-2 rounded-lg bg-primary/20">
                  <span className="text-primary text-lg">📊</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-primary mb-2">66.7%</p>
              <p className="text-xs text-muted-foreground">4 accepted / 6 submissions</p>
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="bg-gradient-card border border-warning/30 rounded-xl p-6 shadow-card hover-lift border-gradient-l-warning relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-warning">Current Streak</h3>
                <div className="p-2 rounded-lg bg-warning/20">
                  <span className="text-warning text-lg">🔥</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-warning mb-2">0</p>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </div>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-card border border-accent/30 rounded-xl p-6 shadow-card hover-lift relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
            <div className="relative border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-4 pl-3">
                <h3 className="text-sm font-semibold text-accent">Global Rank</h3>
                <div className="p-2 rounded-lg bg-accent/20">
                  <span className="text-accent text-lg">🏆</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-accent mb-2 pl-3">-</p>
              <p className="text-xs text-muted-foreground pl-3">Solve more to get ranked</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity Section */}
            <div className="bg-gradient-card border border-border rounded-xl shadow-card border-gradient-l-primary overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                </div>
              </div>
              <div className="p-6">
                <ActivityFeed />
              </div>
            </div>

            {/* Recommended Problems Section */}
            <div className="bg-gradient-card border border-border rounded-xl shadow-card border-gradient-l-success overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-success/5 via-transparent to-success/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Lightbulb className="w-5 h-5 text-success" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Recommended For You</h2>
                </div>
              </div>
              <div className="p-6">
                <RecommendedProblems />
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Contest */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Trophy className="w-5 h-5 text-warning" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Upcoming Contest</h2>
                </div>
              </div>
              <UpcomingContests />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
