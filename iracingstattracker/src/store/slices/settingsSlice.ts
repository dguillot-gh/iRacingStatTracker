import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../services/storage';
import { storage } from '../../services/storage';
import { RootState } from '../index';

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    theme: 'dark',
    autoRefreshInterval: 60000,
    defaultView: 'dashboard',
    notifications: {
      enabled: false,
      sound: false,
      desktop: false
    },
    autoBackup: false,
    backupFrequency: 'daily',
    calendarSync: false
  },
  loading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<AppSettings>) => {
      state.settings = action.payload;
      storage.saveSettings(action.payload).catch(error => {
        console.error('Failed to save settings:', error);
        state.error = error instanceof Error ? error.message : 'Failed to save settings';
      });
    },
    updateTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.settings.theme = action.payload;
      storage.saveSettings(state.settings).catch(error => {
        console.error('Failed to save theme:', error);
        state.error = error instanceof Error ? error.message : 'Failed to save theme';
      });
    },
    toggleNotifications: (state) => {
      state.settings.notifications = {
        ...state.settings.notifications,
        enabled: !state.settings.notifications.enabled
      };
      storage.saveSettings(state.settings).catch(error => {
        console.error('Failed to save notification settings:', error);
        state.error = error instanceof Error ? error.message : 'Failed to save notification settings';
      });
    },
    toggleCalendarSync: (state) => {
      state.settings.calendarSync = !state.settings.calendarSync;
      storage.saveSettings(state.settings).catch(error => {
        console.error('Failed to save calendar sync settings:', error);
        state.error = error instanceof Error ? error.message : 'Failed to save calendar sync settings';
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Actions
export const {
  setSettings,
  updateTheme,
  toggleNotifications,
  toggleCalendarSync,
  setLoading,
  setError,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state: RootState) => state.settings.settings;
export const selectSettingsLoading = (state: RootState) => state.settings.loading;
export const selectSettingsError = (state: RootState) => state.settings.error;

export default settingsSlice.reducer; 