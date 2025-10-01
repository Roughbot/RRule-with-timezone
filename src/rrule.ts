/**
 * Core RRULE functionality
 */

import { RRuleOptions, Frequency, Occurrence, ParseResult } from "./types";

export class RRule {
  private options: RRuleOptions;
  private startDate: Date;

  constructor(options: RRuleOptions, startDate: Date = new Date()) {
    this.options = { ...options };
    this.startDate = new Date(startDate);
  }

  /**
   * Generate occurrences based on the RRULE
   */
  public getOccurrences(count?: number, until?: Date): Occurrence[] {
    const occurrences: Occurrence[] = [];
    const maxCount = count || this.options.count || 100;
    const endDate =
      until ||
      this.options.until ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    let currentDate = new Date(this.startDate);
    let occurrenceCount = 0;

    while (occurrenceCount < maxCount && currentDate <= endDate) {
      occurrences.push({
        date: new Date(currentDate),
        isAllDay: this.isAllDayEvent(),
      });

      currentDate = this.getNextOccurrence(currentDate);
      occurrenceCount++;
    }

    return occurrences;
  }

  /**
   * Get the next occurrence after the given date
   */
  public getNextOccurrence(date: Date): Date {
    const nextDate = new Date(date);
    const interval = this.options.interval || 1;

    switch (this.options.freq) {
      case Frequency.SECONDLY:
        nextDate.setSeconds(nextDate.getSeconds() + interval);
        break;
      case Frequency.MINUTELY:
        nextDate.setMinutes(nextDate.getMinutes() + interval);
        break;
      case Frequency.HOURLY:
        nextDate.setHours(nextDate.getHours() + interval);
        break;
      case Frequency.DAILY:
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case Frequency.WEEKLY:
        if (this.options.byday && this.options.byday.length > 0) {
          // For weekly with specific days, find the next occurrence of any of the specified days
          const targetDays = this.options.byday.map((day) =>
            this.getDayNumber(day)
          );
          const currentDay = nextDate.getDay();

          // Find the next target day
          let nextTargetDay = targetDays.find((day) => day > currentDay);
          if (!nextTargetDay) {
            // If no day found in current week, get first day of next week
            nextTargetDay = Math.min(...targetDays);
            nextDate.setDate(
              nextDate.getDate() + (7 - currentDay + nextTargetDay)
            );
          } else {
            nextDate.setDate(nextDate.getDate() + (nextTargetDay - currentDay));
          }
        } else {
          nextDate.setDate(nextDate.getDate() + 7 * interval);
        }
        break;
      case Frequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case Frequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  /**
   * Convert weekday enum to day number (0 = Sunday, 1 = Monday, etc.)
   */
  private getDayNumber(weekday: string): number {
    const dayMap: { [key: string]: number } = {
      SU: 0,
      MO: 1,
      TU: 2,
      WE: 3,
      TH: 4,
      FR: 5,
      SA: 6,
    };
    return dayMap[weekday] || 0;
  }

  /**
   * Check if this is an all-day event
   */
  private isAllDayEvent(): boolean {
    return (
      this.options.freq === Frequency.DAILY &&
      !this.options.byhour &&
      !this.options.byminute &&
      !this.options.bysecond
    );
  }

  /**
   * Convert RRULE to string format
   */
  public toString(): string {
    const parts: string[] = [];

    parts.push(`FREQ=${this.options.freq}`);

    if (this.options.interval) {
      parts.push(`INTERVAL=${this.options.interval}`);
    }

    if (this.options.count) {
      parts.push(`COUNT=${this.options.count}`);
    }

    if (this.options.until) {
      parts.push(
        `UNTIL=${
          this.options.until.toISOString().replace(/[-:]/g, "").split(".")[0]
        }Z`
      );
    }

    return `RRULE:${parts.join(";")}`;
  }

  /**
   * Parse RRULE string
   */
  public static parse(rruleString: string): ParseResult {
    try {
      if (!rruleString.startsWith("RRULE:")) {
        return { valid: false, error: "Invalid RRULE format" };
      }

      const rrulePart = rruleString.substring(6);
      const options: Partial<RRuleOptions> = {};

      const pairs = rrulePart.split(";");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");

        switch (key) {
          case "FREQ":
            options.freq = value as Frequency;
            break;
          case "INTERVAL":
            options.interval = parseInt(value, 10);
            break;
          case "COUNT":
            options.count = parseInt(value, 10);
            break;
          case "UNTIL":
            options.until = new Date(value);
            break;
          // Add more parsing for other properties as needed
        }
      }

      if (!options.freq) {
        return { valid: false, error: "FREQ is required" };
      }

      return { valid: true, rrule: options as RRuleOptions };
    } catch (error) {
      return { valid: false, error: `Parse error: ${error}` };
    }
  }
}
