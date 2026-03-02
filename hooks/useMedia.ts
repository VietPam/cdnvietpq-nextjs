import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { MediaResponse } from "@/types/media"

export const useMedia = (page: number) => {
  return useQuery<MediaResponse>({
    queryKey: ["media", page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`)
  })
}

export const useDeleteMedia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
    }
  })
}