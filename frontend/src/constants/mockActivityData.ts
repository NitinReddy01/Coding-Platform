/**
 * Mock data for recent activity feed on the dashboard
 */

export interface ActivityItem {
  id: string;
  problem_id: string;
  problem_title: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error';
  language: string;
  timestamp: string; // ISO 8601 date string
  execution_time?: number; // in ms
  memory_used?: number; // in MB
}

/**
 * Mock recent activity data (last 10 submissions)
 */
export const mockActivityData: ActivityItem[] = [
  {
    id: 'sub-001',
    problem_id: '1',
    problem_title: 'Two Sum',
    status: 'accepted',
    language: 'python',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    execution_time: 52,
    memory_used: 14.2,
  },
  {
    id: 'sub-002',
    problem_id: '15',
    problem_title: 'Valid Parentheses',
    status: 'accepted',
    language: 'javascript',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    execution_time: 38,
    memory_used: 12.8,
  },
  {
    id: 'sub-003',
    problem_id: '42',
    problem_title: 'Merge Intervals',
    status: 'wrong_answer',
    language: 'python',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'sub-004',
    problem_id: '42',
    problem_title: 'Merge Intervals',
    status: 'accepted',
    language: 'python',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    execution_time: 145,
    memory_used: 18.5,
  },
  {
    id: 'sub-005',
    problem_id: '28',
    problem_title: 'Binary Search',
    status: 'accepted',
    language: 'java',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    execution_time: 28,
    memory_used: 15.3,
  },
  {
    id: 'sub-006',
    problem_id: '51',
    problem_title: 'N-Queens',
    status: 'time_limit_exceeded',
    language: 'cpp',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'sub-007',
    problem_id: '48',
    problem_title: 'Maximum Subarray Sum',
    status: 'accepted',
    language: 'python',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    execution_time: 78,
    memory_used: 16.7,
  },
  {
    id: 'sub-008',
    problem_id: '33',
    problem_title: 'Valid Sudoku',
    status: 'runtime_error',
    language: 'javascript',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'sub-009',
    problem_id: '33',
    problem_title: 'Valid Sudoku',
    status: 'accepted',
    language: 'javascript',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    execution_time: 95,
    memory_used: 13.9,
  },
  {
    id: 'sub-010',
    problem_id: '7',
    problem_title: 'Reverse Integer',
    status: 'accepted',
    language: 'python',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    execution_time: 42,
    memory_used: 14.1,
  },
];

/**
 * Get formatted relative time string
 * @param dateString - ISO 8601 date string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Get language display name
 */
export function getLanguageDisplay(lang: string): string {
  const languageMap: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    go: 'Go',
    rust: 'Rust',
  };
  return languageMap[lang] || lang;
}
