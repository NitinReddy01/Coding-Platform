import { ActivityFeed } from '../dashboard/ActivityFeed';

/**
 * Recent Activity Tab - reuses ActivityFeed component
 * Shows the user's recent submissions (same data as dashboard)
 */
export function RecentActivityTab() {
  return (
    <div>
      <ActivityFeed />
    </div>
  );
}
