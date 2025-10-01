/**
 * Tests for TimezoneRRule class
 */

import {
  TimezoneRRule,
  TimezoneFrequency,
  TimezoneWeekday,
  useRruleDatesGenerator,
} from "../src/timezone-rrule";

describe("TimezoneRRule", () => {
  describe("parseRRuleString", () => {
    test("should parse daily RRULE with timezone", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3";
      const startTime = "2024-09-29T04:45:00";

      const result = TimezoneRRule.parseRRuleString(rruleString, startTime);

      expect(result).not.toBeNull();
      expect(result?.freq).toBe(TimezoneFrequency.DAILY);
      expect(result?.interval).toBe(1);
      expect(result?.count).toBe(3);
      expect(result?.dtstart).toBeInstanceOf(Date);
    });

    test("should parse weekly RRULE with specific weekdays", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=3";
      const startTime = "2024-09-29T04:45:00";

      const result = TimezoneRRule.parseRRuleString(rruleString, startTime);

      expect(result).not.toBeNull();
      expect(result?.freq).toBe(TimezoneFrequency.WEEKLY);
      expect(result?.byweekday).toEqual([
        TimezoneWeekday.MO,
        TimezoneWeekday.WE,
        TimezoneWeekday.FR,
      ]);
    });

    test("should return null for invalid RRULE string", () => {
      const result = TimezoneRRule.parseRRuleString(
        "invalid",
        "2024-09-29T04:45:00"
      );
      expect(result).toBeNull();
    });
  });

  describe("getDatesWithCustomTimezone", () => {
    test("should generate daily dates with timezone conversion", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3";
      const startTime = "2024-09-29T04:45:00";
      const targetTimeZone = "Europe/London";

      const dates = TimezoneRRule.getDatesWithCustomTimezone(
        rruleString,
        targetTimeZone,
        startTime
      );

      expect(dates).toHaveLength(3);
      expect(dates[0]).toContain("2024-09-29");
      expect(dates[1]).toContain("2024-09-30");
      expect(dates[2]).toContain("2024-10-01");
    });

    test("should generate weekly dates with specific weekdays", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=3";
      const startTime = "2024-09-29T04:45:00";
      const targetTimeZone = "Europe/London";

      const dates = TimezoneRRule.getDatesWithCustomTimezone(
        rruleString,
        targetTimeZone,
        startTime
      );

      expect(dates.length).toBeGreaterThan(0);
      // All dates should be Mondays, Wednesdays, or Fridays
      dates.forEach((dateStr) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        expect([1, 3, 5]).toContain(dayOfWeek); // Monday=1, Wednesday=3, Friday=5
      });
    });

    test("should handle monthly recurrence", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=MONTHLY;INTERVAL=1;COUNT=2";
      const startTime = "2024-09-29T04:45:00";
      const targetTimeZone = "Europe/London";

      const dates = TimezoneRRule.getDatesWithCustomTimezone(
        rruleString,
        targetTimeZone,
        startTime
      );

      expect(dates).toHaveLength(2);
      expect(dates[0]).toContain("2024-09-29");
      expect(dates[1]).toContain("2024-10-29");
    });

    test("should handle yearly recurrence", () => {
      const rruleString =
        "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=YEARLY;INTERVAL=1;COUNT=2";
      const startTime = "2024-09-29T04:45:00";
      const targetTimeZone = "Europe/London";

      const dates = TimezoneRRule.getDatesWithCustomTimezone(
        rruleString,
        targetTimeZone,
        startTime
      );

      expect(dates).toHaveLength(2);
      expect(dates[0]).toContain("2024-09-29");
      expect(dates[1]).toContain("2025-09-29");
    });

    test("should return empty array for invalid input", () => {
      const dates = TimezoneRRule.getDatesWithCustomTimezone(
        "",
        "Europe/London",
        "2024-09-29T04:45:00"
      );

      expect(dates).toEqual([]);
    });
  });
});

describe("useRruleDatesGenerator hook", () => {
  test("should return hook with getDatesWithCustomTimezone function", () => {
    const hook = useRruleDatesGenerator();

    expect(hook).toHaveProperty("getDatesWithCustomTimezone");
    expect(typeof hook.getDatesWithCustomTimezone).toBe("function");
  });

  test("should work through the hook", () => {
    const hook = useRruleDatesGenerator();
    const rruleString =
      "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=2";
    const startTime = "2024-09-29T04:45:00";
    const targetTimeZone = "Europe/London";

    const dates = hook.getDatesWithCustomTimezone(
      rruleString,
      targetTimeZone,
      startTime
    );

    expect(dates).toHaveLength(2);
  });
});
