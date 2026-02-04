export type JobStatus = 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';

export interface Job {
  id: string;
  name: string;
  queue: string;
  status: JobStatus;
  progress: number;
  attempts: number;
  maxAttempts: number;
  data: Record<string, unknown>;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
  nextRunAt?: Date;
  failedReason?: string;
  duration?: number;
}

export interface Queue {
  name: string;
  isPaused: boolean;
  jobCounts: {
    completed: number;
    failed: number;
    active: number;
    waiting: number;
    delayed: number;
  };
}

export interface Stats {
  completed: number;
  failed: number;
  active: number;
  waiting: number;
  delayed: number;
  total: number;
}
