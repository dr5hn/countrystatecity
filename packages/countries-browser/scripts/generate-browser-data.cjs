#!/usr/bin/env node

/**
 * Generate browser-optimized data structure from server package
 * 
 * Transforms:
 * - United_States-US/meta.json → country/US.json
 * - United_States-US/states.json → states/US.json
 * - United_States-US/California-CA/cities.json → cities/US-CA.json
 */

const fs = require('fs');
const path = require('path');
const { gzip } = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(gzip);

// Paths
const serverDataDir = path.join(__dirname, '../../countries/src/data');
const browserDataDir = path.join(__dirname, '../src/data');

// Statistics
const stats = {
  countries: 0,
  states: 0,
  cities: 0,
  totalSize: 0,
  gzippedSize: 0,
};

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Write JSON file and optionally gzipped version
 */
async function writeJSON(filePath, data, createGzip = false) {
  const jsonString = JSON.stringify(data);
  fs.writeFileSync(filePath, jsonString, 'utf-8');
  
  const size = Buffer.byteLength(jsonString);
  stats.totalSize += size;
  
  if (createGzip) {
    const compressed = await gzipAsync(jsonString);
    fs.writeFileSync(`${filePath}.gz`, compressed);
    stats.gzippedSize += compressed.length;
  }
  
  return size;
}

/**
 * Get ISO2 code from directory name (format: CountryName-ISO2)
 */
function getIso2FromDirName(dirName) {
  const parts = dirName.split('-');
  return parts[parts.length - 1];
}

/**
 * Main transformation
 */
async function transformData() {
  console.log('🚀 Starting browser data transformation...\n');
  
  // Clean and create browser data directories
  if (fs.existsSync(browserDataDir)) {
    fs.rmSync(browserDataDir, { recursive: true });
  }
  ensureDir(browserDataDir);
  ensureDir(path.join(browserDataDir, 'country'));
  ensureDir(path.join(browserDataDir, 'states'));
  ensureDir(path.join(browserDataDir, 'cities'));
  
  // 1. Copy countries.json (already flat)
  console.log('📋 Copying countries.json...');
  const countriesPath = path.join(serverDataDir, 'countries.json');
  const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));
  await writeJSON(path.join(browserDataDir, 'countries.json'), countries, true);
  stats.countries = countries.length;
  console.log(`   ✓ ${countries.length} countries\n`);
  
  // 2. Process each country directory
  const countryDirs = fs.readdirSync(serverDataDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  console.log(`📦 Processing ${countryDirs.length} country directories...\n`);
  
  for (const countryDir of countryDirs) {
    const iso2 = getIso2FromDirName(countryDir);
    const countryPath = path.join(serverDataDir, countryDir);
    
    // Transform country metadata
    const metaPath = path.join(countryPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      await writeJSON(path.join(browserDataDir, 'country', `${iso2}.json`), meta, true);
    }
    
    // Transform states
    const statesPath = path.join(countryPath, 'states.json');
    if (fs.existsSync(statesPath)) {
      const states = JSON.parse(fs.readFileSync(statesPath, 'utf-8'));
      await writeJSON(path.join(browserDataDir, 'states', `${iso2}.json`), states, true);
      stats.states += states.length;
      
      // Process state directories for cities
      const stateDirs = fs.readdirSync(countryPath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      
      for (const stateDir of stateDirs) {
        const stateCode = getIso2FromDirName(stateDir);
        const citiesPath = path.join(countryPath, stateDir, 'cities.json');
        
        if (fs.existsSync(citiesPath)) {
          const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));
          await writeJSON(
            path.join(browserDataDir, 'cities', `${iso2}-${stateCode}.json`),
            cities,
            true
          );
          stats.cities += cities.length;
        }
      }
    }
  }
  
  // Print statistics
  console.log('\n✨ Transformation complete!\n');
  console.log('📊 Statistics:');
  console.log(`   Countries: ${stats.countries}`);
  console.log(`   States: ${stats.states}`);
  console.log(`   Cities: ${stats.cities}`);
  console.log(`   Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Gzipped size: ${(stats.gzippedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compression ratio: ${((1 - stats.gzippedSize / stats.totalSize) * 100).toFixed(1)}%`);
  console.log('');
}

// Run transformation
transformData().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
