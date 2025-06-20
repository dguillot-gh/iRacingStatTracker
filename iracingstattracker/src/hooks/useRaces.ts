import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Race } from '../types/race';
import { 
  addRace as addRaceAction,
  updateRace as updateRaceAction,
  deleteRace as deleteRaceAction,
  setRaces as setRacesAction,
  selectRaces,
  selectRacesLoading,
  selectRacesError
} from '../store/slices/raceSlice';
import { storage } from '../services/storage';

const serializeRace = (race: Race): Race => ({
  ...race,
  date: race.date instanceof Date ? race.date.toISOString() : race.date,
  endDate: race.endDate instanceof Date ? race.endDate.toISOString() : race.endDate,
});

export const useRaces = () => {
  const dispatch = useDispatch();
  const races = useSelector(selectRaces);
  const isLoading = useSelector(selectRacesLoading);
  const error = useSelector(selectRacesError);

  const loadRaces = useCallback(async () => {
    try {
      dispatch(setRacesAction({ races: [], loading: true, error: null }));
      const loadedRaces = await storage.getRaces();
      dispatch(setRacesAction({ races: loadedRaces, loading: false, error: null }));
    } catch (err) {
      dispatch(setRacesAction({ 
        races: [], 
        loading: false, 
        error: err instanceof Error ? err.message : 'Failed to load races' 
      }));
    }
  }, [dispatch]);

  const addRace = useCallback(async (race: Omit<Race, 'id'>) => {
    const newRace = serializeRace({ ...race, id: crypto.randomUUID() });
    
    // Optimistic update
    dispatch(addRaceAction(newRace));
    
    try {
      await storage.addRace(newRace);
    } catch (err) {
      // Revert on failure
      dispatch(deleteRaceAction(newRace.id));
      throw err;
    }
    
    return newRace;
  }, [dispatch]);

  const updateRace = useCallback(async (race: Race) => {
    const oldRace = races.find(r => r.id === race.id);
    if (!oldRace) throw new Error('Race not found');

    const serializedRace = serializeRace(race);

    // Optimistic update
    dispatch(updateRaceAction(serializedRace));
    
    try {
      await storage.updateRace(serializedRace);
    } catch (err) {
      // Revert on failure
      dispatch(updateRaceAction(oldRace));
      throw err;
    }
  }, [dispatch, races]);

  const deleteRace = useCallback(async (raceId: string) => {
    const oldRace = races.find(r => r.id === raceId);
    if (!oldRace) throw new Error('Race not found');

    // Optimistic update
    dispatch(deleteRaceAction(raceId));
    
    try {
      await storage.deleteRace(raceId);
    } catch (err) {
      // Revert on failure
      dispatch(addRaceAction(oldRace));
      throw err;
    }
  }, [dispatch, races]);

  return {
    races,
    isLoading,
    error,
    loadRaces,
    addRace,
    updateRace,
    deleteRace
  };
}; 