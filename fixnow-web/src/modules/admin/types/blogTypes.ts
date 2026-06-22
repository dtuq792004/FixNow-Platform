export type BlogStatus = 'DRAFT' | 'PUBLISHED'

export type BlogImage = {
  url: string
  alt: string
  caption: string
}

export type BlogSection = {
  _id?: string
  label?: string
  heading: string
  content: string
  images: BlogImage[]
  quote: string
  tips: string[]
}

export type BlogAuthor = {
  _id: string
  fullName: string
  email?: string
  avatar?: string
}

export type Blog = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  categoryId?: { _id: string; name: string; type?: string; iconUrl?: string } | string | null
  serviceName?: string
  tags: string[]
  coverImage: BlogImage
  sections: BlogSection[]
  status: BlogStatus
  isFeatured: boolean
  readTimeMinutes: number
  seoTitle: string
  seoDescription: string
  authorId: BlogAuthor
  publishedAt: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
}

export type BlogPayload = Omit<
  Blog,
  '_id' | 'authorId' | 'viewCount' | 'createdAt' | 'updatedAt'
>
