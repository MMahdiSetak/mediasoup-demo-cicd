/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],  // Matches your utils.test.ts; adjust if needed
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};