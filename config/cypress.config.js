const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Increase timeout for page load
    defaultCommandTimeout: 10000,
    // Configure screenshot and video settings
    screenshotOnRunFailure: true,
    video: true,
    // Screenshots folder updated for new structure
    screenshotsFolder: '../docs/screenshots/cypress',
  },
}); 