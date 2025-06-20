import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { RaceEntry } from '../types/race';
import {
  loadRaces,
  saveRace,
  updateRaceAsync,
  deleteRaceAsync,
  setLoading,
  setError,
} from '../store/slices/raceSlice';
import { AppDispatch } from '../store';

export const useRaces = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { races, isLoading, error } = useSelector((state: RootState) => state.race);

  // Load races on mount
  useEffect(() => {
    dispatch(loadRaces());
  }, [dispatch]);

  const handleAddRace = useCallback(async (race: RaceEntry) => {
    try {
      await dispatch(saveRace(race)).unwrap();
    } catch (error) {
      console.error('Failed to add race:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to add race'));
    }
  }, [dispatch]);

  const handleUpdateRace = useCallback(async (race: RaceEntry) => {
    try {
      await dispatch(updateRaceAsync(race)).unwrap();
    } catch (error) {
      console.error('Failed to update race:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to update race'));
    }
  }, [dispatch]);

  const handleDeleteRace = useCallback(async (raceId: string) => {
    try {
      await dispatch(deleteRaceAsync(raceId)).unwrap();
    } catch (error) {
      console.error('Failed to delete race:', error);
      dispatch(setError(error instanceof Error ? error.message : 'Failed to delete race'));
    }
  }, [dispatch]);

  const handleSetLoading = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  const handleSetError = useCallback((error: string | null) => {
    dispatch(setError(error));
  }, [dispatch]);

  return {
    races,
    isLoading,
    error,
    addRace: handleAddRace,
    updateRace: handleUpdateRace,
    deleteRace: handleDeleteRace,
    setLoading: handleSetLoading,
    setError: handleSetError,
  };
}; 