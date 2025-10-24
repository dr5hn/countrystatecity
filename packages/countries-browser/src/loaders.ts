/**
 * Fetch-based data loaders for @countrystatecity/countries-browser
 *
 * These loaders use the Fetch API to load JSON data via HTTP requests,
 * enabling usage in browser environments without Node.js dependencies.
 */

import type { ICountry, ICountryMeta, IState, ICity } from './types';
import { getConfig } from './config';

/**
 * Internal cache for loaded data
 * Key: Full URL, Value: Parsed JSON data
 */
const cache = new Map<string, any>();

/**
 * Load JSON data via Fetch API with caching
 *
 * @param path - Relative path to JSON file (e.g., '/countries.json')
 * @returns Promise with parsed JSON data
 * @throws Error if fetch fails or times out
 */
async function loadJSON<T>(path: string): Promise<T> {
  const config = getConfig();
  const fullPath = `${config.baseURL}${path}`;

  // Check cache first
  if (cache.has(fullPath)) {
    return cache.get(fullPath) as T;
  }

  // Setup timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(fullPath, {
      signal: controller.signal,
      headers: config.headers,
      cache: config.cache ? 'default' : 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to load ${path}: HTTP ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Cache the result
    cache.set(fullPath, data);

    return data as T;
  } catch (error: any) {
    // Handle abort (timeout)
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout loading ${path} (${config.timeout}ms)`);
    }

    // Re-throw other errors
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get lightweight list of all countries
 *
 * @returns Promise with array of countries (basic info only)
 * @bundle ~130KB uncompressed, ~30KB gzipped
 *
 * @example
 * ```typescript
 * const countries = await getCountries();
 * console.log(countries[0]);
 * // { id: 1, name: "Afghanistan", iso2: "AF", emoji: "🇦🇫", ... }
 * ```
 */
export async function getCountries(): Promise<ICountry[]> {
  return loadJSON<ICountry[]>('/countries.json');
}

/**
 * Get full country metadata including timezones and translations
 *
 * @param countryCode - ISO2 country code (e.g., 'US', 'IN')
 * @returns Promise with full country metadata or null if not found
 * @bundle ~5-10KB per country
 *
 * @example
 * ```typescript
 * const us = await getCountryByCode('US');
 * console.log(us?.name); // "United States"
 * console.log(us?.timezones.length); // 11
 * console.log(us?.translations.es); // "Estados Unidos"
 * ```
 */
export async function getCountryByCode(countryCode: string): Promise<ICountryMeta | null> {
  try {
    return await loadJSON<ICountryMeta>(`/country/${countryCode}.json`);
  } catch (error) {
    // Return null if country not found (404 or other error)
    return null;
  }
}

/**
 * Get all states/provinces for a specific country
 *
 * @param countryCode - ISO2 country code
 * @returns Promise with array of states or empty array if not found
 * @bundle ~10-100KB depending on country
 *
 * @example
 * ```typescript
 * const usStates = await getStatesOfCountry('US');
 * console.log(usStates.length); // 51 (50 states + DC)
 * console.log(usStates[0]);
 * // { id: 1, name: "Alabama", iso2: "AL", ... }
 * ```
 */
export async function getStatesOfCountry(countryCode: string): Promise<IState[]> {
  try {
    return await loadJSON<IState[]>(`/states/${countryCode}.json`);
  } catch (error) {
    // Return empty array if states not found or country has no states
    return [];
  }
}

/**
 * Get specific state by code
 *
 * @param countryCode - ISO2 country code
 * @param stateCode - State code (e.g., 'CA', 'TX')
 * @returns Promise with state object or null if not found
 * @bundle Same as getStatesOfCountry - filters in memory
 *
 * @example
 * ```typescript
 * const california = await getStateByCode('US', 'CA');
 * console.log(california?.name); // "California"
 * console.log(california?.latitude); // "36.77826100"
 * ```
 */
export async function getStateByCode(
  countryCode: string,
  stateCode: string
): Promise<IState | null> {
  const states = await getStatesOfCountry(countryCode);
  const state = states.find((s) => s.iso2 === stateCode);
  return state || null;
}

/**
 * Get all cities in a specific state
 *
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns Promise with array of cities or empty array if not found
 * @bundle ~5-200KB depending on state
 *
 * @example
 * ```typescript
 * const caCities = await getCitiesOfState('US', 'CA');
 * console.log(caCities.length); // ~1500 cities
 * console.log(caCities[0]);
 * // { id: 111, name: "Los Angeles", latitude: "34.05223", ... }
 * ```
 */
export async function getCitiesOfState(
  countryCode: string,
  stateCode: string
): Promise<ICity[]> {
  try {
    return await loadJSON<ICity[]>(`/cities/${countryCode}-${stateCode}.json`);
  } catch (error) {
    // Return empty array if cities not found or state has no cities
    return [];
  }
}

/**
 * Get ALL cities in an entire country
 *
 * ⚠️ WARNING: Large data size - loads all state city files for the country
 *
 * @param countryCode - ISO2 country code
 * @returns Promise with array of all cities in country
 * @bundle Large - multiple HTTP requests
 *
 * @example
 * ```typescript
 * const allUSCities = await getAllCitiesOfCountry('US');
 * console.log(allUSCities.length); // ~30,000+ cities
 * ```
 */
export async function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]> {
  const states = await getStatesOfCountry(countryCode);
  const allCities: ICity[] = [];

  // Load cities for each state in parallel
  const cityPromises = states.map((state) =>
    getCitiesOfState(countryCode, state.iso2)
  );

  const citiesArrays = await Promise.all(cityPromises);

  // Flatten results
  for (const cities of citiesArrays) {
    allCities.push(...cities);
  }

  return allCities;
}

/**
 * Get every city globally
 *
 * ⚠️ WARNING: MASSIVE data (8MB+) - rarely needed, use sparingly
 *
 * @returns Promise with array of all cities worldwide
 * @bundle 8MB+ - hundreds of HTTP requests
 *
 * @example
 * ```typescript
 * // Not recommended - extremely large dataset
 * const allCities = await getAllCitiesInWorld();
 * console.log(allCities.length); // 150,000+
 * ```
 */
export async function getAllCitiesInWorld(): Promise<ICity[]> {
  const countries = await getCountries();
  const allCities: ICity[] = [];

  // Load cities for each country
  // Note: This is very slow and data-heavy
  for (const country of countries) {
    const cities = await getAllCitiesOfCountry(country.iso2);
    allCities.push(...cities);
  }

  return allCities;
}

/**
 * Get specific city by ID
 *
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityId - Database city ID
 * @returns Promise with city object or null if not found
 * @bundle Same as getCitiesOfState - filters in memory
 *
 * @example
 * ```typescript
 * const city = await getCityById('US', 'CA', 111);
 * console.log(city?.name); // "Los Angeles"
 * ```
 */
export async function getCityById(
  countryCode: string,
  stateCode: string,
  cityId: number
): Promise<ICity | null> {
  const cities = await getCitiesOfState(countryCode, stateCode);
  const city = cities.find((c) => c.id === cityId);
  return city || null;
}

/**
 * Clear the internal cache
 *
 * Useful for forcing fresh data loads or freeing memory
 *
 * @example
 * ```typescript
 * // Load data
 * const countries = await getCountries();
 *
 * // Clear cache to free memory or force reload
 * clearCache();
 *
 * // Next call will fetch fresh data
 * const freshCountries = await getCountries();
 * ```
 */
export function clearCache(): void {
  cache.clear();
}
