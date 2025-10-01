# RruleLib

A TypeScript library for working with recurrence rules (RRULE) - perfect for calendar applications, scheduling systems, and any application that needs to handle recurring events with timezone support.

## Features

- 🚀 **TypeScript Support** - Full TypeScript definitions included
- 📅 **RRULE Parsing** - Parse and validate RRULE strings
- 🔄 **Occurrence Generation** - Generate recurring event occurrences
- 🌍 **Timezone Support** - Full timezone-aware date generation with Luxon
- ⚛️ **React Hook** - Ready-to-use React hook for timezone-aware RRULE generation
- 🛠️ **Utility Functions** - Helper functions for common patterns
- ✅ **Well Tested** - Comprehensive test suite included
- 📦 **Minimal Dependencies** - Only Luxon for timezone support

## Installation

```bash
npm install rrulelib
```

## Quick Start

```typescript
import {
  RRule,
  Frequency,
  createDailyRule,
  TimezoneRRule,
  useRruleDatesGenerator,
} from "rrulelib";

// Basic RRULE usage
const options = createDailyRule(1, 10); // Every day, 10 occurrences
const rrule = new RRule(options, new Date("2024-01-01"));
const occurrences = rrule.getOccurrences();

// Timezone-aware RRULE usage
const timezoneRRuleString =
  "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3";
const timezoneDates = TimezoneRRule.getDatesWithCustomTimezone(
  timezoneRRuleString,
  "Europe/London",
  "2024-09-29T04:45:00"
);

// React hook usage
const { getDatesWithCustomTimezone } = useRruleDatesGenerator();
const hookDates = getDatesWithCustomTimezone(
  timezoneRRuleString,
  "Asia/Tokyo",
  "2024-09-29T04:45:00"
);
```

## API Reference

### RRule Class

The main class for working with recurrence rules.

#### Constructor

```typescript
new RRule(options: RRuleOptions, startDate?: Date)
```

#### Methods

- `getOccurrences(count?: number, until?: Date): Occurrence[]` - Generate occurrences
- `getNextOccurrence(date: Date): Date` - Get next occurrence after given date
- `toString(): string` - Convert to RRULE string format

#### Static Methods

- `parse(rruleString: string): ParseResult` - Parse RRULE string

### Utility Functions

```typescript
import {
  createDailyRule,
  createWeeklyRule,
  createMonthlyRule,
  createYearlyRule,
  validateRRule,
  formatDate,
} from "rrulelib";

// Create common recurrence patterns
const daily = createDailyRule(1, 5); // Every day, 5 times
const weekly = createWeeklyRule(2, [Weekday.MO, Weekday.FR]); // Every 2 weeks on Mon/Fri
const monthly = createMonthlyRule(1, [1, 15]); // Monthly on 1st and 15th
const yearly = createYearlyRule(1, [1, 6]); // Yearly in Jan and Jun

// Validate options
const validation = validateRRule(options);
if (!validation.valid) {
  console.log("Errors:", validation.errors);
}

// Format dates
const formatted = formatDate(new Date(), "long");
```

## Examples

### Daily Recurrence

```typescript
import { RRule, createDailyRule } from "rrulelib";

const options = createDailyRule(1, 7); // Every day for a week
const rrule = new RRule(options, new Date("2024-01-01"));
const occurrences = rrule.getOccurrences();
```

### Weekly Recurrence

```typescript
import { RRule, createWeeklyRule, Weekday } from "rrulelib";

const options = createWeeklyRule(1, [Weekday.MO, Weekday.WE, Weekday.FR]);
const rrule = new RRule(options, new Date("2024-01-01"));
const occurrences = rrule.getOccurrences();
```

### Parse Existing RRULE

```typescript
import { RRule } from "rrulelib";

const result = RRule.parse("RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR");
if (result.valid && result.rrule) {
  const rrule = new RRule(result.rrule);
  const occurrences = rrule.getOccurrences();
}
```

### Timezone-Aware RRULE

```typescript
import { TimezoneRRule, useRruleDatesGenerator } from "rrulelib";

// Parse and generate timezone-aware dates
const rruleString =
  "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3";
const dates = TimezoneRRule.getDatesWithCustomTimezone(
  rruleString,
  "Europe/London",
  "2024-09-29T04:45:00"
);

// Using React hook
const { getDatesWithCustomTimezone } = useRruleDatesGenerator();
const hookDates = getDatesWithCustomTimezone(
  rruleString,
  "Asia/Tokyo",
  "2024-09-29T04:45:00"
);
```

## Development

### Setup

```bash
git clone <repository-url>
cd rrulelib
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Watch Mode

```bash
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 1.0.0

- Initial release
- Basic RRULE parsing and generation
- TypeScript support
- Comprehensive test suite
