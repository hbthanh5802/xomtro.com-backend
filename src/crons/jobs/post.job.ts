import { selectPostsByConditions, updatePostByConditions } from '@/services/post.service';
import { timeInVietNam } from '@/utils/time.helper';
import cron from 'node-cron';

export const revokeExpirePost = () => {
  cron.schedule(
    '*/1 * * * *',
    async () => {
      await executeRevokeExpirePost();
      setTimeout(async () => {
        await executeRevokeExpirePost();
      }, 30 * 1000); // 30 giây
    },
    { scheduled: true }
  );
};

const executeRevokeExpirePost = async () => {
  const now = timeInVietNam().toDate();
  try {
    const willExpiredPosts = await selectPostsByConditions({
      status: {
        operator: 'ne',
        value: 'unactived'
      },
      expirationTime: {
        operator: 'lt',
        value: now
      }
    });
    if (willExpiredPosts.length) {
      await updatePostByConditions(
        { status: 'unactived' },
        {
          status: {
            operator: 'ne',
            value: 'unactived'
          },
          expirationTime: {
            operator: 'lt',
            value: now
          }
        }
      );
    }

    console.log('[INFO] CRON_JOB: Updated expired posts successfully! Effected rows: ' + willExpiredPosts.length);
  } catch (error) {
    console.error('[ERROR ❌] CRON_JOB: Failed to update expired posts', error);
  }
};
