# @countrystatecity/timezones

[![npm version](https://img.shields.io/npm/v/@countrystatecity/timezones)](https://www.npmjs.com/package/@countrystatecity/timezones)
[![npm downloads](https://img.shields.io/npm/dm/@countrystatecity/timezones)](https://www.npmjs.com/package/@countrystatecity/timezones)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@countrystatecity/timezones)](https://bundlephobia.com/package/@countrystatecity/timezones)
[![iOS Compatible](https://img.shields.io/badge/iOS-compatible-brightgreen)](https://github.com/dr5hn/countrystatecity)

Comprehensive timezone data with conversion utilities. Part of the [@countrystatecity](https://github.com/dr5hn/countrystatecity) ecosystem.

## ✨ Features

- 🌐 **392 IANA Timezones**: Complete timezone database
- 🗺️ **223 Countries**: Timezones organized by country
- 🔄 **Time Conversion**: Convert between timezones easily
- ⏰ **Current Time**: Get current time in any timezone
- 📅 **DST Support**: Detect daylight saving time
- 📱 **iOS Compatible**: No stack overflow errors
- 🚀 **Minimal Bundle**: <20KB initial load with lazy loading
- 📝 **TypeScript**: Full type definitions included
- 🔧 **Tree-Shakeable**: Only bundle what you use

## 📦 Installation

```bash
npm install @countrystatecity/timezones
```

```bash
yarn add @countrystatecity/timezones
```

```bash
pnpm add @countrystatecity/timezones
```

## 🚀 Quick Start

```typescript
import { 
  getTimezones, 
  getTimezonesByCountry,
  convertTime,
  getCurrentTime 
} from '@countrystatecity/timezones';

// Get all timezones (~74KB - lazy loaded)
const timezones = await getTimezones();
console.log(timezones.length); // 392

// Get timezones for a specific country (~0.3KB per country)
const usTimezones = await getTimezonesByCountry('US');
console.log(usTimezones);
// [
//   { zoneName: 'America/New_York', abbreviation: 'EST', ... },
//   { zoneName: 'America/Chicago', abbreviation: 'CST', ... },
//   ...
// ]

// Get current time in a timezone
const currentTime = await getCurrentTime('America/New_York');
console.log(currentTime); // "2025-10-18T08:30:00.000Z"

// Convert time between timezones
const converted = await convertTime(
  '2025-10-18 14:00',
  'America/New_York',
  'Asia/Tokyo'
);
console.log(converted);
// {
//   originalTime: "2025-10-18T14:00:00.000Z",
//   fromTimezone: "America/New_York",
//   convertedTime: "2025-10-19T04:00:00.000Z",
//   toTimezone: "Asia/Tokyo",
//   timeDifference: 14
// }
```

## 📖 API Reference

### Core Functions

#### `getTimezones()`

Get all available timezones.

```typescript
const timezones = await getTimezones();
// Returns: ITimezone[]
```

**Bundle Impact**: ~74KB

#### `getTimezonesByCountry(countryCode: string)`

Get timezones for a specific country.

```typescript
const timezones = await getTimezonesByCountry('US');
// Returns: ITimezone[]
```

**Parameters:**
- `countryCode` - ISO 3166-1 alpha-2 country code (e.g., 'US', 'IN')

**Bundle Impact**: ~0.3KB per country

#### `getTimezoneInfo(timezoneName: string)`

Get detailed information about a timezone including current time.

```typescript
const info = await getTimezoneInfo('America/New_York');
// Returns: ITimezoneInfo | null
```

**Returns:**
```typescript
{
  timezone: "America/New_York",
  currentTime: "2025-10-18T08:30:00.000Z",
  utcOffset: "UTC-05:00",
  isDST: false,
  gmtOffset: -18000
}
```

#### `getTimezoneAbbreviations()`

Get all timezone abbreviations (PST, EST, etc.).

```typescript
const abbreviations = await getTimezoneAbbreviations();
// Returns: ITimezoneAbbreviation[]
```

**Bundle Impact**: ~5KB

#### `getTimezonesByAbbreviation(abbreviation: string)`

Find timezones by abbreviation.

```typescript
const timezones = await getTimezonesByAbbreviation('EST');
// Returns: ITimezone[]
```

### Utility Functions

#### `convertTime(time, fromTimezone, toTimezone)`

Convert time from one timezone to another.

```typescript
const result = await convertTime(
  '2025-10-18 14:00',
  'America/New_York',
  'Europe/London'
);
// Returns: IConvertedTime
```

**Parameters:**
- `time` - Time to convert (ISO string or Date object)
- `fromTimezone` - Source timezone (IANA name)
- `toTimezone` - Target timezone (IANA name)

#### `getCurrentTime(timezoneName: string)`

Get current time in a specific timezone.

```typescript
const time = await getCurrentTime('Asia/Tokyo');
// Returns: string (ISO format)
```

#### `isDaylightSaving(timezoneName: string, date?: Date)`

Check if daylight saving time is active.

```typescript
const isDST = await isDaylightSaving('America/New_York');
// Returns: boolean
```

**Parameters:**
- `timezoneName` - IANA timezone name
- `date` - Optional date to check (defaults to now)

#### `getGMTOffset(timezoneName: string)`

Get GMT/UTC offset in seconds.

```typescript
const offset = await getGMTOffset('America/New_York');
// Returns: number (e.g., -18000 for UTC-05:00)
```

#### `formatGMTOffset(offsetSeconds: number)`

Format GMT offset from seconds to string.

```typescript
const formatted = formatGMTOffset(-18000);
// Returns: "UTC-05:00"
```

#### `isValidTimezone(timezoneName: string)`

Validate if a timezone name is valid.

```typescript
const isValid = await isValidTimezone('America/New_York');
// Returns: boolean
```

#### `searchTimezones(searchTerm: string)`

Search timezones by name (partial match).

```typescript
const results = await searchTimezones('america');
// Returns: ITimezone[]
```

#### `getUniqueAbbreviations()`

Get all unique timezone abbreviations.

```typescript
const abbreviations = await getUniqueAbbreviations();
// Returns: string[] (e.g., ['EST', 'PST', 'CST', ...])
```

#### `getTimezonesByOffset(offsetSeconds: number)`

Get timezones by GMT offset.

```typescript
const timezones = await getTimezonesByOffset(-18000); // UTC-05:00
// Returns: ITimezone[]
```

## 📊 TypeScript Types

```typescript
interface ITimezone {
  zoneName: string;        // "America/New_York"
  countryCode: string;     // "US"
  abbreviation: string;    // "EST"
  gmtOffset: number;       // -18000 (seconds)
  gmtOffsetName: string;   // "UTC-05:00"
  tzName: string;          // "Eastern Standard Time"
}

interface ITimezoneInfo {
  timezone: string;
  currentTime: string;     // ISO string
  utcOffset: string;       // "UTC-05:00"
  isDST: boolean;
  gmtOffset: number;
}

interface ITimezoneAbbreviation {
  abbreviation: string;    // "EST"
  name: string;           // "Eastern Standard Time"
  timezones: string[];    // ["America/New_York", ...]
}

interface IConvertedTime {
  originalTime: string;
  fromTimezone: string;
  convertedTime: string;
  toTimezone: string;
  timeDifference: number;  // hours
}
```

## 🌍 Real-World Examples

### Meeting Scheduler

```typescript
import { convertTime, getTimezonesByCountry } from '@countrystatecity/timezones';

async function scheduleMeeting(localTime: string, attendeeCountries: string[]) {
  const meetingTimes = [];
  
  for (const countryCode of attendeeCountries) {
    const timezones = await getTimezonesByCountry(countryCode);
    const primaryTz = timezones[0];
    
    const converted = await convertTime(
      localTime,
      'America/New_York',
      primaryTz.zoneName
    );
    
    meetingTimes.push({
      country: countryCode,
      timezone: primaryTz.zoneName,
      time: converted.convertedTime
    });
  }
  
  return meetingTimes;
}

// Schedule 2 PM EST meeting for US, UK, and Japan
const times = await scheduleMeeting('2025-10-18 14:00', ['US', 'GB', 'JP']);
```

### World Clock

```typescript
import { getTimezonesByCountry, getCurrentTime } from '@countrystatecity/timezones';

async function createWorldClock(countryCodes: string[]) {
  const clocks = [];
  
  for (const code of countryCodes) {
    const timezones = await getTimezonesByCountry(code);
    for (const tz of timezones) {
      const currentTime = await getCurrentTime(tz.zoneName);
      clocks.push({
        location: tz.tzName,
        timezone: tz.zoneName,
        currentTime,
        offset: tz.gmtOffsetName
      });
    }
  }
  
  return clocks;
}

const worldClock = await createWorldClock(['US', 'GB', 'IN', 'AU', 'JP']);
```

### DST Reminder

```typescript
import { isDaylightSaving, getTimezonesByCountry } from '@countrystatecity/timezones';

async function checkDSTStatus(countryCode: string) {
  const timezones = await getTimezonesByCountry(countryCode);
  
  const dstStatus = [];
  for (const tz of timezones) {
    const isDST = await isDaylightSaving(tz.zoneName);
    dstStatus.push({
      timezone: tz.tzName,
      isDST,
      message: isDST 
        ? '⚠️ Daylight Saving Time is active' 
        : '✓ Standard Time'
    });
  }
  
  return dstStatus;
}
```

## 📦 Bundle Size

| Action | Bundle Size |
|--------|-------------|
| Install package + import function | ~5KB |
| Load all timezones | ~74KB |
| Load timezones for one country | ~0.3KB |
| Load abbreviations | ~5KB |
| **Typical usage** | **~10KB** |

## 🔗 Related Packages

Part of the [@countrystatecity](https://github.com/dr5hn/countrystatecity) ecosystem:

- [@countrystatecity/countries](https://www.npmjs.com/package/@countrystatecity/countries) - Countries, states, and cities
- [@countrystatecity/timezones](https://www.npmjs.com/package/@countrystatecity/timezones) - This package
- More packages coming soon!

## 📄 License

[ODbL-1.0](https://github.com/dr5hn/countrystatecity/blob/main/LICENSE) © [dr5hn](https://github.com/dr5hn)

## 🤝 Contributing

Contributions are welcome! Please see the [main repository](https://github.com/dr5hn/countrystatecity) for contribution guidelines.

## 🔗 Links

- [GitHub Repository](https://github.com/dr5hn/countrystatecity)
- [NPM Package](https://www.npmjs.com/package/@countrystatecity/timezones)
- [Issues](https://github.com/dr5hn/countrystatecity/issues)
- [Documentation](https://github.com/dr5hn/countrystatecity/tree/main/packages/timezones)
