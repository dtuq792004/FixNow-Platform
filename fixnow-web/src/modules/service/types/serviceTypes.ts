export type Category = {
  _id: string
  name: string
  type: string
  description?: string
  iconUrl?: string
  isActive: boolean
}

export type Service = {
  _id: string
  name: string
  description?: string
  price: number
  unit: 'hour' | 'job'
  image?: string[]
  categoryId?: Category | string
  providerId?: {
    _id: string
    fullName: string
    avatar?: string
  }
}
