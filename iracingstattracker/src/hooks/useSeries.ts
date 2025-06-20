import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Series } from '../types/series';
import {
  addSeries,
  updateSeries,
  deleteSeries,
  setLoading,
  setError,
  setSeries,
} from '../store/slices/seriesSlice';
import { RootState } from '../store';
import { storage } from '../services/storage';

export const useSeries = () => {
  const dispatch = useDispatch();
  const { series, isLoading, error } = useSelector((state: RootState) => state.series);

  // Load series from storage on mount
  useEffect(() => {
    const loadSeries = async () => {
      try {
        dispatch(setLoading(true));
        const storedSeries = await storage.getSeries();
        dispatch(setSeries(storedSeries));
      } catch (err) {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to load series'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadSeries();
  }, [dispatch]);

  const createSeries = useCallback(async (seriesData: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSeries: Series = {
        ...seriesData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save to storage first
      await storage.addSeries(newSeries);
      
      // Then update Redux state
      dispatch(addSeries(newSeries));
      return newSeries;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to create series'));
      return null;
    }
  }, [dispatch]);

  const editSeries = useCallback(async (seriesData: Partial<Series> & { id: string }) => {
    try {
      const existingSeries = series.find(s => s.id === seriesData.id);
      if (!existingSeries) {
        throw new Error('Series not found');
      }

      const updatedSeries: Series = {
        ...existingSeries,
        ...seriesData,
        updatedAt: new Date().toISOString(),
      };

      // Save to storage first
      await storage.updateSeries(updatedSeries);
      
      // Then update Redux state
      dispatch(updateSeries(updatedSeries));
      return updatedSeries;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to update series'));
      return null;
    }
  }, [dispatch, series]);

  const removeSeries = useCallback(async (id: string) => {
    try {
      // Delete from storage first
      await storage.deleteSeries(id);
      
      // Then update Redux state
      dispatch(deleteSeries(id));
      return true;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to delete series'));
      return false;
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  return {
    series,
    isLoading,
    error,
    createSeries,
    editSeries,
    removeSeries,
    clearError,
  };
}; 