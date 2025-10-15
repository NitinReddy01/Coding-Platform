import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { StatsCards } from '../components/profile/StatsCards';
import { SolvedProblemsTab } from '../components/profile/SolvedProblemsTab';
import { RecentActivityTab } from '../components/profile/RecentActivityTab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import type { RootState } from '../store/store';
import { fetchUserProfile, setActiveTab } from '../store/slices/userSlice';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const dispatch = useDispatch();
  const { profile, stats, solvedProblems, loading, activeTab } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUserProfile(username));
  }, [dispatch, username]);

  const handleTabChange = (tab: string) => {
    dispatch(setActiveTab(tab as 'solved' | 'activity'));
  };

  if (loading || !profile || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header with Gradient */}
        <div className="mb-8 relative overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-primary opacity-20 blur-3xl rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-success opacity-20 blur-3xl rounded-full animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl icon-container-primary">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-primary">User Profile</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              View profile statistics, solved problems, and recent activity.
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="mb-6">
          <ProfileHeader profile={profile} stats={stats} />
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Problem Solving Stats</h2>
          <StatsCards stats={stats} />
        </div>

        {/* Charts Placeholder - Coming Soon */}
        <div className="mb-8 bg-gradient-card border border-border rounded-xl p-8 shadow-card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-success/5" />
          <div className="relative">
            <div className="inline-block p-4 rounded-full bg-gradient-primary mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-lg font-semibold text-gradient-primary mb-2">
              Charts & Heatmap Coming Soon
            </p>
            <p className="text-muted-foreground text-sm">
              Submission heatmap, language distribution chart, and problem difficulty breakdown will be added in the next update.
            </p>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-gradient-card border border-border rounded-xl overflow-hidden shadow-card">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start rounded-none bg-card/50 border-b border-border p-0 h-auto">
              <TabsTrigger
                value="solved"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Solved Problems ({solvedProblems.length})
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-4"
              >
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solved" className="p-6 mt-0">
              <SolvedProblemsTab problems={solvedProblems} />
            </TabsContent>

            <TabsContent value="activity" className="p-6 mt-0">
              <RecentActivityTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
