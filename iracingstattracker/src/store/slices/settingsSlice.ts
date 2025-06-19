import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../services/storage';
import { StorageService } from '../../services/storage';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    theme: 'dark',
    notifications: false,
    calendarSync: false,
  },
  isLoading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<AppSettings>) => {
      state.settings = action.payload;
      StorageService.saveSettings(action.payload);
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.settings.theme = action.payload;
      StorageService.saveSettings(state.settings);
    },
    toggleNotifications: (state) => {
      state.settings.notifications = !state.settings.notifications;
      StorageService.saveSettings(state.settings);
    },
    toggleCalendarSync: (state) => {
      state.settings.calendarSync = !state.settings.calendarSync;
      StorageService.saveSettings(state.settings);
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
  setSettings,
  updateTheme,
  toggleNotifications,
  toggleCalendarSync,
  setLoading,
  setError,
} = settingsSlice.actions;

export default settingsSlice.reducer; 