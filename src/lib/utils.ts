import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines classes with tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number to have a specific number of decimal places
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format a number to display with a unit
 */
export function formatWithUnit(value: number, unit = '', decimals = 2): string {
  return `${formatNumber(value, decimals)}${unit ? ` ${unit}` : ''}`;
}

/**
 * Format a value as CO2e
 */
export function formatCO2e(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)} CO₂e`;
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Get a random value between min and max
 */
export function getRandomValue(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Get random values for a chart
 */
export function getRandomChartData(count: number, min = 0, max = 100): number[] {
  return Array.from({ length: count }, () => getRandomValue(min, max));
}

/**
 * Get month names
 */
export function getMonthNames(short = false): string[] {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return short ? months.map(month => month.substring(0, 3)) : months;
}
