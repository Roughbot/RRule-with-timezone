import { DateTime } from "luxon";

// Enum for frequency types
enum Frequency {
  DAILY = 0,
  WEEKLY = 1,
  MONTHLY = 2,
  YEARLY = 3,
}

// Enum for weekdays
enum Weekday {
  SU = 0,
  MO = 1,
  TU = 2,
  WE = 3,
  TH = 4,
  FR = 5,
  SA = 6,
}

interface RecurrenceOptions {
  freq: Frequency;
  interval: number;
  dtstart: Date;
  until?: Date;
  wkst?: Weekday;
  byweekday?: Weekday[];
  bysetpos?: number[];
  count?: number;
}

/**
 * This hook is used to generate the dates for a recurring event with a custom timezone
 * @returns The dates for the recurring event
 */
export const useRruleDatesGenerator = () => {
  /**
   * Parse RRULE string and convert to RecurrenceOptions
   */
  const parseRRuleString = (
    rRuleString: string,
    _startTime: string
  ): RecurrenceOptions | null => {
    if (!rRuleString) return null;

    // Parse the DTSTART with timezone info
    const dtstartMatch = rRuleString.match(
      /DTSTART;TZID=([^:]+):(\d{8}T\d{6})/
    );
    if (!dtstartMatch) return null;

    const rruleMatch = rRuleString.match(/RRULE:(.+)/);
    if (!rruleMatch) return null;

    const rrulePart = rruleMatch[1];

    // Parse the DTSTART date from the RRULE string itself
    const dtstartStr = dtstartMatch[2]; // e.g., "20250929T044500"
    const year = parseInt(dtstartStr.substring(0, 4));
    const month = parseInt(dtstartStr.substring(4, 6));
    const day = parseInt(dtstartStr.substring(6, 8));
    const hour = parseInt(dtstartStr.substring(9, 11));
    const minute = parseInt(dtstartStr.substring(11, 13));
    const second = parseInt(dtstartStr.substring(13, 15));

    // Create start date in UTC (since we're not using timezone info for the recurrence calculation)
    const startInTargetZone = DateTime.fromObject(
      { year, month, day, hour, minute, second },
      { zone: "UTC" }
    );

    const options: RecurrenceOptions = {
      freq: Frequency.DAILY,
      interval: 1,
      dtstart: startInTargetZone.toJSDate(),
      wkst: Weekday.MO,
    };

    // Parse the RRULE part
    const parts = rrulePart.split(";");
    parts.forEach((part) => {
      const [key, value] = part.split("=");
      switch (key) {
        case "FREQ":
          switch (value) {
            case "DAILY":
              options.freq = Frequency.DAILY;
              break;
            case "WEEKLY":
              options.freq = Frequency.WEEKLY;
              break;
            case "MONTHLY":
              options.freq = Frequency.MONTHLY;
              break;
            case "YEARLY":
              options.freq = Frequency.YEARLY;
              break;
          }
          break;
        case "INTERVAL":
          options.interval = parseInt(value);
          break;
        case "UNTIL":
          const untilStr = value;
          const untilYear = parseInt(untilStr.substring(0, 4));
          const untilMonth = parseInt(untilStr.substring(4, 6));
          const untilDay = parseInt(untilStr.substring(6, 8));
          const untilHour = parseInt(untilStr.substring(9, 11)) || 23;
          const untilMinute = parseInt(untilStr.substring(11, 13)) || 59;
          const untilSecond = parseInt(untilStr.substring(13, 15)) || 59;

          // Create the UNTIL date in UTC to avoid timezone issues
          // This ensures consistent comparison across different timezones
          const untilDateTime = DateTime.fromObject(
            {
              year: untilYear,
              month: untilMonth,
              day: untilDay,
              hour: untilHour,
              minute: untilMinute,
              second: untilSecond,
            },
            { zone: "UTC" }
          );
          options.until = untilDateTime.toJSDate();
          break;
        case "WKST":
          switch (value) {
            case "SU":
              options.wkst = Weekday.SU;
              break;
            case "MO":
              options.wkst = Weekday.MO;
              break;
            case "TU":
              options.wkst = Weekday.TU;
              break;
            case "WE":
              options.wkst = Weekday.WE;
              break;
            case "TH":
              options.wkst = Weekday.TH;
              break;
            case "FR":
              options.wkst = Weekday.FR;
              break;
            case "SA":
              options.wkst = Weekday.SA;
              break;
          }
          break;
        case "BYDAY":
          options.byweekday = value.split(",").map((day) => {
            switch (day) {
              case "SU":
                return Weekday.SU;
              case "MO":
                return Weekday.MO;
              case "TU":
                return Weekday.TU;
              case "WE":
                return Weekday.WE;
              case "TH":
                return Weekday.TH;
              case "FR":
                return Weekday.FR;
              case "SA":
                return Weekday.SA;
              default:
                return Weekday.MO;
            }
          });
          break;
        case "BYSETPOS":
          options.bysetpos = value.split(",").map((pos) => parseInt(pos));
          break;
        case "COUNT":
          options.count = parseInt(value);
          break;
      }
    });

    return options;
  };

  /**
   * Generate dates for daily recurrence
   */
  const generateDailyDates = (
    options: RecurrenceOptions,
    targetTimeZone: string,
    startTime: string
  ): string[] => {
    const dates: string[] = [];
    const startDate = DateTime.fromJSDate(options.dtstart);
    let currentDate = startDate;
    let count = 0;
    const maxCount = options.count || 1000; // Default limit to prevent infinite loops

    while (count < maxCount) {
      if (options.until && currentDate.toJSDate() >= options.until) {
        break;
      }

      // Convert to target timezone and apply original time
      const dateInTargetZone = currentDate.setZone(targetTimeZone);
      const originalTime = DateTime.fromISO(startTime);

      const finalDateTime = dateInTargetZone.set({
        hour: originalTime.hour,
        minute: originalTime.minute,
        second: originalTime.second,
      });

      dates.push(finalDateTime.toString());

      currentDate = currentDate.plus({ days: options.interval });
      count++;
    }

    return dates;
  };

  /**
   * Generate dates for weekly recurrence
   */
  const generateWeeklyDates = (
    options: RecurrenceOptions,
    targetTimeZone: string,
    startTime: string
  ): string[] => {
    const dates: string[] = [];
    const startDate = DateTime.fromJSDate(options.dtstart);
    const originalTime = DateTime.fromISO(startTime);

    // If specific weekdays are specified, generate dates for each weekday
    if (options.byweekday && options.byweekday.length > 0) {
      // Start from the start date and go day by day
      let currentDate = startDate;
      let count = 0;
      const maxCount = options.count || 1000;

      while (count < maxCount) {
        if (options.until && currentDate.toJSDate() >= options.until) {
          break;
        }

        // Get current weekday in our enum format (0=Sunday, 6=Saturday)
        const currentWeekday =
          currentDate.weekday === 7 ? 0 : currentDate.weekday; // Convert Luxon's 7=Sunday to our 0=Sunday

        // Check if current date matches any of the specified weekdays
        if (options.byweekday.includes(currentWeekday)) {
          const dateInTargetZone = currentDate.setZone(targetTimeZone);

          const finalDateTime = dateInTargetZone.set({
            hour: originalTime.hour,
            minute: originalTime.minute,
            second: originalTime.second,
          });

          dates.push(finalDateTime.toString());
        }

        // Move to the next day
        currentDate = currentDate.plus({ days: 1 });
        count++;
      }
    } else {
      // No specific weekdays, use the start date's weekday
      let currentDate = startDate;
      let count = 0;
      const maxCount = options.count || 1000;

      while (count < maxCount) {
        if (options.until && currentDate.toJSDate() >= options.until) {
          break;
        }

        const dateInTargetZone = currentDate.setZone(targetTimeZone);

        const finalDateTime = dateInTargetZone.set({
          hour: originalTime.hour,
          minute: originalTime.minute,
          second: originalTime.second,
        });

        dates.push(finalDateTime.toString());

        currentDate = currentDate.plus({ weeks: options.interval });
        count++;
      }
    }

    return dates;
  };

  /**
   * Generate dates for monthly recurrence
   */
  const generateMonthlyDates = (
    options: RecurrenceOptions,
    targetTimeZone: string,
    startTime: string
  ): string[] => {
    const dates: string[] = [];
    const startDate = DateTime.fromJSDate(options.dtstart);
    let currentDate = startDate;
    let count = 0;
    const maxCount = options.count || 1000;

    while (count < maxCount) {
      if (options.until && currentDate.toJSDate() >= options.until) {
        break;
      }

      // Handle specific weekday occurrences (e.g., "first Monday of month")
      if (options.byweekday && options.bysetpos) {
        const targetWeekday = options.byweekday[0];
        const occurrence = options.bysetpos[0];

        // Find the target weekday in the current month
        const monthStart = currentDate.startOf("month");
        const monthEnd = currentDate.endOf("month");

        // Get all occurrences of the target weekday in the month
        const weekdayOccurrences: DateTime[] = [];
        let checkDate = monthStart;

        while (checkDate <= monthEnd) {
          if (checkDate.weekday % 7 === targetWeekday) {
            weekdayOccurrences.push(checkDate);
          }
          checkDate = checkDate.plus({ days: 1 });
        }

        // Get the specific occurrence (1st, 2nd, 3rd, 4th, or last)
        let targetOccurrence: DateTime | null = null;
        if (occurrence > 0 && occurrence <= weekdayOccurrences.length) {
          targetOccurrence = weekdayOccurrences[occurrence - 1];
        } else if (occurrence === -1 && weekdayOccurrences.length > 0) {
          // Last occurrence
          targetOccurrence = weekdayOccurrences[weekdayOccurrences.length - 1];
        }

        if (targetOccurrence) {
          const dateInTargetZone = targetOccurrence.setZone(targetTimeZone);
          const originalTime = DateTime.fromISO(startTime);

          const finalDateTime = dateInTargetZone.set({
            hour: originalTime.hour,
            minute: originalTime.minute,
            second: originalTime.second,
          });

          dates.push(finalDateTime.toString());
        }
      } else {
        // Simple monthly recurrence on the same day
        const dateInTargetZone = currentDate.setZone(targetTimeZone);
        const originalTime = DateTime.fromISO(startTime);

        const finalDateTime = dateInTargetZone.set({
          hour: originalTime.hour,
          minute: originalTime.minute,
          second: originalTime.second,
        });

        dates.push(finalDateTime.toString());
      }

      currentDate = currentDate.plus({ months: options.interval });
      count++;
    }

    return dates;
  };

  /**
   * Generate dates for yearly recurrence
   */
  const generateYearlyDates = (
    options: RecurrenceOptions,
    targetTimeZone: string,
    startTime: string
  ): string[] => {
    const dates: string[] = [];
    const startDate = DateTime.fromJSDate(options.dtstart);
    let currentDate = startDate;
    let count = 0;
    const maxCount = options.count || 1000;

    while (count < maxCount) {
      if (options.until && currentDate.toJSDate() >= options.until) {
        break;
      }

      const dateInTargetZone = currentDate.setZone(targetTimeZone);
      const originalTime = DateTime.fromISO(startTime);

      const finalDateTime = dateInTargetZone.set({
        hour: originalTime.hour,
        minute: originalTime.minute,
        second: originalTime.second,
      });

      dates.push(finalDateTime.toString());

      currentDate = currentDate.plus({ years: options.interval });
      count++;
    }

    return dates;
  };

  /**
   * Main function to generate dates based on recurrence options
   */
  const getDatesWithCustomTimezone = (
    rRuleString: string,
    targetTimeZone: string,
    startTime: string
  ) => {
    if (!rRuleString) return [];

    const options = parseRRuleString(rRuleString, startTime);
    if (!options) return [];

    switch (options.freq) {
      case Frequency.DAILY:
        return generateDailyDates(options, targetTimeZone, startTime);
      case Frequency.WEEKLY:
        return generateWeeklyDates(options, targetTimeZone, startTime);
      case Frequency.MONTHLY:
        return generateMonthlyDates(options, targetTimeZone, startTime);
      case Frequency.YEARLY:
        return generateYearlyDates(options, targetTimeZone, startTime);
      default:
        return [];
    }
  };

  return { getDatesWithCustomTimezone };
};
