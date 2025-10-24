import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configure, resetConfiguration, getConfig } from '../../src/config';

describe('Configuration', () => {
  beforeEach(() => {
    resetConfiguration();
  });

  it('should have default configuration', () => {
    const config = getConfig();
    
    expect(config.baseURL).toBe('/data');
    expect(config.cache).toBe(true);
    expect(config.timeout).toBe(5000);
    expect(config.headers).toEqual({});
  });

  it('should update configuration', () => {
    configure({
      baseURL: 'https://cdn.example.com/countries',
      cache: false,
      timeout: 10000,
    });

    const config = getConfig();
    expect(config.baseURL).toBe('https://cdn.example.com/countries');
    expect(config.cache).toBe(false);
    expect(config.timeout).toBe(10000);
  });

  it('should merge partial configuration', () => {
    configure({ baseURL: 'https://custom.url' });

    const config = getConfig();
    expect(config.baseURL).toBe('https://custom.url');
    expect(config.cache).toBe(true); // Should retain default
    expect(config.timeout).toBe(5000); // Should retain default
  });

  it('should reset to defaults', () => {
    configure({
      baseURL: 'https://custom.url',
      cache: false,
      timeout: 1000,
    });

    resetConfiguration();

    const config = getConfig();
    expect(config.baseURL).toBe('/data');
    expect(config.cache).toBe(true);
    expect(config.timeout).toBe(5000);
  });

  it('should allow custom headers', () => {
    configure({
      headers: {
        'Authorization': 'Bearer token123',
        'X-Custom': 'value',
      },
    });

    const config = getConfig();
    expect(config.headers).toEqual({
      'Authorization': 'Bearer token123',
      'X-Custom': 'value',
    });
  });
});
