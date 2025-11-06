import type { AxiosInstance } from 'axios';
import type { Submission, SubmissionResponse, SubmissionStatusResponse, LatestSubmissionResponse } from '../types';

export const runCode = async (
  axiosInstance: AxiosInstance,
  code: string,
  language: string,
  problemId: string
): Promise<SubmissionResponse> => {
  const submission: Submission = {
    code,
    language,
    problem_id: problemId,
    type: 'run',
  };

  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions',
    submission
  );
  return response.data;
};

export const submitCode = async (
  axiosInstance: AxiosInstance,
  code: string,
  language: string,
  problemId: string
): Promise<SubmissionResponse> => {
  const submission: Submission = {
    code,
    language,
    problem_id: problemId,
    type: 'submit',
  };

  const response = await axiosInstance.post<SubmissionResponse>(
    '/submissions',
    submission
  );
  return response.data;
};

export const getSubmissionStatus = async (
  axiosInstance: AxiosInstance,
  submissionId: string
): Promise<SubmissionStatusResponse> => {
  const response = await axiosInstance.get<SubmissionStatusResponse>(
    `/submissions/status/${submissionId}`
  );
  return response.data;
};

export const getLatestSubmission = async (
  axiosInstance: AxiosInstance,
  problemId: string
): Promise<LatestSubmissionResponse> => {
  const response = await axiosInstance.get<LatestSubmissionResponse>(
    `/submissions/problem/${problemId}/latest`
  );
  return response.data;
};
