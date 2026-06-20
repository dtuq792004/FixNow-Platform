export type EntityRef = { _id: string; name?: string; type?: string }
export type UserRef = { _id: string; fullName: string; avatar?: string; phone?: string; email?: string }
export type AddressRef = {
  _id?: string
  addressLine?: string
  street?: string
  ward?: string
  district?: string
  city?: string
  latitude?: number
  longitude?: number
}

export type ProviderJobStatus =
  | 'AWAITING_PAYMENT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type ProviderJob = {
  _id: string
  customerId: UserRef
  providerId?: string | UserRef
  conversationId?: string
  categoryId?: EntityRef
  addressId?: AddressRef
  addressText?: string
  services?: Array<EntityRef & { price?: number }>
  title?: string
  description?: string
  note?: string
  media?: string[]
  completionMedia?: string[]
  completionNote?: string
  requestType: 'NORMAL' | 'URGENT' | 'RECURRING'
  totalPrice: number
  finalPrice: number
  status: ProviderJobStatus
  startAt: string
  providerCompletedAt?: string
  createdAt: string
  updatedAt: string
}

export type ProviderJobFilter = 'ALL' | Exclude<ProviderJobStatus, 'AWAITING_PAYMENT'>

export type PaginatedProviderJobs = {
  docs: ProviderJob[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  statusCounts: Record<ProviderJobFilter, number>
}

export type ProviderProfile = {
  _id: string
  userId: string
  description: string
  experienceYears: number
  activeStatus: 'ONLINE' | 'OFFLINE'
  verified: boolean
  serviceCategories: EntityRef[] | string[]
  workingAreas: string[]
  operatingRadiusKm: number
  workingSchedule: {
    weekdays: ProviderSchedulePeriod
    saturday: ProviderSchedulePeriod
    sunday: ProviderSchedulePeriod
  }
  user: UserRef & {
    email: string
    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  }
  stats: {
    completedJobs: number
    averageRating: number
    totalReviews: number
  }
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
  } | null
}

export type ProviderSchedulePeriod = {
  enabled: boolean
  start: string
  end: string
}

export type ProviderService = {
  _id: string
  categoryId?: EntityRef
  name: string
  description?: string
  price: number
  unit: 'hour' | 'job'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  image?: string[]
  createdAt: string
}

export type Wallet = {
  _id: string
  balance: number
  pending: number
  totalEarned: number
  totalWithdrawn: number
}

export type RevenuePoint = {
  _id: { year: number; month?: number; day?: number }
  periodStart?: string
  label?: string
  totalRevenue: number
  totalOrders: number
}

export type WithdrawRequest = {
  _id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  bankName: string
  accountNumber: string
  accountHolder: string
  createdAt: string
}

export type ProviderFeedback = {
  _id: string
  requestId?: { _id: string; title?: string; description?: string }
  customerId: UserRef
  providerReply?: string
  status: 'VISIBLE' | 'HIDDEN'
  servicesFeedbacks: Array<{ _id?: string; rating: number; comment?: string }>
  createdAt: string
}

export type PaginatedFeedback = {
  docs: ProviderFeedback[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
}

export type ProviderNotification = {
  _id: string
  title: string
  message: string
  type: string
  entityId?: string
  entityType?: string
  isRead: boolean
  createdAt: string
}
