# Vite Deployment Guide

This package works with Vite in **server-side contexts** (SSR, API routes, backend code). For client-side (browser) usage, you'll need to create API endpoints.

## Important: Server-Side Only

`@countrystatecity/countries` is designed for server-side use because it:
- Accesses the file system to load JSON data
- Uses Node.js modules (`fs`, `path`, `url`)
- Loads potentially large datasets (up to 8MB for all cities)

**❌ Cannot be used directly in browser/client-side code**
**✅ Works in SSR, API routes, and backend code**

## Usage Patterns

### ✅ Pattern 1: Vite SSR (Server-Side Rendering)

If you're using Vite with SSR (like SvelteKit, Astro, or custom SSR setup), you can use the package in server-side code:

#### SvelteKit Example

```typescript
// src/routes/+page.server.ts
import { getCountries } from '@countrystatecity/countries';

export async function load() {
  const countries = await getCountries();
  return { countries };
}
```

#### Astro Example

```astro
---
// src/pages/countries.astro
import { getCountries } from '@countrystatecity/countries';

const countries = await getCountries();
---

<html>
  <body>
    <h1>Countries</h1>
    <ul>
      {countries.map(country => (
        <li>{country.name}</li>
      ))}
    </ul>
  </body>
</html>
```

### ✅ Pattern 2: API Endpoints

Create API routes that serve the data to your client-side code:

#### Vite + Express Backend

```typescript
// server.js
import express from 'express';
import { getCountries, getStatesOfCountry } from '@countrystatecity/countries';

const app = express();

app.get('/api/countries', async (req, res) => {
  const countries = await getCountries();
  res.json(countries);
});

app.get('/api/countries/:code/states', async (req, res) => {
  const states = await getStatesOfCountry(req.params.code);
  res.json(states);
});

app.listen(3000);
```

#### Client-Side Code

```typescript
// src/components/CountrySelector.tsx
import { useState, useEffect } from 'react';

export function CountrySelector() {
  const [countries, setCountries] = useState([]);
  
  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => setCountries(data));
  }, []);
  
  return (
    <select>
      {countries.map(country => (
        <option key={country.iso2} value={country.iso2}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
```

### ✅ Pattern 3: Build-Time Data Generation

Load data at build time and bundle it with your app:

```typescript
// scripts/generate-countries.ts
import { getCountries } from '@countrystatecity/countries';
import fs from 'fs';

async function generateCountriesData() {
  const countries = await getCountries();
  fs.writeFileSync(
    'src/data/countries.json',
    JSON.stringify(countries, null, 2)
  );
}

generateCountriesData();
```

```typescript
// src/components/CountrySelector.tsx
import countries from '../data/countries.json';

export function CountrySelector() {
  return (
    <select>
      {countries.map(country => (
        <option key={country.iso2} value={country.iso2}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
```

## Configuration

### Basic Vite Configuration

For SSR usage, ensure your `vite.config.ts` doesn't try to bundle the package for the client:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    // Don't try to bundle for SSR
    noExternal: [],
  },
  // If you're building for both client and server:
  build: {
    rollupOptions: {
      external: ['@countrystatecity/countries'],
    },
  },
});
```

### SvelteKit Configuration

SvelteKit handles this automatically, but if you need explicit configuration:

```javascript
// svelte.config.js
export default {
  kit: {
    // The package works out of the box with SvelteKit
  }
};
```

## Troubleshooting

### Error: "Failed to fetch dynamically imported module"

**Cause**: You're trying to use the package in client-side (browser) code.

**Solution**: Move the package usage to server-side code:
- Use in SSR/server components
- Create API endpoints to serve the data
- Generate data at build time

**Example Fix**:

```typescript
// ❌ WRONG - Client-side usage
import { getCountries } from '@countrystatecity/countries';

function MyComponent() {
  const [countries, setCountries] = useState([]);
  
  useEffect(() => {
    getCountries().then(setCountries); // This will fail!
  }, []);
}

// ✅ CORRECT - Server-side API endpoint
// api/countries.ts (backend)
import { getCountries } from '@countrystatecity/countries';

export async function GET() {
  const countries = await getCountries();
  return new Response(JSON.stringify(countries));
}

// MyComponent.tsx (client)
function MyComponent() {
  const [countries, setCountries] = useState([]);
  
  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(setCountries); // This works!
  }, []);
}
```

### Error: "Module not found: Can't resolve 'fs'"

**Cause**: Vite is trying to bundle the package for the browser.

**Solution**: Configure Vite to externalize the package for server builds:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@countrystatecity/countries'],
    },
  },
});
```

### Error: "@countrystatecity/countries: Cannot load data in browser environment"

**Cause**: You're using the package in client-side code.

**Solution**: This is the expected behavior! Use one of the patterns described above:
1. Move code to SSR/server-side
2. Create an API endpoint
3. Generate data at build time

## Why Can't This Work in the Browser?

The package needs to:
1. Access the file system to read JSON files
2. Use Node.js built-in modules (`fs`, `path`, `url`)
3. Potentially load large datasets (cities data can be 8MB+)

Browsers don't have file system access and don't support Node.js modules. While it's technically possible to bundle all data files, it would result in:
- Huge initial bundle size (150MB+ of JSON data)
- Long load times
- Poor user experience

Instead, server-side usage with lazy loading provides:
- ~5KB initial load (just the code)
- Load only the data you need
- Better performance
- Works on serverless platforms

## Best Practices

1. **Use SSR when possible**: Frameworks like SvelteKit, Astro, and Next.js make this easy
2. **Create focused API endpoints**: Only serve the data you need
3. **Cache responses**: Use HTTP caching headers for better performance
4. **Consider build-time generation**: For static sites, generate data files at build time

## Example: Complete Vite + Express Setup

See the [vite-integration test](../../tests/vite-integration/) for a complete working example, including:
- Server-side test demonstrating correct usage
- Example API server (`example-api-server.js`) with full CRUD endpoints
- Ready-to-run examples you can use as a starting point

To run the example API server:

```bash
cd tests/vite-integration
npm install
npm run example
```

This starts an API server at `http://localhost:3001` that you can use from your Vite frontend.

## Support

If you encounter issues:
1. Verify you're using the package server-side, not client-side
2. Check that your Vite configuration externalizes the package
3. Review the error message - it should indicate if you're in a browser environment
4. Report issues at: https://github.com/dr5hn/countrystatecity/issues
