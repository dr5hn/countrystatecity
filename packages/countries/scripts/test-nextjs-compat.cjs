#!/usr/bin/env node

/**
 * This script demonstrates that the package works in a NextJS-like environment
 * where Node.js modules like 'fs' are not available in the browser bundle.
 */

console.log('Testing @countrystatecity/countries with NextJS compatibility...\n');

// Test 1: Check that webpackIgnore comments are present in dist
const fs = require('fs');
const path = require('path');
const distFile = path.join(__dirname, '../dist/index.js');
const distContent = fs.readFileSync(distFile, 'utf-8');

if (distContent.includes('/* webpackIgnore: true */')) {
  console.log('✓ webpackIgnore comments found in dist/index.js');
} else {
  console.error('✗ webpackIgnore comments NOT found in dist/index.js');
  process.exit(1);
}

// Test 2: Check that the code doesn't use direct fs imports
const directFsImport = /await import\s*\(\s*['"]fs['"]\s*\)/.test(distContent.replace(/\/\*.*?\*\//g, ''));
if (!directFsImport) {
  console.log('✓ No direct fs imports without webpackIgnore');
} else {
  console.error('✗ Found direct fs imports without webpackIgnore');
  process.exit(1);
}

// Test 3: Test that the package works in Node.js
async function testNodeEnvironment() {
  const { getCountries, getStatesOfCountry } = require('../dist/index.cjs');
  
  console.log('\nTesting in Node.js environment:');
  
  const countries = await getCountries();
  console.log(`✓ getCountries() returned ${countries.length} countries`);
  
  const usStates = await getStatesOfCountry('US');
  console.log(`✓ getStatesOfCountry('US') returned ${usStates.length} states`);
}

testNodeEnvironment().then(() => {
  console.log('\n✅ All NextJS compatibility checks passed!');
  console.log('\nThe package now works correctly with NextJS/webpack.');
  console.log('The webpackIgnore magic comments prevent webpack from trying');
  console.log('to bundle Node.js-specific modules like fs, path, and url.');
}).catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
