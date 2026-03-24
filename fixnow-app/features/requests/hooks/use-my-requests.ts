/**
 * Shared hook for customer's own requests.
 * Uses a module-level cache so Home and Profile tabs share one API call
 * and stay in sync — when one tab refetches, all instances update.
 */
import { useCallback, useEffect, useState } from 'react';
import { getMyRequestsApi } from '../services/request.service';
import type { ServiceRequestDetail } from '../types';

// ── Module-level shared state ─────────────────────────────────────────────────
let _cache: ServiceRequestDetail[] | null = null;
let _fetching = false;
const _subscribers = new Set<() => void>();

const notify = () => _subscribers.forEach((fn) => fn());

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useMyRequests = () => {
  const [requests, setRequests] = useState<ServiceRequestDetail[]>(_cache ?? []);
  const [isLoading, setIsLoading] = useState(_cache === null);

  // Subscribe so this instance re-renders when another tab fetches new data
  useEffect(() => {
    const update = () => setRequests([...(_cache ?? [])]);
    _subscribers.add(update);
    return () => { _subscribers.delete(update); };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (_cache !== null && !force) {
      setRequests([..._cache]);
      setIsLoading(false);
      return;
    }
    if (_fetching) return;

    _fetching = true;
    setIsLoading(true);
    try {
      const data = await getMyRequestsApi();
      _cache = data;
      notify();
    } catch {
      // silent — caller shows empty state
    } finally {
      _fetching = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { requests, isLoading, refetch };
};

/** Call this after a mutation (cancel, create) to invalidate the cache. */
export const invalidateMyRequests = () => { _cache = null; };
