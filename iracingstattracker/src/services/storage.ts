import { Race } from '../types/race'
import { Series } from '../types/series'

const STORAGE_KEYS = {
  RACES: 'races',
  SETTINGS: 'settings',
  THEME: 'theme',
  SERIES: 'series',
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

class StorageService {
  async getRaces(): Promise<Race[]> {
    try {
      const racesJson = localStorage.getItem(STORAGE_KEYS.RACES)
      if (!racesJson) return []

      const races = JSON.parse(racesJson)

      // Validate the parsed races
      if (!Array.isArray(races)) {
        console.error('Invalid races data format')
        return []
      }

      return races
    } catch (error) {
      console.error('Failed to load races:', error)
      return []
    }
  }

  async addRace(race: Race): Promise<void> {
    const races = await this.getRaces()
    races.push(race)
    await this.saveRaces(races)
  }

  async updateRace(race: Race): Promise<void> {
    const races = await this.getRaces()
    const index = races.findIndex(r => r.id === race.id)
    if (index === -1) throw new Error('Race not found')
    races[index] = race
    await this.saveRaces(races)
  }

  async deleteRace(raceId: string): Promise<void> {
    const races = await this.getRaces()
    const filteredRaces = races.filter(r => r.id !== raceId)
    await this.saveRaces(filteredRaces)
  }

  private async saveRaces(races: Race[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(races)) {
          throw new Error('Invalid races data format')
        }

        const racesToSave = races.map(race => ({
          ...race,
          date: race.date instanceof Date ? race.date.toISOString() : race.date,
          endDate: race.endDate instanceof Date ? race.endDate.toISOString() : race.endDate,
        }))

        localStorage.setItem(STORAGE_KEYS.RACES, JSON.stringify(racesToSave))
        resolve()
      } catch (error) {
        console.error('Failed to save races:', error)
        reject(error)
      }
    })
  }

  async getSettings(): Promise<AppSettings> {
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

  async saveSettings(settings: AppSettings): Promise<void> {
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

  async clearStorage(): Promise<void> {
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

  async getSeries(): Promise<Series[]> {
    try {
      const seriesJson = localStorage.getItem(STORAGE_KEYS.SERIES)
      if (!seriesJson) return []

      const series = JSON.parse(seriesJson)

      // Validate the parsed series
      if (!Array.isArray(series)) {
        console.error('Invalid series data format')
        return []
      }

      return series
    } catch (error) {
      console.error('Failed to load series:', error)
      return []
    }
  }

  async addSeries(series: Series): Promise<void> {
    const allSeries = await this.getSeries()
    allSeries.push(series)
    await this.saveSeries(allSeries)
  }

  async updateSeries(series: Series): Promise<void> {
    const allSeries = await this.getSeries()
    const index = allSeries.findIndex(s => s.id === series.id)
    if (index === -1) throw new Error('Series not found')
    allSeries[index] = series
    await this.saveSeries(allSeries)
  }

  async deleteSeries(seriesId: string): Promise<void> {
    const allSeries = await this.getSeries()
    const filteredSeries = allSeries.filter(s => s.id !== seriesId)
    await this.saveSeries(filteredSeries)
  }

  private async saveSeries(series: Series[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!Array.isArray(series)) {
          throw new Error('Invalid series data format')
        }
        localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(series))
        resolve()
      } catch (error) {
        console.error('Failed to save series:', error)
        reject(error)
      }
    })
  }
}

// Export a singleton instance
export const storage = new StorageService(); 