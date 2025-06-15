import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { RaceEntry, RaceSeries } from '../types/race'
import { format, isWithinInterval, startOfYear, endOfYear } from 'date-fns'

interface ChampionshipManagerProps {
  races: RaceEntry[]
}

interface SeriesChampionship {
  series: RaceSeries
  totalPoints: number
  position: number
  wins: number
  podiums: number
  completedRaces: number
  requiredRaces: number
  droppedWeeks: number[]
  averageFinish: number
  bestFinish: number
  strengthOfField: number
  iRatingGain: number
}

export default function ChampionshipManager({ races }: ChampionshipManagerProps) {
  const [selectedSeries, setSelectedSeries] = useState<RaceSeries | 'all'>('all')
  const [showDroppedWeeks, setShowDroppedWeeks] = useState(false)

  const currentYear = new Date().getFullYear()
  const seasonInterval = {
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  }

  // Championship Statistics
  const championshipStats = useMemo(() => {
    const stats = new Map<RaceSeries, SeriesChampionship>()
    
    const seasonRaces = races.filter(race =>
      isWithinInterval(new Date(race.date), seasonInterval)
    )

    seasonRaces.forEach(race => {
      const current = stats.get(race.series) || {
        series: race.series,
        totalPoints: 0,
        position: 0,
        wins: 0,
        podiums: 0,
        completedRaces: 0,
        requiredRaces: race.championshipStanding?.requiredRaces || 0,
        droppedWeeks: [],
        averageFinish: 0,
        bestFinish: Infinity,
        strengthOfField: 0,
        iRatingGain: 0,
      }

      if (race.status === 'completed' && race.result) {
        current.completedRaces++
        current.totalPoints += race.result.championshipPoints
        if (race.result.finishPosition === 1) current.wins++
        if (race.result.finishPosition <= 3) current.podiums++
        current.averageFinish = (
          (current.averageFinish * (current.completedRaces - 1) + race.result.finishPosition) /
          current.completedRaces
        )
        current.bestFinish = Math.min(current.bestFinish, race.result.finishPosition)
        
        if (race.result.strengthOfField) {
          current.strengthOfField = (
            (current.strengthOfField * (current.completedRaces - 1) + race.result.strengthOfField) /
            current.completedRaces
          )
        }
        
        if (race.result.iRating) {
          current.iRatingGain += race.result.iRating.change
        }

        if (race.championshipStanding?.droppedWeeks) {
          current.droppedWeeks = race.championshipStanding.droppedWeeks
        }
      }

      stats.set(race.series, current)
    })

    // Calculate positions based on points
    const sortedStats = Array.from(stats.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
    
    sortedStats.forEach((stat, index) => {
      stat.position = index + 1
    })

    return sortedStats
  }, [races, seasonInterval])

  // Weekly Results
  const weeklyResults = useMemo(() => {
    return races
      .filter(race =>
        (selectedSeries === 'all' || race.series === selectedSeries) &&
        race.status === 'completed' &&
        isWithinInterval(new Date(race.date), seasonInterval)
      )
      .sort((a, b) => a.week - b.week)
  }, [races, selectedSeries, seasonInterval])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Championship Manager</Typography>

      {/* Series Filter */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Series</InputLabel>
        <Select
          value={selectedSeries}
          label="Series"
          onChange={(e) => setSelectedSeries(e.target.value as RaceSeries | 'all')}
        >
          <MenuItem value="all">All Series</MenuItem>
          {championshipStats.map((stat) => (
            <MenuItem key={stat.series} value={stat.series}>{stat.series}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Championship Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {championshipStats
          .filter(stat => selectedSeries === 'all' || stat.series === selectedSeries)
          .map((stat) => (
            <Grid xs={12} md={selectedSeries === 'all' ? 6 : 12} key={stat.series}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">{stat.series}</Typography>
                    <Chip
                      icon={<StarIcon />}
                      label={`P${stat.position}`}
                      color={stat.position <= 3 ? 'success' : 'default'}
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Points</Typography>
                      <Typography variant="h6">{stat.totalPoints}</Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Wins/Podiums</Typography>
                      <Typography variant="h6">{stat.wins}/{stat.podiums}</Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Races</Typography>
                      <Typography variant="h6">
                        {stat.completedRaces}/{stat.requiredRaces}
                      </Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Avg Finish</Typography>
                      <Typography variant="h6">{stat.averageFinish.toFixed(1)}</Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Best Finish</Typography>
                      <Typography variant="h6">
                        {stat.bestFinish === Infinity ? '-' : stat.bestFinish}
                      </Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Avg SoF</Typography>
                      <Typography variant="h6">
                        {stat.strengthOfField ? stat.strengthOfField.toFixed(0) : '-'}
                      </Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">iRating Gain</Typography>
                      <Typography
                        variant="h6"
                        color={stat.iRatingGain > 0 ? 'success.main' : 'error.main'}
                      >
                        {stat.iRatingGain > 0 ? '+' : ''}{stat.iRatingGain}
                      </Typography>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <Typography color="textSecondary" variant="body2">Dropped Weeks</Typography>
                      <Typography variant="h6">{stat.droppedWeeks.length}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Weekly Results */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Weekly Results</Typography>
        <Button
          variant="outlined"
          onClick={() => setShowDroppedWeeks(!showDroppedWeeks)}
        >
          {showDroppedWeeks ? 'Hide Dropped Weeks' : 'Show Dropped Weeks'}
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Week</TableCell>
              {selectedSeries === 'all' && <TableCell>Series</TableCell>}
              <TableCell>Track</TableCell>
              <TableCell align="right">Finish</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">SoF</TableCell>
              <TableCell align="right">Split</TableCell>
              <TableCell align="right">iRating</TableCell>
              <TableCell align="right">Safety Rating</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weeklyResults.map((race) => {
              const isDroppedWeek = race.championshipStanding?.droppedWeeks?.includes(race.week)
              if (!showDroppedWeeks && isDroppedWeek) return null

              return (
                <TableRow
                  key={race.id}
                  sx={{
                    opacity: isDroppedWeek ? 0.5 : 1,
                    bgcolor: isDroppedWeek ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell>Week {race.week}</TableCell>
                  {selectedSeries === 'all' && <TableCell>{race.series}</TableCell>}
                  <TableCell>{race.track.name}</TableCell>
                  <TableCell align="right">
                    {race.result?.finishPosition}
                    {race.result?.qualifyingResult && (
                      <Tooltip title={`Qualified: P${race.result.qualifyingResult.position}`}>
                        <Typography component="span" color="textSecondary" sx={{ ml: 1 }}>
                          (Q{race.result.qualifyingResult.position})
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">{race.result?.championshipPoints}</TableCell>
                  <TableCell align="right">{race.result?.strengthOfField?.toFixed(0) || '-'}</TableCell>
                  <TableCell align="right">
                    {race.result?.split ? `${race.result.split}/${race.result.totalSplits}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {race.result?.iRating && (
                      <Typography
                        color={race.result.iRating.change > 0 ? 'success.main' : 'error.main'}
                      >
                        {race.result.iRating.change > 0 ? '+' : ''}
                        {race.result.iRating.change}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {race.result?.safetyRating && (
                      <Typography
                        color={race.result.safetyRating.change > 0 ? 'success.main' : 'error.main'}
                      >
                        {race.result.safetyRating.change > 0 ? '+' : ''}
                        {race.result.safetyRating.change.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {isDroppedWeek ? (
                      <Chip size="small" label="Dropped" color="warning" />
                    ) : (
                      <Chip size="small" label="Counted" color="success" />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
} 