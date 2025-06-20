export type ThemeMode = 'light' | 'dark'
export type BackupFrequency = 'daily' | 'weekly' | 'monthly'
export type DefaultView = 'dashboard' | 'raceHistory' | 'series'

export interface IRacingCredentials {
  username: string
  password: string
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
}

export interface AppSettings {
  theme: ThemeMode
  iRacingCredentials?: IRacingCredentials
  autoRefreshInterval: number
  defaultView: DefaultView
  notifications: NotificationSettings
  autoBackup: boolean
  backupFrequency: BackupFrequency
  calendarSync: boolean
} 