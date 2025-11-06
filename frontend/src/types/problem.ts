export type Difficulty = 'easy' | 'medium' | 'hard';

export type RequestStatus = 'pending' | 'rejected' | 'approved' | 'requested_changes';

export interface Tag {
  id: string;
  name: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  difficulty: Difficulty;
  constraints?: string;
  time_limit: number;
  memory_limit: number;
  tags: Tag[];
  submissions: number;
  accepted: number;
  author_id: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  sample_test_cases: TestCase[];
}

export type ProblemMode = 'contest' | 'edit' | 'practice';

export interface TestCase {
  input: string;
  expected_output: string;
}

export interface Language {
  code: string;
  language: string;
  monaco_id: string;
  default_code: string;
}
