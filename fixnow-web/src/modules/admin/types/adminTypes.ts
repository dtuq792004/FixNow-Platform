export type Paginated<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number }
export type NamedUser = { _id: string; fullName: string; email?: string; phone?: string }
export type AdminUser = NamedUser & { avatar?: string | null; role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'; status: 'ACTIVE' | 'INACTIVE' | 'BANNED'; createdAt: string }
export type AdminRequest = { _id: string; title?: string; description?: string; customerId: NamedUser; providerId?: NamedUser; services?: Array<{ _id: string; name: string }>; categoryId?: { _id: string; name: string }; status: string; requestType: string; finalPrice: number; createdAt: string }
export type AdminDashboard = { summary: { totalUsers: number; totalProviders: number; totalRequests: number; pendingRequests: number; grossRevenue: number; platformRevenue: number }; revenueByDay: Array<{ _id: string; value: number }>; latestRequests: AdminRequest[]; topProviders: Array<{ _id: string; name: string; category?: string; completed: number; revenue: number }> }
export type AdminCategory = { _id: string; name: string; type: string; description?: string; iconUrl?: string; isActive: boolean; serviceCount: number; requestCount: number; updatedAt: string }
export type AdminService = {
  _id: string
  name: string
  description?: string
  price: number
  unit: 'hour' | 'job'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  image?: string[]
  providerId?: NamedUser & { avatar?: string | null }
  categoryId?: { _id: string; name: string; type?: string; iconUrl?: string }
  createdAt: string
}
export type AdminPayment = { _id: string; orderCode: number; transactionRef?: string; amount: number; platformFee: number; status: string; createdAt: string }
export type AdminFeedback = { _id: string; customerId: NamedUser; providerId?: { userId?: NamedUser }; servicesFeedbacks: Array<{ rating: number; comment?: string }>; status: 'VISIBLE' | 'HIDDEN'; createdAt: string }
export type AdminComplaint = { _id: string; content: string; warrantyRequested: boolean; status: 'OPEN' | 'PROCESSING' | 'RESOLVED'; customerId: NamedUser; providerId: NamedUser; requestId?: { title?: string; description?: string; finalPrice?: number; media?: string[]; completionMedia?: string[] }; createdAt: string }
export type ProviderApplication = {
  _id: string
  userId?: NamedUser
  fullName: string
  phone: string
  experience: string
  specialties: Array<{ _id: string; name: string }>
  serviceArea: string
  idCard: string
  motivation?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedAt?: string
  rejectionReason?: string
  createdAt: string
}
export type AdminWithdrawal = { _id: string; userId: NamedUser; amount: number; status: 'PENDING' | 'APPROVED' | 'REJECTED'; bankName: string; accountNumber: string; accountHolder: string; createdAt: string }
export type AdminSettings = { platformFeePercent: number; minWithdrawAmount: number; terms: string }
export type AdminReport = { revenueByMonth: Array<{ _id: string; revenue: number }>; categoryUsage: Array<{ name: string; total: number }>; completedJobs: number; averageRating: number; newUsers: number; withdrawals: Array<{ _id: string; amount: number; count: number }> }
