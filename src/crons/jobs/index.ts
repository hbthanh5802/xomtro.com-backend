import { revokeExpirePost } from '@/crons/jobs/post.job';
import { clearExpiredTokenJob, revokeExpiredTokensJob } from '@/crons/jobs/token.job';

export const startCronJobs = () => {
  console.log('[INFO] CRON_JOB: Started!');
  revokeExpiredTokensJob();
  clearExpiredTokenJob();
  revokeExpirePost();
};
