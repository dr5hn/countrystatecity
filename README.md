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
- **Status:** ✅ Implemented

```bash
npm install @countrystatecity/countries
```

## 🚀 Quick Start

```typescript
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries';

// Get all countries (lightweight - ~5KB)
const countries = await getCountries();

// Get states for a country
const states = await getStatesOfCountry('US');

// Get cities in a state
const cities = await getCitiesOfState('US', 'CA');
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

MIT © [dr5hn](https://github.com/dr5hn)

## 🔗 Links

- [GitHub Repository](https://github.com/dr5hn/countrystatecity)
- [Issues](https://github.com/dr5hn/countrystatecity/issues)
- [NPM Organization](https://www.npmjs.com/org/countrystatecity)
