import { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { PickersDay } from '@mui/x-date-pickers/PickersDay'
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { RaceEntry, RaceSeries, RaceClass } from '../types/race'
import { isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'

interface RaceCalendarProps {
  races: RaceEntry[]
  onRaceClick?: (race: RaceEntry) => void
}

type ViewMode = 'month' | 'week'

// Helper function to get track display text
const getTrackDisplayText = (track: string, raceClass: RaceClass) => {
  // If track contains a hyphen, assume it's in format "name - type"
  if (track.includes('-')) {
    return track
  }
  // Otherwise, append the race class type
  return `${track} - ${raceClass}`
}

export default function RaceCalendar({ races, onRaceClick }: RaceCalendarProps) {
  const [selectedSeries, setSelectedSeries] = useState<RaceSeries | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const filteredRaces = useMemo(() => {
    return races.filter(
      (race) =>
        (selectedSeries === 'all' || race.series === selectedSeries) &&
        race.status === 'upcoming' // Only show upcoming races
    )
  }, [races, selectedSeries])

  const weekDays = useMemo(() => {
    if (!selectedDate) return []
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Start week on Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [selectedDate])

  const selectedDateRaces = useMemo(() => {
    if (!selectedDate) return []
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
      return filteredRaces.filter((race) => {
        const raceDate = new Date(race.date)
        return raceDate >= start && raceDate <= end
      })
    }
    return filteredRaces.filter((race) =>
      isSameDay(new Date(race.date), selectedDate)
    )
  }, [filteredRaces, selectedDate, viewMode])

  const handleSeriesChange = ({ target: { value } }: SelectChangeEvent<RaceSeries | 'all'>) => {
    setSelectedSeries(value as RaceSeries | 'all')
  }

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  const getDateHighlight = (date: Date) => {
    const hasRace = filteredRaces.some((race) =>
      isSameDay(new Date(race.date), date)
    )
    return hasRace ? { bgcolor: 'primary.main', color: 'primary.contrastText' } : {}
  }

  const renderWeekView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {weekDays.map((day) => {
        const dayRaces = selectedDateRaces.filter((race) =>
          isSameDay(new Date(race.date), day)
        )
        return (
          <Paper
            key={day.toISOString()}
            sx={{
              p: 2,
              bgcolor: isSameDay(day, new Date()) ? 'action.hover' : 'background.paper',
              minHeight: '100px',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {format(day, 'EEEE, MMM d')}
            </Typography>
            {dayRaces.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {dayRaces.map((race) => (
                  <Paper
                    key={race.id}
                    sx={{
                      p: 1,
                      cursor: onRaceClick ? 'pointer' : 'default',
                      '&:hover': onRaceClick ? {
                        bgcolor: 'action.hover'
                      } : {},
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    onClick={() => onRaceClick?.(race)}
                  >
                    <Typography variant="subtitle2">
                      {race.series}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {race.track} - {race.vehicle}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip
                        label={`Week ${race.week}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={race.class}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No races scheduled
              </Typography>
            )}
          </Paper>
        )
      })}
    </Box>
  )

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Series</InputLabel>
          <Select
            value={selectedSeries}
            label="Series"
            onChange={handleSeriesChange}
          >
            <MenuItem value="all">All Series</MenuItem>
            <MenuItem value="Draftmasters">Draftmasters</MenuItem>
            <MenuItem value="Nascar Trucks">Nascar Trucks</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="month" aria-label="month view">
            Month
          </ToggleButton>
          <ToggleButton value="week" aria-label="week view">
            Week
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        <Paper sx={{ p: 2, minWidth: viewMode === 'month' ? '100%' : '300px' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              loading={false}
              renderLoading={() => <DayCalendarSkeleton />}
              slots={{
                day: (props) => {
                  const highlight = getDateHighlight(props.day)
                  return (
                    <PickersDay
                      {...props}
                      sx={{
                        ...props.sx,
                        ...highlight,
                        fontSize: '1rem',
                        width: 40,
                        height: 40,
                      }}
                    />
                  )
                },
              }}
              sx={{
                width: '100%',
                '& .MuiDayCalendar-weekContainer': {
                  justifyContent: 'space-around',
                },
              }}
            />
          </LocalizationProvider>
        </Paper>

        {viewMode === 'week' && (
          <Paper
            sx={{
              p: 2,
              flexGrow: 1,
              maxHeight: '100%',
              overflow: 'auto',
            }}
          >
            {renderWeekView()}
          </Paper>
        )}

        {viewMode === 'month' && selectedDateRaces.length > 0 && (
          <Paper
            sx={{
              p: 2,
              maxHeight: '100%',
              overflow: 'auto',
              width: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Races on {selectedDate?.toLocaleDateString()}
            </Typography>
            {selectedDateRaces.map((race) => (
              <Box
                key={race.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: onRaceClick ? 'pointer' : 'default',
                  '&:hover': onRaceClick ? {
                    bgcolor: 'action.hover'
                  } : {}
                }}
                onClick={() => onRaceClick?.(race)}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {race.series} - {race.track}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label={`Week ${race.week}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Season ${race.season}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={race.vehicle}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Track Type: {race.class}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {race.status}
                  {race.result && ` - Finished P${race.result.finishPosition}`}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </Box>
  )
} 