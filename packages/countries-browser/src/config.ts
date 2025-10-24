/**
 * Configuration management for @countrystatecity/countries-browser
 */

import type { ConfigOptions } from './types';

/**
 * Default configuration
 */
const defaultConfig: Required<ConfigOptions> = {
  baseURL: '/data',
  cache: true,
  timeout: 5000,
  headers: {},
};

/**
 * Current configuration (mutable)
 */
let currentConfig: Required<ConfigOptions> = { ...defaultConfig };

/**
 * Configure the package behavior
 *
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * import { configure } from '@countrystatecity/countries-browser';
 *
 * // Use CDN
 * configure({
 *   baseURL: 'https://cdn.example.com/geodata',
 * });
 *
 * // Custom headers
 * configure({
 *   headers: {
 *     'Authorization': 'Bearer token',
 *   },
 * });
 *
 * // Disable caching
 * configure({
 *   cache: false,
 * });
 * ```
 */
export function configure(options: ConfigOptions): void {
  currentConfig = {
    ...currentConfig,
    ...options,
    headers: {
      ...currentConfig.headers,
      ...(options.headers || {}),
    },
  };
}

/**
 * Get current configuration
 *
 * @returns Current configuration object
 */
export function getConfig(): Readonly<Required<ConfigOptions>> {
  return { ...currentConfig };
}

/**
 * Reset configuration to defaults
 *
 * @example
 * ```typescript
 * import { configure, resetConfiguration } from '@countrystatecity/countries-browser';
 *
 * configure({ baseURL: 'https://cdn.example.com' });
 * // ... later
 * resetConfiguration(); // Back to defaults
 * ```
 */
export function resetConfiguration(): void {
  currentConfig = { ...defaultConfig };
}
