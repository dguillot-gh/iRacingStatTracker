import { useMemo, useState, useEffect } from 'react'
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
  LinearProgress,
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
} from '@mui/material'
import { RaceEntry } from '../types/race'
import { format, isWithinInterval, startOfYear, endOfYear } from 'date-fns'

interface SeasonManagerProps {
  races: RaceEntry[]
}

interface SeasonGoal {
  id: string
  type: 'wins' | 'podiums' | 'points' | 'incidents' | 'avgFinish'
  target: number
  achieved: boolean
}

interface SeasonStats {
  totalRaces: number
  completedRaces: number
  remainingRaces: number
  wins: number
  podiums: number
  totalPoints: number
  averageFinish: number
  averageIncidents: number
}

export default function SeasonManager({ races }: SeasonManagerProps) {
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState<Partial<SeasonGoal>>({
    type: 'wins',
    target: 0,
  })
  const [goals, setGoals] = useState<SeasonGoal[]>([])

  const currentYear = new Date().getFullYear()
  const seasonInterval = {
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  }

  // Season Statistics
  const seasonStats = useMemo(() => {
    const seasonRaces = races.filter(race =>
      isWithinInterval(new Date(race.date), seasonInterval)
    )
    
    const completed = seasonRaces.filter(race => race.status === 'completed')
    const upcoming = seasonRaces.filter(race => race.status === 'upcoming')
    
    if (completed.length === 0) {
      return {
        totalRaces: seasonRaces.length,
        completedRaces: 0,
        remainingRaces: upcoming.length,
        wins: 0,
        podiums: 0,
        totalPoints: 0,
        averageFinish: 0,
        averageIncidents: 0,
      }
    }

    const wins = completed.filter(race => race.result?.finishPosition === 1).length
    const podiums = completed.filter(race => (race.result?.finishPosition || 0) <= 3).length
    const totalPoints = completed.reduce((sum, race) => sum + (race.result?.championshipPoints || 0), 0)
    const averageFinish = completed.reduce((sum, race) => sum + (race.result?.finishPosition || 0), 0) / completed.length
    const averageIncidents = completed.reduce((sum, race) => sum + (race.result?.incidentPoints || 0), 0) / completed.length

    return {
      totalRaces: seasonRaces.length,
      completedRaces: completed.length,
      remainingRaces: upcoming.length,
      wins,
      podiums,
      totalPoints,
      averageFinish,
      averageIncidents,
    }
  }, [races, seasonInterval])

  // Update goal achievement status
  useEffect(() => {
    setGoals(prev => prev.map(goal => ({
      ...goal,
      achieved: checkGoalAchievement(goal, seasonStats),
    })))
  }, [seasonStats])

  // Series Breakdown
  const seriesBreakdown = useMemo(() => {
    const breakdown = new Map<string, {
      series: string
      races: number
      completed: number
      points: number
      bestFinish: number
      averageFinish: number
    }>()

    races
      .filter(race => isWithinInterval(new Date(race.date), seasonInterval))
      .forEach(race => {
        const current = breakdown.get(race.series) || {
          series: race.series,
          races: 0,
          completed: 0,
          points: 0,
          bestFinish: Infinity,
          averageFinish: 0,
        }

        const isCompleted = race.status === 'completed'
        const finishPos = race.result?.finishPosition || 0
        const points = race.result?.championshipPoints || 0

        breakdown.set(race.series, {
          ...current,
          races: current.races + 1,
          completed: current.completed + (isCompleted ? 1 : 0),
          points: current.points + points,
          bestFinish: isCompleted ? Math.min(current.bestFinish, finishPos) : current.bestFinish,
          averageFinish: isCompleted
            ? (current.averageFinish * current.completed + finishPos) / (current.completed + 1)
            : current.averageFinish,
        })
      })

    return Array.from(breakdown.values())
      .sort((a, b) => b.points - a.points)
  }, [races, seasonInterval])

  // Upcoming Races
  const upcomingRaces = useMemo(() => {
    return races
      .filter(race =>
        race.status === 'upcoming' &&
        isWithinInterval(new Date(race.date), seasonInterval)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [races, seasonInterval])

  const handleAddGoal = () => {
    if (!newGoal.type || !newGoal.target) return

    setGoals(prev => [...prev, {
      id: crypto.randomUUID(),
      type: newGoal.type as SeasonGoal['type'],
      target: newGoal.target as number,
      achieved: false,
    }])

    setIsGoalDialogOpen(false)
    setNewGoal({ type: 'wins', target: 0 })
  }

  function checkGoalAchievement(goal: SeasonGoal, stats: SeasonStats): boolean {
    switch (goal.type) {
      case 'wins':
        return stats.wins >= goal.target
      case 'podiums':
        return stats.podiums >= goal.target
      case 'points':
        return stats.totalPoints >= goal.target
      case 'incidents':
        return stats.averageIncidents <= goal.target
      case 'avgFinish':
        return stats.averageFinish <= goal.target
      default:
        return false
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Season Manager</Typography>
      
      {/* Season Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid container={true} spacing={3}>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Season Progress</Typography>
                <Typography variant="h4">
                  {((seasonStats.completedRaces / seasonStats.totalRaces) * 100).toFixed(0)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(seasonStats.completedRaces / seasonStats.totalRaces) * 100}
                  sx={{ mt: 1 }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {seasonStats.remainingRaces} races remaining
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Season Wins</Typography>
                <Typography variant="h4">{seasonStats.wins}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {((seasonStats.wins / seasonStats.completedRaces) * 100).toFixed(1)}% win rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Points</Typography>
                <Typography variant="h4">{seasonStats.totalPoints}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {(seasonStats.totalPoints / seasonStats.completedRaces).toFixed(1)} avg per race
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Average Finish</Typography>
                <Typography variant="h4">{seasonStats.averageFinish.toFixed(1)}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {seasonStats.podiums} podiums
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Season Goals */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Season Goals</Typography>
        <Button variant="contained" onClick={() => setIsGoalDialogOpen(true)}>
          Add Goal
        </Button>
      </Stack>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Goal</TableCell>
              <TableCell align="right">Target</TableCell>
              <TableCell align="right">Current</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.map((goal) => {
              const current = getCurrentValue(goal.type, seasonStats)
              return (
                <TableRow key={goal.id}>
                  <TableCell>{formatGoalType(goal.type)}</TableCell>
                  <TableCell align="right">{goal.target}</TableCell>
                  <TableCell align="right">{typeof current === 'number' ? current.toFixed(1) : current}</TableCell>
                  <TableCell align="right">
                    <Typography color={goal.achieved ? 'success.main' : 'text.secondary'}>
                      {goal.achieved ? 'Achieved' : 'In Progress'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
            {goals.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No goals set for this season
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Series Breakdown */}
      <Typography variant="h5" gutterBottom>Series Breakdown</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Series</TableCell>
              <TableCell align="right">Races</TableCell>
              <TableCell align="right">Completed</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Best Finish</TableCell>
              <TableCell align="right">Avg Finish</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seriesBreakdown.map((series) => (
              <TableRow key={series.series}>
                <TableCell>{series.series}</TableCell>
                <TableCell align="right">{series.races}</TableCell>
                <TableCell align="right">{series.completed}</TableCell>
                <TableCell align="right">{series.points}</TableCell>
                <TableCell align="right">
                  {series.bestFinish === Infinity ? '-' : series.bestFinish}
                </TableCell>
                <TableCell align="right">
                  {series.averageFinish === 0 ? '-' : series.averageFinish.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Upcoming Races */}
      <Typography variant="h5" gutterBottom>Upcoming Races</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Vehicle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingRaces.map((race) => (
              <TableRow key={race.id}>
                <TableCell>{format(new Date(race.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{race.series}</TableCell>
                <TableCell>{race.track.name}</TableCell>
                <TableCell>{race.vehicle}</TableCell>
              </TableRow>
            ))}
            {upcomingRaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No upcoming races scheduled
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Goal Dialog */}
      <Dialog
        open={isGoalDialogOpen}
        onClose={() => setIsGoalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Season Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={newGoal.type || 'wins'}
                label="Goal Type"
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as SeasonGoal['type'] })}
              >
                <MenuItem value="wins">Total Wins</MenuItem>
                <MenuItem value="podiums">Total Podiums</MenuItem>
                <MenuItem value="points">Championship Points</MenuItem>
                <MenuItem value="incidents">Average Incidents</MenuItem>
                <MenuItem value="avgFinish">Average Finish Position</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Target Value"
              type="number"
              value={newGoal.target || ''}
              onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
              fullWidth
              inputProps={{ 
                min: 0,
                step: newGoal.type === 'avgFinish' || newGoal.type === 'incidents' ? 0.1 : 1
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddGoal}
            variant="contained"
            disabled={!newGoal.type || !newGoal.target}
          >
            Add Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function formatGoalType(type: SeasonGoal['type']): string {
  switch (type) {
    case 'wins': return 'Total Wins'
    case 'podiums': return 'Total Podiums'
    case 'points': return 'Championship Points'
    case 'incidents': return 'Average Incidents'
    case 'avgFinish': return 'Average Finish Position'
    default: return type
  }
}

function getCurrentValue(type: SeasonGoal['type'], stats: SeasonStats): number {
  switch (type) {
    case 'wins': return stats.wins
    case 'podiums': return stats.podiums
    case 'points': return stats.totalPoints
    case 'incidents': return stats.averageIncidents
    case 'avgFinish': return stats.averageFinish
    default: return 0
  }
} 