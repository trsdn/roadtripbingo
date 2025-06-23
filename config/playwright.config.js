const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../playwright',
  testMatch: /.*\.spec\.js/,
  testIgnore: ['../tests/**'],
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
});
