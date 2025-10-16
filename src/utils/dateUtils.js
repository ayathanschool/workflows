// dateUtils.js - Utility functions for date handling

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * Adjusted for timezone to ensure the correct local date
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function todayLocalISO() {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(Date.now() - off).toISOString().slice(0, 10);
}

/**
 * Check if a date is a Friday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if the date is a Friday
 */
export function isFriday(date) {
  return new Date(date).getDay() === 5; // 0 = Sunday, 5 = Friday
}

/**
 * Get next week's date range (Monday-Friday)
 * @returns {Object} Object with start and end dates in ISO format
 */
export function getNextWeekDates() {
  const today = new Date();
  const nextMonday = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days until next Monday
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);
  
  return {
    start: nextMonday.toISOString().split('T')[0],
    end: nextFriday.toISOString().split('T')[0]
  };
}

/**
 * Check if date is between start and end dates (inclusive)
 * @param {string} dateToCheck - Date to check in ISO format
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {boolean} True if date is in range
 */
export function isDateInRange(dateToCheck, startDate, endDate) {
  const date = new Date(dateToCheck).getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return date >= start && date <= end;
}

/**
 * Returns true if the date is for the next week
 * @param {string} date - Date to check in ISO format
 * @returns {boolean} True if the date is in the next week
 */
export function isDateForNextWeek(date) {
  const nextWeek = getNextWeekDates();
  return isDateInRange(date, nextWeek.start, nextWeek.end);
}

/**
 * Format a date object or ISO string into a localized date string
 * @param {Date|string} date - Date object or ISO string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatLocalDate(date, options = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  weekday: 'long'
}) {
  if (typeof date === 'string') {
    date = new Date(date + 'T00:00:00');
  }
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date object or ISO string into a short date format
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Short formatted date string (e.g., "Aug 20, 2025")
 */
export function formatShortDate(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Handle ISO string
    date = new Date(date);
    if (isNaN(date.getTime())) return 'Invalid date';
  }
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Convert period number to time string (e.g., "09:00 - 09:45")
 * Can use custom period times from app settings if provided
 * @param {number|string} period - Period number (1-8)
 * @param {Array} [customPeriodTimes] - Optional custom period times from settings
 * @returns {string} Time range string
 */
export function periodToTimeString(period, customPeriodTimes = null) {
  // Convert string to number if needed
  period = parseInt(period, 10);
  
  // Use custom period times if provided
  if (customPeriodTimes && Array.isArray(customPeriodTimes)) {
    const customPeriod = customPeriodTimes.find(p => p.period === period);
    if (customPeriod && customPeriod.start && customPeriod.end) {
      return `${customPeriod.start} - ${customPeriod.end}`;
    }
  }
  
  // Default period map
  const periodMap = {
    1: "09:00 - 09:45",
    2: "09:45 - 10:30",
    3: "10:45 - 11:30",
    4: "11:30 - 12:15",
    5: "13:00 - 13:45",
    6: "13:45 - 14:30",
    7: "14:45 - 15:30",
    8: "15:30 - 16:15"
  };
  
  return periodMap[period] || `Period ${period}`;
}
