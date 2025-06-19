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
      return races.map((race: any) => ({
        ...race,
        date: new Date(race.date),
        endDate: race.endDate ? new Date(race.endDate) : undefined,
      }))
    } catch (error) {
      console.error('Failed to load races:', error)
      return []
    }
  }

  static async saveRaces(races: RaceEntry[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.RACES, JSON.stringify(races))
    } catch (error) {
      console.error('Failed to save races:', error)
      throw error
    }
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

      return JSON.parse(settingsJson)
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
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  static async clearStorage(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
      throw error
    }
  }
} 