"use client"
import React, { useState, useMemo } from "react"
import {
  Container,
  Box,
  Pagination,
  Fade,
  useTheme,
  useMediaQuery
} from "@mui/material"
import MediaGridView from "./components/MediaGridView"
import MediaListView from "./components/MediaListView"
import MediaLoading from "./components/MediaLoading"
import MediaEmpty from "./components/MediaEmpty"
import MediaError from "./components/MediaError"
import MediaDeleteDialog from "./components/MediaDeleteDialog"
import MediaHeader from "./components/MediaHeader"
import { useMedia, useDeleteMedia } from "@/hooks/useMedia"
import { buildMasonryLayout } from "@/utils/buildMasonryLayout"
import { useMasonryReveal } from "@/hooks/useMasonryReveal"
import { useMediaActions } from "@/hooks/useMediaActions"

export default function MediaPage() {
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

  if (isError) return <MediaError refetch={refetch} />

  if (isLoading)
    return (
      <MediaLoading
        colCount={colCount}
        skeletonHeights={skeletonHeights}
      />
    )

  if (!data?.data?.length) return <MediaEmpty />

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={!isLoading} timeout={800}>
        <Box>
          <MediaHeader
            viewMode={viewMode}
            onChange={setViewMode}
          />

          {viewMode === "grid" ? (
            <MediaGridView
              items={displayData.slice(0, visibleRows * colCount)}
              colCount={colCount}
              onCopy={handleCopy}
              onDelete={setDeleteId}
              onDownload={handleDownload}
            />
          ) : (
            <MediaListView
              items={data.data}
              onDelete={setDeleteId}
            />
          )}

          <Box display="flex" justifyContent="center" mt={6}>
            <Pagination
              count={data.pagination.totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
            />
          </Box>
        </Box>
      </Fade>

      <MediaDeleteDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMedia(deleteId)
        }}
      />
    </Container>
  )
}