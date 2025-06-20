import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Race } from '../../types/race';
import { RootState } from '../index';

interface RaceState {
  races: Race[];
  loading: boolean;
  error: string | null;
}

const initialState: RaceState = {
  races: [],
  loading: false,
  error: null,
};

const serializeRace = (race: Race): Race => ({
  ...race,
  date: race.date instanceof Date ? race.date.toISOString() : race.date,
  endDate: race.endDate instanceof Date ? race.endDate.toISOString() : race.endDate,
});

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setRaces: (state, action: PayloadAction<{ 
      races: Race[]; 
      loading: boolean; 
      error: string | null; 
    }>) => {
      state.races = action.payload.races.map(serializeRace);
      state.loading = action.payload.loading;
      state.error = action.payload.error;
    },
    addRace: (state, action: PayloadAction<Race>) => {
      state.races.push(serializeRace(action.payload));
    },
    updateRace: (state, action: PayloadAction<Race>) => {
      const index = state.races.findIndex(race => race.id === action.payload.id);
      if (index !== -1) {
        state.races[index] = serializeRace(action.payload);
      }
    },
    deleteRace: (state, action: PayloadAction<string>) => {
      state.races = state.races.filter(race => race.id !== action.payload);
    },
  },
});

// Actions
export const { 
  setRaces,
  addRace,
  updateRace,
  deleteRace,
} = raceSlice.actions;

// Selectors
export const selectRaces = (state: RootState) => state.race.races;
export const selectRacesLoading = (state: RootState) => state.race.loading;
export const selectRacesError = (state: RootState) => state.race.error;

export default raceSlice.reducer; 