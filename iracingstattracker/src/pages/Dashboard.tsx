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
} from '@mui/material'
import {
  isAfter,
  isBefore,
  startOfDay,
  format,
  startOfYear,
  endOfYear,
} from 'date-fns'
import { useRaces } from '../hooks/useRaces'
import { RaceEntry, Track, RaceClass } from '../types/race'
import PerformanceAnalytics from '../components/PerformanceAnalytics'

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

const DashboardComponent = () => {
  const { races, isLoading } = useRaces();
  const [activeTab, setActiveTab] = React.useState(0)
  const today = startOfDay(new Date());
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
      
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Performance Analytics" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          {/* Career Overview */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Career Statistics</Typography>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2}>
                <StatCard title="Total Races" value={careerStats.totalRaces} />
                <StatCard title="Wins" value={careerStats.wins} subtitle={`${careerStats.winRate.toFixed(1)}%`} />
                <StatCard title="Podiums" value={careerStats.podiums} subtitle={`${careerStats.podiumRate.toFixed(1)}%`} />
                <StatCard title="Championship Points" value={careerStats.totalPoints} />
                <StatCard title="Average Finish" value={careerStats.averageFinish.toFixed(1)} />
                <StatCard title="Average Incidents" value={careerStats.averageIncidents.toFixed(1)} />
              </Grid>
            </CardContent>
          </Card>

          {/* Class Overview */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Class Performance</Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Object.entries(classStats).map(([className, stats]) => (
              <ClassPerformanceCard key={className} className={className} stats={stats} />
            ))}
          </Grid>

          {/* Track Statistics */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Top Tracks</Typography>
          <Box sx={{ mb: 4 }}>
            <TrackStatsTable stats={trackStats} />
          </Box>

          {/* Recent Races */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Recent Races</Typography>
          <Box sx={{ mb: 4 }}>
            <RecentRacesTable races={recentRaces} />
          </Box>

          {/* Series Statistics */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>Series Performance</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
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
        </>
      ) : (
        <PerformanceAnalytics races={races} />
      )}
    </Box>
  )
}

const Dashboard = memo(DashboardComponent)
Dashboard.displayName = 'Dashboard'

export default Dashboard 