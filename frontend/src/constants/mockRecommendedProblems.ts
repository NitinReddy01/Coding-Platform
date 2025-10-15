/**
 * Mock data for recommended problems on the dashboard
 */

import type { Difficulty } from '../types/problem';

export interface RecommendedProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  acceptance_rate: number;
  tags: string[];
  description: string; // Brief description
  reason: string; // Why this problem is recommended
}

/**
 * Mock recommended problems based on user's skill level
 * These are problems the user hasn't solved yet
 */
export const mockRecommendedProblems: RecommendedProblem[] = [
  {
    id: '23',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    acceptance_rate: 52.3,
    tags: ['Dynamic Programming', 'Math'],
    description: 'Count the number of distinct ways to climb to the top of a staircase.',
    reason: 'Great introduction to dynamic programming',
  },
  {
    id: '35',
    title: 'Longest Palindromic Substring',
    difficulty: 'medium',
    acceptance_rate: 32.8,
    tags: ['String', 'Dynamic Programming'],
    description: 'Find the longest palindromic substring in a given string.',
    reason: 'Build on your string manipulation skills',
  },
  {
    id: '44',
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    acceptance_rate: 65.2,
    tags: ['Array', 'Prefix Sum'],
    description: 'Return an array where each element is the product of all other elements.',
    reason: 'Practice array manipulation without division',
  },
  {
    id: '52',
    title: 'Word Ladder',
    difficulty: 'hard',
    acceptance_rate: 38.5,
    tags: ['BFS', 'Graph', 'String'],
    description: 'Find the shortest transformation sequence from start word to end word.',
    reason: 'Challenge yourself with graph algorithms',
  },
];

/**
 * Get difficulty color classes for badges
 */
export function getDifficultyColorClass(difficulty: Difficulty): string {
  const colorMap: Record<Difficulty, string> = {
    easy: 'bg-gradient-success text-success-foreground',
    medium: 'bg-gradient-primary text-primary-foreground',
    hard: 'bg-destructive/90 text-destructive-foreground border border-destructive',
  };
  return colorMap[difficulty];
}
