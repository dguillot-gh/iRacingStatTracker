import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  Alert,
} from '@mui/material'
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { AppSettings } from '../types/settings'
import { RaceEntry } from '../types/race'

interface SettingsProps {
  settings: AppSettings
  onSettingsUpdate: (settings: AppSettings) => void
  races: RaceEntry[]
}

export default function Settings({ settings, onSettingsUpdate, races }: SettingsProps) {
  const [backupSuccess, setBackupSuccess] = useState<boolean | null>(null)
  const [restoreSuccess, setRestoreSuccess] = useState<boolean | null>(null)

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    onSettingsUpdate({
      ...settings,
      [key]: value,
    })
  }

  const handleBackup = () => {
    try {
      const data = {
        settings,
        races,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `iracingstat-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setBackupSuccess(true)
      setTimeout(() => setBackupSuccess(null), 3000)
    } catch (error) {
      console.error('Backup failed:', error)
      setBackupSuccess(false)
      setTimeout(() => setBackupSuccess(null), 3000)
    }
  }

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.settings && data.races) {
          onSettingsUpdate(data.settings)
          // You'll need to implement race restoration through a proper handler
          setRestoreSuccess(true)
        } else {
          throw new Error('Invalid backup file format')
        }
      } catch (error) {
        console.error('Restore failed:', error)
        setRestoreSuccess(false)
      }
      setTimeout(() => setRestoreSuccess(null), 3000)
    }
    reader.readAsText(file)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Stack spacing={3}>
        {/* Theme Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Appearance</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.theme === 'dark'}
                  onChange={(e) => handleSettingChange('theme', e.target.checked ? 'dark' : 'light')}
                />
              }
              label="Dark Mode"
            />
          </FormGroup>
        </Paper>

        {/* Notification Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Notifications</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
          </FormGroup>
        </Paper>

        {/* Backup Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Backup & Restore</Typography>
          <Stack spacing={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  />
                }
                label="Enable Auto Backup"
              />
            </FormGroup>

            {settings.autoBackup && (
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  label="Backup Frequency"
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            )}

            <Divider />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={handleBackup}
              >
                Backup Now
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<RestoreIcon />}
              >
                Restore Backup
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleRestore}
                />
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Clear All Data
              </Button>
            </Stack>

            {backupSuccess !== null && (
              <Alert severity={backupSuccess ? 'success' : 'error'}>
                {backupSuccess ? 'Backup completed successfully!' : 'Backup failed. Please try again.'}
              </Alert>
            )}

            {restoreSuccess !== null && (
              <Alert severity={restoreSuccess ? 'success' : 'error'}>
                {restoreSuccess ? 'Restore completed successfully!' : 'Restore failed. Please try again.'}
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Export Data */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Export Data</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const csvContent = races
                  .map(race => [
                    race.date,
                    race.series,
                    race.track.name,
                    race.vehicle,
                    race.status,
                    race.result?.position || '',
                    race.result?.iRating?.change || '',
                    race.result?.safetyRating?.change || '',
                  ].join(','))
                  .join('\n')

                const blob = new Blob([`Date,Series,Track,Vehicle,Status,Position,iRating Change,Safety Rating Change\n${csvContent}`], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `iracingstat-export-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              Export to CSV
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
} 