# Contributing to @countrystatecity Packages

Thank you for your interest in contributing! This document provides guidelines for contributing to the @countrystatecity package ecosystem.

## 🚀 Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/countrystatecity.git
   cd countrystatecity
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build Packages**
   ```bash
   pnpm build
   ```

4. **Run Tests**
   ```bash
   pnpm test
   ```

## 📝 Development Workflow

### Creating a Branch

Create a descriptive branch name:
```bash
git checkout -b feature/add-new-utility
git checkout -b fix/loader-bug
git checkout -b docs/update-readme
```

### Making Changes

1. **Code Changes**
   - Follow existing code style
   - Add TypeScript types for all new code
   - Update tests for any changes
   - Ensure all tests pass: `pnpm test`

2. **Documentation**
   - Update README files for user-facing changes
   - Add JSDoc comments to public APIs
   - Update CHANGELOG if applicable

3. **Testing**
   ```bash
   # Run all tests
   pnpm test
   
   # Run tests in watch mode
   cd packages/countries && pnpm test:watch
   
   # Run specific test file
   pnpm --filter "@countrystatecity/countries" vitest tests/unit/loaders.test.ts
   ```

### Commit Guidelines

Use conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring

Examples:
```bash
git commit -m "feat: add getCountryByName utility function"
git commit -m "fix: resolve directory mapping issue for special characters"
git commit -m "docs: update API documentation with examples"
```

### Submitting a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin your-branch-name
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link any related issues

3. **CI Checks**
   - All tests must pass
   - Code must build successfully
   - Bundle size checks must pass

4. **Review Process**
   - Address review feedback
   - Keep PR scope focused
   - Respond to comments

## 🧪 Testing

### Test Structure

```
tests/
├── unit/              # Unit tests for individual functions
├── integration/       # Integration tests for workflows
└── compatibility/     # iOS/Safari compatibility tests
```

### Writing Tests

Use Vitest for all tests:

```typescript
import { describe, it, expect } from 'vitest';
import { getCountries } from '../../src/loaders';

describe('getCountries', () => {
  it('should return array of countries', async () => {
    const countries = await getCountries();
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);
  });
});
```

### Running Specific Tests

```bash
# Run all tests
pnpm test

# Run iOS compatibility tests only
pnpm --filter "@countrystatecity/countries" test:ios

# Run with coverage
pnpm --filter "@countrystatecity/countries" vitest --coverage
```

## 📊 Data Updates

### Manual Data Update

To update the data from the source:

```bash
cd packages/countries

# Download latest data
curl -L "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bstates%2Bcities.json" \
  -o /tmp/countries-data.json

# Generate split structure
node scripts/generate-data.cjs /tmp/countries-data.json

# Test with new data
pnpm build
pnpm test
```

### Automated Updates

Data updates happen automatically:
- **Schedule:** Weekly on Sundays at 00:00 UTC
- **Process:** Downloads → Transforms → Tests → Creates PR
- **Review:** Check the automated PR before merging

## 🏗️ Adding New Packages

To add a new package to the monorepo:

1. **Create Package Directory**
   ```bash
   mkdir -p packages/your-package/src
   cd packages/your-package
   ```

2. **Initialize Package**
   ```bash
   pnpm init
   ```

3. **Configure package.json**
   ```json
   {
     "name": "@countrystatecity/your-package",
     "version": "1.0.0",
     "type": "module",
     "main": "./dist/index.cjs",
     "module": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     }
   }
   ```

4. **Add Build Configuration**
   - Copy `tsconfig.json` from existing package
   - Copy `tsup.config.ts` and adjust as needed
   - Add tests directory

5. **Update Root Package**
   - Package will be automatically included in workspace

## 🔧 Debugging

### Build Issues

```bash
# Clean all build artifacts
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Build with verbose output
pnpm --filter "@countrystatecity/countries" build --verbose
```

### Test Issues

```bash
# Run tests with debug output
DEBUG=* pnpm test

# Run single test file
pnpm vitest tests/unit/loaders.test.ts

# Update test snapshots
pnpm vitest -u
```

### CI Failures

1. Check workflow logs in GitHub Actions
2. Run the same commands locally
3. Ensure Node version matches (v20)
4. Verify pnpm version (8.15.0)

## 📖 Documentation

### API Documentation

- Use JSDoc for all public functions
- Include `@param`, `@returns`, `@example`
- Document any warnings or limitations

Example:
```typescript
/**
 * Get all cities in a specific state
 * @param countryCode - ISO2 country code (e.g., 'US')
 * @param stateCode - State code (e.g., 'CA')
 * @returns Promise with array of cities
 * @example
 * ```typescript
 * const cities = await getCitiesOfState('US', 'CA');
 * console.log(cities[0].name); // "Los Angeles"
 * ```
 */
export async function getCitiesOfState(
  countryCode: string,
  stateCode: string
): Promise<ICity[]> {
  // Implementation
}
```

### README Updates

Update relevant README files:
- Root README for ecosystem changes
- Package README for API changes
- Workflow README for CI/CD changes

## 🎯 Code Style

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use explicit return types
- Avoid `any` (use `unknown` if needed)

### Formatting

Code is formatted automatically, but follow these guidelines:
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- No semicolons

### Naming Conventions

- Functions: `camelCase`
- Types/Interfaces: `PascalCase` with `I` prefix for interfaces
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case.ts`

## 🐛 Reporting Issues

### Data Issues

**For any data-related issues** (incorrect country names, missing cities, wrong coordinates, etc.), please report them to the source database repository:

📊 **[Countries States Cities Database](https://github.com/dr5hn/countries-states-cities-database/issues)**

This package uses data from the above repository. Data fixes should be made there first, then synced to this package.

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, OS, etc.)
- Code samples or screenshots

### Feature Requests

Include:
- Use case and motivation
- Proposed API design
- Examples of usage
- Impact on bundle size

## 💬 Getting Help

- 📖 [Documentation](https://github.com/dr5hn/countrystatecity)
- 🐛 [Issues](https://github.com/dr5hn/countrystatecity/issues)
- 💡 [Discussions](https://github.com/dr5hn/countrystatecity/discussions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the Open Database License (ODbL) v1.0, the same license as the project.
