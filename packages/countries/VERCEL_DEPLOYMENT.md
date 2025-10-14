# Vercel / Serverless Deployment Guide

This package works in Vercel and other serverless environments with proper configuration.

## Next.js Configuration

Add this to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mark the package as external to prevent webpack bundling
  serverExternalPackages: ['@countrystatecity/countries'],
  
  // Ensure data files are included in production builds
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/@countrystatecity/countries/dist/data/**/*'],
    '/**': ['./node_modules/@countrystatecity/countries/dist/data/**/*'],
  },
}

module.exports = nextConfig
```

## Why This Configuration Is Needed

### `serverExternalPackages`

This tells Next.js to keep the package external and not bundle it with webpack. This prevents:
- Webpack trying to bundle Node.js modules (`fs`, `path`, `url`)
- Issues with dynamic imports and file system access
- Bundle size inflation

### `outputFileTracingIncludes`

This ensures that the JSON data files are included in the Vercel deployment. Without this:
- Vercel's automatic tracing might miss the dynamically imported JSON files
- You'll get "Cannot find module './data/countries.json'" errors in production

## Alternative: API Routes Only

If you only use the package in API routes, you can simplify the configuration:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@countrystatecity/countries'],
}

module.exports = nextConfig
```

Then manually ensure data files are included in your build if needed.

## Troubleshooting

### "Cannot find module './data/countries.json'"

**Cause**: The JSON data files aren't being included in the Vercel deployment.

**Solution**: Add `outputFileTracingIncludes` to your `next.config.js` as shown above.

### "Module not found: Can't resolve 'fs'"

**Cause**: Webpack is trying to bundle the package for the client side.

**Solution**: Add `serverExternalPackages: ['@countrystatecity/countries']` to your `next.config.js`.

### Build Errors with `outputFileTracingIncludes`

**Cause**: Path patterns might be incorrect or conflicting with other configuration.

**Solution**: Try these alternatives:

1. Use simpler pattern:
```javascript
outputFileTracingIncludes: {
  '/**': ['./node_modules/@countrystatecity/countries/dist/data/**/*'],
}
```

2. Or specific routes only:
```javascript
outputFileTracingIncludes: {
  '/api/location/**': ['./node_modules/@countrystatecity/countries/dist/data/**/*'],
}
```

## Example Usage

### Server Component (Next.js App Router)

```typescript
import { getCountries } from '@countrystatecity/countries';

export default async function CountriesPage() {
  const countries = await getCountries();
  
  return (
    <div>
      <h1>Countries</h1>
      <ul>
        {countries.map(country => (
          <li key={country.iso2}>{country.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### API Route

```typescript
import { NextResponse } from 'next/server';
import { getCountries } from '@countrystatecity/countries';

export async function GET() {
  const countries = await getCountries();
  return NextResponse.json(countries);
}
```

## Testing Locally

Before deploying to Vercel, test your configuration locally:

```bash
npm run build
npm run start
```

Visit your pages/API routes to ensure data loads correctly.

## Support

If you encounter issues:
1. Check that `next.config.js` has the correct configuration
2. Verify the package is installed: `npm list @countrystatecity/countries`
3. Check Vercel build logs for specific error messages
4. Report issues at: https://github.com/dr5hn/countrystatecity/issues
