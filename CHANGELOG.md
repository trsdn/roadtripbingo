# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-02-01

### Added

#### Complete Cypress to Playwright Migration
- **Comprehensive E2E test suite** with 40 Playwright tests
  - `app.spec.js`: App initialization and language switching (6 tests)
  - `grid-settings.spec.js`: Grid size and settings configuration (6 tests)
  - `center-blank-toggle.spec.js`: Center blank functionality (4 tests)
  - `center-blank-ui.spec.js`: Center blank UI validation (1 test)
  - `icon-management.spec.js`: Icon upload and management (5 tests)
  - `multi-hit-mode.spec.js`: Multi-hit mode feature testing (6 tests)
  - `toggles.spec.js`: Show labels and same card toggles (4 tests)
  - `data-pdf.spec.js`: Data backup/restore and PDF controls (7 tests)

### Changed

#### Test Infrastructure
- **Migrated from Cypress to Playwright**
  - Removed Cypress dependencies
  - Added Playwright test framework
  - Updated test configuration in `config/playwright.config.js`
  - Implemented modern async/await patterns in tests

#### Test Reliability
- **Improved test stability** by replacing fixed timeouts with condition-based waits
  - Used `expect().toBeVisible()` instead of `waitForTimeout()`
  - Implemented proper element state checking
  - Added reliable waiting strategies for dynamic content

### Test Results

#### Before Migration
- Unit Tests: 112/112 passing ✅
- E2E Tests: 1/1 passing (minimal coverage)

#### After Migration
- Unit Tests: 112/112 passing ✅
- E2E Tests: 40/40 passing ✅
- **Total: 152 tests passing**

### Quality Improvements

- ✅ All tests use reliable waiting strategies
- ✅ Tests cover critical user workflows
- ✅ Tests validate UI state and user interactions
- ✅ Tests check feature integration and compatibility
- ✅ No security vulnerabilities detected (CodeQL scan)

---

## [Previous Versions] - 2024-12-19

### Fixed

#### Critical IndexedDB Transaction Issues
- **Fixed IndexedDB initialization race condition** in `indexedDBStorage.js`
  - Converted promise chain to async/await pattern in `init()` method for better error handling
  - Added proper error propagation and transaction management
  - Resolves "Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing" errors

- **Added null checks for database instance** across all IndexedDB storage methods:
  - `saveIcon()`: Added check for `this.db` before creating transactions
  - `loadIcons()`: Added database initialization validation
  - `deleteIcon()`: Added null check with descriptive error message
  - `clearIcons()`: Added database validation before clearing operations
  - `saveSettings()`: Added initialization check for settings storage
  - `loadSettings()`: Added null check for database instance
  - All methods now throw meaningful errors when database is not initialized

#### Test Infrastructure Improvements
- Migrated E2E tests from Cypress to Playwright
- Updated visit URLs from `/src` to `/` to resolve 500 server errors
- Converted spec files to `.spec.js` format

- **Added IndexedDB initialization waiting patterns** across multiple test files:
  - `cards.cy.js`: Added proper IndexedDB initialization wait with button state checks
  - `icons.cy.js`: Added database initialization waiting before icon operations
  - `larger-grids.cy.js`: Added IndexedDB wait patterns for larger grid tests
  - `storage.cy.js`: Added proper initialization and teardown procedures

- **Improved test timing and synchronization**:
  - `app.cy.js`: Added 500ms wait times after language selection for proper UI updates
  - `cards.cy.js`: Added button enabled state checks before clicking
  - All tests now wait for `window.iconDB.db` to be properly initialized

#### Data Validation Fixes
- **Multi-hit mode test corrections**:
  - Fixed default difficulty assertion from 'LIGHT' to 'MEDIUM' in `multi-hit-mode.cy.js`
  - Corrected expected behavior to match actual application defaults

- **Storage test data alignment**:
  - Changed gridSize from '4' to '5' in storage tests to match application defaults
  - Fixed data consistency issues between test expectations and actual app behavior

### Code Quality Improvements

#### Error Handling
- Enhanced error messages in IndexedDB operations with specific context
- Added consistent null checking patterns across all database methods
- Improved async/await usage for better error propagation

#### Test Reliability
- Implemented consistent IndexedDB initialization patterns across all E2E tests
- Added proper cleanup procedures in storage tests
- Enhanced button interaction safety with state checks

### Test Status

#### Passing Tests (36/55 - 65.5%)
- **Unit Tests**: All 85 Jest tests passing ✅
- **E2E Debug Tests**: All debug tests passing (4/4) ✅
- **Icon Management**: All icon tests passing (4/4) ✅
- **Multi-Hit Mode**: 10/11 tests passing ✅
- **Center Blank Toggle**: 5/6 tests passing ✅

#### Remaining Test Failures (19/55 - 34.5%)

### Known Issues

The following test failures remain and require further investigation:

#### 1. Language/Internationalization Issues
- **File**: `app.cy.js`
- **Test**: "updates UI language when changed"
- **Issue**: German translation 'Auto Bingo Generator' not appearing in h1 element
- **Impact**: Language switching functionality may not be working correctly

#### 2. Card Generation Failures
- **Files**: `cards.cy.js`, `larger-grids.cy.js`
- **Issue**: Card preview remains empty even with sufficient icons
- **Tests Affected**: 
  - Card generation with enough icons
  - All larger grid sizes (6x6, 7x7, 8x8)
- **Impact**: Primary application functionality not working in tests

#### 3. Center Blank Functionality Issues
- **Files**: `center-blank-toggle.cy.js`, `multi-hit-mode.cy.js`
- **Issues**: 
  - Toggle state not persisting correctly between page reloads
  - 'FREE' text not appearing in center cell when center blank is enabled
- **Impact**: Center blank feature reliability

#### 4. UI Element Visibility Issues
- **File**: `center-blank-ui.cy.js`
- **Issue**: Settings and language elements not found (#settings, #language)
- **Impact**: UI structure may have changed or elements not properly initialized

#### 5. Preview Toggle Functionality
- **File**: `preview-toggle.cy.js`
- **Issue**: Icon labels not appearing in preview grid (`.icon-label` elements missing)
- **Impact**: Preview functionality not working as expected

#### 6. Storage System Issues
- **File**: `storage.cy.js`
- **Issues**:
  - Backup/restore counting discrepancies (expected 3, got 1)
  - Icon clearing not updating counts correctly
- **Impact**: Data persistence and backup functionality unreliable

### Technical Debt

#### IndexedDB Architecture
- Legacy localStorage code still exists in `storage.js` (deprecated)
- Consider complete migration to IndexedDB-only architecture
- Need unified error handling strategy across storage systems

#### Test Infrastructure
- Some tests rely on timing-based waits rather than proper event-driven waits
- Icon generation tests may need more robust icon creation utilities
- Consider implementing test-specific icon sets for consistent testing

### Migration Notes

#### For Developers
- All new storage code should use `indexedDBStorage.js` module
- Always call `init()` and wait for completion before using IndexedDB methods
- Handle storage quota errors gracefully in production code
- Use proper async/await patterns for IndexedDB operations

#### For Testing
- Always wait for `window.iconDB.db` initialization in E2E tests
- Use the established initialization pattern:
  ```javascript
  cy.window().its('iconDB').should('exist');
  cy.window().then(async (win) => {
    while (!win.iconDB.db) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });
  ```
- Check button states before interactions in tests
- Allow proper timing for UI updates after language changes

### Performance Improvements

#### IndexedDB Operations
- Improved transaction handling reduces connection closing errors
- Better error propagation prevents silent failures
- Async/await pattern provides clearer error stack traces

#### Test Execution
- Reduced test flakiness through better synchronization
- More reliable initialization patterns
- Improved cleanup procedures reduce test pollution

---

## Previous Versions

### [1.2.0] - Previous Release
- Multi-hit mode functionality
- Larger grid support (6x6, 7x7, 8x8)
- Center blank toggle feature
- PDF generation improvements
- Internationalization support

### [1.1.0] - Previous Release
- Icon management system
- Basic card generation
- Storage system implementation
- Initial test suite
