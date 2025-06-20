import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Series } from '../types/series';
import {
  addSeries,
  updateSeries,
  deleteSeries,
  setLoading,
  setError,
} from '../store/slices/seriesSlice';
import { RootState } from '../store';

export const useSeries = () => {
  const dispatch = useDispatch();
  const { series, isLoading, error } = useSelector((state: RootState) => state.series);

  const createSeries = useCallback((seriesData: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSeries: Series = {
        ...seriesData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addSeries(newSeries));
      return newSeries;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to create series'));
      return null;
    }
  }, [dispatch]);

  const editSeries = useCallback((seriesData: Partial<Series> & { id: string }) => {
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
      dispatch(updateSeries(updatedSeries));
      return updatedSeries;
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Failed to update series'));
      return null;
    }
  }, [dispatch, series]);

  const removeSeries = useCallback((id: string) => {
    try {
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