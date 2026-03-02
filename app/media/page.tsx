"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
} from "@mui/material";
import { GridView, ViewList } from "@mui/icons-material";

import MediaGridView from "./components/MediaGridView";
import MediaListView from "./components/MediaListView";
import MediaLoading from "./components/MediaLoading";
import MediaEmpty from "./components/MediaEmpty";
import MediaError from "./components/MediaError";
import MediaDeleteDialog from "./components/MediaDeleteDialog";
import MediaSnackbar from "./components/MediaSnackbar";

export interface MediaItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: string;
  width?: number;
  height?: number;
}

interface MediaResponse {
  data: MediaItem[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    msg: string;
    type: 'success' | 'error';
  }>({ open: false, msg: "", type: "success" });

  const queryClient = useQueryClient();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const colCount = isLg ? 5 : isMd ? 4 : isSm ? 2 : 2;

  const skeletonHeights = useMemo(
    () =>
      Array.from({ length: 15 }, () =>
        Math.floor(Math.random() * (400 - 200 + 1) + 200)
      ),
    []
  );

  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ["media", page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`)
  });

  const displayData = useMemo(() => {
    if (!data?.data) return [];
    const withRatio = data.data.map((item) => ({
      ...item,
      ratio:
        item.height && item.width ? item.height / item.width : 1
    }));
    withRatio.sort((a, b) => b.ratio - a.ratio);

    const result = new Array(withRatio.length);
    for (let i = 0; i < withRatio.length; i++) {
      const row = Math.floor(i / colCount);
      const col = i % colCount;
      const base = row * colCount;
      const itemsInCurrentRow = Math.min(
        colCount,
        withRatio.length - base
      );
      const sortedIndex =
        row % 2 === 0
          ? base + col
          : base + (itemsInCurrentRow - 1 - col);

      result[i] = withRatio[sortedIndex];
    }

    return result;
  }, [data?.data, colCount]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      setSnackbar({
        open: true,
        msg: "Đã xóa tệp thành công",
        type: "success"
      });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["media"] });
    }
  });

  const copyToClipboard = (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      msg: "Đã sao chép liên kết!",
      type: "success"
    });
  };

  const handleDownload = async (
    id: string,
    filename: string
  ) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      setSnackbar({
        open: true,
        msg: "Không thể tải tệp xuống!",
        type: "error"
      });
    }
  };

  if (isError) return <MediaError refetch={refetch} />;
  if (isLoading)
    return (
      <MediaLoading
        colCount={colCount}
        skeletonHeights={skeletonHeights}
      />
    );
  if (!data || data.data.length === 0)
    return <MediaEmpty />;

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
              items={displayData}
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
        open={Boolean(deleteId)}
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
  );
}