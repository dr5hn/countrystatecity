# @countrystatecity/countries-browser Package Specification

## Overview

A browser-native version of `@countrystatecity/countries` designed specifically for frontend/client-side usage. This package provides the same comprehensive geographic data (countries, states, cities) but optimized for browser environments without Node.js dependencies.

## Motivation

### The Problem

The current `@countrystatecity/countries` package:
- Requires Node.js file system access (`fs.readFileSync()`)
- Uses Node.js built-in modules (`fs`, `path`, `url`)
- Cannot run in browser/frontend environments
- Causes "Failed to fetch dynamically imported module" errors in Vite/browser contexts

### Why Not Modify the Existing Package?

1. **Different optimization goals**: Server packages prioritize file system efficiency, browser packages prioritize HTTP/bundle optimization
2. **Breaking changes**: Making existing package browser-compatible would break server-side users
3. **Clear separation**: Explicit package names prevent confusion about use cases
4. **Bundle size tradeoffs**: Browser needs different chunking strategy than server
5. **Ecosystem pattern**: Many packages have `-browser` variants (e.g., `crypto-browserify`)

## Package Architecture

### Package Name

`@countrystatecity/countries-browser`

**Alternative names considered:**
- `@countrystatecity/countries-static` - Less clear about use case
- `@countrystatecity/countries-web` - "Web" ambiguous (could mean server-side web)
- `@countrystatecity/countries-client` - Good alternative, but "browser" more explicit

### Core Design Principles

1. **Zero Node.js Dependencies**: Pure browser-compatible code
2. **Same API Interface**: Drop-in replacement API compatible with server package
3. **Lazy Loading via Fetch**: Load data on-demand using `fetch()` API
4. **Optimized Bundle Splitting**: Strategic chunking for common use cases
5. **CDN-Friendly**: Can be served from CDN and loaded via script tags
6. **TypeScript First**: Full type safety and IDE support

## Technical Implementation

### Data Loading Strategy

**Server Package (current):**
```typescript
// Uses fs.readFileSync
const data = fs.readFileSync('./data/countries.json', 'utf-8');
return JSON.parse(data);
```

**Browser Package (new):**
```typescript
// Uses fetch API
const response = await fetch('/data/countries.json');
return await response.json();
```

### Package Structure

```
@countrystatecity/countries-browser/
├── dist/
│   ├── index.js                 # Main entry point (ESM)
│   ├── index.cjs                # CommonJS bundle
│   ├── index.d.ts               # TypeScript definitions
│   ├── data/
│   │   ├── countries.json       # ~130KB - all countries metadata
│   │   ├── country/
│   │   │   ├── US.json         # Country metadata
│   │   │   └── IN.json
│   │   ├── states/
│   │   │   ├── US.json         # All US states
│   │   │   └── IN.json
│   │   └── cities/
│   │       ├── US-CA.json      # Cities in California
│   │       └── US-TX.json
│   └── cdn/
│       └── countries-browser.min.js  # UMD bundle for CDN
├── src/
│   ├── index.ts                # Main exports
│   ├── loaders.ts              # Fetch-based data loaders
│   ├── types.ts                # TypeScript interfaces (same as server)
│   ├── utils.ts                # Utility functions
│   └── config.ts               # Configuration (base URL, etc.)
├── package.json
├── tsup.config.ts
├── README.md
└── tests/
    ├── unit/
    ├── integration/
    └── browser/                # Real browser tests (Playwright)
```

### Data File Organization

**Optimized for browser caching and HTTP requests:**

```
data/
├── countries.json              # 130KB - All countries (basic info)
├── country/
│   ├── {ISO2}.json            # 5-10KB each - Full country metadata
├── states/
│   ├── {ISO2}.json            # 10-100KB - All states for country
└── cities/
    ├── {ISO2}-{STATE}.json    # 5-200KB - Cities for state
```

**Key differences from server package:**
- Flattened structure (no nested directories like `United_States-US/`)
- Simpler naming (ISO codes only)
- Optimized for HTTP caching (fewer directory levels)
- Pre-gzipped versions available (`.json.gz`)

### Configuration Options

```typescript
// Default: Load from package's own data directory
import { getCountries } from '@countrystatecity/countries-browser';

// Custom: Load from CDN
import { configure, getCountries } from '@countrystatecity/countries-browser';

configure({
  baseURL: 'https://cdn.example.com/countries-data',
  cache: true,          // Use browser cache
  timeout: 5000,        // Request timeout
});

const countries = await getCountries();
```

### API Interface (Same as Server Package)

```typescript
// Core functions - identical signatures to server package
export async function getCountries(): Promise<ICountry[]>;
export async function getCountryByCode(countryCode: string): Promise<ICountryMeta | null>;
export async function getStatesOfCountry(countryCode: string): Promise<IState[]>;
export async function getStateByCode(countryCode: string, stateCode: string): Promise<IState | null>;
export async function getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]>;
export async function getCityById(countryCode: string, stateCode: string, cityId: number): Promise<ICity | null>;
export async function getAllCitiesOfCountry(countryCode: string): Promise<ICity[]>;
export async function getAllCitiesInWorld(): Promise<ICity[]>;

// Utility functions
export function isValidCountryCode(countryCode: string): Promise<boolean>;
export function isValidStateCode(countryCode: string, stateCode: string): Promise<boolean>;
export function searchCitiesByName(searchTerm: string): Promise<ICity[]>;
export function getCountryNameByCode(countryCode: string): Promise<string | null>;
export function getStateNameByCode(countryCode: string, stateCode: string): Promise<string | null>;

// Configuration
export function configure(options: ConfigOptions): void;
export function resetConfiguration(): void;
```

### TypeScript Definitions

**Share same types as server package:**
- `ICountry`
- `ICountryMeta`
- `IState`
- `ICity`
- `ITimezone`
- `ITranslations`

**Additional browser-specific types:**
```typescript
export interface ConfigOptions {
  baseURL?: string;      // Base URL for data files
  cache?: boolean;       // Use browser cache
  timeout?: number;      // Request timeout in ms
  headers?: Record<string, string>;  // Custom headers
}

export interface FetchOptions {
  signal?: AbortSignal;  // For request cancellation
  priority?: 'high' | 'low' | 'auto';  // Fetch priority hint
}
```

## Build System

### Build Configuration (tsup)

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  // ESM and CJS builds
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: true,  // Enable code splitting
    external: [],     // No external dependencies for browser
  },
  // UMD build for CDN usage
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'CountryStateCityBrowser',
    outDir: 'dist/cdn',
    minify: true,
    sourcemap: true,
  },
]);
```

### Data Generation Script

```javascript
// scripts/generate-browser-data.js
/**
 * Transforms server package data structure to browser-optimized structure
 *
 * Input: packages/countries/src/data/ (server structure)
 * Output: packages/countries-browser/src/data/ (browser structure)
 */

import fs from 'fs';
import path from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Read server package data
const serverDataDir = '../countries/src/data';
const browserDataDir = './src/data';

// Transform to flat structure
// United_States-US/states.json → states/US.json
// United_States-US/California-CA/cities.json → cities/US-CA.json

// Generate pre-gzipped versions for each JSON file
for (const file of jsonFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const compressed = await gzipAsync(content);
  fs.writeFileSync(`${file}.gz`, compressed);
}

console.log('Browser-optimized data generated');
```

## Bundle Size Optimization

### Target Sizes

| Asset | Size (uncompressed) | Size (gzipped) |
|-------|---------------------|----------------|
| Main bundle (index.js) | ~15KB | ~5KB |
| countries.json | 130KB | 30KB |
| Typical state file | 50KB | 15KB |
| Typical cities file | 100KB | 25KB |
| **Total for typical flow** | ~300KB | ~75KB |

**Comparison with alternatives:**
- Server package (if it worked): N/A (requires Node.js)
- Bundling all data: 52MB uncompressed
- This approach: Load only what you need (~75KB gzipped typical)

### Caching Strategy

```typescript
// Internal cache implementation
const cache = new Map<string, any>();

async function loadJSON<T>(path: string): Promise<T> {
  // Check cache first
  if (cache.has(path)) {
    return cache.get(path);
  }

  // Fetch with browser cache
  const response = await fetch(path, {
    cache: 'default',  // Respect HTTP cache headers
  });

  const data = await response.json();
  cache.set(path, data);

  return data;
}
```

## Usage Examples

### Basic Usage (React)

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

### CDN Usage (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@countrystatecity/countries-browser/dist/cdn/countries-browser.min.js"></script>
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

### Custom CDN Configuration

```typescript
import { configure, getCountries } from '@countrystatecity/countries-browser';

// Use your own CDN
configure({
  baseURL: 'https://cdn.myapp.com/geodata',
  cache: true,
  headers: {
    'Authorization': 'Bearer token',
  },
});

const countries = await getCountries();
```

### Migration from Server Package

```typescript
// Before (server-side)
import { getCountries } from '@countrystatecity/countries';
const countries = await getCountries();

// After (browser-side) - SAME API!
import { getCountries } from '@countrystatecity/countries-browser';
const countries = await getCountries();
```

## Testing Strategy

### Test Layers

1. **Unit Tests** (Vitest)
   - Test each loader function
   - Mock fetch responses
   - Test caching behavior
   - Test error handling

2. **Integration Tests** (Vitest)
   - Test complete workflows
   - Test with real JSON files
   - Test configuration options

3. **Browser Tests** (Playwright)
   - Test in real browsers (Chrome, Firefox, Safari)
   - Test with actual HTTP server
   - Test caching and network conditions
   - Test bundle sizes

4. **Framework Integration Tests**
   - React integration test
   - Vue integration test
   - Svelte integration test
   - Vanilla JS test

### Example Test

```typescript
// tests/unit/loaders.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getCountries } from '../src/loaders';

describe('getCountries', () => {
  it('should fetch and return countries', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'United States', iso2: 'US' }
        ]),
      })
    );

    const countries = await getCountries();

    expect(fetch).toHaveBeenCalledWith('/data/countries.json', expect.any(Object));
    expect(countries).toHaveLength(1);
    expect(countries[0].name).toBe('United States');
  });

  it('should cache results', async () => {
    await getCountries();
    await getCountries(); // Second call

    // Fetch should only be called once
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### README Structure

1. **Quick Start** - Install and use in 30 seconds
2. **Why Browser Package?** - Explain separation from server package
3. **Installation** - npm, yarn, pnpm, CDN
4. **Usage Examples** - React, Vue, Svelte, Vanilla JS
5. **API Reference** - Complete function documentation
6. **Configuration** - Custom CDN, caching, headers
7. **Bundle Size** - Size breakdown and optimization tips
8. **Migration Guide** - Moving from server package
9. **Troubleshooting** - Common issues and solutions
10. **Comparison** - vs server package, vs alternatives

### Key Documentation Points

**Prominently feature:**
- ✅ Browser/frontend use
- ✅ Vite, Webpack, Rollup compatible
- ✅ React, Vue, Svelte, Angular compatible
- ✅ CDN available
- ✅ TypeScript support
- ✅ Same API as server package

**Clearly state:**
- ❌ Not for Node.js server use (use `@countrystatecity/countries` instead)
- ❌ Requires HTTP server (won't work with `file://` protocol)
- ⚠️ Initial 130KB download for countries list

## Performance Considerations

### Optimization Techniques

1. **HTTP/2 Server Push** - Preload commonly accessed files
2. **Pre-gzipped Files** - Serve `.json.gz` if supported
3. **Long-term Caching** - Immutable cache headers for data files
4. **Lazy Loading** - Load only requested geographic regions
5. **Code Splitting** - Separate utility functions from loaders
6. **Tree Shaking** - Export individual functions, not default object

### Performance Metrics

**Target metrics:**
- Time to First Country List: <500ms
- Time to Load State Data: <200ms
- Time to Load City Data: <500ms
- Total Bundle Size (typical): <75KB gzipped

## Comparison: Server vs Browser Package

| Feature | @countrystatecity/countries | @countrystatecity/countries-browser |
|---------|----------------------------|-------------------------------------|
| **Environment** | Node.js, Bun, Deno | Browser, CDN |
| **Data Loading** | File system (`fs`) | Fetch API |
| **Bundle Size** | ~15KB + 0KB data* | ~15KB + 130KB countries |
| **Dependencies** | Node.js built-ins | Zero |
| **Lazy Loading** | Yes (via fs) | Yes (via fetch) |
| **TypeScript** | ✅ | ✅ |
| **Same API** | ✅ | ✅ |
| **Use Cases** | Next.js API, Express, serverless | React, Vue, Svelte, vanilla JS |
| **Caching** | OS file cache | HTTP cache + memory |
| **Initial Load** | Instant | ~30KB gzipped |

*Server package data is not bundled, loaded from file system on-demand

## Deployment Considerations

### Self-Hosting Data Files

```typescript
// Copy data to public directory during build
// vite.config.ts
export default {
  plugins: [
    {
      name: 'copy-countries-data',
      buildEnd() {
        // Copy node_modules/@countrystatecity/countries-browser/dist/data
        // to dist/data
      }
    }
  ]
}
```

### Using CDN

```typescript
// Configure to use CDN
import { configure } from '@countrystatecity/countries-browser';

configure({
  baseURL: 'https://unpkg.com/@countrystatecity/countries-browser/dist/data',
});
```

### Vercel/Netlify Deployment

Data files are automatically included in deployment (part of npm package).

## Migration Path

### Phase 1: Initial Release
- Core functionality (countries, states, cities)
- React integration test
- Comprehensive documentation
- Publish as v1.0.0

### Phase 2: Enhancements
- Service Worker support for offline usage
- IndexedDB caching for large datasets
- Streaming API for massive city lists
- Framework-specific packages (@countrystatecity/react-countries)

### Phase 3: Advanced Features
- WebSocket support for real-time updates
- Differential updates (only sync changes)
- GraphQL API wrapper
- Advanced search with Fuse.js integration

## Success Metrics

**Package considered successful if:**
1. ✅ Issue #17 reporter confirms it works in Vite
2. ✅ 100% API compatibility with server package
3. ✅ <100KB gzipped for typical use case
4. ✅ Works in Chrome, Firefox, Safari, Edge
5. ✅ 90%+ test coverage
6. ✅ Clear documentation with examples
7. ✅ Positive user feedback

## Open Questions

1. **Naming**: Confirm `countries-browser` vs alternatives?
2. **CDN Provider**: Should we provide official CDN? (jsDelivr, unpkg)
3. **Data Updates**: How to handle data updates in browser cache?
4. **Offline Support**: Include service worker in v1.0.0 or later?
5. **Bundle Strategy**: Single bundle vs multiple entry points?

## Timeline Estimate

- **Week 1**: Core implementation (loaders, types, build system)
- **Week 2**: Testing (unit, integration, browser tests)
- **Week 3**: Documentation, examples, migration guide
- **Week 4**: User testing, refinements, publish v1.0.0

## Conclusion

The `@countrystatecity/countries-browser` package fills a critical gap for frontend developers who need geographic data in client-side applications. By maintaining API compatibility with the server package while optimizing for browser constraints, we provide a seamless developer experience across different deployment contexts.

The separate package approach respects the different optimization priorities of server vs browser environments while keeping both packages maintainable and focused on their respective use cases.
