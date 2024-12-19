import { revokeExpirePost } from '@/crons/jobs/post.job';
import { clearExpiredTokenJob, revokeExpiredTokensJob } from '@/crons/jobs/token.job';
import cron from 'node-cron';

export const startCronJobs = () => {
  console.log('[INFO] CRON_JOB: Started!');
  cron.schedule('*/1 * * * *', () => {
    revokeExpiredTokensJob();
    revokeExpirePost();
  });
  clearExpiredTokenJob();
};
