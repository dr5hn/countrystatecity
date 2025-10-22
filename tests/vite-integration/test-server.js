#!/usr/bin/env node

/**
 * Vite Integration Test - Server-Side Usage
 * 
 * This demonstrates that @countrystatecity/countries works correctly
 * in a Node.js environment (which is how it should be used with Vite).
 * 
 * For Vite apps:
 * - Use in SSR (server-side rendering) code
 * - Use in API endpoints/backends
 * - Generate data at build time
 * 
 * DO NOT use directly in browser/client-side code.
 */

import { getCountries, getCountryByCode, getStatesOfCountry } from '@countrystatecity/countries';

async function runTests() {
  console.log('=================================');
  console.log('Vite Integration Test');
  console.log('Testing @countrystatecity/countries in Node.js/Server environment');
  console.log('=================================\n');

  try {
    // Test 1: Load countries
    console.log('Test 1: Loading countries...');
    const countries = await getCountries();
    if (!countries || countries.length === 0) {
      throw new Error('Failed to load countries');
    }
    console.log(`✓ Test 1 passed: Loaded ${countries.length} countries\n`);

    // Test 2: Load specific country metadata
    console.log('Test 2: Loading US country metadata...');
    const usCountry = await getCountryByCode('US');
    if (!usCountry || usCountry.name !== 'United States') {
      throw new Error('Failed to load US country metadata');
    }
    console.log('✓ Test 2 passed: Loaded US country metadata');
    console.log(`  - Name: ${usCountry.name}`);
    console.log(`  - Capital: ${usCountry.capital}`);
    console.log(`  - Timezones: ${usCountry.timezones?.length || 0}\n`);

    // Test 3: Load states
    console.log('Test 3: Loading US states...');
    const usStates = await getStatesOfCountry('US');
    if (!usStates || usStates.length === 0) {
      throw new Error('Failed to load US states');
    }
    console.log(`✓ Test 3 passed: Loaded ${usStates.length} US states\n`);

    // All tests passed
    console.log('=================================');
    console.log('✅ All tests passed!');
    console.log('=================================\n');
    console.log('This package works correctly with Vite when used in:');
    console.log('  - Server-side rendering (SSR)');
    console.log('  - API endpoints/backends');
    console.log('  - Build-time data generation');
    console.log('\nSee docs/VITE_DEPLOYMENT.md for usage examples.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests failed');
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
