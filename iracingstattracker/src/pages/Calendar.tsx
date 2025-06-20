import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Button,
  Alert,
} from '@mui/material'
import {
  Today as TodayIcon,
  Event as EventIcon,
  EventBusy as CancelledIcon,
  CheckCircle as CompletedIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { enUS } from 'date-fns/locale'
import { RaceEntry } from '../types/race'
import RaceFormDialog from '../components/RaceFormDialog'
import '../styles/calendar.css'
import { generateUUID } from '../utils/uuid'
import { useRaces } from '../hooks/useRaces'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function Calendar() {
  const { races, addRace, updateRace, deleteRace } = useRaces()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isRaceFormOpen, setIsRaceFormOpen] = useState(false)
  const [raceToEdit, setRaceToEdit] = useState<RaceEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateRace = () => {
    setRaceToEdit(null)
    setSelectedDate(new Date())
    setError(null)
    setIsRaceFormOpen(true)
  }

  const handleDateSelect = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    setRaceToEdit(null)
    setError(null)
    setIsRaceFormOpen(true)
  }

  const handleEventSelect = (event: RaceEntry) => {
    setRaceToEdit(event)
    setError(null)
    setIsRaceFormOpen(true)
  }

  const handleFormClose = () => {
    setIsRaceFormOpen(false)
    setSelectedDate(null)
    setRaceToEdit(null)
  }

  const handleRaceFormSubmit = async (race: RaceEntry) => {
    try {
      if (raceToEdit) {
        await updateRace({
          ...race,
          id: raceToEdit.id,
        })
      } else {
        await addRace({
          ...race,
          status: 'upcoming', // Ensure new races are marked as upcoming
        })
      }
      handleFormClose()
    } catch (err) {
      console.error('Failed to save race:', err)
      throw err // Let RaceFormDialog handle the error
    }
  }

  const handleDeleteRace = async (raceId: string) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await deleteRace(raceId)
    } catch (err) {
      setError('Failed to delete race. Please try again.')
      console.error('Failed to delete race:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const eventStyleGetter = (event: RaceEntry) => {
    let backgroundColor = '#2196f3' // default blue
    let borderColor = '#1976d2'

    switch (event.status) {
      case 'completed':
        backgroundColor = '#4caf50' // green
        borderColor = '#388e3c'
        break
      case 'cancelled':
        backgroundColor = '#f44336' // red
        borderColor = '#d32f2f'
        break
      case 'upcoming':
        if (event.class === 'oval') {
          backgroundColor = '#9c27b0' // purple for oval
          borderColor = '#7b1fa2'
        } else {
          backgroundColor = '#ff9800' // orange for road
          borderColor = '#f57c00'
        }
        break
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: '#fff',
        borderRadius: '4px',
        border: 'none',
        padding: '2px 5px',
      },
    }
  }

  const calendarEvents = races.map(race => ({
    ...race,
    title: `${race.series} - ${race.track.name}`,
    start: new Date(race.date),
    end: race.endDate ? new Date(race.endDate) : new Date(race.date),
  }))

  // Calculate statistics for the current month
  const currentMonth = new Date()
  const monthInterval = {
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }

  const monthStats = races.reduce(
    (stats, race) => {
      const raceDate = new Date(race.date)
      if (isWithinInterval(raceDate, monthInterval)) {
        stats.total++
        if (race.status === 'completed') stats.completed++
        if (race.status === 'cancelled') stats.cancelled++
        if (race.status === 'upcoming') stats.upcoming++
      }
      return stats
    },
    { total: 0, completed: 0, cancelled: 0, upcoming: 0 }
  )

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Race Calendar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRace}
          disabled={isSubmitting}
        >
          Create Race
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Monthly Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TodayIcon color="primary" />
                <Box>
                  <Typography variant="h6">{monthStats.total}</Typography>
                  <Typography color="textSecondary">Total Races</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CompletedIcon color="success" />
                <Box>
                  <Typography variant="h6">{monthStats.completed}</Typography>
                  <Typography color="textSecondary">Completed</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <EventIcon color="warning" />
                <Box>
                  <Typography variant="h6">{monthStats.upcoming}</Typography>
                  <Typography color="textSecondary">Upcoming</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CancelledIcon color="error" />
                <Box>
                  <Typography variant="h6">{monthStats.cancelled}</Typography>
                  <Typography color="textSecondary">Cancelled</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar */}
      <Paper sx={{ p: 2, height: 'calc(100vh - 300px)' }}>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleDateSelect}
          onSelectEvent={handleEventSelect}
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          tooltipAccessor={(event: any) => `${event.series} - ${event.track.name}`}
        />
      </Paper>

      {/* Race Form Dialog */}
      <RaceFormDialog
        open={isRaceFormOpen}
        onClose={handleFormClose}
        onSubmit={handleRaceFormSubmit}
        initialData={raceToEdit || (selectedDate ? {
          id: generateUUID(),
          series: '',
          vehicle: '',
          week: 1,
          season: new Date().getFullYear().toString(),
          date: selectedDate,
          track: {
            name: '',
            type: 'oval',
          },
          status: 'upcoming',
          class: 'oval',
        } : undefined)}
      />
    </Box>
  )
} 