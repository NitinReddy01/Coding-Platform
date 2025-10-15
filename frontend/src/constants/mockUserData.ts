/**
 * Mock data for user profile page
 */

import type { Difficulty } from '../types/problem';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string;
  location: string;
  website: string;
  github: string;
  joined_date: string; // ISO 8601 date string
  is_own_profile: boolean; // For conditional rendering
}

export interface UserStats {
  problems_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_submissions: number;
  acceptance_rate: number; // percentage
  current_streak: number; // days
  longest_streak: number; // days
  rank: number | null;
}

export interface LanguageUsage {
  language: string;
  count: number; // number of solutions in this language
  percentage: number;
}

export interface SolvedProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solved_at: string; // ISO 8601 date string
  language: string;
}

export interface SubmissionCalendarDay {
  date: string; // ISO 8601 date string
  count: number; // number of submissions on this day
}

/**
 * Generate 365-day submission calendar data
 */
function generate365DayCalendar(): SubmissionCalendarDay[] {
  const calendar: SubmissionCalendarDay[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulate realistic submission patterns
    // More submissions on weekdays, less on weekends
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Random submission count with realistic distribution
    let count = 0;
    const random = Math.random();

    if (isWeekend) {
      if (random > 0.7) count = Math.floor(Math.random() * 3) + 1; // 30% chance, 1-3 submissions
    } else {
      if (random > 0.5) count = Math.floor(Math.random() * 5) + 1; // 50% chance, 1-5 submissions
      if (random > 0.8) count = Math.floor(Math.random() * 8) + 3; // 20% chance, 3-10 submissions
    }

    calendar.push({ date: date.toISOString(), count });
  }

  return calendar;
}

/**
 * Mock user profile data
 */
export const mockUserProfile: UserProfile = {
  id: 'user-001',
  username: 'johndoe',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: null, // Will show initials
  bio: 'Full-stack developer passionate about algorithms and problem-solving. Currently preparing for tech interviews and improving DSA skills.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  github: 'johndoe',
  joined_date: new Date('2024-06-15').toISOString(),
  is_own_profile: true,
};

/**
 * Mock user statistics
 */
export const mockUserStats: UserStats = {
  problems_solved: 42,
  easy_solved: 18,
  medium_solved: 20,
  hard_solved: 4,
  total_submissions: 127,
  acceptance_rate: 66.9,
  current_streak: 7,
  longest_streak: 15,
  rank: 12543,
};

/**
 * Mock language usage data
 */
export const mockLanguageUsage: LanguageUsage[] = [
  { language: 'Python', count: 25, percentage: 59.5 },
  { language: 'JavaScript', count: 10, percentage: 23.8 },
  { language: 'Java', count: 4, percentage: 9.5 },
  { language: 'C++', count: 2, percentage: 4.8 },
  { language: 'Go', count: 1, percentage: 2.4 },
];

/**
 * Mock solved problems list
 */
export const mockSolvedProblems: SolvedProblem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    language: 'python',
  },
  {
    id: '15',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['String', 'Stack'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    language: 'javascript',
  },
  {
    id: '28',
    title: 'Binary Search',
    difficulty: 'easy',
    tags: ['Array', 'Binary Search'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    language: 'java',
  },
  {
    id: '7',
    title: 'Reverse Integer',
    difficulty: 'easy',
    tags: ['Math'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    language: 'python',
  },
  {
    id: '13',
    title: 'Roman to Integer',
    difficulty: 'easy',
    tags: ['Hash Table', 'Math', 'String'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    language: 'python',
  },
  {
    id: '42',
    title: 'Merge Intervals',
    difficulty: 'medium',
    tags: ['Array', 'Sorting'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    language: 'python',
  },
  {
    id: '33',
    title: 'Valid Sudoku',
    difficulty: 'medium',
    tags: ['Array', 'Hash Table', 'Matrix'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    language: 'javascript',
  },
  {
    id: '48',
    title: 'Maximum Subarray Sum',
    difficulty: 'medium',
    tags: ['Array', 'Dynamic Programming'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    language: 'python',
  },
  {
    id: '35',
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    tags: ['String', 'Dynamic Programming'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    language: 'python',
  },
  {
    id: '44',
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    tags: ['Array', 'Prefix Sum'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    language: 'javascript',
  },
  // Add more to reach 42 total...
  ...Array.from({ length: 32 }, (_, i) => ({
    id: `${100 + i}`,
    title: `Problem ${100 + i}`,
    difficulty: (i < 10 ? 'easy' : i < 22 ? 'medium' : 'hard') as Difficulty,
    tags: ['Array', 'Dynamic Programming'],
    solved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (30 + i)).toISOString(),
    language: ['python', 'javascript', 'java', 'cpp'][i % 4],
  })),
];

/**
 * Mock submission calendar (365 days)
 */
export const mockSubmissionCalendar: SubmissionCalendarDay[] = generate365DayCalendar();

/**
 * Get formatted date for display
 * @param dateString - ISO 8601 date string
 */
export function formatProfileDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculate days since joining
 * @param joinDateString - ISO 8601 date string
 */
export function getDaysSinceJoining(joinDateString: string): number {
  const joinDate = new Date(joinDateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - joinDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get contribution level for heatmap (0-4)
 */
export function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
