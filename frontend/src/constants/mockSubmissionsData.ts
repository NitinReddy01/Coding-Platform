/**
 * Mock data for submissions history page
 * Extended from mockActivityData with full code samples
 */

export interface SubmissionDetail {
  id: string;
  problem_id: string;
  problem_title: string;
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compilation_error';
  language: string;
  code: string;
  execution_time?: number; // in ms
  memory_used?: number; // in MB
  test_cases_passed?: number;
  test_cases_total?: number;
  error_message?: string;
  submitted_at: string; // ISO 8601 date string
}

/**
 * Extended mock submissions data (40 submissions)
 */
export const mockSubmissionsData: SubmissionDetail[] = [
  {
    id: 'sub-001',
    problem_id: '1',
    problem_title: 'Two Sum',
    status: 'accepted',
    language: 'python',
    code: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    execution_time: 52,
    memory_used: 14.2,
    test_cases_passed: 10,
    test_cases_total: 10,
    submitted_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
  },
  {
    id: 'sub-002',
    problem_id: '15',
    problem_title: 'Valid Parentheses',
    status: 'accepted',
    language: 'javascript',
    code: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };

    for (let char of s) {
        if (!map[char]) {
            stack.push(char);
        } else if (stack.pop() !== map[char]) {
            return false;
        }
    }

    return stack.length === 0;
}`,
    execution_time: 38,
    memory_used: 12.8,
    test_cases_passed: 8,
    test_cases_total: 8,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'sub-003',
    problem_id: '42',
    problem_title: 'Merge Intervals',
    status: 'wrong_answer',
    language: 'python',
    code: `def merge(intervals):
    if not intervals:
        return []

    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for interval in intervals[1:]:
        if interval[0] <= merged[-1][1]:
            merged[-1][1] = interval[1]  # Bug: should use max()
        else:
            merged.append(interval)

    return merged`,
    test_cases_passed: 3,
    test_cases_total: 7,
    error_message: 'Expected [[1,6],[8,10],[15,18]], but got [[1,5],[8,10],[15,18]]',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'sub-004',
    problem_id: '42',
    problem_title: 'Merge Intervals',
    status: 'accepted',
    language: 'python',
    code: `def merge(intervals):
    if not intervals:
        return []

    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for interval in intervals[1:]:
        if interval[0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], interval[1])
        else:
            merged.append(interval)

    return merged`,
    execution_time: 145,
    memory_used: 18.5,
    test_cases_passed: 7,
    test_cases_total: 7,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 'sub-005',
    problem_id: '28',
    problem_title: 'Binary Search',
    status: 'accepted',
    language: 'java',
    code: `public class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }
}`,
    execution_time: 28,
    memory_used: 15.3,
    test_cases_passed: 12,
    test_cases_total: 12,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'sub-006',
    problem_id: '51',
    problem_title: 'N-Queens',
    status: 'time_limit_exceeded',
    language: 'cpp',
    code: `class Solution {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> result;
        vector<string> board(n, string(n, '.'));

        // Inefficient backtracking without pruning
        solve(board, 0, result);
        return result;
    }

private:
    void solve(vector<string>& board, int row, vector<vector<string>>& result) {
        if (row == board.size()) {
            result.push_back(board);
            return;
        }

        for (int col = 0; col < board.size(); col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 'Q';
                solve(board, row + 1, result);
                board[row][col] = '.';
            }
        }
    }

    bool isValid(vector<string>& board, int row, int col) {
        // Check column and diagonals (inefficient)
        for (int i = 0; i < row; i++) {
            for (int j = 0; j < board.size(); j++) {
                if (board[i][j] == 'Q' && (j == col || abs(i - row) == abs(j - col))) {
                    return false;
                }
            }
        }
        return true;
    }
};`,
    test_cases_passed: 2,
    test_cases_total: 5,
    error_message: 'Time Limit Exceeded on test case 3 (n=12)',
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'sub-007',
    problem_id: '48',
    problem_title: 'Maximum Subarray Sum',
    status: 'accepted',
    language: 'python',
    code: `def maxSubArray(nums):
    # Kadane's algorithm
    max_sum = current_sum = nums[0]

    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)

    return max_sum`,
    execution_time: 78,
    memory_used: 16.7,
    test_cases_passed: 15,
    test_cases_total: 15,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'sub-008',
    problem_id: '33',
    problem_title: 'Valid Sudoku',
    status: 'runtime_error',
    language: 'javascript',
    code: `function isValidSudoku(board) {
    const rows = new Array(9).fill(null).map(() => new Set());
    const cols = new Array(9).fill(null).map(() => new Set());
    const boxes = new Array(9).fill(null).map(() => new Set());

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const num = board[i][j];
            if (num === '.') continue;

            const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);

            if (rows[i].has(num) || cols[j].has(num) || boxes[boxIndex].has(num)) {
                return false;
            }

            rows[i].add(num);
            cols[j].add(num);
            boxes[boxIndex].add(num);  // Bug: accessing undefined
        }
    }

    return true;
}`,
    test_cases_passed: 0,
    test_cases_total: 10,
    error_message: "TypeError: Cannot read property 'add' of undefined at line 16",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'sub-009',
    problem_id: '33',
    problem_title: 'Valid Sudoku',
    status: 'accepted',
    language: 'javascript',
    code: `function isValidSudoku(board) {
    const rows = new Array(9).fill(null).map(() => new Set());
    const cols = new Array(9).fill(null).map(() => new Set());
    const boxes = new Array(9).fill(null).map(() => new Set());

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const num = board[i][j];
            if (num === '.') continue;

            const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);

            if (rows[i].has(num) || cols[j].has(num) || boxes[boxIndex].has(num)) {
                return false;
            }

            rows[i].add(num);
            cols[j].add(num);
            boxes[boxIndex].add(num);
        }
    }

    return true;
}`,
    execution_time: 95,
    memory_used: 13.9,
    test_cases_passed: 10,
    test_cases_total: 10,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'sub-010',
    problem_id: '7',
    problem_title: 'Reverse Integer',
    status: 'accepted',
    language: 'python',
    code: `def reverse(x):
    sign = -1 if x < 0 else 1
    x = abs(x)

    result = 0
    while x:
        result = result * 10 + x % 10
        x //= 10

    result *= sign

    # Check for 32-bit integer overflow
    if result < -2**31 or result > 2**31 - 1:
        return 0

    return result`,
    execution_time: 42,
    memory_used: 14.1,
    test_cases_passed: 12,
    test_cases_total: 12,
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
  },
  // Additional submissions for pagination testing
  ...generateMoreSubmissions(),
];

/**
 * Generate additional submissions for testing
 */
function generateMoreSubmissions(): SubmissionDetail[] {
  const additionalSubmissions: SubmissionDetail[] = [];
  const problems = [
    { id: '2', title: 'Add Two Numbers', difficulty: 'medium' },
    { id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium' },
    { id: '4', title: 'Median of Two Sorted Arrays', difficulty: 'hard' },
    { id: '5', title: 'Longest Palindromic Substring', difficulty: 'medium' },
    { id: '8', title: 'String to Integer (atoi)', difficulty: 'medium' },
    { id: '10', title: 'Regular Expression Matching', difficulty: 'hard' },
    { id: '11', title: 'Container With Most Water', difficulty: 'medium' },
    { id: '13', title: 'Roman to Integer', difficulty: 'easy' },
    { id: '14', title: 'Longest Common Prefix', difficulty: 'easy' },
    { id: '19', title: 'Remove Nth Node From End of List', difficulty: 'medium' },
  ];

  const statuses: SubmissionDetail['status'][] = ['accepted', 'accepted', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'];
  const languages = ['python', 'javascript', 'java', 'cpp', 'go'];

  for (let i = 0; i < 30; i++) {
    const problem = problems[i % problems.length];
    const status = statuses[i % statuses.length];
    const language = languages[i % languages.length];
    const daysAgo = 5 + Math.floor(i / 2);

    additionalSubmissions.push({
      id: `sub-${String(i + 11).padStart(3, '0')}`,
      problem_id: problem.id,
      problem_title: problem.title,
      status,
      language,
      code: `// ${language} solution for ${problem.title}\n// Submission ${i + 11}\n\nfunction solve() {\n    // Implementation here\n    return result;\n}`,
      execution_time: status === 'accepted' ? 30 + Math.random() * 100 : undefined,
      memory_used: status === 'accepted' ? 12 + Math.random() * 8 : undefined,
      test_cases_passed: status === 'accepted' ? 10 : Math.floor(Math.random() * 5),
      test_cases_total: 10,
      error_message: status !== 'accepted' ? `Error in test case ${Math.floor(Math.random() * 5) + 1}` : undefined,
      submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString(),
    });
  }

  return additionalSubmissions;
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

/**
 * Get relative time string
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
 * Format date for display
 * @param dateString - ISO 8601 date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
