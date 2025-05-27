module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/../tests'],

  // The glob patterns Jest uses to detect test files
  testMatch: ['<rootDir>/../tests/**/*.test.js'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { configFile: './config/.babelrc' }],
  },

  // Transform non-JS imports to JS equivalents
  transformIgnorePatterns: [
    '/node_modules/',
  ],

  // Setup files to run before each test
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Modules that don't need transformation
  moduleFileExtensions: ['js', 'json', 'jsx'],

  // Mock browser APIs that aren't available in Jest
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/../src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/../src/__mocks__/fileMock.js',
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Indicates whether the coverage information should be collected
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: '../coverage',
}; 