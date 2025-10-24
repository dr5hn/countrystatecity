/**
 * Fetch-based data loaders for @countrystatecity/countries-browser
 * Uses the Fetch API for browser-compatible data loading
 */

import type { ICountry, ICountryMeta, IState, ICity, FetchOptions } from './types';
import { getConfig } from './config';

// In-memory cache for loaded data
const cache = new Map<string, any>();

/**
 * Load JSON data using fetch API
 * @param path - Relative path to JSON file
 * @param options - Fetch options
 * @returns Promise with parsed JSON data
 */
async function loadJSON<T>(path: string, options?: FetchOptions): Promise<T> {
  const config = getConfig();
  const fullPath = `${config.baseURL}${path}`;
  
  // Check cache first if caching is enabled
  if (config.cache && cache.has(fullPath)) {
    return cache.get(fullPath);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(fullPath, {
      cache: config.cache ? 'default' : 'no-store',
      headers: config.headers,
      signal: options?.signal || controller.signal,
      // @ts-ignore - priority is experimental but widely supported
      priority: options?.priority || 'auto',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fullPath}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Store in cache
    if (config.cache) {
      cache.set(fullPath, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${config.timeout}ms: ${fullPath}`);
    }
    throw error;
  }
}

/**
 * Clear the internal cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get lightweight list of all countries
 * @returns Promise with array of countries (basic info only)
 * @bundle ~130KB - Loads countries.json
 */
export async function getCountries(): Promise<ICountry[]> {
  return loadJSON<ICountry[]>('/countries.json');
}

/**
 * Get full country metadata including timezones and translations
 * @param countryCode - ISO2 country code (e.g., 'US', 'IN')
 * @returns Promise with full country metadata or null if not found
 * @bundle ~5KB per country - Loads country/{ISO2}.json
 */
export async function getCountryByCode(countryCode: string): Promise<ICountryMeta | null> {
  try {
    return await loadJSON<ICountryMeta>(`/country/${countryCode}.json`);
  } catch (error) {
    // Country not found or file doesn't exist
    return null;
  }
}

/**
 * Get all states/provinces for a specific country
 * @param countryCode - ISO2 country code
 * @returns Promise with array of states or empty array if not found
 * @bundle ~10-100KB depending on country - Loads states/{ISO2}.json
 */
export async function getStatesOfCountry(countryCode: string): Promise<IState[]> {
  try {
    return await loadJSON<IState[]>(`/states/${countryCode}.json`);
  } catch (error) {
    // Country not found or has no states
    return [];
  }
}

/**
 * Get specific state by code
 * @param countryCode - ISO2 country code
 * @param stateCode - State code (e.g., 'CA', 'TX')
 * @returns Promise with state object or null if not found
 * @bundle Same as getStatesOfCountry - filters in memory
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
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @returns Promise with array of cities or empty array if not found
 * @bundle ~5-200KB depending on state - Loads cities/{ISO2}-{STATE}.json
 */
export async function getCitiesOfState(
  countryCode: string,
  stateCode: string
): Promise<ICity[]> {
  try {
    return await loadJSON<ICity[]>(`/cities/${countryCode}-${stateCode}.json`);
  } catch (error) {
    // State not found or has no cities
    return [];
  }
}

/**
 * Get ALL cities in an entire country
 * WARNING: Large data size - loads all state city files for the country
 * @param countryCode - ISO2 country code
 * @returns Promise with array of all cities in country
 * @bundle Large - loads multiple city files
 */
export async function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]> {
  const states = await getStatesOfCountry(countryCode);
  const allCities: ICity[] = [];

  // Load cities for each state
  for (const state of states) {
    const cities = await getCitiesOfState(countryCode, state.iso2);
    allCities.push(...cities);
  }

  return allCities;
}

/**
 * Get every city globally
 * WARNING: MASSIVE data (8MB+) - rarely needed, use sparingly
 * @returns Promise with array of all cities worldwide
 * @bundle 8MB+ - loads ALL city files
 */
export async function getAllCitiesInWorld(): Promise<ICity[]> {
  const countries = await getCountries();
  const allCities: ICity[] = [];

  // Load cities for each country
  for (const country of countries) {
    const cities = await getAllCitiesOfCountry(country.iso2);
    allCities.push(...cities);
  }

  return allCities;
}

/**
 * Get specific city by ID
 * @param countryCode - ISO2 country code
 * @param stateCode - State code
 * @param cityId - Database city ID
 * @returns Promise with city object or null if not found
 * @bundle Same as getCitiesOfState - filters in memory
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
