import { RaceEntry } from '../types/race'

const RACES_STORAGE_KEY = 'iracingstat_races'

export const StorageService = {
  saveRaces: (races: RaceEntry[]): void => {
    try {
      if (!Array.isArray(races)) {
        console.error('Invalid races data: expected array')
        return
      }

      // Convert dates to ISO strings for storage
      const racesToStore = races.map(race => ({
        ...race,
        date: race.date instanceof Date ? race.date.toISOString() : race.date,
        endDate: race.endDate instanceof Date ? race.endDate.toISOString() : race.endDate
      }))

      localStorage.setItem(RACES_STORAGE_KEY, JSON.stringify(racesToStore))
      console.debug(`Saved ${races.length} races to localStorage`)
    } catch (error) {
      console.error('Error saving races to localStorage:', error)
      throw new Error('Failed to save races to localStorage')
    }
  },

  loadRaces: (): RaceEntry[] => {
    try {
      const savedRaces = localStorage.getItem(RACES_STORAGE_KEY)
      if (!savedRaces) {
        console.debug('No saved races found in localStorage')
        return []
      }

      const parsedRaces = JSON.parse(savedRaces)
      if (!Array.isArray(parsedRaces)) {
        console.error('Invalid saved races data: expected array')
        return []
      }

      // Convert ISO strings back to Date objects and validate data
      return parsedRaces.map((race: any) => {
        try {
          return {
            ...race,
            date: new Date(race.date),
            endDate: race.endDate ? new Date(race.endDate) : null,
            // Ensure required properties exist
            id: race.id || crypto.randomUUID(),
            status: race.status || 'upcoming',
          }
        } catch (parseError) {
          console.error('Error parsing race entry:', parseError)
          return null
        }
      }).filter((race): race is RaceEntry => race !== null)
    } catch (error) {
      console.error('Error loading races from localStorage:', error)
      return []
    }
  },

  clearRaces: (): void => {
    try {
      localStorage.removeItem(RACES_STORAGE_KEY)
      console.debug('Cleared races from localStorage')
    } catch (error) {
      console.error('Error clearing races from localStorage:', error)
      throw new Error('Failed to clear races from localStorage')
    }
  }
} 