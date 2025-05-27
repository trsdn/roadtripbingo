# GitHub Issues for Remaining Test Failures

This document outlines suggested GitHub issues to track and resolve the remaining test failures identified after the IndexedDB fixes.

## High Priority Issues

### Issue #1: Card Generation Functionality Broken in Tests
**Priority:** Critical  
**Labels:** bug, testing, card-generation

**Description:**
Card generation tests are failing across multiple test files. The card preview remains empty even when sufficient icons are available.

**Affected Tests:**
- `cards.cy.js`: "should generate bingo cards when there are enough icons"
- `larger-grids.cy.js`: All grid size generation tests (6x6, 7x7, 8x8)

**Expected Behavior:**
- Card preview should populate with bingo cells when sufficient icons exist
- Generate buttons should become enabled when requirements are met

**Actual Behavior:**
- `#cardPreview` remains empty
- Buttons may remain disabled even with sufficient icons

**Investigation Steps:**
1. Check icon loading and counting logic
2. Verify card generation triggering conditions
3. Test icon-to-grid-cell mapping functionality
4. Review button state management

**Code Areas to Investigate:**
- Card generation logic in `app.js`
- Icon counting and validation
- Grid rendering functions
- Button state management

---

### Issue #2: Language Switching Not Working in Tests
**Priority:** High  
**Labels:** bug, i18n, testing

**Description:**
Language switching functionality fails in E2E tests. German translations are not applied correctly when language is changed.

**Affected Tests:**
- `app.cy.js`: "updates UI language when changed"

**Expected Behavior:**
- Changing language to German should update h1 element to show "Auto Bingo Generator"

**Actual Behavior:**
- h1 element does not contain expected German text
- Language switching appears to have no effect

**Investigation Steps:**
1. Check i18n module initialization
2. Verify German translation loading
3. Test language switching event handlers
4. Review translation key mapping

**Code Areas to Investigate:**
- `src/js/modules/i18n.js`
- `src/js/modules/languages.js`
- Language switching event handlers
- Translation file loading

---

### Issue #3: Center Blank Functionality Issues
**Priority:** High  
**Labels:** bug, center-blank, testing

**Description:**
Center blank functionality has multiple issues including state persistence and "FREE" text display.

**Affected Tests:**
- `center-blank-toggle.cy.js`: "should save and restore the toggle state"
- `multi-hit-mode.cy.js`: "should not affect center blank functionality"

**Expected Behavior:**
- Center blank toggle state should persist across page reloads
- Center cell should display "FREE" when center blank is enabled

**Actual Behavior:**
- Toggle state not persisting correctly
- "FREE" text not appearing in center cell

**Investigation Steps:**
1. Check center blank state storage/retrieval
2. Verify "FREE" text insertion logic
3. Test toggle event handlers
4. Review center cell rendering

**Code Areas to Investigate:**
- Center blank toggle implementation
- Storage of toggle state
- Grid rendering with center blank
- Multi-hit mode interaction with center blank

---

## Medium Priority Issues

### Issue #4: UI Element Visibility Problems
**Priority:** Medium  
**Labels:** bug, ui, testing

**Description:**
Several UI elements are not found during tests, suggesting either missing elements or initialization issues.

**Affected Tests:**
- `center-blank-ui.cy.js`: Settings and language elements not found
- `cards.cy.js`: Clear icons button not found

**Expected Behavior:**
- All UI elements should be present and accessible
- Elements should be properly initialized

**Actual Behavior:**
- `#settings` and `#language` elements not found
- `#clearIconsBtn` not found when expected

**Investigation Steps:**
1. Check HTML structure and element IDs
2. Verify conditional rendering logic
3. Test element initialization timing
4. Review CSS display properties

---

### Issue #5: Preview Toggle Functionality Issues
**Priority:** Medium  
**Labels:** bug, preview, testing

**Description:**
Preview toggle functionality is not working correctly. Icon labels are not appearing in the preview grid.

**Affected Tests:**
- `preview-toggle.cy.js`: "shows the label toggle and updates preview grid"

**Expected Behavior:**
- Preview grid should show icon labels when toggle is enabled

**Actual Behavior:**
- `.icon-label` elements not found in preview grid

**Investigation Steps:**
1. Check preview toggle implementation
2. Verify label rendering logic
3. Test toggle state management
4. Review preview grid generation

---

### Issue #6: Storage System Data Inconsistencies
**Priority:** Medium  
**Labels:** bug, storage, testing

**Description:**
Storage system backup/restore functionality shows counting discrepancies and incorrect state management.

**Affected Tests:**
- `storage.cy.js`: Both backup/restore and clear icons tests

**Expected Behavior:**
- Backup should restore exact number of icons
- Clear operation should update counts correctly

**Actual Behavior:**
- Icon counts don't match expectations
- Clear operations not reflecting properly

**Investigation Steps:**
1. Check backup/restore logic
2. Verify icon counting mechanisms
3. Test data synchronization
4. Review storage event handling

---

## Test Infrastructure Issues

### Issue #7: Improve Test Reliability and Timing
**Priority:** Medium  
**Labels:** testing, infrastructure

**Description:**
Several tests rely on arbitrary timing waits rather than proper event-driven synchronization.

**Improvements Needed:**
1. Replace timing-based waits with event-driven waits
2. Implement more robust icon creation utilities for tests
3. Create test-specific icon sets for consistent testing
4. Add better error messages for debugging test failures

**Code Areas to Improve:**
- Test initialization patterns
- Icon generation for tests
- Event waiting mechanisms
- Test cleanup procedures

---

## Suggested Implementation Priority

1. **Card Generation (Issue #1)** - Critical functionality
2. **Center Blank (Issue #3)** - Core feature reliability
3. **Language Switching (Issue #2)** - User experience
4. **UI Elements (Issue #4)** - Foundation for other tests
5. **Preview Toggle (Issue #5)** - Secondary functionality
6. **Storage Issues (Issue #6)** - Data integrity
7. **Test Infrastructure (Issue #7)** - Long-term maintainability

## Testing Recommendations

### Before Fixing Issues
1. Run individual test files to isolate problems
2. Use browser dev tools to inspect element states
3. Check console for JavaScript errors during test execution
4. Verify IndexedDB state during test runs

### After Implementing Fixes
1. Run full test suite to ensure no regressions
2. Test in different browsers
3. Verify performance with larger datasets
4. Check mobile responsiveness

### Continuous Integration
Consider adding test result reporting and failure notifications to catch regressions early.
