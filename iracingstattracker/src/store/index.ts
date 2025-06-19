import { configureStore } from '@reduxjs/toolkit';
import raceReducer from './raceSlice';
import settingsReducer from './settingsSlice';
import seriesReducer from './seriesSlice';

export const store = configureStore({
  reducer: {
    race: raceReducer,
    settings: settingsReducer,
    series: seriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 