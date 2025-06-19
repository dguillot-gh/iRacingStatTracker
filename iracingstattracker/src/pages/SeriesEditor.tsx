import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Series } from '../types/series';
import { useSeries } from '../hooks/useSeries';

const defaultPointsSystem = {
  win: 43,
  second: 40,
  third: 38,
  pole: 1,
  leadLap: 1,
  mostLeadLaps: 2,
};

const emptySeriesForm: Omit<Series, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  category: 'road',
  licenseClass: 'D',
  minLicenseLevel: 1.0,
  seasonLength: 12,
  isActive: true,
  cars: [],
  defaultTrackType: 'road',
  pointsSystem: { ...defaultPointsSystem },
  requiredRaces: 8,
  droppedWeeks: 2,
  isOfficial: true,
};

export default function SeriesEditor() {
  const { series, error, createSeries, editSeries, removeSeries, clearError } = useSeries();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState(emptySeriesForm);
  const [carInput, setCarInput] = useState('');

  const handleOpenDialog = useCallback((series?: Series) => {
    if (series) {
      setEditingSeries(series);
      setFormData(series);
    } else {
      setEditingSeries(null);
      setFormData(emptySeriesForm);
    }
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSeries(null);
    setFormData(emptySeriesForm);
    setCarInput('');
    clearError();
  }, [clearError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSelectChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  }, []);

  const handlePointsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pointsSystem: {
        ...prev.pointsSystem,
        [name]: Number(value),
      },
    }));
  }, []);

  const handleAddCar = useCallback(() => {
    if (carInput.trim()) {
      setFormData(prev => ({
        ...prev,
        cars: [...prev.cars, carInput.trim()],
      }));
      setCarInput('');
    }
  }, [carInput]);

  const handleRemoveCar = useCallback((car: string) => {
    setFormData(prev => ({
      ...prev,
      cars: prev.cars.filter(c => c !== car),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingSeries) {
      editSeries({ ...formData, id: editingSeries.id });
    } else {
      createSeries(formData);
    }
    handleCloseDialog();
  }, [createSeries, editSeries, formData, editingSeries, handleCloseDialog]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this series?')) {
      removeSeries(id);
    }
  }, [removeSeries]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Series Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Series
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>License</TableCell>
              <TableCell>Season Length</TableCell>
              <TableCell>Required Races</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {series.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>{s.licenseClass} {s.minLicenseLevel.toFixed(1)}</TableCell>
                <TableCell>{s.seasonLength} weeks</TableCell>
                <TableCell>{s.requiredRaces}</TableCell>
                <TableCell>
                  <Chip
                    label={s.isActive ? 'Active' : 'Inactive'}
                    color={s.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenDialog(s)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(s.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {series.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No series found. Add your first series to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSeries ? 'Edit Series' : 'Add New Series'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Series Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                  required
                >
                  <MenuItem value="road">Road</MenuItem>
                  <MenuItem value="oval">Oval</MenuItem>
                  <MenuItem value="dirt_road">Dirt Road</MenuItem>
                  <MenuItem value="dirt_oval">Dirt Oval</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>License Class</InputLabel>
                <Select
                  name="licenseClass"
                  value={formData.licenseClass}
                  onChange={handleSelectChange}
                  label="License Class"
                  required
                >
                  <MenuItem value="R">Rookie</MenuItem>
                  <MenuItem value="D">D Class</MenuItem>
                  <MenuItem value="C">C Class</MenuItem>
                  <MenuItem value="B">B Class</MenuItem>
                  <MenuItem value="A">A Class</MenuItem>
                  <MenuItem value="P">Pro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Minimum License Level"
                name="minLicenseLevel"
                value={formData.minLicenseLevel}
                onChange={handleNumberChange}
                inputProps={{ step: 0.1, min: 0 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Season Length (weeks)"
                name="seasonLength"
                value={formData.seasonLength}
                onChange={handleNumberChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Required Races"
                name="requiredRaces"
                value={formData.requiredRaces}
                onChange={handleNumberChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Dropped Weeks"
                name="droppedWeeks"
                value={formData.droppedWeeks}
                onChange={handleNumberChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Points System</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Win Points"
                    name="win"
                    value={formData.pointsSystem.win}
                    onChange={handlePointsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Second Place"
                    name="second"
                    value={formData.pointsSystem.second}
                    onChange={handlePointsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Third Place"
                    name="third"
                    value={formData.pointsSystem.third}
                    onChange={handlePointsChange}
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Pole Points"
                    name="pole"
                    value={formData.pointsSystem.pole}
                    onChange={handlePointsChange}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lead Lap Points"
                    name="leadLap"
                    value={formData.pointsSystem.leadLap}
                    onChange={handlePointsChange}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Most Lead Laps"
                    name="mostLeadLaps"
                    value={formData.pointsSystem.mostLeadLaps}
                    onChange={handlePointsChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Cars</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Car"
                  value={carInput}
                  onChange={(e) => setCarInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCar()}
                />
                <Button variant="contained" onClick={handleAddCar}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.cars.map((car) => (
                  <Chip
                    key={car}
                    label={car}
                    onDelete={() => handleRemoveCar(car)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingSeries ? 'Save Changes' : 'Create Series'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 