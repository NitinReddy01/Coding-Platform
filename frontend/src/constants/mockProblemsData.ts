import type { ProblemListItem, SolveStatus } from '../types/problemList';
import type { Difficulty } from '../types/problem';

// Common tags
const TAGS = {
  array: { id: '1', name: 'Array' },
  string: { id: '2', name: 'String' },
  hash_table: { id: '3', name: 'Hash Table' },
  dp: { id: '4', name: 'Dynamic Programming' },
  math: { id: '5', name: 'Math' },
  sorting: { id: '6', name: 'Sorting' },
  greedy: { id: '7', name: 'Greedy' },
  dfs: { id: '8', name: 'Depth-First Search' },
  bfs: { id: '9', name: 'Breadth-First Search' },
  tree: { id: '10', name: 'Tree' },
  binary_search: { id: '11', name: 'Binary Search' },
  two_pointers: { id: '12', name: 'Two Pointers' },
  sliding_window: { id: '13', name: 'Sliding Window' },
  stack: { id: '14', name: 'Stack' },
  queue: { id: '15', name: 'Queue' },
  heap: { id: '16', name: 'Heap' },
  graph: { id: '17', name: 'Graph' },
  backtracking: { id: '18', name: 'Backtracking' },
  bit_manipulation: { id: '19', name: 'Bit Manipulation' },
  linked_list: { id: '20', name: 'Linked List' },
};

// Helper to generate problem
const createProblem = (
  id: number,
  title: string,
  difficulty: Difficulty,
  tagKeys: string[],
  submissions: number,
  accepted: number,
  solveStatus: SolveStatus = 'unsolved'
): ProblemListItem => ({
  id: id.toString(),
  title,
  description: `<p>This is a ${difficulty} level problem about ${tagKeys.join(', ')}.</p>`,
  difficulty,
  constraints: '1 ≤ n ≤ 10^5',
  time_limit: 2000,
  memory_limit: 128,
  tags: tagKeys.map((key) => TAGS[key as keyof typeof TAGS]),
  submissions,
  accepted,
  acceptance_rate: Math.round((accepted / submissions) * 100),
  author_id: 'author-1',
  status: 'approved',
  created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  updated_at: new Date().toISOString(),
  sample_test_cases: [
    { input: 'sample input', expected_output: 'sample output' },
  ],
  solve_status: solveStatus,
});

/**
 * Mock problems data - 60 problems with variety
 */
export const MOCK_PROBLEMS: ProblemListItem[] = [
  // Easy problems (20)
  createProblem(1, 'Two Sum', 'easy', ['array', 'hash_table'], 5234567, 2891234, 'solved'),
  createProblem(2, 'Reverse String', 'easy', ['string', 'two_pointers'], 3456789, 2123456, 'solved'),
  createProblem(3, 'Palindrome Number', 'easy', ['math'], 2876543, 1987654, 'solved'),
  createProblem(4, 'Valid Parentheses', 'easy', ['string', 'stack'], 2456789, 1456789, 'attempted'),
  createProblem(5, 'Merge Two Sorted Lists', 'easy', ['linked_list'], 1987654, 1234567, 'unsolved'),
  createProblem(6, 'Remove Duplicates from Sorted Array', 'easy', ['array', 'two_pointers'], 1876543, 1345678, 'unsolved'),
  createProblem(7, 'Best Time to Buy and Sell Stock', 'easy', ['array', 'dp'], 2234567, 1123456, 'attempted'),
  createProblem(8, 'Valid Anagram', 'easy', ['string', 'hash_table', 'sorting'], 1765432, 1234567, 'solved'),
  createProblem(9, 'Binary Search', 'easy', ['array', 'binary_search'], 1654321, 1123456, 'unsolved'),
  createProblem(10, 'Majority Element', 'easy', ['array', 'hash_table'], 1543210, 987654, 'unsolved'),
  createProblem(11, 'Contains Duplicate', 'easy', ['array', 'hash_table', 'sorting'], 1876543, 1234567, 'unsolved'),
  createProblem(12, 'Missing Number', 'easy', ['array', 'math', 'bit_manipulation'], 1456789, 987654, 'unsolved'),
  createProblem(13, 'Move Zeroes', 'easy', ['array', 'two_pointers'], 1345678, 876543, 'unsolved'),
  createProblem(14, 'Plus One', 'easy', ['array', 'math'], 1234567, 765432, 'unsolved'),
  createProblem(15, 'Single Number', 'easy', ['array', 'bit_manipulation'], 1987654, 1456789, 'unsolved'),
  createProblem(16, 'Climbing Stairs', 'easy', ['dp', 'math'], 2123456, 1345678, 'unsolved'),
  createProblem(17, 'Maximum Subarray', 'easy', ['array', 'dp'], 1876543, 987654, 'unsolved'),
  createProblem(18, 'Reverse Linked List', 'easy', ['linked_list'], 1765432, 1123456, 'unsolved'),
  createProblem(19, 'Merge Sorted Array', 'easy', ['array', 'two_pointers', 'sorting'], 1654321, 876543, 'unsolved'),
  createProblem(20, 'Intersection of Two Arrays II', 'easy', ['array', 'hash_table', 'sorting'], 1543210, 987654, 'unsolved'),

  // Medium problems (30)
  createProblem(21, 'Add Two Numbers', 'medium', ['linked_list', 'math'], 3456789, 1456789, 'solved'),
  createProblem(22, 'Longest Substring Without Repeating Characters', 'medium', ['string', 'hash_table', 'sliding_window'], 4567890, 1876543, 'attempted'),
  createProblem(23, 'Container With Most Water', 'medium', ['array', 'two_pointers', 'greedy'], 2987654, 1234567, 'unsolved'),
  createProblem(24, '3Sum', 'medium', ['array', 'two_pointers', 'sorting'], 3234567, 987654, 'unsolved'),
  createProblem(25, 'Letter Combinations of a Phone Number', 'medium', ['string', 'backtracking'], 2123456, 1234567, 'unsolved'),
  createProblem(26, 'Generate Parentheses', 'medium', ['string', 'dp', 'backtracking'], 1987654, 1123456, 'unsolved'),
  createProblem(27, 'Remove Nth Node From End of List', 'medium', ['linked_list', 'two_pointers'], 2234567, 1456789, 'unsolved'),
  createProblem(28, 'Search in Rotated Sorted Array', 'medium', ['array', 'binary_search'], 2876543, 1234567, 'attempted'),
  createProblem(29, 'Combination Sum', 'medium', ['array', 'backtracking'], 2345678, 1123456, 'unsolved'),
  createProblem(30, 'Group Anagrams', 'medium', ['array', 'string', 'hash_table', 'sorting'], 2456789, 1456789, 'unsolved'),
  createProblem(31, 'Permutations', 'medium', ['array', 'backtracking'], 2567890, 1345678, 'unsolved'),
  createProblem(32, 'Rotate Image', 'medium', ['array', 'math'], 1987654, 987654, 'unsolved'),
  createProblem(33, 'Jump Game', 'medium', ['array', 'dp', 'greedy'], 2123456, 876543, 'unsolved'),
  createProblem(34, 'Merge Intervals', 'medium', ['array', 'sorting'], 2234567, 1123456, 'unsolved'),
  createProblem(35, 'Unique Paths', 'medium', ['dp', 'math'], 1876543, 1234567, 'unsolved'),
  createProblem(36, 'Minimum Path Sum', 'medium', ['array', 'dp'], 1765432, 987654, 'unsolved'),
  createProblem(37, 'Climbing Stairs', 'medium', ['dp', 'math'], 1654321, 876543, 'unsolved'),
  createProblem(38, 'Validate Binary Search Tree', 'medium', ['tree', 'dfs', 'bfs'], 2345678, 987654, 'unsolved'),
  createProblem(39, 'Binary Tree Level Order Traversal', 'medium', ['tree', 'bfs'], 2123456, 1234567, 'unsolved'),
  createProblem(40, 'Maximum Depth of Binary Tree', 'medium', ['tree', 'dfs', 'bfs'], 1987654, 1456789, 'unsolved'),
  createProblem(41, 'Construct Binary Tree from Preorder and Inorder Traversal', 'medium', ['tree', 'array', 'hash_table'], 1876543, 765432, 'unsolved'),
  createProblem(42, 'Kth Smallest Element in a BST', 'medium', ['tree', 'dfs', 'bfs'], 1765432, 987654, 'unsolved'),
  createProblem(43, 'Number of Islands', 'medium', ['array', 'dfs', 'bfs', 'graph'], 2456789, 1123456, 'unsolved'),
  createProblem(44, 'Course Schedule', 'medium', ['graph', 'dfs', 'bfs'], 1987654, 876543, 'unsolved'),
  createProblem(45, 'Implement Trie (Prefix Tree)', 'medium', ['tree', 'string'], 1765432, 987654, 'unsolved'),
  createProblem(46, 'Design Add and Search Words Data Structure', 'medium', ['tree', 'string', 'dfs'], 1543210, 765432, 'unsolved'),
  createProblem(47, 'Word Search', 'medium', ['array', 'backtracking'], 1876543, 876543, 'unsolved'),
  createProblem(48, 'Subsets', 'medium', ['array', 'backtracking', 'bit_manipulation'], 1654321, 987654, 'unsolved'),
  createProblem(49, 'Word Break', 'medium', ['string', 'dp'], 1987654, 876543, 'unsolved'),
  createProblem(50, 'Longest Increasing Subsequence', 'medium', ['array', 'dp', 'binary_search'], 1765432, 765432, 'unsolved'),

  // Hard problems (10)
  createProblem(51, 'Median of Two Sorted Arrays', 'hard', ['array', 'binary_search'], 2987654, 765432, 'unsolved'),
  createProblem(52, 'Regular Expression Matching', 'hard', ['string', 'dp', 'backtracking'], 1876543, 456789, 'unsolved'),
  createProblem(53, 'Merge k Sorted Lists', 'hard', ['linked_list', 'heap'], 1987654, 765432, 'unsolved'),
  createProblem(54, 'Trapping Rain Water', 'hard', ['array', 'two_pointers', 'dp', 'stack'], 2123456, 876543, 'unsolved'),
  createProblem(55, 'Wildcard Matching', 'hard', ['string', 'dp', 'greedy', 'backtracking'], 1654321, 456789, 'unsolved'),
  createProblem(56, 'Jump Game II', 'hard', ['array', 'dp', 'greedy'], 1543210, 543210, 'unsolved'),
  createProblem(57, 'Edit Distance', 'hard', ['string', 'dp'], 1765432, 654321, 'unsolved'),
  createProblem(58, 'Minimum Window Substring', 'hard', ['string', 'hash_table', 'sliding_window'], 1876543, 543210, 'unsolved'),
  createProblem(59, 'Largest Rectangle in Histogram', 'hard', ['array', 'stack'], 1654321, 456789, 'unsolved'),
  createProblem(60, 'Maximal Rectangle', 'hard', ['array', 'dp', 'stack'], 1543210, 432109, 'unsolved'),
];

/**
 * Get all unique tags from problems
 */
export const getAllTags = () => {
  const tagMap = new Map<string, { id: string; name: string }>();
  MOCK_PROBLEMS.forEach((problem) => {
    problem.tags.forEach((tag) => {
      tagMap.set(tag.id, tag);
    });
  });
  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Filter and paginate problems
 */
export const filterProblems = (
  search: string,
  difficulty: string,
  status: string,
  tags: string[],
  page: number,
  pageSize: number,
  sortField: string,
  sortOrder: 'asc' | 'desc'
) => {
  let filtered = [...MOCK_PROBLEMS];

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.id === searchLower ||
        p.tags.some((t) => t.name.toLowerCase().includes(searchLower))
    );
  }

  // Filter by difficulty
  if (difficulty !== 'all') {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }

  // Filter by status
  if (status !== 'all') {
    filtered = filtered.filter((p) => p.solve_status === status);
  }

  // Filter by tags
  if (tags.length > 0) {
    filtered = filtered.filter((p) =>
      tags.every((tagId) => p.tags.some((t) => t.id === tagId))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal: any = a[sortField as keyof ProblemListItem];
    let bVal: any = b[sortField as keyof ProblemListItem];

    // Handle numeric fields
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle string fields
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  // Paginate
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);

  return {
    problems: paginated,
    total,
    page,
    totalPages,
  };
};
