'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataOptions<T> {
  url: string;
  enabled?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
}

// Global cache for data
const dataCache = new Map<string, { data: any; timestamp: number }>();
const listeners = new Map<string, Set<() => void>>();

// Notify all listeners for a key
function notifyListeners(key: string) {
  const keyListeners = listeners.get(key);
  if (keyListeners) {
    keyListeners.forEach(listener => listener());
  }
}

// Subscribe to data changes
export function subscribeToData(key: string, listener: () => void) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(listener);
  
  return () => {
    listeners.get(key)?.delete(listener);
  };
}

// Invalidate cache for a specific key or pattern
export function invalidateCache(pattern: string) {
  // Find all keys that match the pattern
  const keysToInvalidate: string[] = [];
  dataCache.forEach((_, key) => {
    if (key.includes(pattern) || pattern.includes(key) || key === pattern) {
      keysToInvalidate.push(key);
    }
  });
  
  // Remove from cache and notify listeners
  keysToInvalidate.forEach(key => {
    dataCache.delete(key);
    notifyListeners(key);
  });
}

// Clear all cache
export function clearAllCache() {
  dataCache.clear();
  listeners.forEach((keyListeners, key) => {
    keyListeners.forEach(listener => listener());
  });
}

// Main hook for data fetching with automatic refresh
export function useData<T>(options: UseDataOptions<T>): UseDataReturn<T> {
  const { url, enabled = true, refreshInterval, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const result = await res.json();
      const newData = result.success ? result.data : result;
      
      // Update cache
      dataCache.set(url, { data: newData, timestamp: Date.now() });
      
      setData(newData);
      onSuccess?.(newData);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  // Subscribe to cache changes
  useEffect(() => {
    const unsubscribe = subscribeToData(url, fetchData);
    return unsubscribe;
  }, [url, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Manual mutate function
  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData(prev => {
      const resolved = typeof newData === 'function' 
        ? (newData as (prev: T | null) => T)(prev) 
        : newData;
      dataCache.set(url, { data: resolved, timestamp: Date.now() });
      notifyListeners(url);
      return resolved;
    });
  }, [url]);

  return { data, loading, error, refetch: fetchData, mutate };
}

// Hook for mutations (POST, PUT, DELETE)
interface UseMutationOptions<T, P> {
  url: string;
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  onSuccess?: (data: T, variables: P) => void;
  onError?: (error: Error, variables: P) => void;
  invalidateKeys?: string[];
}

interface UseMutationReturn<T, P> {
  mutate: (variables: P) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useMutation<T, P>(options: UseMutationOptions<T, P>): UseMutationReturn<T, P> {
  const { url, method = 'POST', onSuccess, onError, invalidateKeys = [] } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (variables: P): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || `HTTP error! status: ${res.status}`);
      }
      
      const newData = result.data || result;
      setData(newData);
      
      // Invalidate related cache keys
      invalidateKeys.forEach(key => invalidateCache(key));
      
      // Also invalidate the base URL patterns
      const baseUrl = url.split('?')[0];
      invalidateCache(baseUrl);
      
      onSuccess?.(newData, variables);
      return newData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error, variables);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, method, onSuccess, onError, invalidateKeys]);

  return { mutate, loading, error, data };
}

// Convenience hooks for common operations
export function useEvents() {
  return useData<{ events: any[]; total: number }>({
    url: '/api/events?limit=100',
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

export function useRooms() {
  return useData<{ rooms: any[]; total: number }>({
    url: '/api/rooms?limit=100',
    refreshInterval: 30000,
  });
}

export function useActivities() {
  return useData<{ activities: any[]; total: number }>({
    url: '/api/activities?limit=100',
    refreshInterval: 15000, // Refresh more frequently for activities
  });
}

export function useProjects() {
  return useData<{ projects: any[]; total: number }>({
    url: '/api/projects?limit=100',
    refreshInterval: 30000,
  });
}

export function useDashboard() {
  return useData<{
    stats: any;
    leaderboard: any[];
    upcomingActivities: any[];
  }>({
    url: '/api/dashboard',
    refreshInterval: 15000, // Refresh every 15 seconds for dashboard
  });
}

export function useAchievements() {
  return useData<{ earned: any[]; available: any[]; stats: any }>({
    url: '/api/achievements',
  });
}

export function useNotifications() {
  return useData<{ notifications: any[]; unreadCount: number }>({
    url: '/api/notifications?limit=50',
    refreshInterval: 10000, // Refresh every 10 seconds
  });
}
