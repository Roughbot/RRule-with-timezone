/**
 * Type definitions for RruleLib
 */

export interface RRuleOptions {
  freq: Frequency;
  interval?: number;
  count?: number;
  until?: Date;
  bysecond?: number[];
  byminute?: number[];
  byhour?: number[];
  byday?: Weekday[];
  bymonthday?: number[];
  byyearday?: number[];
  byweekno?: number[];
  bymonth?: number[];
  bysetpos?: number[];
  wkst?: Weekday;
}

export enum Frequency {
  YEARLY = "YEARLY",
  MONTHLY = "MONTHLY",
  WEEKLY = "WEEKLY",
  DAILY = "DAILY",
  HOURLY = "HOURLY",
  MINUTELY = "MINUTELY",
  SECONDLY = "SECONDLY",
}

export enum Weekday {
  SU = "SU",
  MO = "MO",
  TU = "TU",
  WE = "WE",
  TH = "TH",
  FR = "FR",
  SA = "SA",
}

export interface Occurrence {
  date: Date;
  isAllDay?: boolean;
}

export interface ParseResult {
  valid: boolean;
  rrule?: RRuleOptions;
  error?: string;
}
