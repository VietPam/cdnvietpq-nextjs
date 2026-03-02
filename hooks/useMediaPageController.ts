"use client"
import { useState, useMemo } from "react"
import { useTheme, useMediaQuery } from "@mui/material"
import { useMedia, useDeleteMedia } from "@/hooks/useMedia"
import { useMasonryReveal } from "@/hooks/useMasonryReveal"
import { useMediaActions } from "@/hooks/useMediaActions"
import { buildMasonryLayout } from "@/utils/buildMasonryLayout"

export function useMediaPageController() {
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState("grid")
  const [deleteId, setDeleteId] = useState<any>(null)

  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const colCount = isLg ? 5 : isMd ? 4 : 2

  const skeletonHeights = [
    240, 280, 320, 260, 300,
    220, 340, 270, 310, 290,
    250, 330, 210, 360, 275
  ]

  const { data, isLoading, isError, refetch } = useMedia(page)

  const { deleteMedia } = useDeleteMedia(() => {
    setDeleteId(null)
  })

  const visibleRows = useMasonryReveal(
    data?.data?.length || 0,
    colCount
  )

  const { handleDownload, handleCopy } = useMediaActions()

  const displayData = useMemo(() => {
    if (!data?.data) return []
    return buildMasonryLayout(data.data, colCount)
  }, [data?.data, colCount])

  return {
    page,
    setPage,
    viewMode,
    setViewMode,
    deleteId,
    setDeleteId,
    colCount,
    skeletonHeights,
    data,
    isLoading,
    isError,
    refetch,
    deleteMedia,
    visibleRows,
    handleDownload,
    handleCopy,
    displayData
  }
}