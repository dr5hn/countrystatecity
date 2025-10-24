/**
 * @countrystatecity/countries-browser - Browser-native geographic data
 * Optimized for frontend/client-side usage with zero Node.js dependencies
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

// Export configuration
export {
  configure,
  resetConfiguration,
} from './config';

// Default export for convenience
export { getCountries as default } from './loaders';
