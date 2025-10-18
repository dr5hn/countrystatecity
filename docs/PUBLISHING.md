# Publishing Packages

This document describes how to publish packages from the `@countrystatecity` monorepo to NPM.

## Available Packages

- **@countrystatecity/countries**: Countries, states, and cities database
- **@countrystatecity/timezones**: Timezone data with conversion utilities

## Publishing Methods

### 1. Manual Publishing (Recommended)

Use the GitHub Actions workflow dispatch to publish specific packages:

1. Go to the [Publish to NPM workflow](https://github.com/dr5hn/countrystatecity/actions/workflows/publish.yml)
2. Click "Run workflow"
3. Select the package to publish:
   - `countries` - Publish only the countries package
   - `timezones` - Publish only the timezones package
   - `all` - Publish all packages with new versions

The workflow will:
- ✅ Build all packages
- ✅ Run tests
- ✅ Check if the version is already published
- ✅ Publish to NPM (if version is new)
- ✅ Create a GitHub release with the version tag

### 2. Automatic Publishing

When you push changes to `main` branch that affect package code:
- Changes to `packages/*/package.json`
- Changes to `packages/*/src/**`

The workflow will automatically:
- Check both packages for new versions
- Publish any packages with unpublished versions

## Version Management

### Before Publishing

1. **Update the version** in the package's `package.json`:
   ```bash
   cd packages/countries  # or packages/timezones
   npm version patch      # or minor, or major
   ```

2. **Build and test locally**:
   ```bash
   pnpm build
   pnpm test
   ```

3. **Commit the version change**:
   ```bash
   git add packages/*/package.json
   git commit -m "chore: bump version to x.y.z"
   git push
   ```

4. **Trigger the publish workflow** (manual dispatch as described above)

### Version Checking

The workflow automatically checks if a version is already published to NPM:
- If the version exists on NPM, it skips publishing
- If the version is new, it publishes and creates a release

## GitHub Releases

Each package gets its own release with a prefixed tag:
- Countries: `countries-v1.0.4`
- Timezones: `timezones-v1.0.0`

This allows independent versioning of packages in the monorepo.

## Prerequisites

For the workflow to work, the repository needs:
- `NPM_TOKEN` secret configured in GitHub repository settings
- Token must have permission to publish to `@countrystatecity` scope

## Troubleshooting

### "Version already published" but workflow still runs
This is expected behavior. The workflow checks the version and skips publishing if it already exists.

### Publishing fails with permission error
Check that:
1. The NPM_TOKEN is valid and not expired
2. The token has permission to publish to the `@countrystatecity` scope
3. The package name in package.json matches the scope

### Build or test failures
The workflow will not publish if build or tests fail. Fix the issues and try again.

## Package Configuration

Both packages are configured with:
```json
{
  "publishConfig": {
    "access": "public"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

This ensures:
- Packages are publicly accessible on NPM
- Only necessary files (dist and README) are included in the published package
