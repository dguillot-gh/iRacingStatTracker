import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IRacingCredentials {
  email: string;
  password: string;
}

interface Settings {
  theme: 'light' | 'dark';
  iRacingCredentials?: IRacingCredentials;
  autoRefreshInterval: number; // in minutes
  defaultView: 'dashboard' | 'raceHistory' | 'series';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    theme: 'dark',
    autoRefreshInterval: 5,
    defaultView: 'dashboard',
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
    },
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.settings.theme = action.payload;
    },
    setIRacingCredentials: (state, action: PayloadAction<IRacingCredentials>) => {
      state.settings.iRacingCredentials = action.payload;
    },
    clearIRacingCredentials: (state) => {
      state.settings.iRacingCredentials = undefined;
    },
    setAutoRefreshInterval: (state, action: PayloadAction<number>) => {
      state.settings.autoRefreshInterval = action.payload;
    },
    setDefaultView: (state, action: PayloadAction<'dashboard' | 'raceHistory' | 'series'>) => {
      state.settings.defaultView = action.payload;
    },
    setNotificationSettings: (state, action: PayloadAction<{ enabled: boolean; sound: boolean; desktop: boolean }>) => {
      state.settings.notifications = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setTheme,
  setIRacingCredentials,
  clearIRacingCredentials,
  setAutoRefreshInterval,
  setDefaultView,
  setNotificationSettings,
  setLoading,
  setError,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer; 