import { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Typography,
  Divider,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material'
import { BackupService } from '../services/backup'
import { RaceEntry } from '../types/race'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  onThemeChange: (isDark: boolean) => void
  isDarkMode: boolean
  onDataImport: (races: RaceEntry[]) => void
}

export default function SettingsDialog({
  open,
  onClose,
  onThemeChange,
  isDarkMode,
  onDataImport,
}: SettingsDialogProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError(null)
      const url = await BackupService.exportData()
      BackupService.downloadBackup(url)
      setSuccess('Data exported successfully')
    } catch (error) {
      setError('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsImporting(true)
      setError(null)

      // Validate backup file
      const isValid = await BackupService.validateBackup(file)
      if (!isValid) {
        throw new Error('Invalid backup file')
      }

      // Import data
      const { races } = await BackupService.importData(file)
      onDataImport(races)
      setSuccess('Data imported successfully')
    } catch (error) {
      setError('Failed to import data')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <List>
          {/* Theme Settings */}
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary="Toggle between light and dark theme"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={isDarkMode}
                onChange={(e) => onThemeChange(e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          {/* Data Management */}
          <ListItem>
            <ListItemText
              primary="Data Management"
              secondary="Backup and restore your data"
            />
          </ListItem>
          <Box sx={{ pl: 2, pr: 2, mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleExport}
                disabled={isExporting}
                startIcon={isExporting ? <CircularProgress size={20} /> : null}
              >
                Export Data
              </Button>
              <Button
                variant="outlined"
                onClick={handleImportClick}
                disabled={isImporting}
                startIcon={isImporting ? <CircularProgress size={20} /> : null}
              >
                Import Data
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                style={{ display: 'none' }}
              />
            </Stack>
          </Box>

          {/* Notifications */}
          <ListItem>
            <ListItemText
              primary="Race Reminders"
              secondary="Get notified before your races"
            />
            <ListItemSecondaryAction>
              <Switch edge="end" />
            </ListItemSecondaryAction>
          </ListItem>

          {/* Calendar Integration */}
          <ListItem>
            <ListItemText
              primary="Calendar Integration"
              secondary="Sync with your calendar"
            />
            <ListItemSecondaryAction>
              <Switch edge="end" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>

        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
} 