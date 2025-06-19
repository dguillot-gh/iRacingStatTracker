export type TrackType = 'oval' | 'road' | 'dirt'
export type RaceClass = 'oval' | 'road' | 'dirt_road' | 'dirt_oval'
export type RaceStatus = 'upcoming' | 'completed' | 'cancelled'
export type RaceSeries = string

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
  finishPosition?: number
  startPosition?: number
  averageLapTime?: number
  bestLapTime?: number
  leadLaps?: number
  totalLaps?: number
  lapsCompleted?: number
  incidentPoints?: number
  championshipPoints?: number
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
  title?: string
  startTime?: string
}

export type RaceFormData = Omit<RaceEntry, 'id' | 'completed' | 'position' | 'iRatingChange'> 