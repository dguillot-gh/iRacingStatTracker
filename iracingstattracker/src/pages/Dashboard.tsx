import { useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
} from '@mui/material'
import { RaceEntry, Track } from '../types/race'
import {
  isAfter,
  isBefore,
  startOfDay,
  format,
  startOfYear,
  endOfYear,
} from 'date-fns'

interface DashboardProps {
  races: RaceEntry[]
}

interface TrackStats {
  name: string
  type: Track['type']
  totalRaces: number
  wins: number
  podiums: number
  bestFinish: number
  bestLapTime: number
  averageFinish: number
}

interface SeriesStats {
  name: string
  totalRaces: number
  wins: number
  podiums: number
  points: number
  averageFinish: number
}

interface ClassStats {
  totalRaces: number
  wins: number
  podiums: number
  winRate: number
  podiumRate: number
  averageFinish: number
  bestFinish: number
}

export default function Dashboard({ races }: DashboardProps) {
  const today = startOfDay(new Date())
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(today)
  const yearEnd = endOfYear(today)

  // Career Statistics
  const careerStats = useMemo(() => {
    const completedRaces = races.filter(race => race.status === 'completed')
    const totalRaces = completedRaces.length
    
    if (totalRaces === 0) return null

    const wins = completedRaces.filter(race => race.result?.finishPosition === 1).length
    const podiums = completedRaces.filter(race => (race.result?.finishPosition || 0) <= 3).length
    const totalPoints = completedRaces.reduce((sum, race) => sum + (race.result?.championshipPoints || 0), 0)
    const averageFinish = completedRaces.reduce((sum, race) => sum + (race.result?.finishPosition || 0), 0) / totalRaces
    const totalIncidents = completedRaces.reduce((sum, race) => sum + (race.result?.incidentPoints || 0), 0)

    return {
      totalRaces,
      wins,
      podiums,
      winRate: (wins / totalRaces) * 100,
      podiumRate: (podiums / totalRaces) * 100,
      averageFinish,
      totalPoints,
      averageIncidents: totalIncidents / totalRaces,
    }
  }, [races])

  // Track Statistics
  const trackStats = useMemo(() => {
    const stats = new Map<string, TrackStats>()
    const completedRaces = races.filter(race => race.status === 'completed')

    completedRaces.forEach(race => {
      const trackName = race.track.name
      const current = stats.get(trackName) || {
        name: trackName,
        type: race.track.type,
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        bestFinish: Infinity,
        bestLapTime: Infinity,
        averageFinish: 0,
      }

      const finishPos = race.result?.finishPosition || 0
      const lapTime = race.result?.bestLapTime || 0

      stats.set(trackName, {
        ...current,
        totalRaces: current.totalRaces + 1,
        wins: finishPos === 1 ? current.wins + 1 : current.wins,
        podiums: finishPos <= 3 ? current.podiums + 1 : current.podiums,
        bestFinish: Math.min(current.bestFinish, finishPos || Infinity),
        bestLapTime: lapTime > 0 ? Math.min(current.bestLapTime, lapTime) : current.bestLapTime,
        averageFinish: (current.averageFinish * current.totalRaces + finishPos) / (current.totalRaces + 1),
      })
    })

    return Array.from(stats.values())
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5)
  }, [races])

  // Series Statistics
  const seriesStats = useMemo(() => {
    const stats = new Map<string, SeriesStats>()
    const completedRaces = races.filter(race => race.status === 'completed')

    completedRaces.forEach(race => {
      const seriesName = race.series
      const current = stats.get(seriesName) || {
        name: seriesName,
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        points: 0,
        averageFinish: 0,
      }

      const finishPos = race.result?.finishPosition || 0
      const points = race.result?.championshipPoints || 0

      stats.set(seriesName, {
        ...current,
        totalRaces: current.totalRaces + 1,
        wins: finishPos === 1 ? current.wins + 1 : current.wins,
        podiums: finishPos <= 3 ? current.podiums + 1 : current.podiums,
        points: current.points + points,
        averageFinish: (current.averageFinish * current.totalRaces + finishPos) / (current.totalRaces + 1),
      })
    })

    return Array.from(stats.values())
      .sort((a, b) => b.points - a.points)
  }, [races])

  // Recent Performance
  const recentRaces = useMemo(() => {
    return races
      .filter(race => race.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [races])

  // Class Statistics (Oval vs Road)
  const classStats = useMemo(() => {
    const completedRaces = races.filter(race => race.status === 'completed')
    const stats: Record<RaceClass, ClassStats> = {
      oval: {
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        winRate: 0,
        podiumRate: 0,
        averageFinish: 0,
        bestFinish: Infinity,
      },
      road: {
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        winRate: 0,
        podiumRate: 0,
        averageFinish: 0,
        bestFinish: Infinity,
      },
    }

    completedRaces.forEach(race => {
      // Default to track type if class is not set
      const raceClass = race.class || (race.track.type === 'oval' ? 'oval' : 'road') as RaceClass
      const finishPos = race.result?.finishPosition || 0
      
      if (stats[raceClass]) {  // Make sure the class exists in our stats object
        stats[raceClass].totalRaces++
        if (finishPos === 1) stats[raceClass].wins++
        if (finishPos <= 3) stats[raceClass].podiums++
        stats[raceClass].averageFinish = (
          (stats[raceClass].averageFinish * (stats[raceClass].totalRaces - 1) + finishPos) / 
          stats[raceClass].totalRaces
        )
        stats[raceClass].bestFinish = Math.min(stats[raceClass].bestFinish, finishPos || Infinity)
      }
    })

    // Calculate rates
    Object.keys(stats).forEach(key => {
      const classKey = key as RaceClass
      const classStat = stats[classKey]
      if (classStat.totalRaces > 0) {
        classStat.winRate = (classStat.wins / classStat.totalRaces) * 100
        classStat.podiumRate = (classStat.podiums / classStat.totalRaces) * 100
      }
    })

    return stats
  }, [races])

  if (!careerStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Welcome to iRacing Stat Tracker</Typography>
        <Typography>Start adding races to see your statistics and performance metrics.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
      {/* Class Overview */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Class Performance</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(classStats).map(([className, stats]) => (
          <Grid item xs={12} md={6} key={className}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {className}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Total Races</Typography>
                    <Typography variant="h6">{stats.totalRaces}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Wins</Typography>
                    <Typography variant="h6">{stats.wins} ({stats.winRate.toFixed(1)}%)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Podiums</Typography>
                    <Typography variant="h6">{stats.podiums} ({stats.podiumRate.toFixed(1)}%)</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">Best Finish</Typography>
                    <Typography variant="h6">{stats.bestFinish === Infinity ? '-' : stats.bestFinish}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" variant="body2">Average Finish</Typography>
                    <Typography variant="h6">{stats.averageFinish.toFixed(1)}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Career Overview */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Career Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Races</Typography>
              <Typography variant="h4">{careerStats.totalRaces}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Win Rate</Typography>
              <Typography variant="h4">{careerStats.winRate.toFixed(1)}%</Typography>
              <Typography variant="body2" color="textSecondary">
                {careerStats.wins} wins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Podium Rate</Typography>
              <Typography variant="h4">{careerStats.podiumRate.toFixed(1)}%</Typography>
              <Typography variant="body2" color="textSecondary">
                {careerStats.podiums} podiums
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Finish</Typography>
              <Typography variant="h4">{careerStats.averageFinish.toFixed(1)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Track Performance */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Top Tracks</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Track</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Races</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Podiums</TableCell>
              <TableCell align="right">Best Finish</TableCell>
              <TableCell align="right">Best Lap</TableCell>
              <TableCell align="right">Avg Finish</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackStats.map((track) => (
              <TableRow key={track.name}>
                <TableCell>{track.name}</TableCell>
                <TableCell>{track.type}</TableCell>
                <TableCell align="right">{track.totalRaces}</TableCell>
                <TableCell align="right">{track.wins}</TableCell>
                <TableCell align="right">{track.podiums}</TableCell>
                <TableCell align="right">{track.bestFinish === Infinity ? '-' : track.bestFinish}</TableCell>
                <TableCell align="right">
                  {track.bestLapTime === Infinity ? '-' : track.bestLapTime.toFixed(3)}
                </TableCell>
                <TableCell align="right">{track.averageFinish.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Series Performance */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Series Performance</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Series</TableCell>
              <TableCell align="right">Races</TableCell>
              <TableCell align="right">Wins</TableCell>
              <TableCell align="right">Podiums</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Avg Finish</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seriesStats.map((series) => (
              <TableRow key={series.name}>
                <TableCell>{series.name}</TableCell>
                <TableCell align="right">{series.totalRaces}</TableCell>
                <TableCell align="right">{series.wins}</TableCell>
                <TableCell align="right">{series.podiums}</TableCell>
                <TableCell align="right">{series.points}</TableCell>
                <TableCell align="right">{series.averageFinish.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Recent Results */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Recent Results</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Track</TableCell>
              <TableCell align="right">Finish</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Incidents</TableCell>
              <TableCell align="right">Best Lap</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentRaces.map((race) => (
              <TableRow key={race.id}>
                <TableCell>{format(new Date(race.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{race.series}</TableCell>
                <TableCell>{race.track.name}</TableCell>
                <TableCell align="right">{race.result?.finishPosition || '-'}</TableCell>
                <TableCell align="right">{race.result?.championshipPoints || '-'}</TableCell>
                <TableCell align="right">{race.result?.incidentPoints || '-'}</TableCell>
                <TableCell align="right">
                  {race.result?.bestLapTime ? race.result.bestLapTime.toFixed(3) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
} 