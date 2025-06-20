import { useState, useEffect, memo } from 'react'
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
  FormHelperText,
  CircularProgress,
  Box,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { RaceEntry } from '../types/race'
import { Series } from '../types/series'
import { addDays, format } from 'date-fns'
import { useSeries } from '../hooks/useSeries'
import { generateUUID } from '../utils/uuid'

interface RaceFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (race: RaceEntry) => Promise<void>
  initialData?: RaceEntry
}

const defaultFormData: RaceEntry = {
  id: generateUUID(),
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
}

const DialogTitleContent = memo(({ race }: { race?: RaceEntry }) => (
  <Box>
    <Typography variant="h6" component="div">
      {race ? 'Edit Race' : 'Add Race'}
    </Typography>
    {race && (
      <Typography variant="body2" color="textSecondary">
        {format(new Date(race.date), 'MMM d, yyyy')} - {race.series} - {race.track.name}
      </Typography>
    )}
  </Box>
))

DialogTitleContent.displayName = 'DialogTitleContent'

export default function RaceFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: RaceFormDialogProps) {
  const { series } = useSeries()
  const [formData, setFormData] = useState<RaceEntry>(defaultFormData)
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [isWeeklyRecurrence, setIsWeeklyRecurrence] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData)
        setIsMultiDay(!!initialData.endDate)
        setIsWeeklyRecurrence(false)
        const foundSeries = series.find(s => s.name === initialData.series)
        setSelectedSeries(foundSeries || null)
      } else {
        setFormData({ ...defaultFormData, id: generateUUID() })
        setSelectedSeries(null)
        setIsMultiDay(false)
        setIsWeeklyRecurrence(false)
      }
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open, initialData, series])

  useEffect(() => {
    if (selectedSeries) {
      setFormData(prev => ({
        ...prev,
        series: selectedSeries.name,
        class: selectedSeries.category === 'dirt_oval' ? 'dirt_oval' : 
               selectedSeries.category === 'dirt_road' ? 'dirt_road' : 
               selectedSeries.category === 'road' ? 'road' : 'oval',
        track: {
          ...prev.track,
          type: selectedSeries.defaultTrackType,
        },
      }))
    }
  }, [selectedSeries])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.series) {
      newErrors.series = 'Series is required'
    }
    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required'
    }
    if (!formData.track.name) {
      newErrors.track = 'Track name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (isWeeklyRecurrence) {
        // Create 7 races, one for each day of the week
        const races: RaceEntry[] = []
        const groupId = generateUUID()
        for (let i = 0; i < 7; i++) {
          races.push({
            ...formData,
            id: generateUUID(),
            date: addDays(formData.date, i),
            recurrence: 'daily',
            recurrenceGroupId: groupId,
          })
        }
        // Submit each race
        await Promise.all(races.map(race => onSubmit(race)))
      } else {
        // Submit single race
        await onSubmit({
          ...formData,
          endDate: isMultiDay ? formData.endDate : undefined,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to submit race:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save race. Please try again.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <DialogTitleContent race={initialData} />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.series}>
              <InputLabel>Series</InputLabel>
              <Select
                value={selectedSeries?.id || ''}
                label="Series"
                onChange={(e) => {
                  const selected = series.find(s => s.id === e.target.value)
                  setSelectedSeries(selected || null)
                }}
                disabled={isSubmitting}
              >
                {series.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
              {errors.series && (
                <FormHelperText>{errors.series}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.vehicle}>
              <InputLabel>Vehicle</InputLabel>
              <Select
                value={formData.vehicle}
                label="Vehicle"
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                disabled={!selectedSeries || isSubmitting}
              >
                {selectedSeries?.cars.map((car) => (
                  <MenuItem key={car} value={car}>{car}</MenuItem>
                ))}
              </Select>
              {errors.vehicle && (
                <FormHelperText>{errors.vehicle}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Week"
              value={formData.week}
              onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: selectedSeries?.seasonLength || 13 }}
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
              error={!!errors.track}
              helperText={errors.track}
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

          {errors.submit && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">
                {errors.submit}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 