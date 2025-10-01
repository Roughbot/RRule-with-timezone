/**
 * Tests for RRule class
 */

import { RRule } from "../src/rrule";
import { Frequency, Weekday } from "../src/types";
import { createDailyRule, createWeeklyRule, validateRRule } from "../src/utils";

describe("RRule", () => {
  describe("Basic functionality", () => {
    test("should create RRule instance", () => {
      const options = createDailyRule(1, 5);
      const rrule = new RRule(options, new Date("2024-01-01"));

      expect(rrule).toBeInstanceOf(RRule);
    });

    test("should generate daily occurrences", () => {
      const options = createDailyRule(1, 3);
      const rrule = new RRule(options, new Date("2024-01-01"));
      const occurrences = rrule.getOccurrences();

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date).toEqual(new Date("2024-01-01"));
      expect(occurrences[1].date).toEqual(new Date("2024-01-02"));
      expect(occurrences[2].date).toEqual(new Date("2024-01-03"));
    });

    test("should generate weekly occurrences", () => {
      const options = createWeeklyRule(
        1,
        [Weekday.MO, Weekday.WE, Weekday.FR],
        3
      );
      const rrule = new RRule(options, new Date("2024-01-01")); // Monday
      const occurrences = rrule.getOccurrences();

      expect(occurrences).toHaveLength(3);
      expect(occurrences[0].date.getDay()).toBe(1); // Monday
      expect(occurrences[1].date.getDay()).toBe(3); // Wednesday
      expect(occurrences[2].date.getDay()).toBe(5); // Friday
    });
  });

  describe("String conversion", () => {
    test("should convert to RRULE string", () => {
      const options = createDailyRule(2, 5);
      const rrule = new RRule(options);
      const rruleString = rrule.toString();

      expect(rruleString).toMatch(/^RRULE:FREQ=DAILY;INTERVAL=2;COUNT=5$/);
    });
  });

  describe("Parsing", () => {
    test("should parse valid RRULE string", () => {
      const result = RRule.parse("RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5");

      expect(result.valid).toBe(true);
      expect(result.rrule?.freq).toBe(Frequency.DAILY);
      expect(result.rrule?.interval).toBe(1);
      expect(result.rrule?.count).toBe(5);
    });

    test("should reject invalid RRULE string", () => {
      const result = RRule.parse("INVALID:STRING");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe("Utils", () => {
  describe("validateRRule", () => {
    test("should validate correct options", () => {
      const options = createDailyRule(1, 5);
      const result = validateRRule(options);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should catch validation errors", () => {
      const options = { freq: Frequency.DAILY, interval: -1, count: 0 };
      const result = validateRRule(options as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
