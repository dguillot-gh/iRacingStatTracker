export type TrackType = 'oval' | 'road' | 'dirt'
export type RaceClass = 'oval' | 'road'
export type RaceStatus = 'upcoming' | 'completed' | 'cancelled'

export interface Track {
  name: string
  type: TrackType
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
  qualifyingResult?: {
    position: number
    bestLapTime: number
    gap: number
  }
  split?: number
  totalSplits?: number
  strengthOfField?: number
  position?: number
  averageLapTime?: number
  bestLapTime?: number
  leadLaps?: number
  totalLaps?: number
  iRating?: {
    before: number
    after: number
    change: number
  }
  safetyRating?: {
    before: number
    after: number
    change: number
  }
  incidents?: number
}

export interface ChampionshipStanding {
  position: number
  points: number
  requiredRaces: number
  droppedWeeks: number[]
}

export interface RaceEntry {
  id: string
  date: Date
  endDate?: Date
  series: string
  class: RaceClass
  track: Track
  vehicle: string
  week: number
  season: string
  status: RaceStatus
  notes?: string
  result?: RaceResult
  championshipStanding?: ChampionshipStanding
  recurrence?: 'none' | 'daily' | 'weekly'
  recurrenceGroupId?: string
}

export type RaceFormData = Omit<RaceEntry, 'id' | 'completed' | 'position' | 'iRatingChange'> 