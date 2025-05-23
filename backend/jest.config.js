module.exports = {
    // The test environment that will be used for testing
    testEnvironment: 'node',
  
    // The glob patterns Jest uses to detect test files
    testMatch: [
      "**/tests/**/*.test.js"
    ],
  
    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!**/node_modules/**",
      "!**/vendor/**"
    ],
  
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
  
    // Indicates whether each individual test should be reported during the run
    verbose: true,
  
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
  
    // The paths to modules that run some code to configure or set up the testing environment
    setupFiles: ["dotenv/config"],
  
    // Global setup for all tests
    globalSetup: "./tests/setup/globalSetup.js",
  
    // Global teardown for all tests
    globalTeardown: "./tests/setup/globalTeardown.js",
  
    // Test timeout in milliseconds
    testTimeout: 10000
};
