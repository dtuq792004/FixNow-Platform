import type { Category } from '../../service/types/serviceTypes'

export type CustomerNotification = {
  _id: string
  title: string
  message: string
  type: string
  entityId?: string
  entityType?: string
  isRead: boolean
  createdAt: string
}

export type FeaturedProvider = {
  _id: string
  avgRating: number
  reviewCount: number
  experienceYears: number
  description?: string
  workingAreas: string[]
  userId: {
    fullName: string
    avatar?: string
    phone?: string
  }
  serviceCategories: Category[]
}
