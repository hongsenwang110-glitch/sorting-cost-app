import { RegionConfig } from "@prisma/client";

export type CalculationResult = {
  totalCost: number;
  loadedCost: number;
  costPerBox: number | null;
  efficiency: number | null;
  totalHours: number;
};

// Helper: Calculate effective hours (including OT multiplier)
export function applyOT(hours: number, normalHours: number, otMultiplier: number): number {
  const regular = Math.min(hours, normalHours);
  const ot = Math.max(0, hours - normalHours);
  return regular + (ot * otMultiplier);
}

export function calculateTX(
  packages: number,
  shifts: { hours: number; hourlyWage: number }[],
  config: RegionConfig
): CalculationResult {
  let totalCost = 0;
  let totalHours = 0;

  for (const shift of shifts) {
    const effectiveHours = applyOT(shift.hours, config.normalHours, config.otMultiplier);
    totalCost += effectiveHours * shift.hourlyWage;
    totalHours += shift.hours;
  }

  const loadedCost = totalCost * config.markup;
  
  return {
    totalCost,
    loadedCost,
    costPerBox: packages > 0 ? loadedCost / packages : null,
    efficiency: totalHours > 0 ? packages / totalHours : null,
    totalHours
  };
}

export function calculateCA(
  packages: number,
  shifts: { hours: number; hourlyWage: number; role?: string }[],
  config: RegionConfig
): CalculationResult {
  let totalCost = 0;
  let totalHours = 0;
  const markup = config.markup;

  // Re-implemented Individual Sorter Tracking for CA
  for (const shift of shifts) {
     const effectiveHours = applyOT(shift.hours, config.normalHours, config.otMultiplier);
     const wage = shift.hourlyWage;
     totalCost += effectiveHours * wage;
     totalHours += shift.hours;
  }

  const loadedCost = totalCost * markup;

  return {
    totalCost,
    loadedCost,
    costPerBox: packages > 0 ? loadedCost / packages : null,
    efficiency: totalHours > 0 ? packages / totalHours : null,
    totalHours
  };
}

export function calculateNJ(
  packages: number,
  shifts: { hours: number; hourlyWage: number }[],
  config: RegionConfig
): CalculationResult {
  let totalCost = 0;
  let totalHours = 0;
  const ownMarkup = config.ownMarkup || 1.25;

  for (const shift of shifts) {
    const effectiveHours = applyOT(shift.hours, config.normalHours, config.otMultiplier);
    const wage = shift.hourlyWage;
    const cost = effectiveHours * wage;
    
    totalCost += cost;
    totalHours += shift.hours;
  }

  const loadedCost = totalCost * ownMarkup;

  return {
    totalCost,
    loadedCost,
    costPerBox: packages > 0 ? loadedCost / packages : null,
    efficiency: totalHours > 0 ? packages / totalHours : null,
    totalHours
  };
}
