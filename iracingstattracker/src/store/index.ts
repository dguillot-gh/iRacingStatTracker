import { configureStore } from '@reduxjs/toolkit';
import raceReducer from './slices/raceSlice';
import seriesReducer from './slices/seriesSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    race: raceReducer,
    series: seriesReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['race/saveRace/fulfilled', 'race/updateRaceAsync/fulfilled', 'race/loadRaces/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.date', 'payload.endDate'],
        // Ignore these paths in the state
        ignoredPaths: ['race.races.date', 'race.races.endDate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 