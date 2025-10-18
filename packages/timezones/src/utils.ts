import type { ITimezone, IConvertedTime } from './types';
import { getTimezones, getTimezoneInfo } from './loaders';

/**
 * Convert time from one timezone to another
 * @param time - Time to convert (ISO string or Date object)
 * @param fromTimezone - Source timezone (IANA name)
 * @param toTimezone - Target timezone (IANA name)
 * @returns Promise resolving to converted time information
 */
export async function convertTime(
  time: string | Date,
  fromTimezone: string,
  toTimezone: string
): Promise<IConvertedTime> {
  const inputDate = typeof time === 'string' ? new Date(time) : time;
  
  // Get time in source timezone
  const fromTime = inputDate.toLocaleString('en-US', { timeZone: fromTimezone });
  const fromDate = new Date(fromTime);
  
  // Get time in target timezone
  const toTime = inputDate.toLocaleString('en-US', { timeZone: toTimezone });
  const toDate = new Date(toTime);
  
  // Calculate time difference in hours
  const timeDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);

  return {
    originalTime: fromDate.toISOString(),
    fromTimezone,
    convertedTime: toDate.toISOString(),
    toTimezone,
    timeDifference: timeDiff
  };
}

/**
 * Get current time in a specific timezone
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to current time as ISO string
 */
export async function getCurrentTime(timezoneName: string): Promise<string> {
  const info = await getTimezoneInfo(timezoneName);
  if (!info) {
    throw new Error(`Timezone ${timezoneName} not found`);
  }
  return info.currentTime;
}

/**
 * Check if daylight saving time is currently active in a timezone
 * @param timezoneName - IANA timezone name
 * @param date - Optional date to check (defaults to now)
 * @returns Promise resolving to true if DST is active
 */
export async function isDaylightSaving(
  timezoneName: string,
  date: Date = new Date()
): Promise<boolean> {
  // Get offsets for January and July to determine standard time
  const year = date.getFullYear();
  const january = new Date(year, 0, 1);
  const july = new Date(year, 6, 1);
  
  const janStr = january.toLocaleString('en-US', { timeZone: timezoneName });
  const julStr = july.toLocaleString('en-US', { timeZone: timezoneName });
  const dateStr = date.toLocaleString('en-US', { timeZone: timezoneName });
  
  const janOffset = new Date(janStr).getTimezoneOffset();
  const julOffset = new Date(julStr).getTimezoneOffset();
  const dateOffset = new Date(dateStr).getTimezoneOffset();
  
  // Standard time is when offset is maximum (most positive)
  const standardOffset = Math.max(janOffset, julOffset);
  
  // DST is active when current offset is less than standard offset
  return dateOffset < standardOffset;
}

/**
 * Get GMT/UTC offset for a timezone in seconds
 * @param timezoneName - IANA timezone name
 * @returns Promise resolving to offset in seconds
 */
export async function getGMTOffset(timezoneName: string): Promise<number> {
  const info = await getTimezoneInfo(timezoneName);
  if (!info) {
    throw new Error(`Timezone ${timezoneName} not found`);
  }
  return info.gmtOffset;
}

/**
 * Format GMT offset from seconds to string (e.g., "UTC-05:00")
 * @param offsetSeconds - Offset in seconds
 * @returns Formatted offset string
 */
export function formatGMTOffset(offsetSeconds: number): string {
  const hours = Math.floor(Math.abs(offsetSeconds) / 3600);
  const minutes = Math.floor((Math.abs(offsetSeconds) % 3600) / 60);
  const sign = offsetSeconds >= 0 ? '+' : '-';
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Validate if a timezone name is valid IANA timezone
 * @param timezoneName - Timezone name to validate
 * @returns Promise resolving to true if valid
 */
export async function isValidTimezone(timezoneName: string): Promise<boolean> {
  const timezones = await getTimezones();
  return timezones.some(tz => tz.zoneName === timezoneName);
}

/**
 * Search timezones by name (partial match)
 * @param searchTerm - Search term
 * @returns Promise resolving to matching timezones
 */
export async function searchTimezones(searchTerm: string): Promise<ITimezone[]> {
  const timezones = await getTimezones();
  const lowerSearch = searchTerm.toLowerCase();
  
  return timezones.filter(tz => 
    tz.zoneName.toLowerCase().includes(lowerSearch) ||
    tz.tzName.toLowerCase().includes(lowerSearch) ||
    tz.abbreviation.toLowerCase().includes(lowerSearch)
  );
}

/**
 * Get all unique timezone abbreviations
 * @returns Promise resolving to array of unique abbreviations
 */
export async function getUniqueAbbreviations(): Promise<string[]> {
  const timezones = await getTimezones();
  const abbreviations = new Set(timezones.map(tz => tz.abbreviation));
  return Array.from(abbreviations).sort();
}

/**
 * Get timezones by GMT offset
 * @param offsetSeconds - GMT offset in seconds
 * @returns Promise resolving to timezones with matching offset
 */
export async function getTimezonesByOffset(offsetSeconds: number): Promise<ITimezone[]> {
  const timezones = await getTimezones();
  return timezones.filter(tz => tz.gmtOffset === offsetSeconds);
}
