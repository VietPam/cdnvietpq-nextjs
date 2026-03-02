"use client"
import { downloadMedia } from "@/utils/downloadMedia"
import { copyToClipboard } from "@/utils/copyToClipboard"
import { useGlobalSnackbar } from "@/contexts/GlobalSnackbarProvider"

export function useMediaActions() {
  const { showSnackbar } = useGlobalSnackbar()

  const handleDownload = async (id: any, filename: any) => {
    try {
      await downloadMedia(id, filename)
    } catch {
      showSnackbar("Không thể tải tệp xuống!", "error")
    }
  }

  const handleCopy = async (id: any) => {
    try {
      await copyToClipboard(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`
      )
      showSnackbar("Đã sao chép liên kết!", "success")
    } catch {
      showSnackbar("Không thể sao chép liên kết!", "error")
    }
  }

  return {
    handleDownload,
    handleCopy
  }
}