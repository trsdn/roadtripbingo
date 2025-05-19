// ***********************************************
// Custom commands for Road Trip Bingo Generator
// ***********************************************

// Loads a test image file for upload
Cypress.Commands.add('uploadTestImage', { prevSubject: 'element' }, (subject, fileName, fileType = 'image/png') => {
  cy.fixture(fileName, 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then(blob => {
      const testFile = new File([blob], fileName, { type: fileType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      
      subject[0].files = dataTransfer.files;
      return cy.wrap(subject).trigger('change', { force: true });
    });
});

// Clear local storage
Cypress.Commands.add('clearStorage', () => {
  localStorage.clear();
  cy.window().then(win => {
    win.location.reload();
  });
});

// Generate a test backup file for import/restore testing
Cypress.Commands.add('createTestBackup', (iconCount = 3) => {
  // Generate backup data with dummy icons
  const testData = {
    icons: Array.from({ length: iconCount }, (_, i) => ({
      id: `test-${i}`,
      name: `test-icon-${i}`,
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    })),
    settings: {
      language: 'en',
      theme: 'light',
      gridSize: 3,
      cardsPerSet: 1
    },
    gameStates: []
  };

  // Create backup file
  const jsonData = JSON.stringify(testData);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const testFile = new File([blob], 'roadtripbingo-test-backup.json', { type: 'application/json' });
  
  return cy.wrap(testFile);
});

// Cypress custom commands

// This command handles the uncaught exceptions from ES Modules
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test on ES Module errors
  if (err.message.includes('ES Modules may not assign module.exports')) {
    return false;
  }
  
  // for other errors, fail the test
  return true;
});

// Add command to get icons
Cypress.Commands.add('getIcons', () => {
  return cy.window().then(win => {
    return win.iconDB.loadIcons();
  });
});

// Add command to clear icons
Cypress.Commands.add('clearIcons', () => {
  return cy.window().then(win => {
    return win.iconDB.clearIcons();
  });
}); 