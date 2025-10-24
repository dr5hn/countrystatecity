import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCountries, getCountryByCode, getStatesOfCountry, getCitiesOfState, clearCache } from '../../src/loaders';

// Mock fetch globally
global.fetch = vi.fn();

describe('Browser Loaders', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
    // Reset mock
    vi.clearAllMocks();
  });

  describe('getCountries', () => {
    it('should fetch and return countries', async () => {
      const mockCountries = [
        { id: 1, name: 'United States', iso2: 'US', iso3: 'USA' },
        { id: 2, name: 'Canada', iso2: 'CA', iso3: 'CAN' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountries,
      });

      const countries = await getCountries();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/countries.json'),
        expect.any(Object)
      );
      expect(countries).toHaveLength(2);
      expect(countries[0].name).toBe('United States');
    });

    it('should cache results', async () => {
      const mockCountries = [{ id: 1, name: 'Test', iso2: 'TS', iso3: 'TST' }];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockCountries,
      });

      await getCountries();
      await getCountries(); // Second call

      // Fetch should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getCountries()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getCountryByCode', () => {
    it('should fetch country metadata', async () => {
      const mockCountry = {
        id: 1,
        name: 'United States',
        iso2: 'US',
        timezones: [],
        translations: {},
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCountry,
      });

      const country = await getCountryByCode('US');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/country/US.json'),
        expect.any(Object)
      );
      expect(country).not.toBeNull();
      expect(country?.name).toBe('United States');
    });

    it('should return null for non-existent country', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      const country = await getCountryByCode('XX');
      expect(country).toBeNull();
    });
  });

  describe('getStatesOfCountry', () => {
    it('should fetch states for a country', async () => {
      const mockStates = [
        { id: 1, name: 'California', iso2: 'CA', country_code: 'US' },
        { id: 2, name: 'Texas', iso2: 'TX', country_code: 'US' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStates,
      });

      const states = await getStatesOfCountry('US');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/states/US.json'),
        expect.any(Object)
      );
      expect(states).toHaveLength(2);
      expect(states[0].name).toBe('California');
    });

    it('should return empty array for country without states', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      const states = await getStatesOfCountry('XX');
      expect(states).toEqual([]);
    });
  });

  describe('getCitiesOfState', () => {
    it('should fetch cities for a state', async () => {
      const mockCities = [
        { id: 1, name: 'Los Angeles', state_code: 'CA', country_code: 'US' },
        { id: 2, name: 'San Francisco', state_code: 'CA', country_code: 'US' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCities,
      });

      const cities = await getCitiesOfState('US', 'CA');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cities/US-CA.json'),
        expect.any(Object)
      );
      expect(cities).toHaveLength(2);
      expect(cities[0].name).toBe('Los Angeles');
    });

    it('should return empty array for non-existent state', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      const cities = await getCitiesOfState('US', 'XX');
      expect(cities).toEqual([]);
    });
  });
});
