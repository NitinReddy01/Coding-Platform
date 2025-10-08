import type { Problem } from "../types";


export const mockProblem: Problem = {
  id: '1',
  title: 'Two Sum',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:

**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

## Example 2:

**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

## Example 3:

**Input:** nums = [3,3], target = 6
**Output:** [0,1]
`,
  difficulty: 'easy',
  constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
  time_limit: 2000,
  memory_limit: 128,
  tags: [
    { id: '1', name: 'Array' },
    { id: '2', name: 'Hash Table' },
  ],
  submissions: 1234567,
  accepted: 567890,
  author_id: 'mock-author-id',
  status: 'approved',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sample_test_cases: [
    {
      input: '[2,7,11,15]\n9',
      expected_output: '[0,1]',
    },
    {
      input: '[3,2,4]\n6',
      expected_output: '[1,2]',
    },
    {
      input: '[3,3]\n6',
      expected_output: '[0,1]',
    },
  ],
};

export const mockProblems: Problem[] = [
  mockProblem,
  {
    id: '2',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    difficulty: 'easy',
    time_limit: 1000,
    memory_limit: 64,
    tags: [
      { id: '3', name: 'String' },
      { id: '4', name: 'Stack' },
    ],
    submissions: 987654,
    accepted: 543210,
    author_id: 'mock-author-id',
    status: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sample_test_cases: [
      { input: '()', expected_output: 'true' },
      { input: '()[]{}', expected_output: 'true' },
      { input: '(]', expected_output: 'false' },
    ],
  },
];
