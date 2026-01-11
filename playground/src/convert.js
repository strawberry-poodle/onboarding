import * as temperature from "./lib/temperature.js";
import * as distance from "./lib/distance.js";
import * as weight from "./lib/weight.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const defaults = JSON.parse(
  readFileSync(join(__dirname, "../config/defaults.json"), "utf-8")
);

function roundToPrecision(value, precision) {
  return Number.parseFloat(value.toFixed(precision));
}

export function convert(type, value, from, to) {
  // Validate numeric input
  // Check for invalid types that Number() would convert to 0
  if (value === "" || value === null || Array.isArray(value)) {
    throw new Error("Invalid number: value must be a valid numeric value");
  }

  const numValue = Number(value);
  if (isNaN(numValue) || !isFinite(numValue)) {
    throw new Error("Invalid number: value must be a valid numeric value");
  }

  // Validate unit codes before applying defaults
  // Reject empty string and null explicitly
  if (from === "" || from === null) {
    throw new Error(`Unknown unit code: ${from}`);
  }

  switch (type) {
    case "temperature":
      return roundToPrecision(
        temperature.convertTemperature(
          numValue,
          from || defaults.temperature.defaultFrom,
          to || defaults.temperature.defaultTo
        ),
        defaults.precision
      );
    case "distance":
      return roundToPrecision(
        distance.convertDistance(numValue, from, to),
        defaults.precision
      );
    case "weight":
      return roundToPrecision(
        weight.convertWeight(numValue, from, to),
        defaults.precision
      );
    default:
      throw new Error("Unknown type " + type);
  }
}
