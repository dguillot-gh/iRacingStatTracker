import { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { RaceEntry } from '../types/race'

interface PerformanceAnalyticsProps {
  races: RaceEntry[]
}

interface TrackPerformance {
  trackName: string
  bestLapTime: number
  averageLapTime: number
  totalLaps: number
  improvements: number
}

interface TimeOfDayPerformance {
  hour: number
  averageFinish: number
  totalRaces: number
  wins: number
}

export default function PerformanceAnalytics({ races }: PerformanceAnalyticsProps) {
  // Track Performance Analysis
  const trackPerformance = useMemo(() => {
    const perfMap = new Map<string, TrackPerformance>()
    
    races.forEach(race => {
      if (!race.result?.bestLapTime) return
      
      const current = perfMap.get(race.track.name) || {
        trackName: race.track.name,
        bestLapTime: Infinity,
        averageLapTime: 0,
        totalLaps: 0,
        improvements: 0,
      }
      
      const newBest = race.result.bestLapTime < current.bestLapTime
      
      perfMap.set(race.track.name, {
        ...current,
        bestLapTime: Math.min(current.bestLapTime, race.result.bestLapTime),
        averageLapTime: (current.averageLapTime * current.totalLaps + race.result.bestLapTime) / (current.totalLaps + 1),
        totalLaps: current.totalLaps + (race.result.lapsCompleted || 0),
        improvements: current.improvements + (newBest ? 1 : 0),
      })
    })
    
    return Array.from(perfMap.values())
      .sort((a, b) => a.bestLapTime - b.bestLapTime)
  }, [races])

  // Time of Day Performance Analysis
  const timePerformance = useMemo(() => {
    const perfByHour: TimeOfDayPerformance[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      averageFinish: 0,
      totalRaces: 0,
      wins: 0,
    }))
    
    races.forEach(race => {
      if (!race.result?.finishPosition) return
      const hour = new Date(race.date).getHours()
      const current = perfByHour[hour]
      
      perfByHour[hour] = {
        ...current,
        averageFinish: (current.averageFinish * current.totalRaces + race.result.finishPosition) / (current.totalRaces + 1),
        totalRaces: current.totalRaces + 1,
        wins: current.wins + (race.result.finishPosition === 1 ? 1 : 0),
      }
    })
    
    return perfByHour
  }, [races])

  // Performance Trend Analysis
  const performanceTrend = useMemo(() => {
    return races
      .filter(race => race.status === 'completed' && race.result)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(race => ({
        date: format(new Date(race.date), 'MMM d'),
        finishPosition: race.result?.finishPosition || 0,
        iRating: race.result?.iRating?.after || 0,
        incidents: race.result?.incidentPoints || 0,
      }))
  }, [races])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Performance Analytics</Typography>
      
      {/* Performance Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Performance Trends</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="finishPosition"
                stroke="#8884d8"
                name="Finish Position"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="iRating"
                stroke="#82ca9d"
                name="iRating"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Track Performance */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Track Performance</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Track</TableCell>
              <TableCell align="right">Best Lap</TableCell>
              <TableCell align="right">Average Lap</TableCell>
              <TableCell align="right">Total Laps</TableCell>
              <TableCell align="right">Improvements</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackPerformance.map((track) => (
              <TableRow key={track.trackName}>
                <TableCell>{track.trackName}</TableCell>
                <TableCell align="right">
                  {track.bestLapTime.toFixed(3)}s
                </TableCell>
                <TableCell align="right">
                  {track.averageLapTime.toFixed(3)}s
                </TableCell>
                <TableCell align="right">{track.totalLaps}</TableCell>
                <TableCell align="right">{track.improvements}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Time of Day Performance */}
      <Typography variant="h6" gutterBottom>Time of Day Performance</Typography>
      <Card>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'averageFinish' ? `P${value.toFixed(1)}` : value,
                  name === 'averageFinish' ? 'Average Finish' : 'Races'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageFinish"
                stroke="#8884d8"
                name="Average Finish"
              />
              <Line
                type="monotone"
                dataKey="totalRaces"
                stroke="#82ca9d"
                name="Races"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
} 