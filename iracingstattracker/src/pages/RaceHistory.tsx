import React, { useState, useCallback, memo, useMemo } from 'react'
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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { format } from 'date-fns'
import { useRaces } from '../hooks/useRaces'
import RaceFormDialog from '../components/RaceFormDialog'

interface RaceHistoryProps {
  races: RaceEntry[]
  onUpdateRace: (id: string, updates: Partial<RaceEntry>) => void
  onDeleteRace: (id: string) => void
  onCreateRace: (race: RaceEntry) => void
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

const RaceTableRow = memo(({ 
  race, 
  onEditClick, 
  onDeleteClick 
}: { 
  race: RaceEntry; 
  onEditClick: (race: RaceEntry) => void;
  onDeleteClick: (id: string) => void;
}) => {
  const handleEdit = useCallback(() => {
    onEditClick(race);
  }, [race, onEditClick]);

  const handleDelete = useCallback(() => {
    onDeleteClick(race.id);
  }, [race.id, onDeleteClick]);

  return (
    <TableRow>
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
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Race">
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
});

RaceTableRow.displayName = 'RaceTableRow';

const EditDialog = memo(({ 
  isOpen, 
  selectedRace, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean;
  selectedRace: RaceEntry | null;
  onClose: () => void;
  onSave: (formData: RaceResultFormData) => void;
}) => {
  const [formData, setFormData] = useState<RaceResultFormData>({
    finishPosition: '',
    startPosition: '',
    incidentPoints: '',
    championshipPoints: '',
    bestLapTime: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (formData.finishPosition === '') {
      errors.finishPosition = 'Finish position is required';
      isValid = false;
    } else if (formData.finishPosition < 1) {
      errors.finishPosition = 'Position must be 1 or greater';
      isValid = false;
    }

    if (formData.startPosition === '') {
      errors.startPosition = 'Start position is required';
      isValid = false;
    } else if (formData.startPosition < 1) {
      errors.startPosition = 'Position must be 1 or greater';
      isValid = false;
    }

    if (formData.incidentPoints === '') {
      errors.incidentPoints = 'Incident points are required';
      isValid = false;
    } else if (formData.incidentPoints < 0) {
      errors.incidentPoints = 'Incident points cannot be negative';
      isValid = false;
    }

    if (formData.championshipPoints === '') {
      errors.championshipPoints = 'Championship points are required';
      isValid = false;
    }

    if (formData.bestLapTime === '') {
      errors.bestLapTime = 'Best lap time is required';
      isValid = false;
    } else if (formData.bestLapTime <= 0) {
      errors.bestLapTime = 'Lap time must be greater than 0';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (validateForm()) {
      onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  const handleInputChange = useCallback((field: keyof RaceResultFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? Number(value) : ''
    }));
  }, []);

  // Reset form when dialog opens with new race
  React.useEffect(() => {
    if (selectedRace && isOpen) {
      setFormData({
        finishPosition: selectedRace.result?.finishPosition || '',
        startPosition: selectedRace.result?.startPosition || '',
        incidentPoints: selectedRace.result?.incidentPoints || '',
        championshipPoints: selectedRace.result?.championshipPoints || '',
        bestLapTime: selectedRace.result?.bestLapTime || '',
      });
      setFormErrors({});
    }
  }, [selectedRace, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
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
            onChange={(e) => handleInputChange('startPosition', e.target.value)}
            error={!!formErrors.startPosition}
            helperText={formErrors.startPosition}
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Finish Position"
            type="number"
            value={formData.finishPosition}
            onChange={(e) => handleInputChange('finishPosition', e.target.value)}
            error={!!formErrors.finishPosition}
            helperText={formErrors.finishPosition}
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Incident Points"
            type="number"
            value={formData.incidentPoints}
            onChange={(e) => handleInputChange('incidentPoints', e.target.value)}
            error={!!formErrors.incidentPoints}
            helperText={formErrors.incidentPoints}
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Championship Points"
            type="number"
            value={formData.championshipPoints}
            onChange={(e) => handleInputChange('championshipPoints', e.target.value)}
            error={!!formErrors.championshipPoints}
            helperText={formErrors.championshipPoints}
            fullWidth
          />
          <TextField
            label="Best Lap Time (seconds)"
            type="number"
            value={formData.bestLapTime}
            onChange={(e) => handleInputChange('bestLapTime', e.target.value)}
            error={!!formErrors.bestLapTime}
            helperText={formErrors.bestLapTime}
            fullWidth
            inputProps={{ min: 0, step: 0.001 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
});

EditDialog.displayName = 'EditDialog';

export default function RaceHistory() {
  const { races, addRace, updateRace, deleteRace } = useRaces()
  const [selectedRace, setSelectedRace] = useState<RaceEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRaceFormOpen, setIsRaceFormOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const completedRaces = useMemo(() => 
    races
      .filter(race => race.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [races]
  )

  const handleEditRace = useCallback((race: RaceEntry) => {
    setSelectedRace(race)
    setIsEditDialogOpen(true)
  }, [])

  const handleCreateRace = useCallback(() => {
    setSelectedRace(null)
    setIsRaceFormOpen(true)
  }, [])

  const handleRaceFormSubmit = useCallback(async (race: RaceEntry) => {
    try {
      if (selectedRace) {
        await updateRace(race)
      } else {
        await addRace(race)
      }
      setIsRaceFormOpen(false)
      setSelectedRace(null)
    } catch (error) {
      console.error('Failed to save race:', error)
      setError('Failed to save race. Please try again.')
    }
  }, [selectedRace, updateRace, addRace])

  const handleDeleteRace = useCallback(async (id: string) => {
    try {
      await deleteRace(id)
    } catch (error) {
      console.error('Failed to delete race:', error)
      setError('Failed to delete race. Please try again.')
    }
  }, [deleteRace])

  const handleSaveResult = useCallback(async (formData: RaceResultFormData) => {
    if (!selectedRace) return

    try {
      await updateRace({
        ...selectedRace,
        result: {
          finishPosition: Number(formData.finishPosition),
          startPosition: Number(formData.startPosition),
          incidentPoints: Number(formData.incidentPoints),
          championshipPoints: Number(formData.championshipPoints),
          bestLapTime: Number(formData.bestLapTime),
        },
      })
      setIsEditDialogOpen(false)
      setSelectedRace(null)
    } catch (error) {
      console.error('Failed to save race result:', error)
      setError('Failed to save race result. Please try again.')
    }
  }, [selectedRace, updateRace])

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Race History</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateRace}
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
              <TableCell align="right">Start</TableCell>
              <TableCell align="right">Finish</TableCell>
              <TableCell align="right">Incidents</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">Best Lap</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedRaces.map((race) => (
              <RaceTableRow
                key={race.id}
                race={race}
                onEditClick={handleEditRace}
                onDeleteClick={handleDeleteRace}
              />
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

      <EditDialog
        isOpen={isEditDialogOpen}
        selectedRace={selectedRace}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveResult}
      />

      <RaceFormDialog
        open={isRaceFormOpen}
        onClose={() => setIsRaceFormOpen(false)}
        onSubmit={handleRaceFormSubmit}
        initialData={selectedRace || undefined}
      />
    </Box>
  )
} 