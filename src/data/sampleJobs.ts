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

const now = new Date();
const minute = 60 * 1000;
const hour = 60 * minute;

export const sampleQueues: Queue[] = [
  {
    name: 'email-queue',
    isPaused: false,
    jobCounts: { completed: 1247, failed: 23, active: 3, waiting: 15, delayed: 8 },
  },
  {
    name: 'image-processing',
    isPaused: false,
    jobCounts: { completed: 892, failed: 12, active: 5, waiting: 42, delayed: 0 },
  },
  {
    name: 'payment-webhooks',
    isPaused: false,
    jobCounts: { completed: 3421, failed: 7, active: 1, waiting: 3, delayed: 2 },
  },
  {
    name: 'notifications',
    isPaused: true,
    jobCounts: { completed: 567, failed: 4, active: 0, waiting: 89, delayed: 12 },
  },
];

export const sampleJobs: Job[] = [
  {
    id: 'job-001',
    name: 'send-welcome-email',
    queue: 'email-queue',
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    data: { userId: 'usr_12345', template: 'welcome', locale: 'en' },
    createdAt: new Date(now.getTime() - 2 * hour),
    processedAt: new Date(now.getTime() - 2 * hour + 100),
    finishedAt: new Date(now.getTime() - 2 * hour + 1200),
    duration: 1100,
  },
  {
    id: 'job-002',
    name: 'process-invoice-pdf',
    queue: 'email-queue',
    status: 'active',
    progress: 67,
    attempts: 1,
    maxAttempts: 3,
    data: { invoiceId: 'inv_98765', format: 'pdf' },
    createdAt: new Date(now.getTime() - 30 * minute),
    processedAt: new Date(now.getTime() - 5 * minute),
  },
  {
    id: 'job-003',
    name: 'resize-avatar',
    queue: 'image-processing',
    status: 'failed',
    progress: 45,
    attempts: 3,
    maxAttempts: 3,
    data: { imageUrl: 'https://cdn.example.com/img/abc.jpg', sizes: [64, 128, 256] },
    createdAt: new Date(now.getTime() - 1 * hour),
    processedAt: new Date(now.getTime() - 55 * minute),
    finishedAt: new Date(now.getTime() - 50 * minute),
    failedReason: 'ImageProcessingError: Invalid image format - unsupported HEIC',
    duration: 5 * minute,
  },
  {
    id: 'job-004',
    name: 'stripe-webhook-handler',
    queue: 'payment-webhooks',
    status: 'waiting',
    progress: 0,
    attempts: 0,
    maxAttempts: 5,
    data: { eventId: 'evt_1234', type: 'payment_intent.succeeded' },
    createdAt: new Date(now.getTime() - 10 * minute),
  },
  {
    id: 'job-005',
    name: 'send-push-notification',
    queue: 'notifications',
    status: 'delayed',
    progress: 0,
    attempts: 0,
    maxAttempts: 3,
    data: { userId: 'usr_67890', title: 'New message', body: 'You have a new message' },
    createdAt: new Date(now.getTime() - 5 * minute),
    nextRunAt: new Date(now.getTime() + 15 * minute),
  },
  {
    id: 'job-006',
    name: 'generate-thumbnail',
    queue: 'image-processing',
    status: 'active',
    progress: 23,
    attempts: 1,
    maxAttempts: 3,
    data: { videoId: 'vid_abc123', timestamp: 30 },
    createdAt: new Date(now.getTime() - 15 * minute),
    processedAt: new Date(now.getTime() - 2 * minute),
  },
  {
    id: 'job-007',
    name: 'send-password-reset',
    queue: 'email-queue',
    status: 'completed',
    progress: 100,
    attempts: 1,
    maxAttempts: 3,
    data: { email: 'user@example.com', token: 'rst_xxxxx' },
    createdAt: new Date(now.getTime() - 45 * minute),
    processedAt: new Date(now.getTime() - 45 * minute + 50),
    finishedAt: new Date(now.getTime() - 45 * minute + 800),
    duration: 750,
  },
  {
    id: 'job-008',
    name: 'process-refund',
    queue: 'payment-webhooks',
    status: 'completed',
    progress: 100,
    attempts: 2,
    maxAttempts: 5,
    data: { refundId: 'ref_555', amount: 4999, currency: 'usd' },
    createdAt: new Date(now.getTime() - 3 * hour),
    processedAt: new Date(now.getTime() - 3 * hour + 200),
    finishedAt: new Date(now.getTime() - 3 * hour + 3500),
    duration: 3300,
  },
  {
    id: 'job-009',
    name: 'compress-video',
    queue: 'image-processing',
    status: 'waiting',
    progress: 0,
    attempts: 0,
    maxAttempts: 2,
    data: { videoId: 'vid_xyz789', quality: '1080p' },
    createdAt: new Date(now.getTime() - 8 * minute),
  },
  {
    id: 'job-010',
    name: 'daily-digest-email',
    queue: 'email-queue',
    status: 'delayed',
    progress: 0,
    attempts: 0,
    maxAttempts: 3,
    data: { batchSize: 1000, template: 'digest' },
    createdAt: new Date(now.getTime() - 20 * minute),
    nextRunAt: new Date(now.getTime() + 4 * hour),
  },
  {
    id: 'job-011',
    name: 'subscription-renewal',
    queue: 'payment-webhooks',
    status: 'failed',
    progress: 0,
    attempts: 5,
    maxAttempts: 5,
    data: { subscriptionId: 'sub_12345', customerId: 'cus_67890' },
    createdAt: new Date(now.getTime() - 6 * hour),
    processedAt: new Date(now.getTime() - 5 * hour),
    finishedAt: new Date(now.getTime() - 4 * hour),
    failedReason: 'PaymentError: Card declined - insufficient funds',
    duration: 1 * hour,
  },
  {
    id: 'job-012',
    name: 'send-order-confirmation',
    queue: 'email-queue',
    status: 'active',
    progress: 89,
    attempts: 1,
    maxAttempts: 3,
    data: { orderId: 'ord_99999', items: 3 },
    createdAt: new Date(now.getTime() - 3 * minute),
    processedAt: new Date(now.getTime() - 1 * minute),
  },
];

export const getStats = () => {
  const stats = {
    completed: 0,
    failed: 0,
    active: 0,
    waiting: 0,
    delayed: 0,
    total: sampleJobs.length,
  };

  sampleJobs.forEach((job) => {
    stats[job.status]++;
  });

  return stats;
};

export const getNextJob = (): Job | undefined => {
  const delayedJobs = sampleJobs
    .filter((job) => job.status === 'delayed' && job.nextRunAt)
    .sort((a, b) => (a.nextRunAt!.getTime() - b.nextRunAt!.getTime()));
  
  return delayedJobs[0];
};
