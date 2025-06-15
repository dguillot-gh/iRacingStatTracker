import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material'
import { RaceFormData } from '@/types/race'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateTimePicker } from '@mui/x-date-pickers'

interface RaceFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RaceFormData) => void
  initialData?: RaceFormData
  isMultiDay: boolean
  setIsMultiDay: (isMultiDay: boolean) => void
}

const defaultFormData: RaceFormData = {
  date: '',
  series: '',
  track: '',
  carClass: '',
  startTime: '',
  notes: '',
}

export default function RaceFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isMultiDay,
  setIsMultiDay,
}: RaceFormDialogProps) {
  const [showAdvancedFields, setShowAdvancedFields] = useState(false)
  const [formData, setFormData] = useState<RaceFormData>(
    initialData || {
      date: new Date(),
      series: '',
      class: 'oval',
      track: {
        name: '',
        type: 'oval'
      },
      vehicle: '',
      week: 1,
      season: new Date().getFullYear().toString(),
      status: 'upcoming'
    }
  )

  const handleChange = (field: keyof RaceFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      if (field === 'track' && value.type) {
        newData.class = value.type === 'oval' ? 'oval' : 'road'
      }
      
      return newData
    })
  }

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      class: formData.class || (formData.track.type === 'oval' ? 'oval' : 'road'),
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? 'Edit Race' : 'Add Race'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Series</InputLabel>
            <Select
              value={formData.series || ''}
              label="Series"
              onChange={(e) => handleChange('series', e.target.value)}
            >
              <MenuItem value="Draftmasters">Draftmasters</MenuItem>
              <MenuItem value="Pro Series">Pro Series</MenuItem>
              <MenuItem value="World Championship">World Championship</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.class || (formData.track?.type === 'oval' ? 'oval' : 'road')}
              label="Class"
              onChange={(e) => handleChange('class', e.target.value)}
            >
              <MenuItem value="oval">Oval</MenuItem>
              <MenuItem value="road">Road</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Track Type</InputLabel>
            <Select
              value={formData.track?.type || 'oval'}
              label="Track Type"
              onChange={(e) => handleChange('track', { ...formData.track, type: e.target.value })}
            >
              <MenuItem value="oval">Oval</MenuItem>
              <MenuItem value="road">Road</MenuItem>
              <MenuItem value="dirt">Dirt</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Track Name"
            value={formData.track?.name || ''}
            onChange={(e) => handleChange('track', { ...formData.track, name: e.target.value })}
            fullWidth
            required
          />

          <TextField
            label="Vehicle"
            value={formData.vehicle || ''}
            onChange={(e) => handleChange('vehicle', e.target.value)}
            fullWidth
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Week"
                type="number"
                value={formData.week || ''}
                onChange={(e) => handleChange('week', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1, max: 13 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Season"
                value={formData.season || ''}
                onChange={(e) => handleChange('season', e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => handleChange('date', newValue)}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              {isMultiDay && (
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(newValue) => handleChange('endDate', newValue)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>

          <FormControlLabel
            control={
              <Switch
                checked={isMultiDay}
                onChange={(e) => setIsMultiDay(e.target.checked)}
              />
            }
            label="Multi-day Event"
          />

          <TextField
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Advanced Fields Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showAdvancedFields}
                onChange={(e) => setShowAdvancedFields(e.target.checked)}
              />
            }
            label="Show Advanced Fields"
          />

          {showAdvancedFields && (
            <>
              <Typography variant="h6" gutterBottom>Qualifying</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Qualifying Position"
                    type="number"
                    value={formData.result?.qualifyingResult?.position || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      qualifyingResult: {
                        ...formData.result?.qualifyingResult,
                        position: Number(e.target.value)
                      }
                    })}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Qualifying Best Lap"
                    type="number"
                    value={formData.result?.qualifyingResult?.bestLapTime || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      qualifyingResult: {
                        ...formData.result?.qualifyingResult,
                        bestLapTime: Number(e.target.value)
                      }
                    })}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Gap to Pole"
                    type="number"
                    value={formData.result?.qualifyingResult?.gap || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      qualifyingResult: {
                        ...formData.result?.qualifyingResult,
                        gap: Number(e.target.value)
                      }
                    })}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Race Details</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Split"
                    type="number"
                    value={formData.result?.split || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      split: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Total Splits"
                    type="number"
                    value={formData.result?.totalSplits || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      totalSplits: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Strength of Field"
                    type="number"
                    value={formData.result?.strengthOfField || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      strengthOfField: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Performance</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Average Lap Time"
                    type="number"
                    value={formData.result?.averageLapTime || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      averageLapTime: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Lead Laps"
                    type="number"
                    value={formData.result?.leadLaps || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      leadLaps: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TextField
                    label="Total Laps"
                    type="number"
                    value={formData.result?.totalLaps || ''}
                    onChange={(e) => handleChange('result', {
                      ...formData.result,
                      totalLaps: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Rating Changes</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2">iRating</Typography>
                    <TextField
                      label="Before"
                      type="number"
                      value={formData.result?.iRating?.before || ''}
                      onChange={(e) => handleChange('result', {
                        ...formData.result,
                        iRating: {
                          ...formData.result?.iRating,
                          before: Number(e.target.value),
                          after: Number(e.target.value) + (formData.result?.iRating?.change || 0)
                        }
                      })}
                      fullWidth
                    />
                    <TextField
                      label="Change"
                      type="number"
                      value={formData.result?.iRating?.change || ''}
                      onChange={(e) => handleChange('result', {
                        ...formData.result,
                        iRating: {
                          ...formData.result?.iRating,
                          change: Number(e.target.value),
                          after: (formData.result?.iRating?.before || 0) + Number(e.target.value)
                        }
                      })}
                      fullWidth
                    />
                    <TextField
                      label="After"
                      type="number"
                      value={formData.result?.iRating?.after || ''}
                      disabled
                      fullWidth
                    />
                  </Stack>
                </Grid>
                <Grid xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2">Safety Rating</Typography>
                    <TextField
                      label="Before"
                      type="number"
                      value={formData.result?.safetyRating?.before || ''}
                      onChange={(e) => handleChange('result', {
                        ...formData.result,
                        safetyRating: {
                          ...formData.result?.safetyRating,
                          before: Number(e.target.value),
                          after: Number(e.target.value) + (formData.result?.safetyRating?.change || 0)
                        }
                      })}
                      fullWidth
                      inputProps={{ step: 0.01 }}
                    />
                    <TextField
                      label="Change"
                      type="number"
                      value={formData.result?.safetyRating?.change || ''}
                      onChange={(e) => handleChange('result', {
                        ...formData.result,
                        safetyRating: {
                          ...formData.result?.safetyRating,
                          change: Number(e.target.value),
                          after: (formData.result?.safetyRating?.before || 0) + Number(e.target.value)
                        }
                      })}
                      fullWidth
                      inputProps={{ step: 0.01 }}
                    />
                    <TextField
                      label="After"
                      type="number"
                      value={formData.result?.safetyRating?.after || ''}
                      disabled
                      fullWidth
                      inputProps={{ step: 0.01 }}
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Championship</Typography>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField
                    label="Required Races"
                    type="number"
                    value={formData.championshipStanding?.requiredRaces || ''}
                    onChange={(e) => handleChange('championshipStanding', {
                      ...formData.championshipStanding,
                      requiredRaces: Number(e.target.value)
                    })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Dropped Week</InputLabel>
                    <Select
                      value={formData.championshipStanding?.droppedWeeks?.includes(formData.week) ? 'yes' : 'no'}
                      label="Dropped Week"
                      onChange={(e) => {
                        const isDropped = e.target.value === 'yes'
                        const currentWeek = formData.week
                        const currentDroppedWeeks = formData.championshipStanding?.droppedWeeks || []
                        
                        handleChange('championshipStanding', {
                          ...formData.championshipStanding,
                          droppedWeeks: isDropped
                            ? [...currentDroppedWeeks, currentWeek]
                            : currentDroppedWeeks.filter(w => w !== currentWeek)
                        })
                      }}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? 'Save Changes' : 'Add Race'}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 