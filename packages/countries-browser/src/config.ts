/**
 * Configuration for @countrystatecity/countries-browser
 */

import type { ConfigOptions } from './types';

// Default configuration
const defaultConfig: Required<ConfigOptions> = {
  baseURL: '/data',  // Relative to the app's public directory
  cache: true,
  timeout: 5000,
  headers: {},
};

// Current configuration (mutable)
let currentConfig: Required<ConfigOptions> = { ...defaultConfig };

/**
 * Configure the browser package
 * @param options - Configuration options
 */
export function configure(options: ConfigOptions): void {
  currentConfig = {
    ...currentConfig,
    ...options,
  };
}

/**
 * Reset configuration to defaults
 */
export function resetConfiguration(): void {
  currentConfig = { ...defaultConfig };
}

/**
 * Get current configuration
 * @returns Current configuration
 */
export function getConfig(): Required<ConfigOptions> {
  return { ...currentConfig };
}
