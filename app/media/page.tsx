"use client"
import React, { useState, useMemo, useEffect } from "react"
import {
  Container,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Pagination,
  Fade,
  useTheme,
  useMediaQuery
} from "@mui/material"
import { GridView, ViewList } from "@mui/icons-material"
import MediaGridView from "./components/MediaGridView"
import MediaListView from "./components/MediaListView"
import MediaLoading from "./components/MediaLoading"
import MediaEmpty from "./components/MediaEmpty"
import MediaError from "./components/MediaError"
import MediaDeleteDialog from "./components/MediaDeleteDialog"
import { useMedia, useDeleteMedia } from "@/hooks/useMedia"
import { buildMasonryLayout } from "@/utils/buildMasonryLayout"
import { downloadMedia } from "@/utils/downloadMedia"
import { copyToClipboard } from "@/utils/copyToClipboard"
import { useGlobalSnackbar } from "@/contexts/GlobalSnackbarProvider"

export default function MediaPage() {
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [visibleRows, setVisibleRows] = useState(1)

  const { showSnackbar } = useGlobalSnackbar()

  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const colCount = isLg ? 5 : isMd ? 4 : 2

  const skeletonHeights = useMemo(
    () => [
      240, 280, 320, 260, 300,
      220, 340, 270, 310, 290,
      250, 330, 210, 360, 275
    ],
    []
  )

  const { data, isLoading, isError, refetch } = useMedia(page)
  const deleteMutation = useDeleteMedia()

  useEffect(() => {
    setVisibleRows(1)
  }, [page])

  useEffect(() => {
    if (!data?.data || visibleRows >= Math.ceil(data.data.length / colCount))
      return

    const timer = setTimeout(() => {
      setVisibleRows(v => v + 1)
    }, 200)

    return () => clearTimeout(timer)
  }, [visibleRows, data?.data, colCount])

  const displayData = useMemo(() => {
    if (!data?.data) return []
    return buildMasonryLayout(data.data, colCount)
  }, [data?.data, colCount])

  const handleDownload = async (id: string, filename: string) => {
    try {
      await downloadMedia(id, filename)
    } catch {
      showSnackbar("Không thể tải tệp xuống!", "error")
    }
  }

  const handleCopy = async (id: string) => {
    try {
      await copyToClipboard(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`
      )
      showSnackbar("Đã sao chép liên kết!", "success")
    } catch {
      showSnackbar("Không thể sao chép liên kết!", "error")
    }
  }

  const handleDeleteSuccess = () => {
    showSnackbar("Đã xóa tệp thành công", "success")
    setDeleteId(null)
  }

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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography variant="h4" fontWeight={800}>
              Thư viện Media
            </Typography>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridView fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

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
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: handleDeleteSuccess
            })
          }
        }}
      />
    </Container>
  )
}