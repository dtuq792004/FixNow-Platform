import { useCallback, useEffect, useState } from 'react';
import {
  fetchProviderStatus,
  updateProviderStatus,
  updateProviderWorkingAreas,
} from '~/features/provider/services/provider.service';
import type { ProviderStatus } from '~/features/provider/types/provider.types';

interface UseProviderStatusReturn {
  providerStatus: ProviderStatus | null;
  isLoading: boolean;    // initial fetch
  isUpdating: boolean;   // mutation (updateStatus / updateWorkingAreas)
  error: string | null;
  updateStatus: (activeStatus: 'ONLINE' | 'OFFLINE') => Promise<void>;
  updateWorkingAreas: (workingAreas: string[]) => Promise<void>;
  reload: () => Promise<void>;
}

export const useProviderStatus = (): UseProviderStatusReturn => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProviderStatus();
      setProviderStatus(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải thông tin provider');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = useCallback(async (activeStatus: 'ONLINE' | 'OFFLINE') => {
    try {
      setIsUpdating(true);
      const updated = await updateProviderStatus(activeStatus);
      setProviderStatus(updated);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể cập nhật trạng thái');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateWorkingAreas = useCallback(async (workingAreas: string[]) => {
    try {
      setIsUpdating(true);
      const updated = await updateProviderWorkingAreas(workingAreas);
      setProviderStatus(updated);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể cập nhật khu vực làm việc');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    providerStatus,
    isLoading,
    isUpdating,
    error,
    updateStatus,
    updateWorkingAreas,
    reload: load,
  };
};
