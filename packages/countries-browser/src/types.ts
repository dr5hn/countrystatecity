/**
 * TypeScript interfaces for @world/countries package
 */

/**
 * Timezone information for a country
 */
export interface ITimezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

/**
 * Translations for country/state/city names
 */
export interface ITranslations {
  [languageCode: string]: string;
}

/**
 * Basic country information (lightweight)
 * Used in countries.json for fast loading
 */
export interface ICountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  subregion: string;
  nationality: string;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

/**
 * Full country metadata including timezones and translations
 * Used in {Country-CODE}/meta.json
 */
export interface ICountryMeta extends ICountry {
  timezones: ITimezone[];
  translations: ITranslations;
}

/**
 * State/Province information
 */
export interface IState {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  fips_code: string | null;
  iso2: string;
  type: string | null;
  latitude: string | null;
  longitude: string | null;
  native: string | null;
  timezone: string | null;
  translations: ITranslations;
}

/**
 * City information
 */
export interface ICity {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  country_id: number;
  country_code: string;
  latitude: string;
  longitude: string;
  native: string | null;
  timezone: string | null;
  translations: ITranslations;
}

/**
 * Configuration options for browser package
 */
export interface ConfigOptions {
  baseURL?: string;      // Base URL for data files
  cache?: boolean;       // Use browser cache
  timeout?: number;      // Request timeout in ms
  headers?: Record<string, string>;  // Custom headers
}

/**
 * Fetch options for data loading
 */
export interface FetchOptions {
  signal?: AbortSignal;  // For request cancellation
  priority?: 'high' | 'low' | 'auto';  // Fetch priority hint
}
