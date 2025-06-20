import { RaceEntry } from '../types/race'

const STORAGE_KEYS = {
  RACES: 'races',
  SETTINGS: 'settings',
  THEME: 'theme',
} as const

export interface AppSettings {
  theme: 'light' | 'dark'
  iRacingCredentials?: {
    username: string
    password: string
  }
  autoRefreshInterval: number
  defaultView: 'dashboard' | 'raceHistory' | 'series'
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
  }
  autoBackup: boolean
  backupFrequency: string
  calendarSync: boolean
}

export class StorageService {
  static async getRaces(): Promise<RaceEntry[]> {
    try {
      const racesJson = localStorage.getItem(STORAGE_KEYS.RACES)
      if (!racesJson) return []

      const races = JSON.parse(racesJson)
      const parsedRaces = races.map((race: any) => ({
        ...race,
        date: new Date(race.date),
        endDate: race.endDate ? new Date(race.endDate) : undefined,
      }))

      // Validate the parsed races
      if (!Array.isArray(parsedRaces)) {
        console.error('Invalid races data format')
        return []
      }

      return parsedRaces
    } catch (error) {
      console.error('Failed to load races:', error)
      return []
    }
  }

  static async saveRaces(races: RaceEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(races)) {
          throw new Error('Invalid races data format')
        }

        const racesToSave = races.map(race => ({
          ...race,
          date: race.date.toISOString(),
          endDate: race.endDate?.toISOString(),
        }))

        localStorage.setItem(STORAGE_KEYS.RACES, JSON.stringify(racesToSave))
        resolve()
      } catch (error) {
        console.error('Failed to save races:', error)
        reject(error)
      }
    })
  }

  static async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!settingsJson) {
        return {
          theme: 'dark',
          autoRefreshInterval: 60000,
          defaultView: 'dashboard',
          notifications: {
            enabled: false,
            sound: false,
            desktop: false
          },
          autoBackup: false,
          backupFrequency: 'daily',
          calendarSync: false
        }
      }

      const settings = JSON.parse(settingsJson)
      return settings
    } catch (error) {
      console.error('Failed to load settings:', error)
      return {
        theme: 'dark',
        autoRefreshInterval: 60000,
        defaultView: 'dashboard',
        notifications: {
          enabled: false,
          sound: false,
          desktop: false
        },
        autoBackup: false,
        backupFrequency: 'daily',
        calendarSync: false
      }
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
        resolve()
      } catch (error) {
        console.error('Failed to save settings:', error)
        reject(error)
      }
    })
  }

  static async clearStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear()
        resolve()
      } catch (error) {
        console.error('Failed to clear storage:', error)
        reject(error)
      }
    })
  }
} 