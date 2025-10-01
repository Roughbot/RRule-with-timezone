/**
 * Utility functions for RruleLib
 */

import { RRuleOptions, Frequency, Weekday } from "./types";

/**
 * Create a simple daily recurrence rule
 */
export function createDailyRule(
  interval: number = 1,
  count?: number
): RRuleOptions {
  const options: RRuleOptions = {
    freq: Frequency.DAILY,
    interval,
  };

  if (count !== undefined) {
    options.count = count;
  }

  return options;
}

/**
 * Create a weekly recurrence rule
 */
export function createWeeklyRule(
  interval: number = 1,
  byday: Weekday[] = [Weekday.MO],
  count?: number
): RRuleOptions {
  const options: RRuleOptions = {
    freq: Frequency.WEEKLY,
    interval,
    byday,
  };

  if (count !== undefined) {
    options.count = count;
  }

  return options;
}

/**
 * Create a monthly recurrence rule
 */
export function createMonthlyRule(
  interval: number = 1,
  bymonthday?: number[],
  count?: number
): RRuleOptions {
  const options: RRuleOptions = {
    freq: Frequency.MONTHLY,
    interval,
  };

  if (bymonthday !== undefined) {
    options.bymonthday = bymonthday;
  }

  if (count !== undefined) {
    options.count = count;
  }

  return options;
}

/**
 * Create a yearly recurrence rule
 */
export function createYearlyRule(
  interval: number = 1,
  bymonth?: number[],
  count?: number
): RRuleOptions {
  const options: RRuleOptions = {
    freq: Frequency.YEARLY,
    interval,
  };

  if (bymonth !== undefined) {
    options.bymonth = bymonth;
  }

  if (count !== undefined) {
    options.count = count;
  }

  return options;
}

/**
 * Validate RRULE options
 */
export function validateRRule(options: RRuleOptions): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.freq) {
    errors.push("FREQ is required");
  }

  if (options.interval && options.interval < 1) {
    errors.push("INTERVAL must be greater than 0");
  }

  if (options.count && options.count < 1) {
    errors.push("COUNT must be greater than 0");
  }

  if (options.until && options.count) {
    errors.push("Cannot specify both UNTIL and COUNT");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date,
  format: "short" | "long" | "iso" = "short"
): string {
  switch (format) {
    case "iso":
      return date.toISOString();
    case "long":
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "short":
    default:
      return date.toLocaleDateString();
  }
}
