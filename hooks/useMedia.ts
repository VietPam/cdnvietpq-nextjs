"use client"
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useGlobalSnackbar } from "@/contexts/GlobalSnackbarProvider"

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
const LIMIT = 20

export function useMedia(page: number) {
  return useQuery<any>({
    queryKey: ["media", page],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/media?page=${page}&limit=${LIMIT}`
      )
      if (!res.ok) throw new Error("Failed to fetch media")
      return res.json()
    },
    placeholderData: keepPreviousData
  })
}

export function useDeleteMedia(onSuccessClose?: () => void) {
  const queryClient = useQueryClient()
  const { showSnackbar } = useGlobalSnackbar()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${BASE_URL}/media/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Delete failed")
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
      showSnackbar("Đã xóa tệp thành công", "success")
      if (onSuccessClose) onSuccessClose()
    },
    onError: () => {
      showSnackbar("Không thể xóa tệp!", "error")
    }
  })

  return {
    deleteMedia: mutation.mutate,
    isDeleting: mutation.isPending
  }
}