import { RaceEntry } from '../types/race'

export class BackupService {
  static async exportData(): Promise<string> {
    try {
      const races = localStorage.getItem('races')
      const settings = localStorage.getItem('settings')
      
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          races: races ? JSON.parse(races) : [],
          settings: settings ? JSON.parse(settings) : {},
        },
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      })

      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('Failed to export data')
    }
  }

  static async importData(file: File): Promise<{
    races: RaceEntry[]
    settings: any
  }> {
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)

      // Validate backup data
      if (!backupData.version || !backupData.timestamp || !backupData.data) {
        throw new Error('Invalid backup file format')
      }

      // Convert date strings back to Date objects
      const races = backupData.data.races.map((race: any) => ({
        ...race,
        date: new Date(race.date),
        endDate: race.endDate ? new Date(race.endDate) : undefined,
      }))

      return {
        races,
        settings: backupData.data.settings,
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Failed to import data')
    }
  }

  static async validateBackup(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic structure validation
      if (!data.version || !data.timestamp || !data.data) {
        return false
      }

      // Validate races array
      if (!Array.isArray(data.data.races)) {
        return false
      }

      // Validate required race properties
      const hasValidRaces = data.data.races.every((race: any) => {
        return (
          race.id &&
          race.series &&
          race.track &&
          race.date &&
          race.status
        )
      })

      return hasValidRaces
    } catch {
      return false
    }
  }

  static downloadBackup(url: string, filename: string = 'iracingstat-backup.json') {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
} 