import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Typography,
} from '@mui/material'
import { RaceEntry } from '@/types/race'

interface RaceResultDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (id: string, position: number, iRatingChange: number) => void
  race: RaceEntry
}

export default function RaceResultDialog({
  open,
  onClose,
  onSubmit,
  race,
}: RaceResultDialogProps) {
  const [position, setPosition] = useState<string>('')
  const [iRatingChange, setIRatingChange] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(race.id, parseInt(position), parseInt(iRatingChange))
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Record Race Result</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {race.series} at {race.track.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(race.date + 'T' + race.startTime).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Finish Position"
                type="number"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="iRating Change"
                type="number"
                value={iRatingChange}
                onChange={(e) => setIRatingChange(e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!position || !iRatingChange}
          >
            Save Result
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 