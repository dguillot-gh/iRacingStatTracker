import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { RaceEntry } from '../types/race';
import {
  setRaces,
  addRace,
  updateRace,
  deleteRace,
  setLoading,
  setError,
} from '../store/raceSlice';

export const useRaces = () => {
  const dispatch = useDispatch();
  const { races, isLoading, error } = useSelector((state: RootState) => state.race);

  const handleSetRaces = useCallback((races: RaceEntry[]) => {
    dispatch(setRaces(races));
  }, [dispatch]);

  const handleAddRace = useCallback((race: RaceEntry) => {
    dispatch(addRace(race));
  }, [dispatch]);

  const handleUpdateRace = useCallback((race: RaceEntry) => {
    dispatch(updateRace(race));
  }, [dispatch]);

  const handleDeleteRace = useCallback((raceId: string) => {
    dispatch(deleteRace(raceId));
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
    setRaces: handleSetRaces,
    addRace: handleAddRace,
    updateRace: handleUpdateRace,
    deleteRace: handleDeleteRace,
    setLoading: handleSetLoading,
    setError: handleSetError,
  };
}; 