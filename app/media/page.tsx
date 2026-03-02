"use client"
import React, { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
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
import MediaSnackbar from "./components/MediaSnackbar"
import { MediaItem, MediaResponse } from "@/types/media"

export default function MediaPage() {
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [visibleRows, setVisibleRows] = useState(1)
  const [snackbar, setSnackbar] = useState<any>({
    open: false,
    msg: "",
    type: "success"
  })

  const queryClient = useQueryClient()
  const theme = useTheme()

  const isSm = useMediaQuery(theme.breakpoints.down("md"))
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"))
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))

  const colCount = isLg ? 5 : isMd ? 4 : 2

  const skeletonHeights = useMemo(
    () => Array.from({ length: 15 }, () => Math.floor(Math.random() * 200 + 200)),
    []
  )

  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ["media", page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`)
  })

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

    const items = data.data
      .map(i => ({
        ...i,
        ratio: i.height && i.width ? i.height / i.width : 1
      }))
      .sort((a, b) => b.ratio - a.ratio)

    return items.map((_, i, arr) => {
      const row = Math.floor(i / colCount)
      const col = i % colCount
      const base = row * colCount
      const countInRow = Math.min(colCount, arr.length - base)

      return arr[
        row % 2 === 0
          ? base + col
          : base + (countInRow - 1 - col)
      ]
    })
  }, [data?.data, colCount])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      setSnackbar({
        open: true,
        msg: "Đã xóa tệp thành công",
        type: "success"
      })
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ["media"] })
    }
  })

  const handleDownload = async (id: string, filename: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`
      )
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setSnackbar({
        open: true,
        msg: "Không thể tải tệp xuống!",
        type: "error"
      })
    }
  }

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`
    )
    setSnackbar({
      open: true,
      msg: "Đã sao chép liên kết!",
      type: "success"
    })
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
              onCopy={copyToClipboard}
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
        onConfirm={() =>
          deleteId && deleteMutation.mutate(deleteId)
        }
      />

      <MediaSnackbar
        snackbar={snackbar}
        setSnackbar={setSnackbar}
      />
    </Container>
  )
}