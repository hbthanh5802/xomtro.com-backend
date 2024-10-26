import { timeInVietNam } from '@/utils/time.helper';
import { v4 as uuidv4 } from 'uuid';

export const generateFileName = (fileName?: string) => {
  const now = timeInVietNam().toDate();

  const formatDate = `${now.getUTCDate().toString().padStart(2, '0')}-${(now.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getUTCFullYear()}_${now.getUTCHours().toString().padStart(2, '0')}-${now
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}-${now.getUTCSeconds().toString().padStart(2, '0')}`;

  return `${fileName ? fileName + '_' : ''}${uuidv4()}_${formatDate}`;
};
