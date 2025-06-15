import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { format } from 'date-fns'

interface RacePlannerProps {
  races: RaceEntry[]
  onUpdateRace: (id: string, updates: Partial<RaceEntry>) => void
  onDeleteRace: (id: string) => void
}

interface QuickResultFormData {
  finishPosition: string | number
  startPosition: string | number
  incidentPoints: string | number
  championshipPoints: string | number
  bestLapTime: string | number
  didNotFinish: boolean
}

export default function RacePlanner({ races, onUpdateRace, onDeleteRace }: RacePlannerProps) {
  const [selectedRace, setSelectedRace] = useState<RaceEntry | null>(null)
  const [isQuickResultDialogOpen, setIsQuickResultDialogOpen] = useState(false)
  const [quickResultData, setQuickResultData] = useState<QuickResultFormData>({
    finishPosition: '',
    startPosition: '',
    incidentPoints: '',
    championshipPoints: '',
    bestLapTime: '',
    didNotFinish: false,
  })

  const handleQuickResultOpen = (race: RaceEntry) => {
    setSelectedRace(race)
    setQuickResultData({
      finishPosition: '',
      startPosition: '',
      incidentPoints: '',
      championshipPoints: '',
      bestLapTime: '',
      didNotFinish: false,
    })
    setIsQuickResultDialogOpen(true)
  }

  const handleQuickResultSave = () => {
    if (!selectedRace) return

    const result = quickResultData.didNotFinish
      ? {
          finishPosition: 0,
          startPosition: 0,
          incidentPoints: 0,
          championshipPoints: 0,
          bestLapTime: 0,
          notes: 'Did Not Finish',
        }
      : {
          finishPosition: Number(quickResultData.finishPosition),
          startPosition: Number(quickResultData.startPosition),
          incidentPoints: Number(quickResultData.incidentPoints),
          championshipPoints: Number(quickResultData.championshipPoints),
          bestLapTime: Number(quickResultData.bestLapTime),
        }

    onUpdateRace(selectedRace.id, {
      status: 'completed',
      result,
    })

    setIsQuickResultDialogOpen(false)
    setSelectedRace(null)
  }

  const upcomingRaces = races
    .filter(race => race.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Race Planner
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingRaces.map((race) => (
              <TableRow key={race.id}>
                <TableCell>{format(new Date(race.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{race.series}</TableCell>
                <TableCell>{race.track.name}</TableCell>
                <TableCell>{race.vehicle}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Record Result">
                      <IconButton
                        size="small"
                        onClick={() => handleQuickResultOpen(race)}
                        color="primary"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Race">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteRace(race.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {upcomingRaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No upcoming races found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isQuickResultDialogOpen}
        onClose={() => setIsQuickResultDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRace && (
            <>
              Record Race Result - {format(new Date(selectedRace.date), 'MMM d, yyyy')}
              <Typography variant="subtitle1" color="textSecondary">
                {selectedRace.series} - {selectedRace.track.name}
              </Typography>
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={quickResultData.didNotFinish}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    didNotFinish: e.target.checked,
                    finishPosition: e.target.checked ? '' : quickResultData.finishPosition,
                    startPosition: e.target.checked ? '' : quickResultData.startPosition,
                    incidentPoints: e.target.checked ? '' : quickResultData.incidentPoints,
                    championshipPoints: e.target.checked ? '' : quickResultData.championshipPoints,
                    bestLapTime: e.target.checked ? '' : quickResultData.bestLapTime,
                  })}
                />
              }
              label="Did Not Finish (DNF)"
            />
            {!quickResultData.didNotFinish && (
              <>
                <TextField
                  label="Start Position"
                  type="number"
                  value={quickResultData.startPosition}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    startPosition: e.target.value ? Number(e.target.value) : ''
                  })}
                  fullWidth
                  inputProps={{ min: 1 }}
                  required
                />
                <TextField
                  label="Finish Position"
                  type="number"
                  value={quickResultData.finishPosition}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    finishPosition: e.target.value ? Number(e.target.value) : ''
                  })}
                  fullWidth
                  inputProps={{ min: 1 }}
                  required
                />
                <TextField
                  label="Incident Points"
                  type="number"
                  value={quickResultData.incidentPoints}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    incidentPoints: e.target.value ? Number(e.target.value) : ''
                  })}
                  fullWidth
                  inputProps={{ min: 0 }}
                  required
                />
                <TextField
                  label="Championship Points"
                  type="number"
                  value={quickResultData.championshipPoints}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    championshipPoints: e.target.value ? Number(e.target.value) : ''
                  })}
                  fullWidth
                  required
                />
                <TextField
                  label="Best Lap Time (seconds)"
                  type="number"
                  value={quickResultData.bestLapTime}
                  onChange={(e) => setQuickResultData({
                    ...quickResultData,
                    bestLapTime: e.target.value ? Number(e.target.value) : ''
                  })}
                  fullWidth
                  inputProps={{ step: 0.001, min: 0.001 }}
                  required
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsQuickResultDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleQuickResultSave}
            variant="contained"
            color="primary"
            disabled={
              !quickResultData.didNotFinish &&
              (!quickResultData.finishPosition ||
                !quickResultData.startPosition ||
                !quickResultData.incidentPoints ||
                !quickResultData.championshipPoints ||
                !quickResultData.bestLapTime)
            }
          >
            Save Result
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 