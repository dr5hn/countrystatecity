import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCountries, getStatesOfCountry, getCitiesOfState, configure, clearCache } from '../../src';

/**
 * Integration tests for browser package
 * These tests simulate real-world usage with mocked fetch
 */

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Browser Package Integration Tests', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
    
    // Reset configuration
    configure({
      baseURL: '/data',
      cache: true,
      timeout: 5000,
    });
  });

  it('should handle country-state-city selection flow', async () => {
    // Mock countries list
    const mockCountries = [
      { id: 231, name: 'United States', iso2: 'US', iso3: 'USA' },
      { id: 38, name: 'Canada', iso2: 'CA', iso3: 'CAN' },
    ];
    
    // Mock states list
    const mockStates = [
      { id: 1416, name: 'California', iso2: 'CA', country_code: 'US' },
      { id: 1407, name: 'Texas', iso2: 'TX', country_code: 'US' },
    ];
    
    // Mock cities list
    const mockCities = [
      { id: 111149, name: 'Los Angeles', state_code: 'CA', country_code: 'US' },
      { id: 111303, name: 'San Francisco', state_code: 'CA', country_code: 'US' },
    ];

    // Setup fetch mocks
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockCountries })  // getCountries
      .mockResolvedValueOnce({ ok: true, json: async () => mockStates })     // getStatesOfCountry
      .mockResolvedValueOnce({ ok: true, json: async () => mockCities });    // getCitiesOfState

    // Step 1: Load countries
    const countries = await getCountries();
    expect(countries).toHaveLength(2);
    expect(countries[0].name).toBe('United States');

    // Step 2: Select USA and load states
    const selectedCountry = countries.find(c => c.iso2 === 'US');
    expect(selectedCountry).toBeDefined();
    
    const states = await getStatesOfCountry('US');
    expect(states).toHaveLength(2);
    expect(states[0].name).toBe('California');

    // Step 3: Select California and load cities
    const selectedState = states.find(s => s.iso2 === 'CA');
    expect(selectedState).toBeDefined();
    
    const cities = await getCitiesOfState('US', 'CA');
    expect(cities).toHaveLength(2);
    expect(cities[0].name).toBe('Los Angeles');
  });

  it('should use custom base URL from configuration', async () => {
    const customBaseURL = 'https://cdn.example.com/geodata';
    configure({ baseURL: customBaseURL });

    const mockCountries = [{ id: 1, name: 'Test', iso2: 'TS', iso3: 'TST' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries,
    });

    await getCountries();

    expect(global.fetch).toHaveBeenCalledWith(
      `${customBaseURL}/countries.json`,
      expect.any(Object)
    );
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(getCountries()).rejects.toThrow('Failed to fetch');
  });

  it('should cache data between requests', async () => {
    const mockCountries = [{ id: 1, name: 'Test', iso2: 'TS', iso3: 'TST' }];
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockCountries,
    });

    // First call
    await getCountries();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call (should use cache)
    await getCountries();
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call

    // Clear cache and try again
    clearCache();
    await getCountries();
    expect(global.fetch).toHaveBeenCalledTimes(2); // Now 2 calls
  });

  it.skip('should handle timeout configuration', async () => {
    // Note: Timeout testing is difficult with mocked fetch
    // This would need to be tested in a real browser environment
    configure({ timeout: 100 }); // Very short timeout

    // Mock a slow response that never resolves in time
    (global.fetch as any).mockImplementationOnce(
      () => new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => [],
          });
        }, 1000); // Longer than timeout
      })
    );

    await expect(getCountries()).rejects.toThrow();
  });

  it('should pass custom headers to fetch', async () => {
    configure({
      headers: {
        'Authorization': 'Bearer test-token',
        'X-Custom': 'custom-value',
      },
    });

    const mockCountries = [{ id: 1, name: 'Test', iso2: 'TS', iso3: 'TST' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCountries,
    });

    await getCountries();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'X-Custom': 'custom-value',
        }),
      })
    );
  });
});
