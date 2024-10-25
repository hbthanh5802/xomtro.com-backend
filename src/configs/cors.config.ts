import { env } from '@/configs/env.config';
import ApiError from '@/utils/ApiError.helper';
import { WHITELIST_DOMAIN } from '@/utils/constants.helper';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;

type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (error: Error | null, origin?: StaticOrigin) => void
) => void;

export const corsOptions = {
  origin: <CustomOrigin>function (requestOrigin, callback) {
    if (!requestOrigin && env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (requestOrigin && WHITELIST_DOMAIN.includes(requestOrigin)) {
      return callback(null, true);
    }

    return callback(new ApiError(StatusCodes.FORBIDDEN, `${requestOrigin} is not allowed by our CORS policy.`));
  },
  optionsSuccessStatus: 200,
  credentials: true
};
