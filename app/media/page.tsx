"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Container, Card, Typography, Stack, Button, IconButton,
  Dialog, DialogTitle, DialogActions, Box, Pagination, Skeleton,
  Tooltip, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert, Snackbar, Chip,
  useTheme, useMediaQuery, Fade
} from "@mui/material";
import Masonry from '@mui/lab/Masonry';
import {
  DeleteOutline, ContentCopy, Download,
  GridView, ViewList, ErrorOutline, CloudUpload,
  Visibility, PlayCircleOutline
} from '@mui/icons-material';
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

interface MediaItem {
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
  const [snackbar, setSnackbar] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({
    open: false, msg: '', type: 'success'
  });

  const queryClient = useQueryClient();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const colCount = isLg ? 5 : isMd ? 4 : isSm ? 2 : 2;

  // Giả lập mảng chiều cao ngẫu nhiên cho Skeleton để nhìn giống Masonry thật
  const skeletonHeights = useMemo(() => 
    Array.from({ length: 15 }, () => Math.floor(Math.random() * (400 - 200 + 1) + 200)), 
  []);

  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ['media', page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`),
  });

  const displayData = useMemo(() => {
    if (!data?.data) return [];
    const withRatio = data.data.map(item => ({
      ...item,
      ratio: (item.height && item.width) ? (item.height / item.width) : 1
    }));
    withRatio.sort((a, b) => b.ratio - a.ratio);
    const result = new Array(withRatio.length);
    for (let i = 0; i < withRatio.length; i++) {
      const row = Math.floor(i / colCount);
      const col = i % colCount;
      const base = row * colCount;
      const itemsInCurrentRow = Math.min(colCount, withRatio.length - base);
      let sortedIndex = (row % 2 === 0) ? (base + col) : (base + (itemsInCurrentRow - 1 - col));
      result[i] = withRatio[sortedIndex];
    }
    return result;
  }, [data?.data, colCount]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      setSnackbar({ open: true, msg: 'Đã xóa tệp thành công', type: 'success' });
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  const copyToClipboard = (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, msg: 'Đã sao chép liên kết!', type: 'success' });
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setSnackbar({ open: true, msg: 'Không thể tải tệp xuống!', type: 'error' });
    }
  };

  if (isError) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Đã xảy ra lỗi khi tải dữ liệu</Typography>
      <Button onClick={() => refetch()} variant="contained" sx={{ mt: 2 }}>Thử lại</Button>
    </Container>
  );

  // --- UI LOADING MỚI: MASONRY GHOST GRID ---
  if (isLoading) return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Skeleton cho Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Skeleton variant="text" width={280} height={60} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
      </Stack>

      <Masonry columns={colCount} spacing={1.5}>
        {skeletonHeights.map((h, i) => (
          <Box key={i} sx={{ mb: 1.5 }}>
             <Skeleton 
              variant="rectangular" 
              height={h} 
              sx={{ 
                borderRadius: 3,
                animationDuration: `${1 + i * 0.1}s` // Hiệu ứng pulse so le nhẹ
              }} 
            />
          </Box>
        ))}
      </Masonry>

      {/* Skeleton cho Pagination */}
      <Box display="flex" justifyContent="center" mt={6}>
        <Skeleton variant="rectangular" width={300} height={40} sx={{ borderRadius: 2 }} />
      </Box>
    </Container>
  );

  if (!data || data.data.length === 0) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <CloudUpload sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>Thư viện trống</Typography>
      <Button component={Link} href="/media/upload" variant="contained">Tải lên file đầu tiên</Button>
    </Container>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={!isLoading} timeout={800}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>Thư viện Media</Typography>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
              <ToggleButton value="grid"><GridView fontSize="small" /></ToggleButton>
              <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {viewMode === 'grid' ? (
            <Masonry columns={colCount} spacing={1.5}>
              {displayData.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    borderRadius: 3, position: 'relative', border: 'none', overflow: 'hidden',
                    bgcolor: 'grey.100',
                    aspectRatio: `${item.width || 1} / ${item.height || 1}`,
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)' },
                    '&:hover .overlay-content': { opacity: 1 },
                  }}
                >
                  <Box sx={{ lineHeight: 0, height: '100%', overflow: 'hidden' }}>
                    <MediaRenderer
                      url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
                      mimeType={item.mime_type}
                      preview
                    />
                  </Box>

                  {item.mime_type.startsWith('video/') && (
                    <Box sx={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      color: 'white', opacity: 0.6, pointerEvents: 'none', zIndex: 1
                    }}>
                      <PlayCircleOutline sx={{ fontSize: 48 }} />
                    </Box>
                  )}

                  <Box
                    className="overlay-content"
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      p: 1.5, opacity: 0, transition: 'opacity 0.3s ease-in-out', zIndex: 2
                    }}
                  >
                    <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                      <Tooltip title="Copy link">
                        <IconButton size="small" onClick={() => copyToClipboard(item.id)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                          <ContentCopy fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" onClick={() => setDeleteId(item.id)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: '#ff4444' } }}>
                          <DeleteOutline fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Box>
                      <Typography variant="caption" noWrap sx={{ color: 'white', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        {item.filename}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                          {formatBytes(item.size)}
                        </Typography>
                        <IconButton size="small" sx={{ color: 'white', p: 0 }} onClick={() => handleDownload(item.id, item.filename)}>
                          <Download sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Masonry>
          ) : (
            /* List View ... */
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell width={70}>Xem</TableCell>
                <TableCell>Tên tệp</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Dung lượng</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden' }}>
                      <MediaRenderer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} mimeType={item.mime_type} preview />
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600} noWrap>{item.filename}</Typography></TableCell>
                  <TableCell><Chip label={item.mime_type.split('/')[1]} size="small" variant="outlined" /></TableCell>
                  <TableCell>{formatBytes(item.size)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}><DeleteOutline fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box display="flex" justifyContent="center" mt={6}>
            <Pagination count={data.pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
          </Box>
        </Box>
      </Fade>

   {/* Dialog & Snackbar */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa tệp?</DialogTitle>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Hủy bỏ</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.type} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
}