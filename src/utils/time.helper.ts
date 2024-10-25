import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

// Get datetime in UTC
export const getCurrentUtc = () => dayjs.utc();

// Get Vietnam time from UTC
export const timeInVietNam = () => dayjs.utc().add(7, 'hour');

// Format time to VN
export const formatTimeForVietnamese = (date: dayjs.Dayjs | Date) => {
  const dayjsDate = dayjs.isDayjs(date) ? date : dayjs.tz(date.toUTCString());
  return dayjsDate.locale('vi').format('HH:mm:ss DD/MM/YYYY ');
};
