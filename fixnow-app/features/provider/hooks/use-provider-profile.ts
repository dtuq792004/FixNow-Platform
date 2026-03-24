import { useCallback, useEffect, useState } from 'react';
import type { PublicProviderProfile } from '../services/provider-public-profile.service';
import { getProviderProfileApi } from '../services/provider-public-profile.service';

interface UseProviderProfileReturn {
  profile: PublicProviderProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProviderProfile = (providerId: string): UseProviderProfileReturn => {
  const [profile, setProfile] = useState<PublicProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProviderProfileApi(providerId);
      setProfile(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải hồ sơ thợ');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, error, refetch: fetch };
};
