# Vite Integration Test

This test verifies that `@countrystatecity/countries` works correctly in a **server-side Node.js environment**, which is how it should be used with Vite applications.

## Important: Server-Side Usage Only

`@countrystatecity/countries` is designed for server-side use and **cannot** be used directly in browser/client-side code. This is because it:
- Requires Node.js file system access
- Uses Node.js built-in modules (`fs`, `path`, `url`)
- Loads data files from the file system

## What This Tests

This test demonstrates **correct server-side usage** with Vite:
- Loading countries data in Node.js environment
- Loading country metadata with file system access
- Loading states data
- All operations work correctly without browser dependencies

## Running the Test

### Automated Test (CI)

```bash
./test.sh
```

This will:
1. Install dependencies
2. Run the server-side test (`test-server.js`)
3. Verify all data loading operations work correctly

### Manual Testing

```bash
npm install
npm test
```

## Expected Results

The test should complete without errors, showing:
- ✅ Test 1 passed: Loaded countries
- ✅ Test 2 passed: Loaded US country metadata
- ✅ Test 3 passed: Loaded US states

## Usage Patterns for Vite Apps

### ✅ Correct: Server-Side Usage

#### 1. SvelteKit Server Load

```typescript
// src/routes/+page.server.ts
import { getCountries } from '@countrystatecity/countries';

export async function load() {
  const countries = await getCountries();
  return { countries };
}
```

#### 2. API Endpoint

```typescript
// src/api/countries.js
import { getCountries } from '@countrystatecity/countries';

export async function GET() {
  const countries = await getCountries();
  return new Response(JSON.stringify(countries));
}
```

#### 3. Build-Time Generation

```typescript
// scripts/generate-data.js
import { getCountries } from '@countrystatecity/countries';
import fs from 'fs';

const countries = await getCountries();
fs.writeFileSync('src/data/countries.json', JSON.stringify(countries));
```

### ❌ Incorrect: Client-Side Usage

```typescript
// ❌ This will NOT work in the browser
import { getCountries } from '@countrystatecity/countries';

function MyComponent() {
  const [countries, setCountries] = useState([]);
  
  useEffect(() => {
    getCountries().then(setCountries); // Error: Cannot access file system
  }, []);
}
```

**Solution**: Create an API endpoint and fetch from it:

```typescript
// ✅ Fetch from API endpoint instead
useEffect(() => {
  fetch('/api/countries')
    .then(res => res.json())
    .then(setCountries);
}, []);
```

## Complete Guide

See [docs/VITE_DEPLOYMENT.md](../../docs/VITE_DEPLOYMENT.md) for:
- Detailed usage patterns
- Configuration examples
- Troubleshooting guide
- Complete working examples

## Troubleshooting

### Error: "Failed to fetch dynamically imported module"

**Cause**: Trying to use the package in browser/client-side code.

**Solution**: Move to server-side code (SSR, API endpoints) or fetch from an API.

### Error: "Cannot load data in browser environment"

**Cause**: This is the expected error message when the package detects it's running in a browser.

**Solution**: Use one of the correct patterns shown above.

### Error: "Module not found: Can't resolve 'fs'"

**Cause**: Vite is trying to bundle the package for the browser.

**Solution**: Only use the package in server-side code where Node.js modules are available.
