export type RaceSeries = 'Draftmasters' | 'Pro Series' | 'World Championship'

export type RaceStatus = 'upcoming' | 'completed' | 'cancelled'

export type RecurrencePattern = 'daily' | 'weekly' | 'none'

export type RaceClass = 'oval' | 'road'

export interface Track {
  name: string
  type: 'oval' | 'road' | 'dirt'
}

export interface QualifyingResult {
  position: number
  bestLapTime: number
  gap?: number  // Gap to pole
}

export interface RatingChange {
  before: number
  after: number
  change: number
}

export interface RaceResult {
  finishPosition: number
  startPosition: number
  incidentPoints: number
  championshipPoints: number
  bestLapTime: number // in seconds
  // Advanced optional fields
  qualifyingResult?: QualifyingResult
  split?: number
  totalSplits?: number
  strengthOfField?: number
  iRating?: RatingChange
  safetyRating?: RatingChange
  averageLapTime?: number
  leadLaps?: number
  totalLaps?: number
  gapToLeader?: number  // in seconds
  fuelUsagePerLap?: number
}

export interface ChampionshipStanding {
  position: number
  points: number
  droppedWeeks: number[]
  requiredRaces: number
  completedRaces: number
}

export interface RaceEntry {
  id: string
  series: RaceSeries
  class: RaceClass
  vehicle: string
  week: number
  season: string
  track: Track
  date: Date
  endDate?: Date // For multi-day events
  recurrence?: RecurrencePattern
  recurrenceGroupId?: string // To group recurring races together
  status: RaceStatus
  result?: RaceResult
  championshipStanding?: ChampionshipStanding
  notes?: string
}

export type RaceFormData = Omit<RaceEntry, 'id' | 'completed' | 'position' | 'iRatingChange'> 