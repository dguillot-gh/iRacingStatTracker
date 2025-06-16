import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Series } from '../types/series';

interface SeriesState {
  series: Series[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SeriesState = {
  series: [],
  isLoading: false,
  error: null,
};

export const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
    setSeries: (state, action: PayloadAction<Series[]>) => {
      state.series = action.payload;
    },
    addSeries: (state, action: PayloadAction<Series>) => {
      state.series.push(action.payload);
    },
    updateSeries: (state, action: PayloadAction<Series>) => {
      const index = state.series.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.series[index] = action.payload;
      }
    },
    deleteSeries: (state, action: PayloadAction<string>) => {
      state.series = state.series.filter(s => s.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSeries,
  addSeries,
  updateSeries,
  deleteSeries,
  setLoading,
  setError,
} = seriesSlice.actions;

export default seriesSlice.reducer; 