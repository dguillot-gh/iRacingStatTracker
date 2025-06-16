import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { AppSettings } from '../services/storage';
import {
  setSettings,
  updateTheme,
  toggleNotifications,
  toggleCalendarSync,
  setLoading,
  setError,
} from '../store/slices/settingsSlice';

export const useSettings = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, error } = useSelector((state: RootState) => state.settings);

  const handleSetSettings = useCallback((settings: AppSettings) => {
    dispatch(setSettings(settings));
  }, [dispatch]);

  const handleUpdateTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch(updateTheme(theme));
  }, [dispatch]);

  const handleToggleNotifications = useCallback(() => {
    dispatch(toggleNotifications());
  }, [dispatch]);

  const handleToggleCalendarSync = useCallback(() => {
    dispatch(toggleCalendarSync());
  }, [dispatch]);

  const handleSetLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  const handleSetError = useCallback((error: string | null) => {
    dispatch(setError(error));
  }, [dispatch]);

  return {
    settings,
    isLoading,
    error,
    setSettings: handleSetSettings,
    updateTheme: handleUpdateTheme,
    toggleNotifications: handleToggleNotifications,
    toggleCalendarSync: handleToggleCalendarSync,
    setLoading: handleSetLoading,
    setError: handleSetError,
  };
}; 