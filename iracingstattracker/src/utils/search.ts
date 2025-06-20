import { Race, RaceSeries } from '../types/race';

export interface SearchOptions {
  series?: RaceSeries;
  startDate?: Date;
  endDate?: Date;
  track?: string;
  vehicle?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
}

// Helper function to safely convert a value to string for searching
function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return '';
}

export function searchRaces(races: Race[], searchTerm: string, options?: SearchOptions): Race[] {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return races.filter(race => {
    // If no search term, only apply filters
    if (!normalizedTerm && !options) return true;
    
    // Apply search term
    const searchableFields = [
      race.track,
      race.vehicle,
      race.series,
      race.notes,
      race.title,
      race.status,
      race.season
    ];

    const matchesSearch = !normalizedTerm || searchableFields.some(field => 
      safeToString(field).toLowerCase().includes(normalizedTerm)
    );
    
    // Apply filters if provided
    const matchesFilters = !options || Object.entries(options).every(([key, value]) => {
      if (!value) return true;
      
      switch (key) {
        case 'series':
          return race.series === value;
        case 'startDate':
          return new Date(race.date) >= value;
        case 'endDate':
          return new Date(race.date) <= value;
        case 'track':
          return safeToString(race.track).toLowerCase().includes(value.toLowerCase());
        case 'vehicle':
          return safeToString(race.vehicle).toLowerCase().includes(value.toLowerCase());
        case 'status':
          return race.status === value;
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  });
}

export function exportToCSV(races: Race[]): string {
  const headers = [
    'Date',
    'Series',
    'Track',
    'Vehicle',
    'Week',
    'Status',
    'Position',
    'Start Position',
    'Finish Position',
    'iRating Change',
    'Safety Rating Change',
    'Incidents',
    'Championship Points',
    'Notes'
  ].join(',');
  
  const rows = races.map(race => [
    new Date(race.date).toISOString(),
    safeToString(race.series),
    safeToString(race.track),
    safeToString(race.vehicle),
    race.week,
    race.status,
    race.result?.position || '',
    race.result?.startPosition || '',
    race.result?.finishPosition || '',
    race.result?.iRating?.change || '',
    race.result?.safetyRating?.change || '',
    race.result?.incidents || '',
    race.result?.championshipPoints || '',
    (race.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
  ].join(','));
  
  return [headers, ...rows].join('\n');
}

export function exportToJSON(races: Race[]): string {
  return JSON.stringify(races, null, 2);
} 