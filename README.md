# @countrystatecity/* Package Ecosystem

[![CI](https://github.com/dr5hn/countrystatecity/workflows/CI/badge.svg)](https://github.com/dr5hn/countrystatecity/actions/workflows/ci.yml)
[![Data Update](https://github.com/dr5hn/countrystatecity/workflows/Update%20Data/badge.svg)](https://github.com/dr5hn/countrystatecity/actions/workflows/update-data.yml)

Official package ecosystem for countries, states, cities, and geographic data with iOS/Safari support and minimal bundle sizes.

## 📦 Packages

### @countrystatecity/countries [![npm](https://img.shields.io/npm/v/@countrystatecity/countries)](https://www.npmjs.com/package/@countrystatecity/countries)

Complete countries, states, and cities database with lazy loading and iOS compatibility.

- **Location:** [`packages/countries`](./packages/countries)
- **Documentation:** [README](./packages/countries/README.md)
- **Bundle Size:** <10KB initial load
- **Data:** 250+ countries, 5,000+ states, 150,000+ cities
- **Environment:** 🖥️ **Server-side only** (Node.js, Next.js API routes, Express, etc.)
- **Status:** ✅ Implemented

```bash
npm install @countrystatecity/countries
```

> **⚠️ Server-Side Only**: This package requires Node.js file system access. For browser/frontend use, see [@countrystatecity/countries-browser](#countrystatecitycountries-browser) (coming soon).

### @countrystatecity/timezones [![npm](https://img.shields.io/npm/v/@countrystatecity/timezones)](https://www.npmjs.com/package/@countrystatecity/timezones)

Comprehensive timezone data with conversion utilities and iOS compatibility.

- **Location:** [`packages/timezones`](./packages/timezones)
- **Documentation:** [README](./packages/timezones/README.md)
- **Bundle Size:** <20KB initial load
- **Data:** 392 IANA timezones, 223 countries, 131 abbreviations
- **Environment:** 🖥️ **Server-side only** (Node.js, Next.js API routes, Express, etc.)
- **Status:** ✅ Implemented

```bash
npm install @countrystatecity/timezones
```

### @countrystatecity/countries-browser

Browser-compatible version of the countries package for frontend/client-side usage.

- **Location:** TBD
- **Documentation:** [Specification](./specs/4-countries-browser-package-spec.md)
- **Bundle Size:** ~75KB gzipped for typical use
- **Data:** Same as server package (250+ countries, 5,000+ states, 150,000+ cities)
- **Environment:** 🌐 **Browser/Frontend** (React, Vue, Svelte, Vite, etc.)
- **Status:** 📋 Planned (see [Issue #17](https://github.com/dr5hn/countrystatecity/issues/17))

This package will provide fetch-based data loading for browser environments with the same API as the server package.

## 🚀 Quick Start

> **💡 Choose the right package for your environment:**
> - **Server-side** (Node.js, Next.js API routes, Express): Use `@countrystatecity/countries`
> - **Browser/Frontend** (React, Vue, Svelte, Vite): Use `@countrystatecity/countries-browser` (coming soon) or create API endpoints

### Countries, States, and Cities (Server-Side)

```typescript
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries';

// Get all countries (lightweight - ~5KB)
const countries = await getCountries();

// Get states for a country
const states = await getStatesOfCountry('US');

// Get cities in a state
const cities = await getCitiesOfState('US', 'CA');
```

### Timezones

```typescript
import { getTimezones, getTimezonesByCountry, convertTime } from '@countrystatecity/timezones';

// Get all timezones
const timezones = await getTimezones();

// Get timezones for a country
const usTimezones = await getTimezonesByCountry('US');

// Convert time between timezones
const converted = await convertTime(
  '2025-10-18 14:00',
  'America/New_York',
  'Asia/Tokyo'
);
```

## ✨ Key Features

- 📱 **iOS Compatible**: No stack overflow errors on Safari/iOS browsers
- 🚀 **Minimal Bundle**: <10KB initial load with lazy loading
- 🔄 **Dynamic Loading**: Uses dynamic imports for code-splitting
- 🌐 **Full Data**: Countries, states, cities with translations
- ⏰ **Timezone Support**: Comprehensive timezone information
- 📝 **TypeScript**: Full type definitions included
- 🔧 **Tree-Shakeable**: Only bundle what you use

## 🎯 Why This Ecosystem?

### The Problem

The popular `country-state-city` package (162K weekly downloads) has critical issues:

- 🔴 8MB bundle size (includes ALL data upfront)
- 🔴 iOS Safari crashes with stack overflow errors
- 🔴 Unmaintained for 2+ years
- 🔴 Static imports force entire bundle inclusion

### Our Solution

- ✅ Minimal bundle (<10KB initial)
- ✅ Dynamic imports & lazy loading
- ✅ iOS/Safari compatible
- ✅ Always updated from authoritative database
- ✅ Tree-shakeable & code-splittable

### Bundle Size Comparison

| Action | @countrystatecity/countries | country-state-city |
|--------|----------------------------|-------------------|
| Install & import | 5KB | 8MB |
| Load countries | +2KB | - |
| Load US states | +30KB | - |
| Load CA cities | +15KB | - |
| **Total for typical use** | **~50KB** | **8MB** |

**160x smaller bundle size!**

## 📊 Package Comparison

### Server vs Browser Packages

| Feature | @countrystatecity/countries | @countrystatecity/countries-browser |
|---------|----------------------------|-------------------------------------|
| **Environment** | Node.js, Bun, Deno | Browser, Frontend |
| **Data Loading** | File system (`fs`) | Fetch API |
| **Dependencies** | Node.js built-ins | Zero |
| **Initial Bundle** | ~15KB | ~15KB + 130KB countries data |
| **Lazy Loading** | ✅ Via file system | ✅ Via HTTP requests |
| **TypeScript** | ✅ | ✅ |
| **Same API** | ✅ | ✅ |
| **Use Cases** | Next.js API routes, Express, serverless functions | React, Vue, Svelte, vanilla JS |
| **iOS Compatible** | ✅ | ✅ |
| **Caching** | OS file cache | HTTP cache + memory |
| **Status** | ✅ Available now | 📋 Planned |

### When to Use Each Package

**Use `@countrystatecity/countries` (Server) when:**
- ✅ Building API endpoints or backends
- ✅ Using Next.js App Router server components
- ✅ Running in Node.js, serverless functions (Vercel, AWS Lambda)
- ✅ You have file system access
- ✅ Building command-line tools

**Use `@countrystatecity/countries-browser` (Browser) when:**
- ✅ Building client-side React/Vue/Svelte apps
- ✅ Using Vite for frontend development
- ✅ Need to load data in the browser directly
- ✅ Building single-page applications (SPAs)
- ✅ Running in browser environments only

**Current Workaround (until browser package is ready):**
Create API endpoints using the server package, then fetch from your frontend:

```typescript
// pages/api/countries.ts (Next.js API route)
import { getCountries } from '@countrystatecity/countries';

export default async function handler(req, res) {
  const countries = await getCountries();
  res.json(countries);
}

// components/CountrySelector.tsx (Frontend)
const countries = await fetch('/api/countries').then(r => r.json());
```

See [Vite Deployment Guide](./docs/VITE_DEPLOYMENT.md) for detailed patterns.

## 🏗️ Monorepo Structure

```
countrystatecity/
├── .github/
│   └── workflows/          # CI/CD workflows
│       ├── ci.yml          # Continuous Integration
│       ├── update-data.yml # Automated data updates
│       └── publish.yml     # NPM publishing
├── packages/
│   └── countries/          # @countrystatecity/countries package
├── specs/                  # Technical specifications
├── package.json            # Root package configuration
└── pnpm-workspace.yaml     # Workspace configuration
```

## 🔄 CI/CD & Automation

### Continuous Integration
Every push and PR automatically:
- ✅ Runs type checking
- ✅ Executes 42 comprehensive tests
- ✅ Builds all packages
- ✅ Validates bundle sizes
- ✅ Tests iOS/Safari compatibility

### Automated Data Updates
Weekly automated updates (Sundays at 00:00 UTC):
- 📥 Downloads latest data from [source repository](https://github.com/dr5hn/countries-states-cities-database)
- 🔄 Transforms into optimized split structure
- 🧪 Runs full test suite
- 📝 Creates PR for review if changes detected

**Manual trigger:** Go to [Actions](https://github.com/dr5hn/countrystatecity/actions/workflows/update-data.yml) → Run workflow

### Publishing
Automated publishing to NPM on version changes:
- 🔍 Detects version bumps in package.json
- 📦 Builds and tests before publishing
- 🚀 Publishes to NPM registry
- 🏷️ Creates GitHub release with changelog

See [Workflow Documentation](./.github/workflows/README.md) for details.

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
cd packages/countries && pnpm test:watch
```

### Commands

```bash
# Build all packages
pnpm build

# Test all packages
pnpm test

# Clean build artifacts
pnpm clean
```

## 📊 Testing

All packages include comprehensive tests:

- ✅ Unit tests
- ✅ Integration tests
- ✅ iOS/Safari compatibility tests

Current coverage: 42 tests passing

## 📖 Documentation

- [Monorepo Plan](./specs/1-monorepo-plan.md)
- [@countrystatecity/countries Spec](./specs/2-world-countries-npm-package-spec.md)
- [Package Ecosystem Spec](./specs/3-world-package-ecosystem-spec.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

**For data-related issues** (incorrect country names, missing cities, wrong coordinates, etc.), please report them to the [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database/issues) repository, which is the source of data for this package.

## 📄 License

[ODbL-1.0](./LICENSE) © [dr5hn](https://github.com/dr5hn)

This package and its data are licensed under the Open Database License (ODbL) v1.0. The data is sourced from the [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database) which is also licensed under ODbL-1.0.

You are free to share, create, and adapt this database as long as you:
- **Attribute**: Credit the original sources
- **Share-Alike**: Distribute adaptations under the same license
- **Keep Open**: Don't use technical restrictions

## 🔗 Links

- [GitHub Repository](https://github.com/dr5hn/countrystatecity)
- [Issues](https://github.com/dr5hn/countrystatecity/issues)
- [NPM Organization](https://www.npmjs.com/org/countrystatecity)
