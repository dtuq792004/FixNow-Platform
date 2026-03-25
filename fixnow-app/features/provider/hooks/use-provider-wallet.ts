import { useCallback, useState } from 'react';
import {
  createWithdrawRequest,
  fetchProviderWallet,
  fetchWithdrawHistory,
  type ProviderWallet,
  type WithdrawRequest,
} from '../services/wallet.service';

interface WithdrawBody {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export const useProviderWallet = () => {
  const [wallet, setWallet] = useState<ProviderWallet | null>(null);
  const [history, setHistory] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // No user._id needed — backend identifies user via JWT (req.user.id)
  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProviderWallet();
      setWallet(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải ví');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await fetchWithdrawHistory();
      setHistory(data);
    } catch (err: any) {
      // Non-blocking — UI shows empty list, but log for debugging
      console.warn('[useProviderWallet] loadHistory failed:', err?.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadWallet(), loadHistory()]);
  }, [loadWallet, loadHistory]);

  const submitWithdraw = useCallback(
    async (body: WithdrawBody): Promise<void> => {
      const newRequest = await createWithdrawRequest(body);
      // Optimistically prepend to history and refresh wallet balance
      setHistory((prev) => [newRequest, ...prev]);
      await loadWallet();
    },
    [loadWallet],
  );

  return {
    wallet,
    history,
    loading,
    historyLoading,
    error,
    loadAll,
    loadWallet,
    loadHistory,
    submitWithdraw,
  };
};
