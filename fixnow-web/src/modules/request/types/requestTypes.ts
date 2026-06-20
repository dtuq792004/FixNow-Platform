import type { Category } from '../../service/types/serviceTypes'
import type { Address } from '../../profile/types/addressTypes'

export type RequestStatus =
  | 'AWAITING_PAYMENT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type RequestItem = {
  _id: string
  categoryId?: Category | string
  addressId?: Address | string
  addressText?: string
  providerId?: {
    _id: string
    fullName: string
    avatar?: string
    phone?: string
  } | string
  conversationId?: string
  services?: Array<string | { _id: string; name: string; price: number }>
  title?: string
  description?: string
  note?: string
  media?: string[]
  requestType: 'NORMAL' | 'URGENT' | 'RECURRING'
  totalPrice: number
  discountAmount: number
  finalPrice: number
  status: RequestStatus
  startAt: string
  createdAt: string
  updatedAt: string
  completionMedia?: string[]
  completionNote?: string
}

export type CreateRequestPayload = {
  categoryId: string
  addressId: string
  title: string
  description: string
  services?: string[]
  requestType?: 'NORMAL' | 'URGENT' | 'RECURRING'
  startAt?: string
}
