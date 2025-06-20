import { useState, useMemo } from 'react'
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
  CircularProgress,
  Alert,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Add as AddIcon } from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { format } from 'date-fns'
import RaceFormDialog from '../components/RaceFormDialog'
import { useRaces } from '../hooks/useRaces'

interface QuickResultFormData {
  finishPosition: string | number
  startPosition: string | number
  incidentPoints: string | number
  championshipPoints: string | number
  bestLapTime: string | number
  didNotFinish: boolean
}

export default function RacePlanner() {
  const { races, addRace, updateRace, deleteRace } = useRaces()
  const [selectedRace, setSelectedRace] = useState<RaceEntry | null>(null)
  const [isQuickResultDialogOpen, setIsQuickResultDialogOpen] = useState(false)
  const [isRaceFormOpen, setIsRaceFormOpen] = useState(false)
  const [raceToEdit, setRaceToEdit] = useState<RaceEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    setIsQuickResultDialogOpen(true)
  }

  const handleQuickResultSave = async () => {
    if (!selectedRace || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
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

      await updateRace({
        ...selectedRace,
        status: 'completed',
        result,
      })

      setIsQuickResultDialogOpen(false)
      setSelectedRace(null)
    } catch (err) {
      setError('Failed to save race result. Please try again.')
      console.error('Failed to save race result:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRace = (race: RaceEntry) => {
    setRaceToEdit(race)
    setError(null)
    setIsRaceFormOpen(true)
  }

  const handleCreateRace = () => {
    setRaceToEdit(null)
    setError(null)
    setIsRaceFormOpen(true)
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
      setIsRaceFormOpen(false)
      setRaceToEdit(null)
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

  const upcomingRaces = useMemo(() => 
    races
      .filter(race => race.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [races]
  )

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Race Planner</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateRace}
          disabled={isSubmitting}
        >
          Add Race
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                    <Tooltip title="Edit Race">
                      <IconButton
                        size="small"
                        onClick={() => handleEditRace(race)}
                        color="primary"
                        disabled={isSubmitting}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Record Result">
                      <IconButton
                        size="small"
                        onClick={() => handleQuickResultOpen(race)}
                        color="primary"
                        disabled={isSubmitting}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Race">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRace(race.id)}
                        color="error"
                        disabled={isSubmitting}
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
        onClose={() => !isSubmitting && setIsQuickResultDialogOpen(false)}
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  inputProps={{ min: 0 }}
                  disabled={isSubmitting}
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
                  inputProps={{ min: 0, step: 0.001 }}
                  disabled={isSubmitting}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsQuickResultDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleQuickResultSave}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Result'}
          </Button>
        </DialogActions>
      </Dialog>

      <RaceFormDialog
        open={isRaceFormOpen}
        onClose={() => setIsRaceFormOpen(false)}
        onSubmit={handleRaceFormSubmit}
        initialData={raceToEdit || undefined}
      />
    </Box>
  )
} 