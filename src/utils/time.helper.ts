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
export const formatTimeForVietnamese = (
  date: dayjs.Dayjs | Date,
  format: 'HH:mm:ss DD/MM/YYYY' | 'DD/MM/YYYY' = 'HH:mm:ss DD/MM/YYYY'
) => {
  const dayjsDate = dayjs.isDayjs(date) ? date : dayjs(date);

  return dayjsDate.locale('vi').format(format);
};

/**
 * Format a date value to 'YYYY-MM-DD' for input type="date".
 * @param date - The date to format.
 * @returns The formatted date string.
 */
export const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Convert a date string from input type="date" to UTC ISO format.
 * @param date - The date string to convert.
 * @returns The UTC ISO string.
 */
export const convertToUTC = (date: string): string => {
  return dayjs(date).utc().toISOString();
};

/**
 * Validate if a date is within a given range.
 * @param date - The date to validate.
 * @param minDate - The minimum allowed date.
 * @param maxDate - The maximum allowed date.
 * @returns A validation message or true if valid.
 */
export const validateDateRange = (date: string, minDate?: Date, maxDate?: Date): string | true => {
  const parsedDate = dayjs(date);

  if (minDate && parsedDate.isBefore(dayjs(minDate))) {
    return `Date must be after ${formatDateForInput(minDate)}`;
  }

  if (maxDate && parsedDate.isAfter(dayjs(maxDate))) {
    return `Date must be before ${formatDateForInput(maxDate)}`;
  }

  return true;
};
