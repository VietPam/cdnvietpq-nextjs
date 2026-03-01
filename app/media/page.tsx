import { api } from "@/lib/api";

interface MediaItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: string;
}

interface MediaResponse {
  success: boolean;
  data: MediaItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);

  const response = await api.get<MediaResponse>(
    `/media?page=${page}&limit=${limit}`
  );

  const items = response.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Media</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-3">
            <p className="font-medium text-sm break-all">
              {item.filename}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.created_at).toLocaleString()}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {(item.size / 1024).toFixed(1)} KB
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 