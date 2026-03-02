"use client"

import { useState, useEffect, useMemo, useCallback } from "react"

export function useMediaDetail(id: string | string[] | undefined) {
  const mediaId = typeof id === "string" ? id : ""
  const fileUrl = useMemo(() => {
    if (!mediaId) return ""
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${mediaId}/file`
  }, [mediaId])

  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetadata = useCallback(async () => {
    if (!fileUrl) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(fileUrl, {
        method: "HEAD",
        signal: controller.signal
      })

      if (!res.ok) {
        setError("Không tìm thấy tệp tin này.")
        return
      }

      const contentType = res.headers.get("content-type") || ""
      const contentLength = res.headers.get("content-length") || "0"

      setItem({
        id: mediaId,
        filename: mediaId,
        mime_type: contentType,
        size: Number(contentLength),
        created_at: null,
        visibility: "public"
      })
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Đã có lỗi xảy ra khi tải dữ liệu.")
      }
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [fileUrl, mediaId])

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  return {
    item,
    loading,
    error,
    fileUrl,
    refetch: fetchMetadata
  }
}