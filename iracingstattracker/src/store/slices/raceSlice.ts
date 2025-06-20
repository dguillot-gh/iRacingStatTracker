import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RaceEntry } from '../../types/race';
import { StorageService } from '../../services/storage';

interface RaceState {
  races: RaceEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RaceState = {
  races: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const loadRaces = createAsyncThunk(
  'race/loadRaces',
  async () => {
    const races = await StorageService.getRaces();
    return races;
  }
);

export const saveRace = createAsyncThunk(
  'race/saveRace',
  async (race: RaceEntry) => {
    const currentRaces = await StorageService.getRaces();
    const updatedRaces = [...currentRaces, race];
    await StorageService.saveRaces(updatedRaces);
    return race;
  }
);

export const updateRaceAsync = createAsyncThunk(
  'race/updateRaceAsync',
  async (race: RaceEntry) => {
    const currentRaces = await StorageService.getRaces();
    const updatedRaces = currentRaces.map(r => r.id === race.id ? race : r);
    await StorageService.saveRaces(updatedRaces);
    return race;
  }
);

export const deleteRaceAsync = createAsyncThunk(
  'race/deleteRaceAsync',
  async (raceId: string) => {
    const currentRaces = await StorageService.getRaces();
    const updatedRaces = currentRaces.filter(r => r.id !== raceId);
    await StorageService.saveRaces(updatedRaces);
    return raceId;
  }
);

export const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load races
    builder.addCase(loadRaces.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loadRaces.fulfilled, (state, action) => {
      state.races = action.payload;
      state.isLoading = false;
    });
    builder.addCase(loadRaces.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to load races';
    });

    // Save race
    builder.addCase(saveRace.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(saveRace.fulfilled, (state, action) => {
      state.races.push(action.payload);
      state.isLoading = false;
    });
    builder.addCase(saveRace.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to save race';
    });

    // Update race
    builder.addCase(updateRaceAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateRaceAsync.fulfilled, (state, action) => {
      const index = state.races.findIndex(race => race.id === action.payload.id);
      if (index !== -1) {
        state.races[index] = action.payload;
      }
      state.isLoading = false;
    });
    builder.addCase(updateRaceAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update race';
    });

    // Delete race
    builder.addCase(deleteRaceAsync.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteRaceAsync.fulfilled, (state, action) => {
      state.races = state.races.filter(race => race.id !== action.payload);
      state.isLoading = false;
    });
    builder.addCase(deleteRaceAsync.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete race';
    });
  },
});

export const { setLoading, setError } = raceSlice.actions;
export default raceSlice.reducer; 