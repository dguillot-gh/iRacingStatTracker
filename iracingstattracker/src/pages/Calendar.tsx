import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Grid,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { RaceEntry, RaceSeries, RecurrencePattern } from '../types/race'
import RaceCalendar from '../components/RaceCalendar'
import { v4 as uuidv4 } from 'uuid'
import { addDays, eachDayOfInterval, addWeeks } from 'date-fns'
import DataManagement from '../components/DataManagement'

interface CalendarProps {
  races: RaceEntry[]
  onAddRace: (race: RaceEntry) => void
  onUpdateRace: (id: string, updates: Partial<RaceEntry>) => void
}

const initialFormState = {
  series: 'Draftmasters' as RaceSeries,
  vehicle: '',
  week: 1,
  season: new Date().getFullYear().toString(),
  date: new Date(),
  track: {
    name: '',
    type: 'oval' as const
  },
  status: 'upcoming' as const
}

export default function Calendar({ races, onAddRace, onUpdateRace }: CalendarProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<RaceEntry>>(initialFormState)
  const [editingRaceId, setEditingRaceId] = useState<string | null>(null)
  const [isMultiDay, setIsMultiDay] = useState(false)

  // Filter out completed races for the calendar view
  const upcomingRaces = useMemo(() => 
    races.filter(race => race.status === 'upcoming'),
    [races]
  )

  const handleFormOpen = (race?: RaceEntry) => {
    if (race) {
      setFormData(race)
      setIsMultiDay(!!race.endDate)
      setEditingRaceId(race.id)
    } else {
      setFormData(initialFormState)
      setIsMultiDay(false)
      setEditingRaceId(null)
    }
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setFormData(initialFormState)
    setEditingRaceId(null)
    setIsMultiDay(false)
  }

  const handleFormSubmit = () => {
    if (!formData.series || !formData.track?.name || !formData.date) return

    const baseRace: RaceEntry = {
      id: editingRaceId || uuidv4(),
      series: formData.series as RaceSeries,
      vehicle: formData.vehicle || '',
      week: formData.week || 1,
      season: formData.season || new Date().getFullYear().toString(),
      date: formData.date,
      track: {
        name: formData.track.name,
        type: formData.track.type || 'oval'
      },
      status: formData.status || 'upcoming'
    }

    if (isMultiDay && formData.endDate) {
      baseRace.endDate = formData.endDate
    }

    if (!isMultiDay && formData.recurrence) {
      const races: RaceEntry[] = []
      let currentDate = formData.date
      const recurrenceGroupId = uuidv4() // Generate a shared ID for the recurring races

      if (formData.recurrence === 'daily') {
        // Create races for each day of the week
        for (let i = 0; i < 7; i++) {
          races.push({
            ...baseRace,
            id: uuidv4(),
            date: addDays(currentDate, i),
            recurrence: formData.recurrence,
            recurrenceGroupId
          })
        }
      } else if (formData.recurrence === 'weekly') {
        // Create races for 12 weeks
        for (let i = 0; i < 12; i++) {
          races.push({
            ...baseRace,
            id: uuidv4(),
            date: addWeeks(currentDate, i),
            week: (formData.week || 1) + i,
            recurrence: formData.recurrence,
            recurrenceGroupId
          })
        }
      }

      if (races.length > 0) {
        races.forEach(race => onAddRace(race))
        handleFormClose()
        return
      }
    }

    if (editingRaceId) {
      onUpdateRace(editingRaceId, baseRace)
    } else {
      onAddRace(baseRace)
    }

    handleFormClose()
  }

  const handleImport = (importedRaces: RaceEntry[]) => {
    importedRaces.forEach(race => onAddRace(race))
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Race Calendar</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => handleFormOpen()}>
            Add Race
          </Button>
          <DataManagement races={upcomingRaces} onImport={handleImport} />
        </Stack>
      </Stack>

      <RaceCalendar
        races={upcomingRaces}
        onRaceClick={handleFormOpen}
      />

      <Dialog open={isFormOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRaceId ? 'Edit Race' : 'Add Race'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item sm={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Series</InputLabel>
                <Select
                  value={formData.series || ''}
                  label="Series"
                  onChange={(e) => setFormData({ ...formData, series: e.target.value as RaceSeries })}
                >
                  <MenuItem value="Draftmasters">Draftmasters</MenuItem>
                  <MenuItem value="Nascar Trucks">Nascar Trucks</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle"
                value={formData.vehicle || ''}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              />
            </Grid>

            <Grid item sm={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Week"
                value={formData.week || ''}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 13 }}
              />
            </Grid>

            <Grid item sm={12} md={6}>
              <TextField
                fullWidth
                label="Season"
                value={formData.season || ''}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              />
            </Grid>

            <Grid item sm={12} md={6}>
              <TextField
                fullWidth
                label="Track Name"
                value={formData.track?.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  track: { ...formData.track!, name: e.target.value }
                })}
              />
            </Grid>

            <Grid item sm={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Track Type</InputLabel>
                <Select
                  value={formData.track?.type || 'oval'}
                  label="Track Type"
                  onChange={(e) => setFormData({
                    ...formData,
                    track: { ...formData.track!, type: e.target.value as 'oval' | 'road' | 'dirt' }
                  })}
                >
                  <MenuItem value="oval">Oval</MenuItem>
                  <MenuItem value="road">Road</MenuItem>
                  <MenuItem value="dirt">Dirt</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sm={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMultiDay}
                    onChange={(e) => {
                      setIsMultiDay(e.target.checked)
                      if (!e.target.checked) {
                        setFormData({ ...formData, endDate: undefined, recurrence: undefined })
                      }
                    }}
                  />
                }
                label="Multi-day Event"
              />
            </Grid>

            <Grid item sm={12} md={isMultiDay ? 6 : 12}>
              <DatePicker
                label="Start Date"
                value={formData.date || null}
                onChange={(newDate) => setFormData({ ...formData, date: newDate || new Date() })}
                sx={{ width: '100%' }}
              />
            </Grid>

            {isMultiDay && (
              <Grid item sm={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate || null}
                  onChange={(newDate) => setFormData({ ...formData, endDate: newDate || undefined })}
                  sx={{ width: '100%' }}
                  minDate={formData.date}
                />
              </Grid>
            )}

            {!isMultiDay && (
              <Grid item sm={12}>
                <FormControl fullWidth>
                  <InputLabel>Recurrence</InputLabel>
                  <Select
                    value={formData.recurrence || 'none'}
                    label="Recurrence"
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as RecurrencePattern })}
                  >
                    <MenuItem value="none">No Recurrence</MenuItem>
                    <MenuItem value="daily">Daily for a Week</MenuItem>
                    <MenuItem value="weekly">Weekly for 12 Weeks</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained" color="primary">
            {editingRaceId ? 'Update' : 'Add'} Race
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 