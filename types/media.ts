export interface MediaItem {
  id: string
  filename: string
  mime_type: string
  size: number
  created_at: string
  r2_key: string
  visibility: string
  width?: number
  height?: number
}

export interface MediaResponse {
  data: MediaItem[]
  pagination: {
    totalItems: number
    totalPages: number
    currentPage: number
    limit: number
  }
}