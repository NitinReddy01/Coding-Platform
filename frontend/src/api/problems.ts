import type { AxiosInstance } from 'axios';
import type { Language, Problem, ProblemMode, TestCase } from '../types';
import type { PaginatedProblemsResponse } from '../types/problemList';
import type { ProblemInput } from '../types/problem-form';

export interface ValidatorTestResult {
  test_case_id: string;
  input: string;
  expected: string;
  passed: boolean;
  error?: string;
  debug_output?: string; // stderr from validator for debugging
  is_sample: boolean; // whether this is a sample test case (visible to users)
  order_index: number;
}

export interface ValidateValidatorResponse {
  valid: boolean;
  results: ValidatorTestResult[];
  message?: string;
}

export const fetchProblem = async (
  axiosInstance: AxiosInstance,
  id: string,
  mode:ProblemMode
): Promise<Problem> => {
  const response = await axiosInstance.get<{problem:Problem}>(`/problems/${id}?mode=${mode}`);
  return response.data.problem;
};


export const fetchProblems = async (
  axiosInstance: AxiosInstance,
  filters?: {
    difficulty?: string;
    tags?: string[];
    search?: string;
  }
): Promise<Problem[]> => {
  const response = await axiosInstance.get<Problem[]>('/problems', {
    params: filters,
  });
  return response.data;
};

export const fetchLanguages = async (axios:AxiosInstance,): Promise<Language[]> =>  {
  const response = await axios.get<Language[]>('/problems/languages');
  return response.data;
}

export const fetchProblemsList = async (
  axiosInstance: AxiosInstance,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedProblemsResponse> => {
  const response = await axiosInstance.get<PaginatedProblemsResponse>('/problems', {
    params: { page, limit },
  });
  return response.data;
};


export const createProblem = async (
  axiosInstance: AxiosInstance,
  problemData: ProblemInput
): Promise<void> => {
  await axiosInstance.post('/problems', problemData);
};


export const testValidator = async (
  axiosInstance: AxiosInstance,
  validatorCode: string,
  validatorLanguage: string,
  testCases: TestCase[]
): Promise<ValidateValidatorResponse> => {
  const response = await axiosInstance.post<ValidateValidatorResponse>(
    '/problems/validate-validator',
    {
      validator_code: validatorCode,
      validator_language: validatorLanguage,
      test_cases: testCases,
    }
  );
  return response.data;
};
