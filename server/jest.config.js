/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.ts',     // Adjust if you use different test file patterns
  ],
  // Optional: more settings as needed later
  // roots: ['<rootDir>'],
  // moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};