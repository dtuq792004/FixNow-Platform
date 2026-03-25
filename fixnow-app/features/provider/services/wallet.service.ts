import apiClient from '~/lib/api-client';

// ── Response shapes ───────────────────────────────────────────────────────────

interface WalletApiResponse {
  success: boolean;
  data: {
    _id: string;
    userId: string;
    balance: number;
    pending: number;
    totalEarned: number;
    totalWithdrawn: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface WithdrawRequestItem {
  _id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  rejectReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateWithdrawBody {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface ProviderWallet {
  id: string;
  balance: number;
  pending: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export interface WithdrawRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  rejectReason?: string;
  processedAt?: string;
  createdAt: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

const mapWallet = (raw: WalletApiResponse['data']): ProviderWallet => ({
  id: raw._id,
  balance: raw.balance,
  pending: raw.pending,
  totalEarned: raw.totalEarned,
  totalWithdrawn: raw.totalWithdrawn,
  updatedAt: raw.updatedAt,
});

const mapWithdrawRequest = (raw: WithdrawRequestItem): WithdrawRequest => ({
  id: raw._id,
  amount: raw.amount,
  status: raw.status,
  bankName: raw.bankName,
  accountNumber: raw.accountNumber,
  accountHolder: raw.accountHolder,
  rejectReason: raw.rejectReason,
  processedAt: raw.processedAt,
  createdAt: raw.createdAt,
});

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /finance/my-wallet — wallet of the currently authenticated user */
export const fetchProviderWallet = async (): Promise<ProviderWallet> => {
  const res = await apiClient.get<WalletApiResponse>('/finance/my-wallet');
  return mapWallet(res.data.data);
};

/** GET /withdraw/provider/withdraws */
export const fetchWithdrawHistory = async (): Promise<WithdrawRequest[]> => {
  const res = await apiClient.get<WithdrawRequestItem[]>('/withdraw/provider/withdraws');
  return res.data.map(mapWithdrawRequest);
};

/** POST /withdraw/provider/withdraw */
export const createWithdrawRequest = async (body: CreateWithdrawBody): Promise<WithdrawRequest> => {
  const res = await apiClient.post<{ message: string; data: WithdrawRequestItem }>(
    '/withdraw/provider/withdraw',
    body,
  );
  return mapWithdrawRequest(res.data.data);
};
