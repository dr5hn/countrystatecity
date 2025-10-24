import { describe, it, expect, vi } from 'vitest';
import {
  isValidCountryCode,
  isValidStateCode,
  searchCitiesByName,
  getCountryNameByCode,
  getStateNameByCode,
} from '../../src/utils';

// Mock the loaders
vi.mock('../../src/loaders', () => ({
  getCountries: vi.fn(async () => [
    { id: 1, name: 'United States', iso2: 'US', iso3: 'USA' },
    { id: 2, name: 'Canada', iso2: 'CA', iso3: 'CAN' },
  ]),
  getStatesOfCountry: vi.fn(async (countryCode: string) => {
    if (countryCode === 'US') {
      return [
        { id: 1, name: 'California', iso2: 'CA', country_code: 'US' },
        { id: 2, name: 'Texas', iso2: 'TX', country_code: 'US' },
      ];
    }
    return [];
  }),
  getCitiesOfState: vi.fn(async (countryCode: string, stateCode: string) => {
    if (countryCode === 'US' && stateCode === 'CA') {
      return [
        { id: 1, name: 'Los Angeles', state_code: 'CA', country_code: 'US' },
        { id: 2, name: 'San Francisco', state_code: 'CA', country_code: 'US' },
        { id: 3, name: 'San Diego', state_code: 'CA', country_code: 'US' },
      ];
    }
    return [];
  }),
  getCountryByCode: vi.fn(async () => null),
}));

describe('Utilities', () => {
  describe('isValidCountryCode', () => {
    it('should return true for valid country code', async () => {
      const isValid = await isValidCountryCode('US');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid country code', async () => {
      const isValid = await isValidCountryCode('XX');
      expect(isValid).toBe(false);
    });
  });

  describe('isValidStateCode', () => {
    it('should return true for valid state code', async () => {
      const isValid = await isValidStateCode('US', 'CA');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid state code', async () => {
      const isValid = await isValidStateCode('US', 'XX');
      expect(isValid).toBe(false);
    });

    it('should return false for invalid country', async () => {
      const isValid = await isValidStateCode('XX', 'CA');
      expect(isValid).toBe(false);
    });
  });

  describe('searchCitiesByName', () => {
    it('should find cities with partial match', async () => {
      const cities = await searchCitiesByName('US', 'CA', 'san');
      expect(cities).toHaveLength(2);
      expect(cities[0].name).toBe('San Francisco');
      expect(cities[1].name).toBe('San Diego');
    });

    it('should be case-insensitive', async () => {
      const cities = await searchCitiesByName('US', 'CA', 'SAN');
      expect(cities).toHaveLength(2);
    });

    it('should return empty array when no matches', async () => {
      const cities = await searchCitiesByName('US', 'CA', 'xyz');
      expect(cities).toEqual([]);
    });
  });

  describe('getCountryNameByCode', () => {
    it('should return country name', async () => {
      const name = await getCountryNameByCode('US');
      expect(name).toBe('United States');
    });

    it('should return null for invalid code', async () => {
      const name = await getCountryNameByCode('XX');
      expect(name).toBeNull();
    });
  });

  describe('getStateNameByCode', () => {
    it('should return state name', async () => {
      const name = await getStateNameByCode('US', 'CA');
      expect(name).toBe('California');
    });

    it('should return null for invalid code', async () => {
      const name = await getStateNameByCode('US', 'XX');
      expect(name).toBeNull();
    });
  });
});
