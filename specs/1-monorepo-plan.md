# Complete Monorepo Specifications - @world Ecosystem

**Document Purpose:** Pure specifications for building the @world/* NPM package ecosystem in a monorepo structure. No implementation code - only requirements, architecture, and guidelines.

---

## 📋 Executive Summary

### **Business Context**
- **Existing Assets:** Popular API at countrystatecity.in, export tool, 3 domains (.in, .io, .org)
- **Problem:** Existing npm package (country-state-city) has iOS crashes, 8MB bundle, unmaintained
- **Solution:** Build official @world/* ecosystem with iOS support, lazy loading, always updated from your database

### **Technical Approach**
- **Monorepo:** Single repository with multiple packages
- **Package Naming:** @world/* namespace (e.g., @world/countries)
- **Architecture:** Lazy-loading, split data files, dynamic imports
- **Data Source:** Your MySQL database synced via API

---

## 🏗️ Monorepo Architecture Specifications

### **Directory Structure Requirements**

```
world/                                  [Root monorepo directory]
├── .github/                           [GitHub configuration]
│   └── workflows/                     [CI/CD workflows]
│       ├── ci.yml                     [Tests, lint, build verification]
│       ├── publish.yml                [Automated npm publishing]
│       └── ios-test.yml               [iOS compatibility testing]
│
├── packages/                          [All publishable npm packages]
│   ├── countries/                     [Priority 1: @world/countries]
│   │   ├── src/                       [Source code]
│   │   │   ├── index.ts              [Main entry point]
│   │   │   ├── types.ts              [TypeScript interfaces]
│   │   │   ├── loaders.ts            [Dynamic data loading]
│   │   │   ├── utils.ts              [Utility functions]
│   │   │   └── data/                 [JSON data files - split structure]
│   │   │       ├── countries.json    [Lightweight country list]
│   │   │       └── [Country-CODE]/   [Per-country directories]
│   │   │           ├── meta.json     [Full country data + timezones]
│   │   │           ├── states.json   [All states in country]
│   │   │           └── [State-CODE]/ [Per-state directories]
│   │   │               └── cities.json [Cities in state]
│   │   ├── tests/                    [Test files]
│   │   │   ├── unit/                 [Unit tests]
│   │   │   ├── integration/          [Integration tests]
│   │   │   └── compatibility/        [iOS/Safari specific tests]
│   │   ├── scripts/                  [Data generation scripts]
│   │   │   ├── generate-data.ts      [Generate from database]
│   │   │   └── validate-data.ts      [Validate structure]
│   │   ├── package.json              [Package configuration]
│   │   ├── tsconfig.json             [TypeScript config]
│   │   ├── tsup.config.ts            [Build configuration]
│   │   └── README.md                 [Package documentation]
│   │
│   ├── timezones/                     [Priority 2: @world/timezones]
│   ├── currencies/                    [Priority 3: @world/currencies]
│   ├── languages/                     [Priority 4: @world/languages]
│   ├── phone-codes/                   [Priority 5: @world/phone-codes]
│   ├── airports/                      [Future: @world/airports]
│   ├── postal-codes/                  [Future: @world/postal-codes]
│   ├── validate/                      [Future: @world/validate]
│   ├── format/                        [Future: @world/format]
│   └── react/                         [Future: @world/react]
│
├── apps/                              [Non-publishable applications]
│   ├── docs/                          [Documentation website]
│   │   ├── pages/                     [Documentation pages]
│   │   ├── components/                [Reusable components]
│   │   ├── public/                    [Static assets]
│   │   └── package.json               [Next.js app config]
│   │
│   ├── playground/                    [Interactive demo site]
│   └── api-proxy/                     [Optional: API wrapper]
│
├── shared/                            [Shared utilities (not published)]
│   ├── types/                         [Shared TypeScript types]
│   │   └── index.ts                   [Common interfaces]
│   ├── utils/                         [Shared utility functions]
│   ├── tsconfig/                      [Shared TypeScript configs]
│   │   ├── base.json                  [Base config]
│   │   ├── nextjs.json                [Next.js specific]
│   │   └── library.json               [Library specific]
│   └── eslint-config/                 [Shared ESLint rules]
│
├── scripts/                           [Root-level scripts]
│   ├── generate-all-data.ts          [Generate data for all packages]
│   ├── validate-all-data.ts          [Validate all packages]
│   ├── sync-from-api.ts              [Sync from your API]
│   └── publish-workflow.ts           [Publishing automation]
│
├── package.json                       [Root package.json - private]
├── pnpm-workspace.yaml               [Workspace configuration]
├── turbo.json                        [Turborepo configuration]
├── tsconfig.json                     [Root TypeScript config]
├── .env.example                      [Environment variables template]
├── .gitignore                        [Git ignore rules]
├── .npmrc                            [NPM configuration]
└── README.md                         [Monorepo documentation]
```

---

## 📦 Package Specifications

### **1. @world/countries (Priority 1)**

**Package Requirements:**
- Package name: `@world/countries`
- Bundle size target: <10KB initial load
- iOS/Safari compatibility: MANDATORY
- Data loading: Dynamic imports only
- Data structure: Split by country/state (NEVER combine)
- Update frequency: Sync with your database weekly/monthly

**Functional Requirements:**
- Get all countries (lightweight list)
- Get country metadata (with timezones, translations)
- Get states by country
- Get cities by state
- Get all cities in country (with warning about size)
- Search utilities
- Validation helpers

**Non-Functional Requirements:**
- Initial bundle: <10KB
- Country list load: <50KB
- State data load: <100KB per country
- City data load: <200KB per state
- Load time: <500ms on 3G
- iOS Safari: No stack overflow errors
- Tree-shakeable: Must support tree-shaking
- TypeScript: Full type definitions required

**Data Source Integration:**
- Primary: Your MySQL database
- Secondary: Your existing API (for validation/sync)
- Update mechanism: Automated script from database
- Sync frequency: Weekly or on-demand

**Testing Requirements:**
- Unit tests: 80%+ coverage
- Integration tests: All API functions
- iOS compatibility: Test on iPhone Safari 13+
- Bundle size: Automated checks on CI
- Load time: Performance tests

---

### **2. @world/timezones (Priority 2)**

**Package Requirements:**
- Package name: `@world/timezones`
- Purpose: IANA timezone data with conversion utilities
- Bundle size target: <20KB initial

**Functional Requirements:**
- Get all timezones
- Get timezones by country
- Get timezone info (current time, offset, DST)
- Convert time between timezones
- Validate timezone names
- Get GMT/UTC offsets

**Data Structure:**
- timezones.json (all IANA timezones)
- by-country/ (timezones grouped by country)
- abbreviations.json (EST, PST, etc.)

**Integration Points:**
- Uses country codes from @world/countries
- Can be imported independently
- Shares TypeScript types from shared/types

---

### **3. @world/currencies (Priority 3)**

**Package Requirements:**
- Package name: `@world/currencies`
- Purpose: Currency codes, symbols, formatting
- Bundle size target: <5KB initial

**Functional Requirements:**
- Get all currencies
- Get currency by code
- Get currencies by country
- Format currency amounts
- Get currency symbols
- Parse currency strings

**Data Structure:**
- currencies.json (ISO 4217 codes)
- by-country/ (country-currency mappings)
- symbols.json (currency symbols)

---

### **4. @world/languages (Priority 4)**

**Package Requirements:**
- Package name: `@world/languages`
- Purpose: World languages with native names
- Bundle size target: <10KB initial

**Functional Requirements:**
- Get all languages
- Get language by code (ISO 639-1/2)
- Get languages by country
- Get countries by language
- Check if RTL (right-to-left)
- Get native language names

**Data Structure:**
- languages.json (all languages)
- by-country/ (country-language mappings)
- scripts.json (writing systems)

---

### **5. @world/phone-codes (Priority 5)**

**Package Requirements:**
- Package name: `@world/phone-codes`
- Purpose: International dialing codes and validation
- Bundle size target: <8KB initial

**Functional Requirements:**
- Get all phone codes
- Get phone code by country
- Validate phone numbers
- Format phone numbers
- Parse phone numbers
- Get country from phone number

**Data Structure:**
- phone-codes.json (all country codes)
- formats/ (validation patterns by country)

---

### **Future Packages (Lower Priority)**

6. **@world/airports** - Airport codes (IATA/ICAO)
7. **@world/postal-codes** - Postal code formats and validation
8. **@world/borders** - Country borders and neighbors
9. **@world/flags** - Flag emojis and SVG assets
10. **@world/coordinates** - Geolocation utilities
11. **@world/validate** - Unified validation utilities
12. **@world/format** - Formatting utilities
13. **@world/distance** - Distance calculations
14. **@world/react** - React components for all packages

---

## 🔧 Technical Specifications

### **Monorepo Tooling Requirements**

**Package Manager:**
- Tool: pnpm (required)
- Version: 8.x or higher
- Reason: Faster, disk-efficient, better workspace support

**Build System:**
- Tool: Turborepo (required)
- Purpose: Parallel builds, caching, task orchestration
- Configuration: turbo.json with build pipeline

**Build Tool (per package):**
- Tool: tsup (recommended) or Vite
- Output: ESM and CJS formats
- Requirements: Tree-shaking, minification, source maps

**Testing Framework:**
- Tool: Vitest (recommended)
- Coverage: 80%+ for core functions
- Types: Unit, integration, compatibility (iOS)

**TypeScript:**
- Version: 5.x
- Mode: Strict
- Config: Shared base config in shared/tsconfig

**Code Quality:**
- Linter: ESLint with TypeScript support
- Formatter: Prettier
- Pre-commit: Lint-staged + Husky (optional)

---

### **Package Configuration Standards**

**Every Package Must Have:**

1. **package.json Requirements:**
   - name: @world/[package-name]
   - version: Semantic versioning
   - main: ./dist/index.cjs (CommonJS)
   - module: ./dist/index.js (ESM)
   - types: ./dist/index.d.ts (TypeScript)
   - exports: Proper exports map
   - files: Only dist/ and README.md
   - repository: Link to monorepo
   - homepage: Link to countrystatecity.io
   - publishConfig: { access: "public" }

2. **Build Configuration:**
   - Output: dist/ directory
   - Formats: ESM and CJS
   - TypeScript: Declaration files (.d.ts)
   - Source maps: Always include
   - Minification: Optional (for production)

3. **Testing Configuration:**
   - Framework: Vitest
   - Coverage: Coverage reports
   - iOS tests: Separate test suite

4. **Documentation:**
   - README.md with:
     - Installation instructions
     - Quick start examples
     - API reference
     - Bundle size badge
     - iOS compatibility badge
     - Link to full docs

---

### **Data Management Specifications**

**Data Generation Requirements:**

1. **Source of Truth:**
   - Primary: Your MySQL database
   - Backup: Your API (countrystatecity.in)
   - Format: JSON (split structure)

2. **Generation Process:**
   - Frequency: Weekly automated or manual trigger
   - Method: Direct database query OR API fetch
   - Validation: Automated validation script
   - Commit: Automated PR with data updates

3. **Data Structure Rules:**
   - NEVER combine files into monolithic JSONs
   - ALWAYS keep split structure (country/state/city)
   - File naming: Use underscores for spaces (United_States-US)
   - Encoding: UTF-8
   - Format: Pretty-printed JSON (2 spaces)

4. **Data Quality:**
   - Validation: Automated schema validation
   - Completeness: Check for missing fields
   - Consistency: Cross-reference IDs
   - Testing: Load tests for large countries

**Data Sync Specifications:**

Option A - Direct Database:
- Connect to MySQL database
- Query tables: countries, states, cities
- Transform to JSON structure
- Write to packages/*/src/data/

Option B - API Sync:
- Fetch from countrystatecity.in API
- Rate limit: Respect API limits
- Authentication: Use API key
- Transform: Match package structure
- Write: Same as Option A

---

## 🌐 Domain & Infrastructure Strategy

### **Domain Allocation**

**countrystatecity.io** (Primary)
- Purpose: Main documentation and package showcase
- Technology: Next.js 14 (app router)
- Location: apps/docs/ in monorepo
- Content:
  - Landing page with package overview
  - Getting started guides
  - API documentation for each package
  - Interactive playground
  - Bundle size comparisons
  - iOS compatibility proof
  - Migration guides from old packages
  - Blog/changelog

**countrystatecity.in** (Existing API)
- Purpose: Keep existing API operational
- Strategy: Cross-promote NPM packages
- Updates:
  - Add banner linking to NPM packages
  - Update docs to mention packages
  - Show migration examples
  - Track API usage vs NPM usage

**countrystatecity.org** (Optional/Future)
- Purpose: Community and resources
- Content ideas:
  - Developer blog
  - Community showcase
  - Data accuracy reports
  - Contribution guidelines
  - Educational content about geographical data

### **Hosting Requirements**

**Documentation Site (countrystatecity.io):**
- Hosting: Vercel or Netlify (recommended)
- SSL: Required
- CDN: Built-in with hosting
- Analytics: Google Analytics or Plausible
- Search: Algolia DocSearch (optional)

**NPM Packages:**
- Registry: npmjs.com
- Scope: @world
- Publishing: Automated via GitHub Actions
- Access: Public

**GitHub Repository:**
- URL: github.com/yourusername/world
- Visibility: Public
- Organization: Optional (can use personal)
- Features: Issues, Discussions, Wiki, Actions

---

## 🚀 CI/CD Specifications

### **GitHub Actions Requirements**

**Workflow 1: Continuous Integration (ci.yml)**
- Trigger: On push to main/develop, on pull requests
- Jobs:
  1. Install dependencies (pnpm install)
  2. Run linter (pnpm lint)
  3. Run tests (pnpm test)
  4. Build all packages (pnpm build)
  5. Check bundle sizes
  6. Run iOS compatibility tests (on macOS runner)
- Success criteria: All checks pass
- Failure action: Block PR merge

**Workflow 2: Package Publishing (publish.yml)**
- Trigger: On push to main (after merge)
- Tool: Changesets for versioning
- Jobs:
  1. Install dependencies
  2. Build all packages
  3. Run tests
  4. Create changesets
  5. Publish to NPM
  6. Create GitHub release
  7. Update documentation
- Authentication: NPM_TOKEN secret
- Versioning: Semantic versioning

**Workflow 3: Data Sync (sync-data.yml)**
- Trigger: Weekly cron OR manual
- Jobs:
  1. Connect to database/API
  2. Fetch latest data
  3. Generate JSON files
  4. Validate data structure
  5. Create PR with updates
  6. Auto-merge if tests pass
- Secrets: DB credentials or API key

**Workflow 4: Documentation Deploy (deploy-docs.yml)**
- Trigger: On push to main (docs changes)
- Jobs:
  1. Build documentation site
  2. Deploy to countrystatecity.io
  3. Invalidate CDN cache
- Integration: Vercel or Netlify

---

## 📊 Quality Assurance Specifications

### **Testing Requirements**

**Unit Tests:**
- Coverage: 80%+ for all packages
- Framework: Vitest
- Location: packages/*/tests/unit/
- What to test:
  - All public functions
  - Data loaders
  - Validation functions
  - Utility functions
  - Error handling

**Integration Tests:**
- Coverage: All API endpoints
- Location: packages/*/tests/integration/
- What to test:
  - Complete user workflows
  - Cross-package integration
  - Data consistency
  - Performance benchmarks

**Compatibility Tests:**
- Critical: iOS Safari compatibility
- Location: packages/*/tests/compatibility/
- Test environments:
  - iOS Safari 13+
  - macOS Safari 13+
  - iOS Chrome
  - Android Chrome
  - Desktop browsers
- Test cases:
  - Load large country data
  - Sequential loads
  - Memory usage
  - Stack depth

**Performance Tests:**
- Bundle size: Automated on every build
- Load time: <500ms on 3G
- Memory: No memory leaks
- Tree-shaking: Verify unused code is removed

### **Code Quality Standards**

**TypeScript:**
- Strict mode: Required
- No any types: Avoid (use unknown or proper types)
- Interfaces: Define for all public APIs
- Generics: Use where appropriate
- Documentation: TSDoc comments for public APIs

**Linting:**
- ESLint: TypeScript rules
- Rules: Airbnb or Standard base
- Custom: Add project-specific rules
- Auto-fix: On pre-commit (optional)

**Formatting:**
- Prettier: Enforced
- Config: Shared across monorepo
- Run: On pre-commit or CI

**Documentation:**
- Code comments: For complex logic
- README: For each package
- API docs: Generated from TSDoc
- Examples: Real-world usage

---

## 📈 Success Metrics & Monitoring

### **Package Metrics to Track**

**Download Metrics:**
- Weekly downloads per package
- Total downloads across ecosystem
- Download growth rate
- Top referring projects

**Quality Metrics:**
- Bundle size per package
- Bundle size over time
- Test coverage percentage
- Build success rate
- CI/CD pipeline duration

**User Metrics:**
- GitHub stars
- GitHub issues (open/closed ratio)
- Pull requests from community
- Documentation page views
- API usage (from existing API)

**Performance Metrics:**
- Average load time
- P95 load time
- Bundle parse time
- Memory usage
- iOS compatibility score

### **Monitoring Requirements**

**Package Health:**
- Tool: npmjs.com statistics
- Frequency: Weekly review
- Metrics: Downloads, bundle size, dependents

**Repository Health:**
- Tool: GitHub Insights
- Metrics: Contributors, issues, PRs, stars
- Frequency: Monthly review

**Documentation Analytics:**
- Tool: Google Analytics or Plausible
- Metrics: Page views, search queries, popular pages
- Frequency: Weekly review

**Bundle Size Tracking:**
- Tool: bundlephobia.com
- Integration: Automated check on CI
- Alert: If bundle size increases >10%

---

## 🎯 Launch Strategy Specifications

### **Phase 1: Soft Launch (Weeks 1-2)**

**Objectives:**
- Launch @world/countries only
- Validate iOS compatibility
- Build initial user base
- Gather feedback

**Activities:**
1. Publish @world/countries to npm
2. Deploy documentation to countrystatecity.io
3. Add banner to countrystatecity.in API
4. Announce on your existing platforms
5. Create showcase examples
6. Submit to npm weekly (newsletter)

**Success Criteria:**
- 100+ downloads in first week
- Zero iOS crash reports
- 5+ GitHub stars
- Positive feedback on package quality

---

### **Phase 2: Community Building (Weeks 3-4)**

**Objectives:**
- Reach developer communities
- Establish credibility
- Generate awareness
- Collect feedback

**Activities:**
1. Post on Reddit (r/javascript, r/reactjs, r/webdev)
2. Tweet thread explaining the problem/solution
3. Write Dev.to article: "Fixing the iOS Bug in country-state-city"
4. Post on Hacker News
5. Submit to JavaScript Weekly
6. Create video tutorial
7. Add to Awesome lists

**Success Criteria:**
- 1000+ downloads
- Front page of Reddit/HN (optional but good)
- 50+ GitHub stars
- 10+ community contributions (issues/PRs)

---

### **Phase 3: Ecosystem Expansion (Months 2-3)**

**Objectives:**
- Launch additional packages
- Show ecosystem value
- Build network effects

**Activities:**
1. Launch @world/timezones
2. Launch @world/currencies
3. Launch @world/languages
4. Cross-promote between packages
5. Create combo examples
6. Update documentation
7. Product Hunt launch for ecosystem

**Success Criteria:**
- 5000+ total downloads across packages
- 100+ GitHub stars
- Featured on Product Hunt
- 3+ blog posts from community

---

### **Phase 4: React Components (Month 4)**

**Objectives:**
- Make adoption easier
- Reach React developers
- Show framework support

**Activities:**
1. Launch @world/react
2. Create interactive demos
3. Add CodeSandbox examples
4. Video tutorials for React usage
5. Submit to React newsletter

**Success Criteria:**
- 10,000+ total downloads
- 200+ GitHub stars
- Used in 50+ projects
- Considered "official" alternative

---

## 📝 Documentation Specifications

### **Package-Level Documentation (README.md)**

Each package must have:

1. **Header Section:**
   - Package name and description
   - Badges: npm version, downloads, bundle size, iOS compatible
   - Quick links: Docs, API, Issues

2. **Installation:**
   - npm install command
   - yarn/pnpm alternatives
   - CDN option (if applicable)

3. **Quick Start:**
   - Minimal working example
   - 5 lines of code maximum
   - Shows most common use case

4. **Features List:**
   - Bullet points of key features
   - What makes it unique
   - Bundle size comparison

5. **API Reference:**
   - All public functions
   - TypeScript signatures
   - Parameters and return types
   - Examples for each function

6. **Advanced Usage:**
   - Complex examples
   - Best practices
   - Performance tips
   - Common patterns

7. **Migration Guide:**
   - From country-state-city
   - Code comparison
   - Breaking changes

8. **License & Links:**
   - MIT license
   - Links to docs, repo, website

---

### **Documentation Site Requirements (countrystatecity.io)**

**Required Pages:**

1. **Homepage:**
   - Hero: "Official world data for developers"
   - Package overview grid
   - Bundle size comparison
   - iOS compatibility proof
   - Quick installation
   - Feature highlights
   - Testimonials (once available)

2. **Getting Started:**
   - Installation guide
   - First example
   - Core concepts
   - Common patterns

3. **Packages:**
   - Overview of all packages
   - When to use each
   - How they work together
   - Roadmap for future packages

4. **API Reference:**
   - Searchable
   - All functions documented
   - Interactive examples
   - Type definitions

5. **Guides:**
   - Migration from old packages
   - React integration
   - Next.js integration
   - TypeScript usage
   - Performance optimization
   - iOS compatibility explained

6. **Playground:**
   - Interactive code editor
   - Live preview
   - Sharable links
   - Examples library

7. **About:**
   - Why we built this
   - Team
   - Data source (your database/API)
   - Update frequency
   - Contact info

---

## 💡 Marketing & Positioning

### **Key Messages**

**Primary Message:**
"Official world geographical data with iOS support and minimal bundle size"

**Supporting Messages:**
1. From the team behind the popular countrystatecity.in API
2. Fixes the iOS crash bug in country-state-city
3. 5KB vs 8MB - 1600x smaller initial load
4. Always up-to-date with our live database
5. Modern architecture for modern apps

### **Target Audiences**

**Primary:**
- React/Vue/Angular developers
- Full-stack developers
- Mobile app developers (React Native)
- Form/dropdown builders

**Secondary:**
- Companies building address forms
- E-commerce platforms
- Travel/booking sites
- International products

### **Competitive Positioning**

**vs country-state-city:**
- ✅ iOS compatible (they crash)
- ✅ Maintained (they're abandoned)
- ✅ Smaller bundle (1600x smaller)
- ✅ Official source (they use outdated data)

**vs Building from scratch:**
- ✅ Always updated
- ✅ Tested on all platforms
- ✅ TypeScript support
- ✅ Free and open source

### **Content Strategy**

**Blog Topics:**
1. "Why iOS Safari Crashes on Large JSON Files"
2. "The Cost of Bundle Size: A Case Study"
3. "Building a Lazy-Loading Data Library"
4. "How We Keep 150K Cities Searchable"
5. "The Evolution of Country Codes"

**Video Content:**
1. Quick start tutorial (3 minutes)
2. Building a complete address form (10 minutes)
3. Performance optimization tips (5 minutes)
4. iOS compatibility explained (5 minutes)

---

## 🔐 Security & Privacy Specifications

### **Package Security:**
- No dependencies (or minimal, vetted deps)
- No telemetry or tracking
- No external API calls (all data local)
- Regular security audits (npm audit)
- Vulnerability scanning in CI

### **Data Privacy:**
- No personal data collected
- No user tracking in packages
- Anonymous usage stats (optional, opt-in)
- GDPR compliant
- Clear privacy policy

### **License:**
- MIT License (recommended)
- Clear attribution requirements
- Commercial use allowed
- Modification allowed
- Distribution allowed

---

## 📞 Support & Maintenance

### **Support Channels:**
1. GitHub Issues (primary)
2. GitHub Discussions (community)
3. Email support (optional)
4. Discord/Slack (optional)

### **Maintenance Schedule:**
- Data updates: Weekly or on-demand
- Bug fixes: Within 48 hours
- Feature requests: Monthly review
- Security patches: Immediate

### **Contribution Guidelines:**
- Open for PRs
- Issue templates provided
- PR templates provided
- Code of conduct
- Style guide
- Testing requirements

---

**END OF SPECIFICATIONS**

This document provides complete specifications without any code implementation. Use this to brief developers or as requirements for Claude Code or other AI coding assistants.
