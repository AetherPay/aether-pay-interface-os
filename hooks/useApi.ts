/**
 * AetherOS - useApi Hook
 *
 * Generic hook for fetching data from the backend admin API.
 * Falls back to mock data if API is not available.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => api.merchants.list());
 */

import { useState, useEffect, useCallback } from 'react';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  mockData?: T,
  deps: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(mockData || null);
  const [loading, setLoading] = useState(!mockData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK && mockData) {
      setData(mockData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      console.error('[Admin API Error]', err);
      setError(err.message || 'An error occurred');
      // Fallback to mock data if API fails
      if (mockData) {
        setData(mockData);
      }
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for real-time polling (replaces the current setInterval pattern in App.tsx)
 *
 * Usage:
 *   const { data } = usePolling(() => api.dashboard.getKPIs(), 5000);
 */
interface UsePollingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  stop: () => void;
  start: () => void;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number = 5000,
  mockData?: T,
): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(mockData || null);
  const [loading, setLoading] = useState(!mockData);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const fetchData = async () => {
      if (USE_MOCK && mockData) {
        setData(mockData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        if (mockData) setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, intervalMs]);

  return {
    data,
    loading,
    error,
    stop: () => setIsActive(false),
    start: () => setIsActive(true),
  };
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE)
 */
interface UseMutationResult<T, P> {
  mutate: (params: P) => Promise<T | null>;
  loading: boolean;
  error: string | null;
  data: T | null;
}

export function useMutation<T, P = any>(
  mutator: (params: P) => Promise<T>
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutator(params);
      setData(result);
      return result;
    } catch (err: any) {
      console.error('[Admin Mutation Error]', err);
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}

export default useApi;
