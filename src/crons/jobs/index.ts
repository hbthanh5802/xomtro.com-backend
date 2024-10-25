import { revokeExpiredTokensJob } from '@/crons/jobs/token.job';

export const startCronJobs = () => {
  console.log('[INFO] CRON_JOB: Started!');
  revokeExpiredTokensJob();
};
