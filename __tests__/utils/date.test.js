const { getPassDateByMilliseconds } = require("../../src/utils/date");

describe("date utils", () => {
  describe("getPassDateByMilliseconds", () => {
    it("should return a date in the past by specified milliseconds", () => {
      const now = Date.now();
      const tenMinutesAgo = 10 * 60 * 1000;
      
      const result = getPassDateByMilliseconds(tenMinutesAgo);
      
      expect(result.getTime()).toBeLessThan(now);
      expect(result.getTime()).toBeGreaterThanOrEqual(now - tenMinutesAgo - 1000);
    });

    it("should return current date when ms is 0", () => {
      const result = getPassDateByMilliseconds(0);
      const now = Date.now();
      
      expect(result.getTime()).toBeCloseTo(now, -3);
    });

    it("should handle large milliseconds values", () => {
      const oneDayAgo = 24 * 60 * 60 * 1000;
      const result = getPassDateByMilliseconds(oneDayAgo);
      
      expect(result.getTime()).toBeLessThan(Date.now());
    });
  });
});
