# Examples

This directory contains example implementations of `@countrystatecity/countries-browser` in different environments.

## Available Examples

### Vanilla JavaScript (`vanilla/`)

A simple HTML + JavaScript example demonstrating:
- Loading countries on page load
- Cascading dropdowns (Country → State → City)
- Using the browser package without any framework

**To run:**
```bash
cd vanilla
# Serve with any HTTP server, e.g.:
npx http-server -p 3000
# Or:
python3 -m http.server 3000
```

Then open http://localhost:3000

### React (`react/`)

*(Coming soon)*

A React example demonstrating:
- Using the package with React hooks
- TypeScript integration
- Custom hooks for data loading

### Vue (`vue/`)

*(Coming soon)*

A Vue 3 example demonstrating:
- Composition API usage
- Reactive data loading
- TypeScript support

## Real Package Usage

To use the actual `@countrystatecity/countries-browser` package:

1. **Install the package:**
   ```bash
   npm install @countrystatecity/countries-browser
   ```

2. **Import in your code:**
   ```javascript
   import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries-browser';
   ```

3. **Configure if needed:**
   ```javascript
   import { configure } from '@countrystatecity/countries-browser';
   
   configure({
     baseURL: 'https://your-cdn.com/data',  // Optional: use custom CDN
     cache: true,
     timeout: 5000,
   });
   ```

4. **Load data:**
   ```javascript
   const countries = await getCountries();
   const states = await getStatesOfCountry('US');
   const cities = await getCitiesOfState('US', 'CA');
   ```

## Notes

- All examples require an HTTP server (not `file://` protocol)
- Data files must be accessible at the configured `baseURL`
- The package uses browser's Fetch API for loading data
- TypeScript definitions are included for better IDE support
