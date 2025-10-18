const fs = require('fs');
const path = require('path');

/**
 * Generate timezone data from countries package
 * Extracts timezone information and organizes it by country
 */
async function generateTimezoneData() {
  console.log('Generating timezone data...\n');

  const countriesDataDir = path.join(__dirname, '../../countries/src/data');
  const timezonesDataDir = path.join(__dirname, '../src/data');
  const byCountryDir = path.join(timezonesDataDir, 'by-country');

  // Ensure output directories exist
  if (!fs.existsSync(timezonesDataDir)) {
    fs.mkdirSync(timezonesDataDir, { recursive: true });
  }
  if (!fs.existsSync(byCountryDir)) {
    fs.mkdirSync(byCountryDir, { recursive: true });
  }

  // Load countries.json to get country list
  const countriesFile = path.join(countriesDataDir, 'countries.json');
  if (!fs.existsSync(countriesFile)) {
    console.error('❌ countries.json not found in countries package');
    process.exit(1);
  }

  const countries = JSON.parse(fs.readFileSync(countriesFile, 'utf-8'));
  console.log(`Found ${countries.length} countries`);

  const allTimezones = [];
  const timezoneAbbreviations = new Map();
  let processedCountries = 0;

  // Process each country
  for (const country of countries) {
    const countryDirName = `${country.name.replace(/\s+/g, '_')}-${country.iso2}`;
    const metaFile = path.join(countriesDataDir, countryDirName, 'meta.json');

    if (!fs.existsSync(metaFile)) {
      console.log(`  ⚠️  Skipping ${country.name} (no meta.json)`);
      continue;
    }

    try {
      const countryMeta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      
      if (!countryMeta.timezones || !Array.isArray(countryMeta.timezones)) {
        console.log(`  ⚠️  Skipping ${country.name} (no timezones data)`);
        continue;
      }

      const countryTimezones = countryMeta.timezones.map(tz => ({
        zoneName: tz.zoneName,
        countryCode: country.iso2,
        abbreviation: tz.abbreviation,
        gmtOffset: tz.gmtOffset,
        gmtOffsetName: tz.gmtOffsetName,
        tzName: tz.tzName
      }));

      // Add to all timezones (avoid duplicates)
      for (const tz of countryTimezones) {
        const exists = allTimezones.find(t => 
          t.zoneName === tz.zoneName && t.countryCode === tz.countryCode
        );
        if (!exists) {
          allTimezones.push(tz);
        }

        // Track abbreviations
        if (tz.abbreviation) {
          if (!timezoneAbbreviations.has(tz.abbreviation)) {
            timezoneAbbreviations.set(tz.abbreviation, {
              abbreviation: tz.abbreviation,
              name: tz.tzName,
              timezones: []
            });
          }
          const abbrevData = timezoneAbbreviations.get(tz.abbreviation);
          if (!abbrevData.timezones.includes(tz.zoneName)) {
            abbrevData.timezones.push(tz.zoneName);
          }
        }
      }

      // Write country-specific timezones
      const countryFile = path.join(byCountryDir, `${country.iso2}.json`);
      fs.writeFileSync(countryFile, JSON.stringify(countryTimezones, null, 2));
      
      processedCountries++;
      if (processedCountries % 50 === 0) {
        console.log(`  Processed ${processedCountries} countries...`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${country.name}:`, error.message);
    }
  }

  console.log(`\n✓ Processed ${processedCountries} countries`);

  // Write all timezones
  const allTimezonesFile = path.join(timezonesDataDir, 'timezones.json');
  fs.writeFileSync(allTimezonesFile, JSON.stringify(allTimezones, null, 2));
  console.log(`✓ Written ${allTimezones.length} timezones to timezones.json`);

  // Write abbreviations
  const abbreviationsArray = Array.from(timezoneAbbreviations.values()).sort((a, b) => 
    a.abbreviation.localeCompare(b.abbreviation)
  );
  const abbreviationsFile = path.join(timezonesDataDir, 'abbreviations.json');
  fs.writeFileSync(abbreviationsFile, JSON.stringify(abbreviationsArray, null, 2));
  console.log(`✓ Written ${abbreviationsArray.length} abbreviations to abbreviations.json`);

  // Calculate and display statistics
  const totalSize = fs.statSync(allTimezonesFile).size / 1024;
  const avgCountrySize = fs.readdirSync(byCountryDir)
    .reduce((acc, file) => {
      return acc + fs.statSync(path.join(byCountryDir, file)).size;
    }, 0) / fs.readdirSync(byCountryDir).length / 1024;

  console.log('\n📊 Statistics:');
  console.log(`  Total timezones: ${allTimezones.length}`);
  console.log(`  Countries with timezones: ${processedCountries}`);
  console.log(`  Unique abbreviations: ${abbreviationsArray.length}`);
  console.log(`  Main file size: ${totalSize.toFixed(2)} KB`);
  console.log(`  Average country file size: ${avgCountrySize.toFixed(2)} KB`);

  console.log('\n✨ Timezone data generation complete!');
}

// Run the generator
generateTimezoneData().catch(error => {
  console.error('❌ Error generating timezone data:', error);
  process.exit(1);
});
