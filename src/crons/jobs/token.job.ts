import { db } from '@/configs/database.config';
import { tokens } from '@/models/schema';
import { removeTokenByCondition, searchTokenByCondition, updateTokenWithConditions } from '@/services/token.service';
import { tokenSchemaType } from '@/types/schema.type';
import { timeInVietNam } from '@/utils/time.helper';
import { and, eq, lt } from 'drizzle-orm';
import cron from 'node-cron';

export const revokeExpiredTokensJob = () => {
  cron.schedule(
    '*/1 * * * *',
    async () => {
      const now = timeInVietNam().toDate();
      try {
        const expiredTokenList = await db
          .select()
          .from(tokens)
          .where(and(eq(tokens.isActived, true), lt(tokens.expirationTime, now)));

        if (expiredTokenList.length) {
          await updateTokenWithConditions<tokenSchemaType>(
            { isActived: false },
            {
              expirationTime: {
                operator: 'lt',
                value: now
              }
            }
          );
        }

        console.log('[INFO] CRON_JOB: Updated invalid tokens successfully! Effected rows: ' + expiredTokenList.length);
      } catch (error) {
        console.error('[ERROR ❌] CRON_JOB: Failed to updated invalid tokens', error);
      }
    },
    { scheduled: true }
  );
};

export const clearExpiredTokenJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const expiredTokenList = await searchTokenByCondition({ isActived: false });
      await removeTokenByCondition({ isActived: false });
      console.log('[INFO] CRON_JOB: Clear expired tokens successfully! Effected rows: ' + expiredTokenList.length);
    } catch (error) {
      console.error('[ERROR ❌] CRON_JOB: Failed to clear expired tokens', error);
    }
  });
};
