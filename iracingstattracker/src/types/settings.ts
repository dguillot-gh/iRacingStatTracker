export type ThemeMode = 'light' | 'dark'
export type BackupFrequency = 'daily' | 'weekly' | 'monthly'

export interface AppSettings {
  theme: ThemeMode
  notifications: boolean
  autoBackup: boolean
  backupFrequency: BackupFrequency
} 