/**
 * Example usage of RruleLib
 * Run with: node example.js
 */

const {
  RRule,
  Frequency,
  Weekday,
  createDailyRule,
  createWeeklyRule,
  TimezoneRRule,
  TimezoneFrequency,
  TimezoneWeekday,
  useRruleDatesGenerator,
} = require("./lib");

console.log("🚀 RruleLib Example\n");

// Example 1: Daily recurrence
console.log("📅 Daily Recurrence (every 2 days, 5 times):");
const dailyOptions = createDailyRule(2, 5);
const dailyRule = new RRule(dailyOptions, new Date("2024-01-01"));
const dailyOccurrences = dailyRule.getOccurrences();

dailyOccurrences.forEach((occurrence, index) => {
  console.log(`  ${index + 1}. ${occurrence.date.toDateString()}`);
});

console.log("\n📝 RRULE String:", dailyRule.toString());

// Example 2: Weekly recurrence
console.log("\n📅 Weekly Recurrence (Mon, Wed, Fri, 3 times):");
const weeklyOptions = createWeeklyRule(
  1,
  [Weekday.MO, Weekday.WE, Weekday.FR],
  3
);
const weeklyRule = new RRule(weeklyOptions, new Date("2024-01-01")); // Monday
const weeklyOccurrences = weeklyRule.getOccurrences();

weeklyOccurrences.forEach((occurrence, index) => {
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    occurrence.date.getDay()
  ];
  console.log(`  ${index + 1}. ${occurrence.date.toDateString()} (${dayName})`);
});

// Example 3: Parse RRULE string
console.log("\n📅 Parse RRULE String:");
const rruleString = "RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=3";
const parseResult = RRule.parse(rruleString);

if (parseResult.valid && parseResult.rrule) {
  console.log("✅ Parsed successfully!");
  console.log("Frequency:", parseResult.rrule.freq);
  console.log("Interval:", parseResult.rrule.interval);
  console.log("Count:", parseResult.rrule.count);

  const parsedRule = new RRule(parseResult.rrule, new Date("2024-01-01"));
  const parsedOccurrences = parsedRule.getOccurrences();

  console.log("Generated occurrences:");
  parsedOccurrences.forEach((occurrence, index) => {
    console.log(`  ${index + 1}. ${occurrence.date.toDateString()}`);
  });
} else {
  console.log("❌ Parse failed:", parseResult.error);
}

// Example 4: Timezone-aware RRULE parsing and generation
console.log("\n🌍 Timezone-Aware RRULE Example:");
const timezoneRRuleString =
  "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=DAILY;INTERVAL=1;COUNT=3";
const startTime = "2024-09-29T04:45:00";
const targetTimeZone = "Europe/London";

console.log("Original RRULE:", timezoneRRuleString);
console.log("Target timezone:", targetTimeZone);

const timezoneDates = TimezoneRRule.getDatesWithCustomTimezone(
  timezoneRRuleString,
  targetTimeZone,
  startTime
);

console.log("Generated dates in target timezone:");
timezoneDates.forEach((date, index) => {
  console.log(`  ${index + 1}. ${date}`);
});

// Example 5: Using the React hook
console.log("\n⚛️ React Hook Example:");
const hook = useRruleDatesGenerator();
const hookDates = hook.getDatesWithCustomTimezone(
  timezoneRRuleString,
  "Asia/Tokyo",
  startTime
);

console.log("Generated dates in Tokyo timezone:");
hookDates.forEach((date, index) => {
  console.log(`  ${index + 1}. ${date}`);
});

// Example 6: Weekly timezone recurrence
console.log("\n📅 Weekly Timezone Recurrence (Mon, Wed, Fri):");
const weeklyTimezoneRRule =
  "DTSTART;TZID=America/New_York:20240929T044500\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=3";

const weeklyTimezoneDates = TimezoneRRule.getDatesWithCustomTimezone(
  weeklyTimezoneRRule,
  "Europe/Paris",
  startTime
);

console.log("Weekly recurrence in Paris timezone:");
weeklyTimezoneDates.forEach((date, index) => {
  const dateObj = new Date(date);
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    dateObj.getDay()
  ];
  console.log(`  ${index + 1}. ${date} (${dayName})`);
});

console.log("\n✨ Example completed!");
