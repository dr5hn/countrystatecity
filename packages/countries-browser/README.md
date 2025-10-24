# @countrystatecity/countries-browser

Browser-native countries, states, and cities database optimized for frontend/client-side usage. Zero Node.js dependencies, uses Fetch API for lazy loading.

## ✨ Features

- ✅ **Browser/Frontend Use** - Works in all modern browsers
- ✅ **Zero Dependencies** - No Node.js modules required
- ✅ **Vite, Webpack, Rollup Compatible** - Works with all major bundlers
- ✅ **Framework Agnostic** - React, Vue, Svelte, Angular, Vanilla JS
- ✅ **CDN Available** - Use via unpkg or jsDelivr
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Same API as Server Package** - Drop-in replacement for client-side
- ✅ **Lazy Loading** - Load only what you need via Fetch API
- ✅ **Optimized Bundle Size** - ~15KB core + data on-demand

## 📦 Installation

```bash
npm install @countrystatecity/countries-browser
# or
yarn add @countrystatecity/countries-browser
# or
pnpm add @countrystatecity/countries-browser
```

## 🚀 Quick Start

### React Example

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
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.iso2} value={c.iso2}>{c.name}</option>
        ))}
      </select>

      {states.length > 0 && (
        <select>
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.iso2} value={s.iso2}>{s.name}</option>
          ))}
        </select>
      )}
    </>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <select v-model="selectedCountry">
      <option value="">Select Country</option>
      <option v-for="country in countries" :key="country.iso2" :value="country.iso2">
        {{ country.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getCountries, getStatesOfCountry } from '@countrystatecity/countries-browser';

const countries = ref([]);
const selectedCountry = ref('');

onMounted(async () => {
  countries.value = await getCountries();
});
</script>
```

### CDN Usage (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@countrystatecity/countries-browser/dist/cdn/index.global.js"></script>
</head>
<body>
  <script>
    const { getCountries } = CountryStateCityBrowser;

    getCountries().then(countries => {
      console.log('Loaded', countries.length, 'countries');
    });
  </script>
</body>
</html>
```

## 📚 API Reference

### Core Functions

All functions return Promises and use the Fetch API internally.

#### `getCountries(): Promise<ICountry[]>`

Get lightweight list of all countries (basic info only).

```typescript
const countries = await getCountries();
// Returns array of ~250 countries with basic info
```

#### `getCountryByCode(countryCode: string): Promise<ICountryMeta | null>`

Get full country metadata including timezones and translations.

```typescript
const usa = await getCountryByCode('US');
// Returns country with timezones, translations, etc.
```

#### `getStatesOfCountry(countryCode: string): Promise<IState[]>`

Get all states/provinces for a specific country.

```typescript
const usStates = await getStatesOfCountry('US');
// Returns array of US states
```

#### `getStateByCode(countryCode: string, stateCode: string): Promise<IState | null>`

Get specific state by code.

```typescript
const california = await getStateByCode('US', 'CA');
```

#### `getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]>`

Get all cities in a specific state.

```typescript
const caCities = await getCitiesOfState('US', 'CA');
// Returns all California cities
```

#### `getAllCitiesOfCountry(countryCode: string): Promise<ICity[]>`

Get ALL cities in an entire country (large data size).

```typescript
const allUSCities = await getAllCitiesOfCountry('US');
// WARNING: Large dataset
```

#### `getAllCitiesInWorld(): Promise<ICity[]>`

Get every city globally (MASSIVE data - 8MB+).

```typescript
const allCities = await getAllCitiesInWorld();
// WARNING: Very large dataset, use sparingly
```

#### `getCityById(countryCode: string, stateCode: string, cityId: number): Promise<ICity | null>`

Get specific city by ID.

```typescript
const city = await getCityById('US', 'CA', 12345);
```

### Utility Functions

#### `isValidCountryCode(countryCode: string): Promise<boolean>`

Check if a country code exists.

```typescript
const isValid = await isValidCountryCode('US'); // true
```

#### `isValidStateCode(countryCode: string, stateCode: string): Promise<boolean>`

Check if a state code exists in a country.

```typescript
const isValid = await isValidStateCode('US', 'CA'); // true
```

#### `searchCitiesByName(countryCode: string, stateCode: string, searchTerm: string): Promise<ICity[]>`

Search cities by name (partial match, case-insensitive).

```typescript
const cities = await searchCitiesByName('US', 'CA', 'san');
// Returns San Francisco, San Diego, etc.
```

#### `getCountryNameByCode(countryCode: string): Promise<string | null>`

Get country name from code.

```typescript
const name = await getCountryNameByCode('US'); // "United States"
```

#### `getStateNameByCode(countryCode: string, stateCode: string): Promise<string | null>`

Get state name from code.

```typescript
const name = await getStateNameByCode('US', 'CA'); // "California"
```

### Configuration

#### `configure(options: ConfigOptions): void`

Configure the package globally.

```typescript
import { configure } from '@countrystatecity/countries-browser';

configure({
  baseURL: 'https://cdn.myapp.com/geodata',  // Custom CDN
  cache: true,                                // Use browser cache (default: true)
  timeout: 10000,                             // Request timeout in ms (default: 5000)
  headers: {                                  // Custom headers
    'Authorization': 'Bearer token',
  },
});
```

#### `resetConfiguration(): void`

Reset to default configuration.

```typescript
import { resetConfiguration } from '@countrystatecity/countries-browser';

resetConfiguration();
```

#### `clearCache(): void`

Clear the internal memory cache.

```typescript
import { clearCache } from '@countrystatecity/countries-browser';

clearCache();
```

## 🎯 Why Browser Package?

The main `@countrystatecity/countries` package uses Node.js file system (`fs`) and cannot run in browsers. This package:

- **Uses Fetch API** instead of `fs.readFileSync`
- **Zero Node.js dependencies** - pure browser code
- **Optimized data structure** for HTTP/CDN delivery
- **Same API interface** - easy migration

### Comparison

| Feature | @countrystatecity/countries | @countrystatecity/countries-browser |
|---------|----------------------------|-------------------------------------|
| **Environment** | Node.js, Bun, Deno | Browser, CDN |
| **Data Loading** | File system (`fs`) | Fetch API |
| **Bundle Size** | ~15KB + 0KB data* | ~15KB + 130KB countries |
| **Dependencies** | Node.js built-ins | Zero |
| **Use Cases** | Next.js API, Express, serverless | React, Vue, Svelte, vanilla JS |

*Server package data is not bundled, loaded from file system on-demand

## 📊 Bundle Size

| Asset | Uncompressed | Gzipped |
|-------|--------------|---------|
| Main bundle | ~15KB | ~5KB |
| countries.json | 130KB | 30KB |
| Typical state file | 50KB | 15KB |
| Typical cities file | 100KB | 25KB |
| **Total for typical flow** | ~300KB | ~75KB |

## ⚙️ Configuration Examples

### Using jsDelivr CDN for GitHub Data

You can use jsDelivr to load data directly from the GitHub repository:

```typescript
import { configure, getCountries } from '@countrystatecity/countries-browser';

// Use jsDelivr CDN to load data from GitHub
configure({
  baseURL: 'https://cdn.jsdelivr.net/gh/dr5hn/countrystatecity@main/packages/countries-browser/dist/data',
});

const countries = await getCountries();
```

### Using Custom CDN

```typescript
import { configure, getCountries } from '@countrystatecity/countries-browser';

configure({
  baseURL: 'https://cdn.myapp.com/geodata',
});

const countries = await getCountries();
```

### Self-Hosting Data Files

In your build tool (e.g., Vite):

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'copy-countries-data',
      buildEnd() {
        // Copy data to public directory
        // From: node_modules/@countrystatecity/countries-browser/dist/data
        // To: public/data
      }
    }
  ]
});
```

## 🔧 TypeScript Types

Full TypeScript support with exported interfaces:

```typescript
import type {
  ICountry,
  ICountryMeta,
  IState,
  ICity,
  ITimezone,
  ITranslations,
  ConfigOptions,
  FetchOptions,
} from '@countrystatecity/countries-browser';
```

## 🚨 Important Notes

- ❌ **Not for Node.js server use** - Use `@countrystatecity/countries` instead
- ❌ **Requires HTTP server** - Won't work with `file://` protocol
- ⚠️ **Initial download** - 130KB for countries list (30KB gzipped)
- ✅ **Lazy loading** - Only requested data is loaded

## 📝 Migration from Server Package

```typescript
// Before (server-side)
import { getCountries } from '@countrystatecity/countries';
const countries = await getCountries();

// After (browser-side) - SAME API!
import { getCountries } from '@countrystatecity/countries-browser';
const countries = await getCountries();
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md).

## 📄 License

ODbL-1.0 - See [LICENSE](../../LICENSE) for details.

## 🔗 Links

- [GitHub Repository](https://github.com/dr5hn/countrystatecity)
- [Server Package (@countrystatecity/countries)](../countries)
- [Issue Tracker](https://github.com/dr5hn/countrystatecity/issues)

## ⭐ Support

If you find this package helpful, please give it a star on GitHub!
