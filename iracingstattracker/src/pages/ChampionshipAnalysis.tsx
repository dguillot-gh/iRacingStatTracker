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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Slider,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab'
import { RaceEntry, RaceSeries } from '../types/race'
import { format, isAfter, isBefore, startOfToday } from 'date-fns'

interface ChampionshipAnalysisProps {
  races: RaceEntry[]
}

interface Scenario {
  position: number
  points: number
  probability: number
}

interface Prediction {
  series: RaceSeries
  currentPosition: number
  predictedPosition: number
  pointsNeeded: number
  remainingRaces: number
  scenarios: Scenario[]
  probability: number
}

export default function ChampionshipAnalysis({ races }: ChampionshipAnalysisProps) {
  const [selectedSeries, setSelectedSeries] = useState<RaceSeries | 'all'>('all')
  const [scenarioPosition, setScenarioPosition] = useState<number>(1)

  // Calculate predictions based on historical performance
  const predictions = useMemo(() => {
    const today = startOfToday()
    const predictions: Prediction[] = []
    
    // Group races by series
    const seriesRaces = new Map<RaceSeries, RaceEntry[]>()
    races.forEach(race => {
      const seriesRaces_ = seriesRaces.get(race.series) || []
      seriesRaces_.push(race)
      seriesRaces.set(race.series, seriesRaces_)
    })

    seriesRaces.forEach((seriesRaces, series) => {
      const completedRaces = seriesRaces.filter(r => 
        isBefore(new Date(r.date), today) && r.status === 'completed'
      )
      const upcomingRaces = seriesRaces.filter(r => 
        isAfter(new Date(r.date), today)
      )
      
      if (completedRaces.length === 0) return

      // Calculate average points and finish positions
      const avgPoints = completedRaces.reduce((sum, race) => 
        sum + (race.result?.championshipPoints || 0), 0
      ) / completedRaces.length

      const avgPosition = completedRaces.reduce((sum, race) =>
        sum + (race.result?.finishPosition || 0), 0
      ) / completedRaces.length

      // Calculate current championship position
      const currentPosition = completedRaces[completedRaces.length - 1]
        ?.championshipStanding?.position || 0

      // Generate scenarios
      const scenarios: Scenario[] = []
      for (let pos = 1; pos <= 5; pos++) {
        const expectedPoints = pos === 1 ? 43 : pos === 2 ? 40 : pos === 3 ? 38 : pos === 4 ? 35 : 32
        const probability = pos <= avgPosition ? 0.8 : pos <= avgPosition + 2 ? 0.5 : 0.2
        scenarios.push({ position: pos, points: expectedPoints, probability })
      }

      // Calculate points needed for championship
      const pointsNeeded = Math.max(0, 400 - completedRaces.reduce(
        (sum, race) => sum + (race.result?.championshipPoints || 0), 0
      ))

      // Predict final position based on current trend
      const predictedPosition = Math.round(
        (currentPosition + avgPosition) / 2
      )

      predictions.push({
        series,
        currentPosition,
        predictedPosition,
        pointsNeeded,
        remainingRaces: upcomingRaces.length,
        scenarios,
        probability: predictedPosition <= 3 ? 0.7 : predictedPosition <= 5 ? 0.4 : 0.2
      })
    })

    return predictions
  }, [races])

  // Calculate scenario impact
  const scenarioImpact = useMemo(() => {
    if (!selectedSeries || selectedSeries === 'all') return null

    const prediction = predictions.find(p => p.series === selectedSeries)
    if (!prediction) return null

    const scenario = prediction.scenarios.find(s => s.position === scenarioPosition)
    if (!scenario) return null

    return {
      points: scenario.points,
      probability: scenario.probability,
      newPosition: Math.max(1, prediction.predictedPosition - (5 - scenarioPosition))
    }
  }, [selectedSeries, scenarioPosition, predictions])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Championship Analysis & Predictions</Typography>

      {/* Series Selection */}
      <FormControl sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Series</InputLabel>
        <Select
          value={selectedSeries}
          label="Series"
          onChange={(e) => setSelectedSeries(e.target.value as RaceSeries | 'all')}
        >
          <MenuItem value="all">All Series</MenuItem>
          {predictions.map((pred) => (
            <MenuItem key={pred.series} value={pred.series}>{pred.series}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Predictions Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {predictions
          .filter(pred => selectedSeries === 'all' || pred.series === selectedSeries)
          .map((pred) => (
            <Grid item xs={12} md={selectedSeries === 'all' ? 6 : 12} key={pred.series}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">{pred.series}</Typography>
                    <Chip 
                      label={`P${pred.currentPosition}`}
                      color={pred.currentPosition <= 3 ? 'success' : 'default'}
                    />
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography color="textSecondary" variant="body2">Predicted Final Position</Typography>
                      <Typography variant="h6">P{pred.predictedPosition}</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={pred.probability * 100}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography color="textSecondary" variant="body2">Points Needed</Typography>
                      <Typography variant="h6">{pred.pointsNeeded}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Over {pred.remainingRaces} remaining races
                      </Typography>
                    </Grid>
                  </Grid>

                  {selectedSeries === pred.series && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>Position Scenario Analysis</Typography>
                      <Stack spacing={2} direction="row" alignItems="center">
                        <Typography>P{scenarioPosition}</Typography>
                        <Slider
                          value={scenarioPosition}
                          onChange={(_, value) => setScenarioPosition(value as number)}
                          min={1}
                          max={10}
                          marks
                          sx={{ flex: 1 }}
                        />
                      </Stack>

                      {scenarioImpact && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            Finishing P{scenarioPosition} would earn {scenarioImpact.points} points
                          </Typography>
                          <Typography variant="body2">
                            Probability: {(scenarioImpact.probability * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2">
                            Projected new position: P{scenarioImpact.newPosition}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Championship Timeline */}
      {selectedSeries !== 'all' && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Championship Progress</Typography>
          <Timeline>
            {races
              .filter(race => race.series === selectedSeries)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((race, index) => (
                <TimelineItem key={race.id}>
                  <TimelineSeparator>
                    <TimelineDot color={
                      race.status === 'completed' ? 'success' :
                      race.status === 'upcoming' ? 'primary' : 'grey'
                    } />
                    {index < races.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">
                      {format(new Date(race.date), 'MMM d, yyyy')} - {race.track.name}
                    </Typography>
                    {race.status === 'completed' && race.result && (
                      <Typography variant="body2" color="textSecondary">
                        P{race.result.finishPosition} - {race.result.championshipPoints} points
                        {race.championshipStanding && (
                          <> (P{race.championshipStanding.position} in championship)</>
                        )}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
          </Timeline>
        </Paper>
      )}
    </Box>
  )
} 