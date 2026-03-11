const { getRandomChar, createHash } = require("../../src/utils/random");

describe("random utils", () => {
  describe("getRandomChar", () => {
    it("should return a string with default size of 3 bytes (hex = 6 chars)", () => {
      const result = getRandomChar();
      expect(result).toHaveLength(6);
    });

    it("should return a string with specified size", () => {
      const result = getRandomChar(5);
      expect(result).toHaveLength(10);
    });

    it("should return different values on each call", () => {
      const result1 = getRandomChar();
      const result2 = getRandomChar();
      expect(result1).not.toBe(result2);
    });
  });

  describe("createHash", () => {
    it("should return SHA-256 hash of the input text", () => {
      const result = createHash("test");
      expect(result).toHaveLength(64);
      expect(result).toMatch(/^[a-f0-9]+$/);
    });

    it("should return same hash for same input", () => {
      const hash1 = createHash("password123");
      const hash2 = createHash("password123");
      expect(hash1).toBe(hash2);
    });

    it("should return different hash for different input", () => {
      const hash1 = createHash("password123");
      const hash2 = createHash("password124");
      expect(hash1).not.toBe(hash2);
    });
  });
});
