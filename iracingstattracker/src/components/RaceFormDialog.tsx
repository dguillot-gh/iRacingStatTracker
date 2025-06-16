import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  Divider,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { RaceEntry } from '../types/race'
import { addDays } from 'date-fns'

interface RaceFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (race: RaceEntry) => void
  initialData?: RaceEntry
}

export default function RaceFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: RaceFormDialogProps) {
  const [formData, setFormData] = useState<RaceEntry>({
    id: crypto.randomUUID(),
    series: '',
    vehicle: '',
    week: 1,
    season: new Date().getFullYear().toString(),
    date: new Date(),
    track: {
      name: '',
      type: 'oval',
    },
    status: 'upcoming',
    class: 'oval',
  })
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [isWeeklyRecurrence, setIsWeeklyRecurrence] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setIsMultiDay(!!initialData.endDate)
      setIsWeeklyRecurrence(false) // Reset recurrence when editing
    }
  }, [initialData])

  const handleSubmit = () => {
    if (!formData.series || !formData.track.name) return

    if (isWeeklyRecurrence) {
      // Create 7 races, one for each day of the week
      const races: RaceEntry[] = []
      for (let i = 0; i < 7; i++) {
        races.push({
          ...formData,
          id: crypto.randomUUID(),
          date: addDays(formData.date, i),
          recurrence: 'daily',
          recurrenceGroupId: crypto.randomUUID(), // Same group ID for all races in the week
        })
      }
      // Submit each race
      races.forEach(race => onSubmit(race))
    } else {
      // Submit single race
      onSubmit(formData)
    }
    
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Race' : 'Add Race'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Series</InputLabel>
              <Select
                value={formData.series}
                label="Series"
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
              >
                <MenuItem value="Draftmasters">Draftmasters</MenuItem>
                <MenuItem value="Nascar Trucks">Nascar Trucks</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vehicle"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Week"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 13 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Season"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Track Name"
              value={formData.track.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  track: { ...formData.track, name: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Track Type</InputLabel>
              <Select
                value={formData.track.type}
                label="Track Type"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    track: { ...formData.track, type: e.target.value as 'oval' | 'road' | 'dirt' },
                  })
                }
              >
                <MenuItem value="oval">Oval</MenuItem>
                <MenuItem value="road">Road</MenuItem>
                <MenuItem value="dirt">Dirt</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom>Date Options</Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMultiDay}
                    onChange={(e) => {
                      setIsMultiDay(e.target.checked)
                      if (!e.target.checked) {
                        setFormData({ ...formData, endDate: undefined })
                      }
                      setIsWeeklyRecurrence(false) // Reset weekly recurrence when switching to multi-day
                    }}
                  />
                }
                label="Multi-day Event"
              />

              {!isMultiDay && !initialData && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={isWeeklyRecurrence}
                      onChange={(e) => setIsWeeklyRecurrence(e.target.checked)}
                    />
                  }
                  label="Create Daily Races for One Week"
                />
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={isMultiDay ? 6 : 12}>
            <DatePicker
              label="Start Date"
              value={formData.date}
              onChange={(newDate) =>
                setFormData({ ...formData, date: newDate || new Date() })
              }
              sx={{ width: '100%' }}
            />
          </Grid>

          {isMultiDay && (
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={formData.endDate || null}
                onChange={(newDate) =>
                  setFormData({ ...formData, endDate: newDate || undefined })
                }
                sx={{ width: '100%' }}
                minDate={formData.date}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'upcoming' | 'completed' | 'cancelled',
                  })
                }
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? 'Update' : 'Add'} Race
        </Button>
      </DialogActions>
    </Dialog>
  )
} 