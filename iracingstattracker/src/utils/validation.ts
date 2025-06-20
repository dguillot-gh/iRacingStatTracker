import { RaceEntry } from '../types/race';

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export const validateRaceEntry = (race: Partial<RaceEntry>): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Required fields
  if (!race.series) {
    errors.series = 'Series is required';
  }

  if (!race.vehicle) {
    errors.vehicle = 'Vehicle is required';
  }

  if (!race.track?.name) {
    errors.track = 'Track name is required';
  }

  if (!race.date) {
    errors.date = 'Date is required';
  }

  // Date validation
  if (race.date && race.endDate) {
    const startDate = new Date(race.date);
    const endDate = new Date(race.endDate);
    if (endDate < startDate) {
      errors.endDate = 'End date must be after start date';
    }
  }

  // Week validation
  if (typeof race.week === 'number') {
    if (race.week < 1) {
      errors.week = 'Week must be 1 or greater';
    }
    if (race.week > 13) {
      errors.week = 'Week cannot exceed 13';
    }
  }

  // Season validation
  if (race.season) {
    const currentYear = new Date().getFullYear();
    const seasonYear = parseInt(race.season);
    if (isNaN(seasonYear) || seasonYear < currentYear - 1 || seasonYear > currentYear + 1) {
      errors.season = 'Season year must be within one year of current year';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 