export interface Media {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: "public" | "private";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}