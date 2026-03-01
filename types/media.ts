export interface MediaItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: "public" | "private";
}

export interface MediaResponse {
  data: MediaItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}