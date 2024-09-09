import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
      // Determine the key to group by
      const groupKey = typeof key === 'function'
        ? key(currentValue)
        : currentValue[key];

      // Initialize the group if it doesn't exist
      if (!result[groupKey]) result[groupKey] = [];

      // Push the current value to the group
      result[groupKey].push(currentValue);

      return result;
  }, {});
}

export function round(number, decimalPlaces = 0) {
  const factor = Math.pow(10, decimalPlaces);

  return Math.round(number * factor) / factor;
}
