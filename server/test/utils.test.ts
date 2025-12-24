import { isValidPort } from '../src/utils';  // Adjust path if needed

describe('isValidPort', () => {
  test('should return true for valid ports', () => {
    expect(isValidPort(3000)).toBe(true);
    expect(isValidPort(4443)).toBe(true);
    expect(isValidPort(1)).toBe(true);
    expect(isValidPort(65535)).toBe(true);
  });

  test('should return false for invalid ports', () => {
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(65536)).toBe(false);
    expect(isValidPort(3.14)).toBe(false);
    expect(isValidPort(NaN)).toBe(false);
  });
});