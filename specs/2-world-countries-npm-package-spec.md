# @world/countries Package - Complete Specifications

**Document Type:** Technical specifications for @world/countries npm package  
**Purpose:** Define all requirements without implementation code  
**Audience:** Developers, AI assistants, technical leads

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Analysis](#problem-analysis)
3. [Architecture Decisions](#architecture-decisions)
4. [Package Structure Requirements](#package-structure-requirements)
5. [Data Organization Specifications](#data-organization-specifications)
6. [API Design Requirements](#api-design-requirements)
7. [Build Configuration Requirements](#build-configuration-requirements)
8. [Database Integration Specifications](#database-integration-specifications)
9. [Testing Requirements](#testing-requirements)
10. [Publishing Requirements](#publishing-requirements)

---

## 🎯 Project Overview

### Package Information
- **Package Name:** `@world/countries`
- **Description:** Official countries, states, and cities database with iOS/Safari support and minimal bundle size
- **Version:** 1.0.0 (initial release)
- **License:** MIT (recommended)
- **Homepage:** https://countrystatecity.io
- **Repository:** https://github.com/yourusername/world (monorepo)

### Key Goals
1. **iOS Compatible** - Zero stack overflow errors on Safari/iOS browsers
2. **Minimal Bundle Size** - <10KB initial load, lazy-load everything else
3. **Lazy Loading** - Dynamic imports, never static imports for data
4. **Always Updated** - Direct sync from authoritative MySQL database
5. **Developer Friendly** - Simple API, full TypeScript support, excellent documentation

### Success Criteria
- Bundle size: <10KB initial, <50KB with country list
- iOS compatibility: No crashes on iOS 13+
- Load time: <500ms on 3G networks
- Test coverage: >80%
- Weekly downloads: 1000+ within 3 months

---

## 🔍 Problem Analysis

### Why Existing `country-state-city` Package Fails

**Package:** `country-state-city` by harpreetkhalsagtbit  
**Weekly Downloads:** 162,270  
**Last Updated:** 2 years ago (unmaintained)

#### Their Architecture (What They Do Wrong)

**Source Structure (Good):**
```
data/
├── India-IN/
│   ├── Delhi-DL/cities.json
│   └── allStates.json
└── United_States-US/
    ├── California-CA/cities.json
    └── allStates.json
```

**Fatal Build Step (Bad):**
- They run script: `combineSplitFilesToMakeALargeDatasetFiles-CSC.ts`
- This combines ALL data into 3 monolithic files:
  - country.json (all countries)
  - state.json (all states)  
  - city.json (**8MB** - ALL cities worldwide)
- These are published to npm with static imports
- Result: Bundlers MUST include all 8MB

**Published Code Pattern:**
- Static import: `import cityData from './assets/city.json'`
- This forces 8MB into every bundle
- iOS Safari cannot parse 8MB JSON without stack overflow
- Even if you only want one city, you get all 150,000+ cities

#### User-Reported Issues (GitHub)

**Issue #184:** "Maximum call stack exceeded on iPhone"
- Works on Android, Windows, Mac
- Fails only on iOS browsers
- User created their own package `usa-state-city` as workaround

**Issue #173:** "Angular 17 - white screen on iPhone"
- Desktop works fine
- iPhone shows white screen
- Package causes the crash

**Issue #123:** "Maximum Call Stack Size error"
- Only on iOS devices
- Memory overflow when loading cities

**Issue #93:** "Bundle size too large"
- 2MB gzipped minimum
- Cannot tree-shake
- Loads all data always

#### Root Cause Analysis

**Why iOS Crashes:**
- Apple reduced iOS Safari maximum call stack size
- From ~1000 frames to <100 frames (iOS 13+)
- Parsing 8MB JSON in one operation exceeds limit
- Android/desktop have larger stack, don't crash

**Why Bundle Size Is Huge:**
- Static imports cannot be tree-shaken
- Bundlers must include everything
- No code-splitting possible
- 8MB minimum bundle

**Why It's Unmaintained:**
- Last commit: 2 years ago
- Issues pile up without response
- Data becomes stale
- No one trusts it anymore

---

## 🏗️ Architecture Decisions

### Core Principle: Never Combine Data Files

**Critical Rule:** Data files MUST remain split in published package  
**Reason:** Allows dynamic loading and code-splitting

#### What NOT To Do
- ❌ Create monolithic JSON files
- ❌ Use static imports for data
- ❌ Load all data upfront
- ❌ Combine files in build process
- ❌ Use synchronous loading

#### What TO Do
- ✅ Keep data split by country/state in published package
- ✅ Use dynamic import() for all data
- ✅ Load data on-demand only when requested
- ✅ Preserve directory structure in dist/
- ✅ Allow bundlers to code-split naturally

### Dynamic vs Static Imports

**Static Import (Wrong Approach):**
```
import cityData from './data/city.json'
// Loads 8MB immediately, bundler includes all data
```

**Dynamic Import (Correct Approach):**
```
const { default: data } = await import('./data/city.json')
// Only loads when called, bundler can split code
```

**Why Dynamic Imports Matter:**

1. **Code Splitting:** Bundlers create separate chunks
2. **On-Demand Loading:** Download only when needed
3. **iOS Safe:** Small chunks parsed separately
4. **Tree-Shakeable:** Unused data never bundled
5. **Performance:** Faster initial page load

### Bundle Size Strategy

| User Action | Bundle Added | What Loads |
|------------|--------------|------------|
| Install package & import function | 5KB | Main code only |
| Call getCountries() | +2KB | Countries list |
| Call getStatesOfCountry('US') | +30KB | US states only |
| Call getCitiesOfState('US', 'CA') | +15KB | California cities |
| Call getAllCitiesInWorld() | +8MB | Everything (warn user!) |

**Compare to existing package:** 8MB for everything, always, no choice

---

## 📁 Package Structure Requirements

### Required Directory Structure

```
@world/countries/
├── src/
│   ├── index.ts                      # Main entry, exports all functions
│   ├── types.ts                      # TypeScript interfaces
│   ├── loaders.ts                    # Dynamic loading functions
│   ├── utils.ts                      # Helper utilities
│   └── data/                         # JSON data (KEEP SPLIT!)
│       ├── countries.json            # ~5KB - Basic country list
│       ├── United_States-US/
│       │   ├── meta.json             # Full US data + timezones
│       │   ├── states.json           # All US states
│       │   ├── California-CA/
│       │   │   └── cities.json       # CA cities only
│       │   ├── Texas-TX/
│       │   │   └── cities.json       # TX cities only
│       │   └── [other states]/
│       ├── India-IN/
│       │   ├── meta.json
│       │   ├── states.json
│       │   ├── Delhi-DL/
│       │   │   └── cities.json
│       │   └── [other states]/
│       └── [other countries]/
├── tests/
│   ├── unit/
│   │   ├── loaders.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   └── api.test.ts
│   └── compatibility/
│       └── ios-safari.test.ts        # CRITICAL: iOS tests
├── scripts/
│   ├── generate-data.ts              # Fetch from database
│   └── validate-data.ts              # Validate structure
├── dist/                             # Build output (preserve structure!)
│   ├── index.js                      # ESM entry
│   ├── index.cjs                     # CommonJS entry
│   ├── index.d.ts                    # TypeScript definitions
│   └── data/                         # SAME split structure as src/data
├── package.json
├── tsconfig.json
├── tsup.config.ts                    # Build configuration
├── .npmignore
└── README.md
```

### File Naming Convention

**Critical Rule:** Use consistent naming for predictable paths

**Format:** `{Name}-{ISO2_CODE}`

**Examples:**
- Countries: `United_States-US/`, `United_Kingdom-GB/`, `India-IN/`
- States: `California-CA/`, `Texas-TX/`, `New_York-NY/`
- Use underscores for spaces (not hyphens or spaces)

**Why:** Dynamic imports need predictable paths, spaces cause issues

### Build Output Requirements

**Critical:** Preserve split structure in dist/

**dist/ must contain:**
- index.js (ESM)
- index.cjs (CommonJS)
- index.d.ts (TypeScript definitions)
- data/ directory with SAME structure as src/data/

**Never in dist/:**
- Combined/monolithic data files
- Source TypeScript files
- Test files
- Scripts

---

## 📊 Data Organization Specifications

### Data Hierarchy

```
Level 1: countries.json (all countries, basic info)
    ↓
Level 2: {Country-CODE}/meta.json (full country data)
Level 2: {Country-CODE}/states.json (all states in country)
    ↓
Level 3: {Country-CODE}/{State-CODE}/cities.json (all cities in state)
```

### Data File Specifications

#### File: `countries.json` (Root Level)

**Purpose:** Lightweight country list for dropdowns/search  
**Size Target:** <50KB  
**Format:** Array of country objects

**Required Fields Per Country:**
- id (number) - Database ID
- name (string) - Country name
- iso2 (string) - 2-letter code (US, IN, GB)
- iso3 (string) - 3-letter code (USA, IND, GBR)
- numeric_code (string) - ISO numeric code
- phonecode (string) - International dialing code
- capital (string) - Capital city
- currency (string) - Currency code (USD, INR)
- currency_name (string) - Full currency name
- currency_symbol (string) - Symbol ($, ₹, £)
- tld (string) - Top-level domain (.us, .in)
- native (string) - Native name
- region (string) - Geographic region
- subregion (string) - Sub-region
- nationality (string) - Demonym (American, Indian)
- latitude (string) - Decimal degrees
- longitude (string) - Decimal degrees
- emoji (string) - Flag emoji (🇺🇸)
- emojiU (string) - Unicode representation

**Excluded from countries.json** (in meta.json instead):
- timezones (too large)
- translations (too large)

---

#### File: `{Country-CODE}/meta.json`

**Purpose:** Complete country metadata with timezones  
**Size Target:** <5KB per country  
**Format:** Single country object

**Additional Fields (vs countries.json):**
- timezones (array) - Array of timezone objects:
  - zoneName (string) - IANA timezone name
  - gmtOffset (number) - Seconds from UTC
  - gmtOffsetName (string) - UTC offset string
  - abbreviation (string) - Timezone abbreviation
  - tzName (string) - Full timezone name
- translations (object) - Key-value pairs:
  - Keys: Language codes (ko, es, fr, de, ja, ru, ar, etc.)
  - Values: Translated country names

**Use Case:** When user needs full country details

---

#### File: `{Country-CODE}/states.json`

**Purpose:** All states/provinces in a country  
**Size Target:** <100KB per country (varies by size)  
**Format:** Array of state objects

**Required Fields Per State:**
- id (number) - Database ID
- name (string) - State/province name
- country_id (number) - Parent country ID
- country_code (string) - Parent country ISO2
- fips_code (string|null) - FIPS code (US only)
- iso2 (string) - State code (CA, TX, NY)
- type (string|null) - Type (state, province, etc.)
- latitude (string|null) - Decimal degrees
- longitude (string|null) - Decimal degrees
- native (string|null) - Native name
- timezone (string|null) - IANA timezone
- translations (object) - Language translations

---

#### File: `{Country-CODE}/{State-CODE}/cities.json`

**Purpose:** All cities in a specific state  
**Size Target:** <200KB per state (varies widely)  
**Format:** Array of city objects

**Required Fields Per City:**
- id (number) - Database ID
- name (string) - City name
- state_id (number) - Parent state ID
- state_code (string) - Parent state code
- country_id (number) - Parent country ID
- country_code (string) - Parent country code
- latitude (string) - Decimal degrees
- longitude (string) - Decimal degrees
- native (string|null) - Native name
- timezone (string|null) - IANA timezone
- translations (object) - Language translations

---

### Data Quality Requirements

**Validation Rules:**
1. All required fields must be present
2. IDs must be unique within type
3. Foreign keys must reference valid parents
4. Coordinates must be valid decimal degrees
5. ISO codes must follow standards
6. JSON must be valid and parseable
7. UTF-8 encoding required
8. No trailing commas in JSON

**Consistency Rules:**
1. country_code in states.json must match folder name
2. state_code in cities.json must match folder name
3. All states in states.json must have matching folders
4. File naming must use underscores for spaces

---

## 💻 API Design Requirements

### Module Exports

**Main Entry Point** (`index.ts`):  
Must export these categories:
1. Types (all TypeScript interfaces)
2. Loader functions (data fetching)
3. Utility functions (helpers)
4. Default export (convenience)

### TypeScript Interface Requirements

**Interface: ICountry**
- All fields from countries.json
- No timezones or translations
- Used for lightweight lists

**Interface: ICountryMeta**
- Extends ICountry
- Adds timezones array
- Adds translations object
- Used for full country details

**Interface: IState**
- All fields from states.json
- Including translations

**Interface: ICity**
- All fields from cities.json
- Including translations

**Interface: ITimezone**
- zoneName, gmtOffset, gmtOffsetName, abbreviation, tzName

**Interface: ITranslations**
- Index signature: [languageCode: string]: string

### Required Functions Specifications

#### Function: getCountries()
- **Purpose:** Get lightweight list of all countries
- **Returns:** Promise<ICountry[]>
- **Bundle Impact:** ~5KB (country.json)
- **Use Case:** Populating country dropdowns
- **Performance:** <100ms

#### Function: getCountryByCode(countryCode: string)
- **Purpose:** Get full country metadata including timezones
- **Parameters:** countryCode (ISO2 code like 'US')
- **Returns:** Promise<ICountryMeta | null>
- **Bundle Impact:** ~5KB per country
- **Use Case:** Showing detailed country info
- **Error Handling:** Returns null if not found

#### Function: getStatesOfCountry(countryCode: string)
- **Purpose:** Get all states/provinces for a country
- **Parameters:** countryCode (ISO2 code)
- **Returns:** Promise<IState[]>
- **Bundle Impact:** ~10-100KB depending on country
- **Use Case:** State/province dropdowns
- **Error Handling:** Returns empty array if not found

#### Function: getStateByCode(countryCode: string, stateCode: string)
- **Purpose:** Get specific state details
- **Parameters:** countryCode, stateCode
- **Returns:** Promise<IState | null>
- **Implementation:** Filters states.json in memory
- **Bundle Impact:** Same as getStatesOfCountry
- **Error Handling:** Returns null if not found

#### Function: getCitiesOfState(countryCode: string, stateCode: string)
- **Purpose:** Get all cities in a specific state
- **Parameters:** countryCode, stateCode
- **Returns:** Promise<ICity[]>
- **Bundle Impact:** ~5-200KB depending on state
- **Use Case:** City dropdowns
- **Error Handling:** Returns empty array if not found
- **Performance:** <500ms

#### Function: getAllCitiesOfCountry(countryCode: string)
- **Purpose:** Get ALL cities in an entire country
- **Warning:** Large data size, use sparingly
- **Parameters:** countryCode
- **Returns:** Promise<ICity[]>
- **Bundle Impact:** Large (loads all state city files)
- **Implementation:** Loop through all states
- **Use Case:** Full country city search
- **Performance:** Variable, can be slow

#### Function: getAllCitiesInWorld()
- **Purpose:** Get every city globally
- **Warning:** MASSIVE data (8MB+), rarely needed
- **Returns:** Promise<ICity[]>
- **Bundle Impact:** 8MB+
- **Implementation:** Loop through all countries and states
- **Use Case:** Only for specific analytical needs
- **Documentation:** Must warn users about size

#### Function: getCityById(countryCode: string, stateCode: string, cityId: number)
- **Purpose:** Get specific city by database ID
- **Parameters:** countryCode, stateCode, cityId
- **Returns:** Promise<ICity | null>
- **Implementation:** Load state cities, find by ID
- **Error Handling:** Returns null if not found

### Utility Functions Requirements

#### Function: isValidCountryCode(countryCode: string)
- **Purpose:** Check if country code exists
- **Returns:** Promise<boolean>
- **Implementation:** Search countries.json

#### Function: isValidStateCode(countryCode: string, stateCode: string)
- **Purpose:** Check if state code exists
- **Returns:** Promise<boolean>

#### Function: searchCitiesByName(countryCode: string, stateCode: string, searchTerm: string)
- **Purpose:** Search cities by partial name
- **Returns:** Promise<ICity[]>
- **Implementation:** Load state cities, filter by name

#### Function: getCountryNameByCode(countryCode: string)
- **Purpose:** Get country name from code
- **Returns:** Promise<string | null>

#### Function: getStateNameByCode(countryCode: string, stateCode: string)
- **Purpose:** Get state name from code
- **Returns:** Promise<string | null>

#### Function: getTimezoneForCity(countryCode: string, stateCode: string, cityName: string)
- **Purpose:** Get timezone for specific city
- **Returns:** Promise<string | null>

#### Function: getCountryTimezones(countryCode: string)
- **Purpose:** Get all timezones for country
- **Returns:** Promise<string[]>
- **Implementation:** Load country meta, extract timezone names

---

## 🔧 Build Configuration Requirements

### Build Tool Selection

**Recommended:** tsup (fast, simple)  
**Alternative:** Vite (more features)

**Requirements:**
- Must output ESM and CJS formats
- Must generate TypeScript declarations
- Must include source maps
- Must NOT bundle data files (keep external)
- Must preserve data/ directory structure
- Must support tree-shaking

### Package.json Specifications

**Required Fields:**
- name: "@world/countries"
- version: Semantic versioning (1.0.0)
- description: Clear, concise
- keywords: countries, states, cities, geography, ios-compatible
- author: Your name/org
- license: MIT
- homepage: https://countrystatecity.io
- repository: Link to monorepo with directory path
- bugs: Link to issues

**Entry Points:**
- main: ./dist/index.cjs (CommonJS)
- module: ./dist/index.js (ESM)
- types: ./dist/index.d.ts (TypeScript)
- exports: Proper exports map for both formats

**Scripts:**
- build: Compile TypeScript and generate dist/
- dev: Watch mode for development
- test: Run all tests
- test:ios: Run iOS compatibility tests specifically
- lint: ESLint check
- generate-data: Fetch from database
- validate-data: Check data structure

**Files Array:**
- Must include: ["dist", "README.md"]
- Must exclude: src/, tests/, scripts/

**publishConfig:**
- access: "public" (for scoped packages)

### TypeScript Configuration

**Compiler Options Requirements:**
- target: ES2020 or higher
- module: ESNext
- moduleResolution: bundler
- resolveJsonModule: true (CRITICAL)
- strict: true
- declaration: true
- declarationMap: true
- sourceMap: true
- skipLibCheck: true

### Build Process Requirements

**Step 1: Compile TypeScript**
- Input: src/**/*.ts
- Output: dist/ with ESM and CJS
- Generate: .d.ts files

**Step 2: Copy Data Files**
- Source: src/data/
- Destination: dist/data/
- Preserve: Exact directory structure
- No transformation: Keep JSON as-is

**Step 3: Generate Package Files**
- Create: dist/package.json if needed
- Include: LICENSE, README.md

**Step 4: Validate Output**
- Check: All exports work
- Test: Import from dist/
- Verify: Bundle size limits
- Confirm: Types are correct

---

## 🗄️ Database Integration Specifications

### Database Schema (Your MySQL Database)

**Table: countries**
- Primary key: id
- Key fields: name, iso2, iso3, phonecode, capital, currency, latitude, longitude, emoji
- JSON fields: timezones, translations
- Foreign keys: region_id, subregion_id

**Table: states**
- Primary key: id
- Foreign key: country_id → countries.id
- Key fields: name, country_code, iso2, latitude, longitude, timezone
- JSON fields: translations

**Table: cities**
- Primary key: id
- Foreign key: state_id → states.id, country_id → countries.id
- Key fields: name, country_code, state_code, latitude, longitude, timezone
- JSON fields: translations

### Data Generation Requirements

**Method 1: Direct Database Query (Recommended)**

Requirements:
1. Connect to MySQL using mysql2 library
2. Query all countries with flag=1
3. For each country:
   - Query states where country_id matches
   - For each state:
     - Query cities where state_id matches
     - Generate cities.json file
   - Generate states.json file
   - Generate meta.json file
4. Generate countries.json at root
5. Validate all generated files

**Method 2: API Sync (Alternative)**

Requirements:
1. Use your existing API (countrystatecity.in)
2. Authenticate with API key
3. Fetch data via REST endpoints
4. Transform to match JSON structure
5. Write files in same structure
6. Rate limit: Respect API limits

### JSON Transformation Rules

**From Database to JSON:**
1. Parse JSON strings (timezones, translations)
2. Convert decimal types to strings
3. Handle NULL values appropriately
4. Format dates if applicable
5. Clean up whitespace in names
6. Validate ISO codes
7. Pretty-print JSON (2 spaces)
8. UTF-8 encoding

### Data Update Strategy

**Frequency:**
- Development: On-demand (manual)
- Production: Weekly automated OR on-demand

**Process:**
1. Run generation script
2. Validate all generated files
3. Run tests to ensure compatibility
4. Commit to git
5. Create PR for review
6. Deploy after approval

---

## 🧪 Testing Requirements

### Test Coverage Requirements

**Minimum Coverage:** 80% for all packages  
**Critical Coverage:** 100% for core loaders

### Unit Test Specifications

**Location:** tests/unit/  
**Framework:** Vitest (recommended)

**Test Categories:**

1. **Loader Functions:**
   - Test: getCountries() returns array
   - Test: getCountries() has valid structure
   - Test: getCountryByCode('US') returns USA
   - Test: getCountryByCode('INVALID') returns null
   - Test: getStatesOfCountry('US') returns states
   - Test: getStatesOfCountry('INVALID') returns empty array
   - Test: getCitiesOfState('US', 'CA') returns cities
   - Test: getCitiesOfState invalid params returns empty
   - Test: All data has required fields
   - Test: ISO codes are valid format
   - Test: Coordinates are valid ranges

2. **Utility Functions:**
   - Test: isValidCountryCode() for valid/invalid
   - Test: isValidStateCode() for valid/invalid
   - Test: searchCitiesByName() finds matches
   - Test: searchCitiesByName() case insensitive
   - Test: getCountryNameByCode() returns correct name
   - Test: Helper functions handle errors gracefully

3. **Data Integrity:**
   - Test: countries.json is valid JSON
   - Test: All countries have required fields
   - Test: All state directories exist
   - Test: All city files are valid
   - Test: No duplicate IDs
   - Test: Foreign keys reference valid parents

### Integration Test Specifications

**Location:** tests/integration/  
**Purpose:** Test complete user workflows

**Test Scenarios:**

1. **Complete Address Selection Flow:**
   - Load countries list
   - Select country
   - Load states for country
   - Select state
   - Load cities for state
   - Verify data consistency throughout

2. **Performance Tests:**
   - Measure: Time to load countries
   - Measure: Time to load states
   - Measure: Time to load cities
   - Verify: All under target thresholds
   - Check: No memory leaks

3. **Error Handling:**
   - Test: Invalid country code handling
   - Test: Invalid state code handling
   - Test: Network failures (mock)
   - Test: Corrupted data handling

### iOS Compatibility Test Specifications

**Location:** tests/compatibility/ios-safari.test.ts  
**Critical Requirement:** Must pass before publishing

**Test Environment:**
- iOS Safari 13+
- macOS Safari 13+
- iOS Chrome
- Real device testing (via BrowserStack or similar)

**Test Cases:**

1. **Stack Overflow Prevention:**
   - Test: Load countries.json (should succeed)
   - Test: Load states for large country (should succeed)
   - Test: Load cities for large state (should succeed)
   - Test: Sequential loads don't crash
   - Verify: No "Maximum call stack exceeded" errors

2. **Bundle Size Tests:**
   - Test: Initial bundle under 10KB
   - Test: With countries under 50KB
   - Test: With one state under 150KB
   - Test: Progressive loading works

3. **Memory Tests:**
   - Test: No memory leaks
   - Test: Can load multiple states
   - Test: Can switch between countries
   - Test: Memory stays within limits

4. **Real-World Scenarios:**
   - Test: User fills out address form
   - Test: User searches for city
   - Test: User changes country selection
   - Test: All interactions smooth on iOS

### Bundle Size Testing

**Requirements:**
- Automated check on every build
- Fail CI if bundle exceeds limits
- Track bundle size over time

**Limits:**
- index.js: <10KB
- countries.json: <50KB
- Any state cities.json: <200KB

**Tools:**
- bundlephobia.com for npm package
- bundlesize library for CI checks
- Automated reporting in PRs

---

## 📦 Publishing Requirements

### Pre-Publish Checklist

**Data Validation:**
- [ ] Run: npm run validate-data
- [ ] Check: All JSON files valid
- [ ] Verify: No missing files
- [ ] Confirm: Data structure correct

**Testing:**
- [ ] Run: npm run test
- [ ] Pass: All unit tests
- [ ] Pass: All integration tests
- [ ] Pass: iOS compatibility tests
- [ ] Verify: Coverage >80%

**Build:**
- [ ] Run: npm run build
- [ ] Check: dist/ directory created
- [ ] Verify: ESM and CJS files present
- [ ] Confirm: Types generated (.d.ts)
- [ ] Test: Import from dist/

**Bundle Size:**
- [ ] Check: index.js <10KB
- [ ] Verify: No bloat
- [ ] Compare: Previous version size

**Documentation:**
- [ ] Update: README.md
- [ ] Include: All examples work
- [ ] Add: Migration guide if needed
- [ ] Update: CHANGELOG.md

**iOS Testing:**
- [ ] Test: On real iPhone
- [ ] Test: On iPad
- [ ] Verify: No crashes
- [ ] Check: Performance acceptable

### Publishing Process

**Step 1: Version Bump**
- Use: Semantic versioning
- Update: package.json version
- Create: Git tag

**Step 2: Build**
- Run: npm run build
- Verify: Clean build

**Step 3: Publish to npm**
- Command: npm publish
- Verify: Published successfully
- Check: On npmjs.com

**Step 4: Create Release**
- Create: GitHub release
- Include: Changelog
- Tag: Version number

**Step 5: Update Documentation**
- Deploy: Updated docs to countrystatecity.io
- Announce: On social media
- Update: Your API site

### Post-Publish Verification

**Immediate Checks:**
- [ ] Install from npm: npm install @world/countries
- [ ] Test: In fresh project
- [ ] Verify: Types work in TypeScript
- [ ] Check: Bundle size on bundlephobia.com
- [ ] Monitor: First user feedback

**Within 24 Hours:**
- [ ] Monitor: Download count
- [ ] Check: GitHub issues
- [ ] Review: Any error reports
- [ ] Verify: CI passing

**Within 1 Week:**
- [ ] Gather: User feedback
- [ ] Plan: Next iteration
- [ ] Fix: Any critical bugs
- [ ] Update: Documentation if needed

---

## 📚 Documentation Requirements

### README.md Structure

**Section 1: Header**
- Package name and one-line description
- Badges: npm version, downloads, bundle size, iOS compatible
- Quick links: Docs, API Reference, Changelog

**Section 2: Installation**
- npm install @world/countries
- yarn/pnpm alternatives

**Section 3: Quick Start**
- Minimal 5-line example
- Import and basic usage
- Shows most common use case

**Section 4: Features**
- iOS/Safari compatible
- Tiny bundle size comparison
- Always up-to-date
- Full TypeScript support
- Lazy loading

**Section 5: API Reference**
- List all functions
- Show TypeScript signatures
- Provide examples
- Link to full docs

**Section 6: Why This Package**
- Compare to country-state-city
- Show bundle size difference
- Explain iOS compatibility
- Mention official data source

**Section 7: Migration Guide**
- From country-state-city
- Code comparison
- Breaking changes
- Benefits

**Section 8: Links**
- Full documentation
- GitHub repository
- Issue tracker
- Your API site

---

## 🎯 Success Metrics

### Package Health Metrics

**Downloads:**
- Week 1: 100+ downloads
- Month 1: 1,000+ downloads
- Month 3: 10,000+ downloads
- Month 6: 50,000+ downloads

**Quality:**
- GitHub stars: 50+ in month 1
- Issues: <5 open issues
- Test coverage: >80%
- Bundle size: <10KB maintained

**Adoption:**
- Dependent projects: 10+ in month 3
- Community PRs: 5+ in month 6
- Positive feedback: No iOS crash reports

### Monitoring Requirements

**Automated:**
- npm download statistics (weekly)
- Bundle size tracking (every build)
- CI/CD success rate (every commit)
- Test coverage (every PR)

**Manual:**
- GitHub stars (weekly)
- Issue response time (daily)
- User feedback (ongoing)
- Documentation quality (monthly)

---

**END OF SPECIFICATIONS**

This document defines all requirements for @world/countries package without any implementation code. Use this as your complete specification for development.
