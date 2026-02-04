import { Job, Queue, JobStatus } from '@/data/sampleJobs';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface JobsFilter {
  queue?: string;
  status?: JobStatus;
  search?: string;
}

interface Stats {
  completed: number;
  failed: number;
  active: number;
  waiting: number;
  delayed: number;
  total: number;
}

/**
 * Fetch all queues with job counts
 */
export async function fetchQueues(): Promise<Queue[]> {
  const response = await fetch(`${API_BASE_URL}/queues`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch queues: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch jobs with optional filters
 */
export async function fetchJobs(filters?: JobsFilter): Promise<Job[]> {
  const params = new URLSearchParams();
  
  if (filters?.queue) {
    params.append('queue', filters.queue);
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  
  const url = `${API_BASE_URL}/jobs${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Convert date strings to Date objects
  return data.map((job: any) => ({
    ...job,
    createdAt: new Date(job.createdAt),
    processedAt: job.processedAt ? new Date(job.processedAt) : undefined,
    finishedAt: job.finishedAt ? new Date(job.finishedAt) : undefined,
    nextRunAt: job.nextRunAt ? new Date(job.nextRunAt) : undefined,
  }));
}

/**
 * Fetch aggregate statistics
 */
export async function fetchStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch a specific job by queue and ID
 */
export async function fetchJobById(queue: string, id: string): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${queue}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch job: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Convert date strings to Date objects
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    processedAt: data.processedAt ? new Date(data.processedAt) : undefined,
    finishedAt: data.finishedAt ? new Date(data.finishedAt) : undefined,
    nextRunAt: data.nextRunAt ? new Date(data.nextRunAt) : undefined,
  };
}

/**
 * Health check
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  
  return response.json();
}
