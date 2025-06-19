import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RaceEntry } from '../types/race';
import { StorageService } from '../services/storage';

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

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setRaces: (state, action: PayloadAction<RaceEntry[]>) => {
      state.races = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addRace: (state, action: PayloadAction<RaceEntry>) => {
      state.races.push(action.payload);
      StorageService.saveRaces(state.races);
    },
    updateRace: (state, action: PayloadAction<RaceEntry>) => {
      const index = state.races.findIndex(race => race.id === action.payload.id);
      if (index !== -1) {
        state.races[index] = action.payload;
        StorageService.saveRaces(state.races);
      }
    },
    deleteRace: (state, action: PayloadAction<string>) => {
      state.races = state.races.filter(race => race.id !== action.payload);
      StorageService.saveRaces(state.races);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setRaces, addRace, updateRace, deleteRace, setLoading, setError } = raceSlice.actions;
export default raceSlice.reducer; 