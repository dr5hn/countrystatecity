# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pnpm monorepo for the `@countrystatecity/*` package ecosystem - comprehensive geographic data packages (countries, states, cities, timezones) with iOS/Safari compatibility, minimal bundle sizes, and lazy loading support.

**Key innovation**: Addresses critical issues in the popular `country-state-city` package (162K weekly downloads) which has an 8MB bundle size and iOS Safari crashes. This ecosystem provides the same data with <10KB initial load through dynamic imports and split data files.

**Critical Architecture Decision**: Packages are split by **environment** (server vs browser), not by feature.
- **Server packages** (`@countrystatecity/countries`, `@countrystatecity/timezones`): Use Node.js file system APIs, cannot run in browsers
- **Browser package** (planned: `@countrystatecity/countries-browser`): Uses fetch API, designed for frontend/client-side usage
- This separation is **intentional and necessary** - attempting to make server packages browser-compatible would compromise their core design

## Monorepo Structure

```
packages/
├── countries/         @countrystatecity/countries - SERVER-SIDE countries, states, cities
└── timezones/         @countrystatecity/timezones - SERVER-SIDE timezone data & conversion
tests/
├── nextjs-integration/  Real Next.js app for testing webpack compatibility
└── vite-integration/    Real Vite app for testing SSR compatibility
specs/
└── 4-countries-browser-package-spec.md  Specification for browser package
```

## Development Commands

### Root Level (affects all packages)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode (navigate to specific package first)
cd packages/countries && pnpm test:watch

# Clean all build artifacts and node_modules
pnpm clean

# Lint all packages
pnpm lint
```

### Package-Specific Commands

```bash
# Work on a specific package
cd packages/countries  # or packages/timezones

# Build this package only
pnpm build

# Build in watch mode
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run iOS compatibility tests only
pnpm test:ios

# Type check
pnpm typecheck

# Run specific test file
pnpm vitest tests/unit/loaders.test.ts

# Run with coverage
pnpm vitest --coverage
```

### Integration Testing

```bash
# Test Next.js integration
cd tests/nextjs-integration
pnpm install
pnpm build   # Must succeed for Next.js compatibility

# Test Vite integration
cd tests/vite-integration
pnpm install
pnpm build
```

## Critical Architecture Patterns

### 1. Dynamic Import Strategy for Code Splitting

The core innovation is using dynamic `import()` with careful webpack handling to enable lazy loading while maintaining compatibility across environments (Next.js, Vite, serverless).

**Key pattern in `packages/*/src/loaders.ts`:**

```typescript
// Uses webpackIgnore to prevent bundling Node.js modules
async function importNodeModule(moduleName: string): Promise<any> {
  switch (moduleName) {
    case 'fs':
      return import(/* webpackIgnore: true */ 'fs');
    case 'path':
      return import(/* webpackIgnore: true */ 'path');
    // ...
  }
}
```

**Important**: The `webpackIgnore` comment generates an expected webpack warning: "Critical dependency: the request of a dependency is an expression". This is harmless and indicates the fix is working correctly.

### 2. Multi-Environment Path Resolution

The `loadJSON` function in loaders.ts uses multiple fallback paths to work across different deployment environments:

```typescript
const possiblePaths = [
  pathModule.join(basePath, path),                    // Local development
  pathModule.join(basePath, '..', path),              // Alternative bundling
  pathModule.join(process.cwd(), 'node_modules', '@countrystatecity', 'countries', 'dist', path), // Vercel/serverless
];
```

This handles: local dev, different bundler outputs, Vercel's serverless layout, AWS Lambda, and other platforms.

### 3. Split Data File Structure

Data is organized in a hierarchical split structure to enable lazy loading:

```
src/data/
├── countries.json                    # ~5KB - lightweight list
├── {CountryName-CODE}/
│   ├── meta.json                    # Country metadata with timezones
│   ├── states.json                  # States list
│   └── {StateName-CODE}/
│       └── cities.json              # Cities for that state
```

**Why this matters**: Users only load what they need. Loading all countries is 5KB, but getting cities for a specific state only loads that state's file (~15-200KB depending on state).

### 4. Environment Detection

```typescript
function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' &&
         process.versions != null &&
         process.versions.node != null;
}
```

All file system operations are guarded by this check. Browser environments receive helpful error messages directing users to use server-side code.

## Package Build System

Both packages use **tsup** for building with identical configuration patterns:

- **Entry**: `src/index.ts`
- **Formats**: ESM and CommonJS
- **Output**: `dist/` with `.js`, `.cjs`, `.d.ts`, and copied `data/` directory
- **Important**: Data files are copied (not bundled) to `dist/data/` during build

Build process (`tsup.config.ts`):
1. Bundle TypeScript code
2. Generate type definitions
3. Copy entire `src/data/` directory to `dist/data/` (via onSuccess hook)

## Testing Strategy

The repository has 42+ tests across multiple layers:

1. **Unit tests** (`packages/*/tests/unit/`): Core function logic
2. **Integration tests** (`packages/*/tests/integration/`): API workflows
3. **Compatibility tests** (`packages/*/tests/compatibility/`): iOS/Safari specific
4. **Framework integration tests** (`tests/nextjs-integration/`, `tests/vite-integration/`): Real-world bundler compatibility

**Critical**: Next.js integration test (`tests/nextjs-integration/`) runs in CI and must pass. This verifies webpack compatibility and catches bundling issues.

## Next.js / Vercel Deployment Requirements

When users deploy apps using these packages to Next.js/Vercel, they **must** add this to `next.config.js`:

```javascript
module.exports = {
  serverExternalPackages: ['@countrystatecity/countries', '@countrystatecity/timezones'],
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/@countrystatecity/countries/dist/data/**/*',
      './node_modules/@countrystatecity/timezones/dist/data/**/*',
    ],
  },
}
```

**Why both are needed**:
- `serverExternalPackages`: Prevents webpack from bundling the package (avoids "Can't resolve 'fs'" errors)
- `outputFileTracingIncludes`: Ensures JSON data files are included in Vercel deployment

## Vite / SSR Usage

For Vite users, the package must be used in server-side code only. See `docs/VITE_DEPLOYMENT.md` and `tests/vite-integration/` for patterns:

1. Create API endpoints that use the package server-side
2. Client-side code fetches from these endpoints
3. Alternatively, use in SSR/SSG contexts where Node.js is available

## Data Updates

### Manual Data Update

```bash
cd packages/countries  # or packages/timezones

# Download latest data from source
curl -L "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bstates%2Bcities.json.gz" \
  -o /tmp/countries-data.json.gz
gunzip /tmp/countries-data.json.gz

# Generate split structure
node scripts/generate-data.cjs /tmp/countries-data.json

# Test and build
pnpm build
pnpm test
```

### Automated Updates

- **Schedule**: Weekly on Sundays at 00:00 UTC via GitHub Actions
- **Process**: Downloads data → Transforms to split structure → Runs tests → Creates PR
- **Source**: [Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database)

**Important**: Data issues should be reported to the source database repository, not here.

## Publishing Workflow

Automated via `.github/workflows/publish.yml`:

1. Detect version bumps in package.json
2. Build and test
3. Publish to NPM
4. Create GitHub release

Manual publishing requires NPM access token configured in GitHub secrets.

## Common Webpack Warnings (Expected)

When building Next.js apps that use these packages, you may see:

```
Critical dependency: the request of a dependency is an expression
```

**Status**: Expected and harmless. This indicates `webpackIgnore` is working correctly to prevent bundling Node.js modules.

## Type System

All packages export comprehensive TypeScript types from `src/types.ts`:

- `ICountry` - Basic country info (lightweight)
- `ICountryMeta` - Full country with timezones & translations
- `IState` - State/province info
- `ICity` - City info with coordinates
- `ITimezone` - Timezone information
- `ITranslations` - Localized name translations

## Code Style Conventions

- **Functions**: camelCase (e.g., `getCountries`)
- **Types/Interfaces**: PascalCase with `I` prefix (e.g., `ICountry`)
- **Files**: kebab-case.ts
- Prefer `const` over `let`
- Use explicit return types on functions
- Avoid `any` - use `unknown` if needed

## Bundle Size Monitoring

Bundle sizes are critical to this project's value proposition:

- Countries package: <10KB initial load
- Timezones package: <20KB initial load
- Individual data files: Varies by country/state

Always verify bundle impact of changes using the integration tests.

## Important Implementation Notes

1. **Never bundle data files**: Data must remain as separate JSON files for lazy loading
2. **Always test with real bundlers**: Unit tests alone don't catch webpack/Vite issues
3. **Consider serverless environments**: File paths work differently in Lambda/Vercel Functions
4. **Maintain fallback strategies**: Multiple path resolution attempts ensure cross-platform reliability
5. **Document configuration requirements**: Users need clear setup instructions for Next.js/Vite
6. **iOS compatibility is critical**: The original `country-state-city` package crashes on iOS Safari due to large static imports - dynamic imports prevent this

## CI/CD Workflows

Located in `.github/workflows/`:

- **ci.yml**: Runs on every push/PR - type check, build, test (42 tests), Next.js integration test
- **update-data.yml**: Weekly automated data updates from source database
- **publish.yml**: Automated NPM publishing on version changes

All CI checks must pass before merging.

## Key Dependencies

- **pnpm**: v8.15.0 (workspace management)
- **Node.js**: >=18.0.0
- **TypeScript**: v5.3.0
- **tsup**: v8.0.0 (building)
- **vitest**: v1.0.0 (testing)

## Documentation Structure

- `README.md` (root): Ecosystem overview, quick start, bundle comparison
- `packages/*/README.md`: Package-specific API documentation
- `CONTRIBUTING.md`: Detailed contribution guidelines
- `docs/VERCEL_DEPLOYMENT.md`: Vercel/serverless deployment guide
- `docs/VITE_DEPLOYMENT.md`: Vite SSR usage patterns
- `.github/copilot-instructions.md`: Historical context on Next.js compatibility fixes

## Frontend/Browser Usage - Important Context

**Issue #17**: User reported "Failed to fetch dynamically imported module" error when using package in Vite frontend.

**Root Cause**: The server packages (`@countrystatecity/countries`, `@countrystatecity/timezones`) are architecturally designed for Node.js and **cannot** run in browsers because:
1. Use `fs.readFileSync()` for file system access
2. Depend on Node.js built-in modules (`fs`, `path`, `url`)
3. Expect file system paths, not HTTP URLs
4. 52MB of JSON data files require file system

**Resolution**: Create separate browser package (`@countrystatecity/countries-browser`) - see `specs/4-countries-browser-package-spec.md`

**Workarounds until browser package exists**:
1. Use in API endpoints (fetch from frontend)
2. Use in SSR contexts only (SvelteKit load functions, Astro components)
3. Generate static JSON at build time

**Do NOT attempt to**:
- Make server packages browser-compatible (breaks core design)
- Bundle all 52MB of data (defeats lazy loading purpose)
- Use server package directly in client-side code

## When Making Changes

1. Understand the environment (Node.js vs browser, webpack vs Vite vs serverless)
2. **Respect the server-only architecture** - do not add browser compatibility to server packages
3. Test with integration tests - unit tests alone are insufficient
4. Consider bundle size impact - run builds and check dist/ sizes
5. Update relevant documentation
6. Ensure CI passes (includes Next.js integration test)
7. For API changes: update package README and type definitions
