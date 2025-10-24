# @countrystatecity/countries-browser

Browser-native countries, states, and cities database with lazy loading via fetch API.

[![npm](https://img.shields.io/npm/v/@countrystatecity/countries-browser)](https://www.npmjs.com/package/@countrystatecity/countries-browser)
[![License](https://img.shields.io/badge/license-ODbL--1.0-blue)](../../LICENSE)

## ✨ Features

- 🌐 **Browser-Native**: Uses Fetch API, zero Node.js dependencies
- 🚀 **Lazy Loading**: Load only the data you need via HTTP
- 📦 **Minimal Bundle**: ~15KB code + ~30KB countries list (gzipped)
- 🔄 **Same API**: 100% compatible with server package
- 📝 **TypeScript**: Full type definitions included
- 🎯 **CDN Ready**: Use via NPM or script tag
- 🔧 **Configurable**: Custom CDN, caching, headers

## 📦 Installation

```bash
npm install @countrystatecity/countries-browser
# or
yarn add @countrystatecity/countries-browser
# or
pnpm add @countrystatecity/countries-browser
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries-browser';

// Get all countries (~30KB gzipped)
const countries = await getCountries();
console.log(countries[0]);
// { id: 1, name: "Afghanistan", iso2: "AF", emoji: "🇦🇫", ... }

// Get states for a country
const states = await getStatesOfCountry('US');
console.log(states.length); // 51

// Get cities in a state
const cities = await getCitiesOfState('US', 'CA');
console.log(cities.length); // ~1500
```

### Configuration

```typescript
import { configure } from '@countrystatecity/countries-browser';

// Use jsDelivr CDN (GitHub-hosted)
configure({
  baseURL: 'https://cdn.jsdelivr.net/gh/dr5hn/countrystatecity@main/packages/countries-browser/dist/data',
  cache: true,
  timeout: 5000,
});

// Or use your own CDN
configure({
  baseURL: 'https://cdn.example.com/geodata',
});

// Custom headers (for authenticated APIs)
configure({
  headers: {
    'Authorization': 'Bearer token',
  },
});
```

### CDN Usage

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load from jsDelivr CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@countrystatecity/countries-browser/dist/cdn/countries-browser.min.js"></script>
</head>
<body>
  <script>
    const { getCountries, configure } = CountryStateCityBrowser;

    // Optional: Use GitHub-hosted data via jsDelivr
    configure({
      baseURL: 'https://cdn.jsdelivr.net/gh/dr5hn/countrystatecity@main/packages/countries-browser/dist/data'
    });

    getCountries().then(countries => {
      console.log('Loaded', countries.length, 'countries');
    });
  </script>
</body>
</html>
```

## 📖 API Reference

### Core Functions

#### `getCountries(): Promise<ICountry[]>`
Get lightweight list of all countries.

#### `getCountryByCode(countryCode: string): Promise<ICountryMeta | null>`
Get full country metadata including timezones and translations.

#### `getStatesOfCountry(countryCode: string): Promise<IState[]>`
Get all states/provinces for a country.

#### `getStateByCode(countryCode: string, stateCode: string): Promise<IState | null>`
Get specific state details.

#### `getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]>`
Get all cities in a specific state.

#### `getCityById(countryCode: string, stateCode: string, cityId: number): Promise<ICity | null>`
Get specific city by ID.

#### `getAllCitiesOfCountry(countryCode: string): Promise<ICity[]>`
⚠️ Get ALL cities in an entire country (large data).

#### `getAllCitiesInWorld(): Promise<ICity[]>`
⚠️ Get every city globally (8MB+ data).

### Utility Functions

#### `isValidCountryCode(countryCode: string): Promise<boolean>`
Check if country code exists.

#### `isValidStateCode(countryCode: string, stateCode: string): Promise<boolean>`
Check if state code exists.

#### `searchCitiesByName(countryCode: string, stateCode: string, searchTerm: string): Promise<ICity[]>`
Search cities by partial name match.

#### `getCountryNameByCode(countryCode: string): Promise<string | null>`
Get country name from ISO2 code.

#### `getStateNameByCode(countryCode: string, stateCode: string): Promise<string | null>`
Get state name from code.

#### `getTimezoneForCity(countryCode: string, stateCode: string, cityName: string): Promise<string | null>`
Get timezone for specific city.

#### `getCountryTimezones(countryCode: string): Promise<string[]>`
Get all timezones for a country.

### Configuration

#### `configure(options: ConfigOptions): void`
Configure package behavior (CDN URL, caching, headers).

#### `getConfig(): ConfigOptions`
Get current configuration.

#### `resetConfiguration(): void`
Reset to default configuration.

#### `clearCache(): void`
Clear internal data cache.

## 🎯 Why Browser Package?

The server package (`@countrystatecity/countries`) uses Node.js file system APIs and cannot run in browsers. This package provides the same API using Fetch API for browser environments.

| Feature | Server Package | Browser Package |
|---------|---------------|-----------------|
| Environment | Node.js, serverless | Browser, frontend |
| Data Loading | File system (`fs`) | Fetch API |
| Dependencies | Node.js built-ins | Zero |
| Initial Bundle | ~15KB | ~15KB + 130KB data |
| Use Cases | API routes, backends | React, Vue, Svelte |

### When to Use Each

**Use server package when:**
- Building API endpoints or backends
- Using Next.js server components
- Running in Node.js environments

**Use browser package when:**
- Building client-side apps (React, Vue, Svelte)
- Using Vite for frontend development
- Need data directly in the browser

## 📊 Bundle Sizes

| Action | Size (uncompressed) | Size (gzipped) |
|--------|---------------------|----------------|
| Package code | ~15KB | ~5KB |
| Countries list | 130KB | ~30KB |
| Typical state | 50KB | ~15KB |
| Typical cities | 100KB | ~25KB |
| **Typical usage** | **~300KB** | **~75KB** |

## 🔧 TypeScript

Full TypeScript support with type definitions:

```typescript
import type { ICountry, IState, ICity, ConfigOptions } from '@countrystatecity/countries-browser';
```

## 🧪 Framework Examples

### React

```typescript
import { useState, useEffect } from 'react';
import { getCountries, getStatesOfCountry } from '@countrystatecity/countries-browser';

function CountrySelector() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    getCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      getStatesOfCountry(selectedCountry).then(setStates);
    }
  }, [selectedCountry]);

  return (
    <>
      <select onChange={e => setSelectedCountry(e.target.value)}>
        {countries.map(c => (
          <option key={c.iso2} value={c.iso2}>{c.name}</option>
        ))}
      </select>

      {states.length > 0 && (
        <select>
          {states.map(s => (
            <option key={s.iso2} value={s.iso2}>{s.name}</option>
          ))}
        </select>
      )}
    </>
  );
}
```

### Vue

```vue
<script setup>
import { ref, onMounted, watch } from 'vue';
import { getCountries, getStatesOfCountry } from '@countrystatecity/countries-browser';

const countries = ref([]);
const states = ref([]);
const selectedCountry = ref('');

onMounted(async () => {
  countries.value = await getCountries();
});

watch(selectedCountry, async (newValue) => {
  if (newValue) {
    states.value = await getStatesOfCountry(newValue);
  }
});
</script>

<template>
  <select v-model="selectedCountry">
    <option v-for="country in countries" :key="country.iso2" :value="country.iso2">
      {{ country.name }}
    </option>
  </select>

  <select v-if="states.length">
    <option v-for="state in states" :key="state.iso2" :value="state.iso2">
      {{ state.name }}
    </option>
  </select>
</template>
```

## 📄 License

[ODbL-1.0](../../LICENSE) © [dr5hn](https://github.com/dr5hn)

Data sourced from [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database).

## 🔗 Links

- [GitHub Repository](https://github.com/dr5hn/countrystatecity)
- [Server Package](https://www.npmjs.com/package/@countrystatecity/countries)
- [Issues](https://github.com/dr5hn/countrystatecity/issues)
- [Specification](https://github.com/dr5hn/countrystatecity/blob/main/specs/4-countries-browser-package-spec.md)

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md).

For data issues (incorrect names, missing cities, etc.), report to the [source database repository](https://github.com/dr5hn/countries-states-cities-database/issues).
