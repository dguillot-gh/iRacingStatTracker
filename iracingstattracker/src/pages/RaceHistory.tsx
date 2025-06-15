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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  FormHelperText,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { format } from 'date-fns'

interface RaceHistoryProps {
  races: RaceEntry[]
  onUpdateRace: (id: string, updates: Partial<RaceEntry>) => void
  onDeleteRace: (id: string) => void
}

interface RaceResultFormData {
  finishPosition: number | ''
  startPosition: number | ''
  incidentPoints: number | ''
  championshipPoints: number | ''
  bestLapTime: number | ''
}

interface FormErrors {
  finishPosition?: string
  startPosition?: string
  incidentPoints?: string
  championshipPoints?: string
  bestLapTime?: string
}

export default function RaceHistory({ races, onUpdateRace, onDeleteRace }: RaceHistoryProps) {
  const [selectedRace, setSelectedRace] = useState<RaceEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<RaceResultFormData>({
    finishPosition: '',
    startPosition: '',
    incidentPoints: '',
    championshipPoints: '',
    bestLapTime: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleEditClick = (race: RaceEntry) => {
    setSelectedRace(race)
    setFormData({
      finishPosition: race.result?.finishPosition || '',
      startPosition: race.result?.startPosition || '',
      incidentPoints: race.result?.incidentPoints || '',
      championshipPoints: race.result?.championshipPoints || '',
      bestLapTime: race.result?.bestLapTime || '',
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Finish Position validation
    if (formData.finishPosition === '') {
      errors.finishPosition = 'Finish position is required'
      isValid = false
    } else if (formData.finishPosition < 1) {
      errors.finishPosition = 'Position must be 1 or greater'
      isValid = false
    }

    // Start Position validation
    if (formData.startPosition === '') {
      errors.startPosition = 'Start position is required'
      isValid = false
    } else if (formData.startPosition < 1) {
      errors.startPosition = 'Position must be 1 or greater'
      isValid = false
    }

    // Incident Points validation
    if (formData.incidentPoints === '') {
      errors.incidentPoints = 'Incident points are required'
      isValid = false
    } else if (formData.incidentPoints < 0) {
      errors.incidentPoints = 'Incident points cannot be negative'
      isValid = false
    }

    // Championship Points validation
    if (formData.championshipPoints === '') {
      errors.championshipPoints = 'Championship points are required'
      isValid = false
    }

    // Best Lap Time validation
    if (formData.bestLapTime === '') {
      errors.bestLapTime = 'Best lap time is required'
      isValid = false
    } else if (formData.bestLapTime <= 0) {
      errors.bestLapTime = 'Lap time must be greater than 0'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSave = () => {
    if (!selectedRace || !validateForm()) return

    onUpdateRace(selectedRace.id, {
      status: 'completed',
      result: {
        finishPosition: formData.finishPosition as number,
        startPosition: formData.startPosition as number,
        incidentPoints: formData.incidentPoints as number,
        championshipPoints: formData.championshipPoints as number,
        bestLapTime: formData.bestLapTime as number,
      },
    })

    setIsEditDialogOpen(false)
    setSelectedRace(null)
  }

  const handleClose = () => {
    setIsEditDialogOpen(false)
    setSelectedRace(null)
    setFormErrors({})
  }

  const completedRaces = races.filter(race => race.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Race History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Series</TableCell>
              <TableCell>Track</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell align="right">Start</TableCell>
              <TableCell align="right">Finish</TableCell>
              <TableCell align="right">Inc</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Best Lap</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedRaces.map((race) => (
              <TableRow key={race.id}>
                <TableCell>{format(new Date(race.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{race.series}</TableCell>
                <TableCell>{race.track.name} ({race.track.type})</TableCell>
                <TableCell>{race.vehicle}</TableCell>
                <TableCell align="right">{race.result?.startPosition || '-'}</TableCell>
                <TableCell align="right">{race.result?.finishPosition || '-'}</TableCell>
                <TableCell align="right">{race.result?.incidentPoints || '-'}</TableCell>
                <TableCell align="right">{race.result?.championshipPoints || '-'}</TableCell>
                <TableCell align="right">
                  {race.result?.bestLapTime ? `${race.result.bestLapTime.toFixed(3)}s` : '-'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Result">
                      <IconButton size="small" onClick={() => handleEditClick(race)}>
                        <EditIcon />
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
            {completedRaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No completed races found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isEditDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedRace ? (
            <>Edit Race Result - {format(new Date(selectedRace.date), 'MMM d, yyyy')}</>
          ) : (
            'Edit Race Result'
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Start Position"
              type="number"
              value={formData.startPosition}
              onChange={(e) => setFormData({ ...formData, startPosition: e.target.value ? Number(e.target.value) : '' })}
              error={!!formErrors.startPosition}
              helperText={formErrors.startPosition}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Finish Position"
              type="number"
              value={formData.finishPosition}
              onChange={(e) => setFormData({ ...formData, finishPosition: e.target.value ? Number(e.target.value) : '' })}
              error={!!formErrors.finishPosition}
              helperText={formErrors.finishPosition}
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Incident Points"
              type="number"
              value={formData.incidentPoints}
              onChange={(e) => setFormData({ ...formData, incidentPoints: e.target.value ? Number(e.target.value) : '' })}
              error={!!formErrors.incidentPoints}
              helperText={formErrors.incidentPoints}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Championship Points"
              type="number"
              value={formData.championshipPoints}
              onChange={(e) => setFormData({ ...formData, championshipPoints: e.target.value ? Number(e.target.value) : '' })}
              error={!!formErrors.championshipPoints}
              helperText={formErrors.championshipPoints}
              fullWidth
            />
            <TextField
              label="Best Lap Time (seconds)"
              type="number"
              value={formData.bestLapTime}
              onChange={(e) => setFormData({ ...formData, bestLapTime: e.target.value ? Number(e.target.value) : '' })}
              error={!!formErrors.bestLapTime}
              helperText={formErrors.bestLapTime}
              fullWidth
              inputProps={{ step: 0.001, min: 0.001 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 