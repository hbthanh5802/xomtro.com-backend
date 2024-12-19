import { selectPostsByConditions, updatePostByConditions } from '@/services/post.service';
import { timeInVietNam } from '@/utils/time.helper';

export const revokeExpirePost = async () => {
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
