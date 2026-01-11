#!/usr/bin/env node
import { convert } from "../src/convert.js";
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

const [,, command, ...args] = process.argv;

if (!command) {
  console.error("Usage: convert <type> <value> [from] [to]");
  console.error("   or: convert compare <value1> <unit1> <value2> <unit2>");
  process.exit(1);
}

if (command === "compare") {
  // Parse: convert compare <value1> <unit1> <value2> <unit2>
  if (args.length !== 4) {
    console.error("Usage: convert compare <value1> <unit1> <value2> <unit2>");
    console.error("Example: convert compare 5 km 3 mi");
    process.exit(1);
  }

  const [value1, unit1, value2, unit2] = args;
  const numValue1 = Number(value1);
  const numValue2 = Number(value2);

  if (isNaN(numValue1) || isNaN(numValue2)) {
    console.error("Error: Both values must be valid numbers");
    process.exit(1);
  }

  // Determine type from units
  const distanceUnits = ["km", "mi", "m"];
  const weightUnits = ["g", "oz", "lb"];
  const temperatureUnits = ["C", "F", "K"];

  let type;
  if (distanceUnits.includes(unit1) && distanceUnits.includes(unit2)) {
    type = "distance";
  } else if (weightUnits.includes(unit1) && weightUnits.includes(unit2)) {
    type = "weight";
  } else if (temperatureUnits.includes(unit1) && temperatureUnits.includes(unit2)) {
    type = "temperature";
  } else {
    console.error(`Error: Units ${unit1} and ${unit2} are not compatible or unknown`);
    process.exit(1);
  }

  // Convert both values to unit2 for comparison
  const convertedValue1 = convert(type, numValue1, unit1, unit2);
  const convertedValue2 = numValue2; // Already in unit2

  // Compare and display results
  const diff = roundToPrecision(
    Math.abs(convertedValue1 - convertedValue2),
    defaults.precision
  );
  const larger = convertedValue1 > convertedValue2 ? 1 : convertedValue1 < convertedValue2 ? 2 : 0;

  console.log(`${numValue1} ${unit1} = ${convertedValue1} ${unit2}`);
  console.log(`${numValue2} ${unit2} = ${numValue2} ${unit2}`);
  
  if (larger === 0) {
    console.log("Both values are equal");
  } else if (larger === 1) {
    console.log(`${numValue1} ${unit1} is larger by ${diff} ${unit2}`);
  } else {
    console.log(`${numValue2} ${unit2} is larger by ${diff} ${unit2}`);
  }
} else {
  // Original convert command
  const [type, value, from, to] = [command, ...args];
  
  if (!type || !value) {
    console.error("Usage: convert <type> <value> [from] [to]");
    console.error("   or: convert compare <value1> <unit1> <value2> <unit2>");
    process.exit(1);
  }

  try {
    const result = convert(type, Number(value), from, to);
    console.log(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
