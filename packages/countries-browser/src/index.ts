/**
 * @countrystatecity/countries-browser
 *
 * Browser-native countries, states, and cities database with lazy loading via fetch API
 *
 * @example
 * ```typescript
 * import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries-browser';
 *
 * // Get all countries
 * const countries = await getCountries();
 *
 * // Get states for a country
 * const states = await getStatesOfCountry('US');
 *
 * // Get cities in a state
 * const cities = await getCitiesOfState('US', 'CA');
 * ```
 *
 * @packageDocumentation
 */

// Export all types
export type {
  ICountry,
  ICountryMeta,
  IState,
  ICity,
  ITimezone,
  ITranslations,
  ConfigOptions,
  FetchOptions,
} from './types';

// Export all loaders
export {
  getCountries,
  getCountryByCode,
  getStatesOfCountry,
  getStateByCode,
  getCitiesOfState,
  getAllCitiesOfCountry,
  getAllCitiesInWorld,
  getCityById,
  clearCache,
} from './loaders';

// Export utilities
export {
  isValidCountryCode,
  isValidStateCode,
  searchCitiesByName,
  getCountryNameByCode,
  getStateNameByCode,
  getTimezoneForCity,
  getCountryTimezones,
} from './utils';

// Export configuration functions
export {
  configure,
  getConfig,
  resetConfiguration,
} from './config';

// Default export for convenience
export { getCountries as default } from './loaders';
