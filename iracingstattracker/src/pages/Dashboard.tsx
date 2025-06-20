import React, { useMemo, memo } from 'react'
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
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
} from '@mui/material'
import {
  isAfter,
  isBefore,
  startOfDay,
  format,
  startOfYear,
  endOfYear,
  addDays,
  isPast,
  isFuture,
  differenceInDays,
} from 'date-fns'
import { useRaces } from '../hooks/useRaces'
import { RaceEntry, Track, RaceClass } from '../types/race'
import PerformanceAnalytics from '../components/PerformanceAnalytics'
import { useNavigate } from 'react-router-dom'

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

const StatCard = memo(({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
  <Grid item xs={6}>
    <Typography variant="subtitle2" color="textSecondary">
      {title}
    </Typography>
    <Typography variant="h6">
      {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="textSecondary">
        {subtitle}
      </Typography>
    )}
  </Grid>
))

StatCard.displayName = 'StatCard'

const ClassPerformanceCard = memo(({ className, stats }: { className: string; stats: ClassStats }) => (
  <Grid item xs={12} md={6}>
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
          {className}
        </Typography>
        <Grid container spacing={2}>
          <StatCard title="Total Races" value={stats.totalRaces} />
          <StatCard title="Wins" value={stats.wins} subtitle={`${stats.winRate.toFixed(1)}%`} />
          <StatCard title="Podiums" value={stats.podiums} subtitle={`${stats.podiumRate.toFixed(1)}%`} />
          <StatCard title="Average Finish" value={stats.averageFinish.toFixed(1)} />
          <StatCard title="Best Finish" value={stats.bestFinish === Infinity ? '-' : stats.bestFinish} />
        </Grid>
      </CardContent>
    </Card>
  </Grid>
))

ClassPerformanceCard.displayName = 'ClassPerformanceCard'

const TrackStatsTable = memo(({ stats }: { stats: TrackStats[] }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Track</TableCell>
          <TableCell align="right">Races</TableCell>
          <TableCell align="right">Wins</TableCell>
          <TableCell align="right">Podiums</TableCell>
          <TableCell align="right">Best Finish</TableCell>
          <TableCell align="right">Best Lap</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {stats.map((track) => (
          <TableRow key={track.name}>
            <TableCell>{track.name}</TableCell>
            <TableCell align="right">{track.totalRaces}</TableCell>
            <TableCell align="right">{track.wins}</TableCell>
            <TableCell align="right">{track.podiums}</TableCell>
            <TableCell align="right">
              {track.bestFinish === Infinity ? '-' : track.bestFinish}
            </TableCell>
            <TableCell align="right">
              {track.bestLapTime === Infinity ? '-' : `${track.bestLapTime.toFixed(3)}s`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
))

TrackStatsTable.displayName = 'TrackStatsTable'

const RecentRacesTable = memo(({ races }: { races: RaceEntry[] }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Series</TableCell>
          <TableCell>Track</TableCell>
          <TableCell align="right">Start</TableCell>
          <TableCell align="right">Finish</TableCell>
          <TableCell align="right">Inc</TableCell>
          <TableCell align="right">Points</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {races.map((race) => (
          <TableRow key={race.id}>
            <TableCell>{format(new Date(race.date), 'MMM d, yyyy')}</TableCell>
            <TableCell>{race.series}</TableCell>
            <TableCell>{race.track.name}</TableCell>
            <TableCell align="right">{race.result?.startPosition || '-'}</TableCell>
            <TableCell align="right">{race.result?.finishPosition || '-'}</TableCell>
            <TableCell align="right">{race.result?.incidentPoints || '-'}</TableCell>
            <TableCell align="right">{race.result?.championshipPoints || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
))

RecentRacesTable.displayName = 'RecentRacesTable'

const NextRaceCard = memo(({ race }: { race: RaceEntry }) => {
  const navigate = useNavigate()
  const daysUntil = differenceInDays(new Date(race.date), new Date())

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Next Race</Typography>
          <Chip 
            label={`In ${daysUntil} days`}
            color="primary"
            size="small"
          />
        </Stack>
        <Typography variant="subtitle1" gutterBottom>{race.series}</Typography>
        <Typography variant="body1" gutterBottom>{race.track.name}</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {format(new Date(race.date), 'MMMM d, yyyy')}
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          onClick={() => navigate('/planner')}
          sx={{ mt: 1 }}
        >
          View in Planner
        </Button>
      </CardContent>
    </Card>
  )
})

NextRaceCard.displayName = 'NextRaceCard'

const PerformanceTrendCard = memo(({ races }: { races: RaceEntry[] }) => {
  const recentRaces = races
    .filter(race => race.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const trend = recentRaces.map(race => ({
    date: format(new Date(race.date), 'MMM d'),
    position: race.result?.finishPosition || 0,
    points: race.result?.championshipPoints || 0,
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Recent Performance</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Position</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trend.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.date}</TableCell>
                <TableCell align="right">{result.position}</TableCell>
                <TableCell align="right">{result.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
})

PerformanceTrendCard.displayName = 'PerformanceTrendCard'

const SeasonProgressCard = memo(({ races }: { races: RaceEntry[] }) => {
  const today = new Date()
  const completedRaces = races.filter(race => race.status === 'completed').length
  const upcomingRaces = races.filter(race => 
    race.status === 'upcoming' && isFuture(new Date(race.date))
  ).length
  const totalRaces = completedRaces + upcomingRaces
  const progress = (completedRaces / totalRaces) * 100

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Season Progress</Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 10, borderRadius: 5, mb: 2 }}
        />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2" color="textSecondary">Completed</Typography>
            <Typography variant="h6">{completedRaces}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="textSecondary">Remaining</Typography>
            <Typography variant="h6">{upcomingRaces}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2" color="textSecondary">Progress</Typography>
            <Typography variant="h6">{progress.toFixed(0)}%</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
})

SeasonProgressCard.displayName = 'SeasonProgressCard'

const DashboardComponent = () => {
  const { races, isLoading } = useRaces()
  const [activeTab, setActiveTab] = React.useState(0)
  const today = startOfDay(new Date())
  const currentYear = new Date().getFullYear()
  const yearStart = startOfYear(today)
  const yearEnd = endOfYear(today)

  // Get next upcoming race
  const nextRace = useMemo(() => {
    return races
      .filter(race => race.status === 'upcoming' && isFuture(new Date(race.date)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  }, [races])

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

  // Class Statistics
  const classStats = useMemo(() => {
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
      dirt_road: {
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        winRate: 0,
        podiumRate: 0,
        averageFinish: 0,
        bestFinish: Infinity,
      },
      dirt_oval: {
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        winRate: 0,
        podiumRate: 0,
        averageFinish: 0,
        bestFinish: Infinity,
      }
    }

    const completedRaces = races.filter(race => race.status === 'completed')
    completedRaces.forEach(race => {
      const raceClass = race.class
      const finishPos = race.result?.finishPosition || 0

      if (finishPos > 0) {
        stats[raceClass].totalRaces++
        stats[raceClass].wins += finishPos === 1 ? 1 : 0
        stats[raceClass].podiums += finishPos <= 3 ? 1 : 0
        stats[raceClass].bestFinish = Math.min(stats[raceClass].bestFinish, finishPos)
        stats[raceClass].averageFinish = (stats[raceClass].averageFinish * (stats[raceClass].totalRaces - 1) + finishPos) / stats[raceClass].totalRaces
      }
    })

    // Calculate rates
    Object.values(stats).forEach(stat => {
      if (stat.totalRaces > 0) {
        stat.winRate = (stat.wins / stat.totalRaces) * 100
        stat.podiumRate = (stat.podiums / stat.totalRaces) * 100
      }
    })

    return stats
  }, [races])

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    )
  }

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
      
      <Grid container spacing={3}>
        {/* Next Race and Season Progress */}
        <Grid item xs={12} md={4}>
          {nextRace && <NextRaceCard race={nextRace} />}
        </Grid>
        <Grid item xs={12} md={4}>
          <SeasonProgressCard races={races} />
        </Grid>
        <Grid item xs={12} md={4}>
          <PerformanceTrendCard races={races} />
        </Grid>

        {/* Career Stats */}
        {careerStats && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Career Statistics" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Races"
                      value={careerStats.totalRaces}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Wins"
                      value={careerStats.wins}
                      subtitle={`${careerStats.winRate.toFixed(1)}%`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Podiums"
                      value={careerStats.podiums}
                      subtitle={`${careerStats.podiumRate.toFixed(1)}%`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Championship Points"
                      value={careerStats.totalPoints}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Track Stats */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Top Tracks" />
            <CardContent>
              <TrackStatsTable stats={trackStats} />
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Races */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Races" />
            <CardContent>
              <RecentRacesTable
                races={races
                  .filter(race => race.status === 'completed')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Performance Analytics" />
            <CardContent>
              <PerformanceAnalytics races={races} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const Dashboard = memo(DashboardComponent)
Dashboard.displayName = 'Dashboard'

export default Dashboard 