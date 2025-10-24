#!/usr/bin/env node

/**
 * Data Transformation Script for @countrystatecity/countries-browser
 *
 * Transforms server package data structure to browser-optimized flat structure:
 *
 * Server structure:
 *   data/United_States-US/meta.json
 *   data/United_States-US/states.json
 *   data/United_States-US/California-CA/cities.json
 *
 * Browser structure:
 *   data/countries.json (unchanged)
 *   data/country/US.json
 *   data/states/US.json
 *   data/cities/US-CA.json
 */

const fs = require('fs');
const path = require('path');
const { gzip } = require('zlib');
const { promisify } = require('util');

const gzipAsync = promisify(gzip);

// Paths
const SERVER_DATA_DIR = path.join(__dirname, '../../countries/src/data');
const BROWSER_DATA_DIR = path.join(__dirname, '../src/data');

// Statistics
const stats = {
  countries: 0,
  countriesWithStates: 0,
  states: 0,
  cities: 0,
  totalSize: 0,
  gzippedSize: 0,
};

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write JSON file and optionally create gzipped version
 */
async function writeJSON(filePath, data, createGzip = true) {
  const json = JSON.stringify(data, null, 0); // No formatting for smaller size
  fs.writeFileSync(filePath, json, 'utf-8');

  const size = Buffer.byteLength(json, 'utf-8');
  stats.totalSize += size;

  if (createGzip) {
    const compressed = await gzipAsync(json);
    fs.writeFileSync(`${filePath}.gz`, compressed);
    stats.gzippedSize += compressed.length;
  }

  return size;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Main transformation function
 */
async function transformData() {
  console.log('🔄 Transforming server data to browser-optimized structure...\n');

  // Clean and create browser data directories
  if (fs.existsSync(BROWSER_DATA_DIR)) {
    fs.rmSync(BROWSER_DATA_DIR, { recursive: true });
  }

  ensureDir(BROWSER_DATA_DIR);
  ensureDir(path.join(BROWSER_DATA_DIR, 'country'));
  ensureDir(path.join(BROWSER_DATA_DIR, 'states'));
  ensureDir(path.join(BROWSER_DATA_DIR, 'cities'));

  // Step 1: Copy countries.json (already in correct format)
  console.log('📋 Copying countries.json...');
  const countriesPath = path.join(SERVER_DATA_DIR, 'countries.json');
  const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));
  await writeJSON(path.join(BROWSER_DATA_DIR, 'countries.json'), countries);
  stats.countries = countries.length;
  console.log(`  ✓ ${stats.countries} countries\n`);

  // Step 2: Process each country directory
  console.log('🗺️  Processing country data...');
  const countryDirs = fs
    .readdirSync(SERVER_DATA_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const countryDir of countryDirs) {
    const countryDirPath = path.join(SERVER_DATA_DIR, countryDir.name);

    // Extract ISO2 code from directory name (e.g., "United_States-US" -> "US")
    const iso2 = countryDir.name.split('-').pop();

    // Process meta.json -> country/{ISO2}.json
    const metaPath = path.join(countryDirPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      await writeJSON(path.join(BROWSER_DATA_DIR, 'country', `${iso2}.json`), meta);
    }

    // Process states.json -> states/{ISO2}.json
    const statesPath = path.join(countryDirPath, 'states.json');
    if (fs.existsSync(statesPath)) {
      const states = JSON.parse(fs.readFileSync(statesPath, 'utf-8'));
      await writeJSON(path.join(BROWSER_DATA_DIR, 'states', `${iso2}.json`), states);
      stats.countriesWithStates++;
      stats.states += states.length;

      // Process each state's cities
      const stateDirs = fs
        .readdirSync(countryDirPath, { withFileTypes: true })
        .filter((d) => d.isDirectory());

      for (const stateDir of stateDirs) {
        const citiesPath = path.join(countryDirPath, stateDir.name, 'cities.json');

        if (fs.existsSync(citiesPath)) {
          // Extract state code from directory name
          const stateCode = stateDir.name.split('-').pop();
          const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf-8'));

          // Write to cities/{COUNTRY}-{STATE}.json
          await writeJSON(
            path.join(BROWSER_DATA_DIR, 'cities', `${iso2}-${stateCode}.json`),
            cities
          );
          stats.cities += cities.length;
        }
      }
    }
  }

  console.log(`  ✓ Processed ${countryDirs.length} countries\n`);

  // Print statistics
  console.log('📊 Transformation Complete!\n');
  console.log('Statistics:');
  console.log(`  Countries: ${stats.countries}`);
  console.log(`  Countries with states: ${stats.countriesWithStates}`);
  console.log(`  Total states: ${stats.states}`);
  console.log(`  Total cities: ${stats.cities}`);
  console.log(`\nFile Sizes:`);
  console.log(`  Total (uncompressed): ${formatBytes(stats.totalSize)}`);
  console.log(`  Total (gzipped): ${formatBytes(stats.gzippedSize)}`);
  console.log(`  Compression ratio: ${((stats.gzippedSize / stats.totalSize) * 100).toFixed(1)}%`);
  console.log(`\nOutput directory: ${BROWSER_DATA_DIR}`);

  // Verify critical files exist
  console.log('\n✅ Verifying generated files...');
  const criticalFiles = [
    'countries.json',
    'country/US.json',
    'states/US.json',
    'cities/US-CA.json',
  ];

  let allExist = true;
  for (const file of criticalFiles) {
    const exists = fs.existsSync(path.join(BROWSER_DATA_DIR, file));
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    if (!exists) allExist = false;
  }

  if (allExist) {
    console.log('\n✨ All critical files verified!');
  } else {
    console.error('\n❌ Some critical files are missing!');
    process.exit(1);
  }
}

// Run transformation
transformData().catch((error) => {
  console.error('\n❌ Error during transformation:', error);
  process.exit(1);
});
