"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Container, Card, Typography, Stack, Button, IconButton, 
  Dialog, DialogTitle, DialogActions, Box, Pagination, Skeleton, 
  Tooltip, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Alert, Snackbar, Chip
} from "@mui/material";
import Masonry from '@mui/lab/Masonry';
import {
  DeleteOutline, ContentCopy, Download, 
  GridView, ViewList, ErrorOutline, CloudUpload
} from '@mui/icons-material';
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

// 1. Định nghĩa Interface
interface MediaItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: string;
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

  // 2. Fetch dữ liệu với React Query (Tăng limit để Masonry trông đầy đặn hơn)
  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ['media', page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`),
  });

  // 3. Mutation xóa tệp (Optimistic Updates)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['media', page] });
      const previousData = queryClient.getQueryData<MediaResponse>(['media', page]);
      if (previousData) {
        queryClient.setQueryData(['media', page], {
          ...previousData,
          data: previousData.data.filter(item => item.id !== id)
        });
      }
      return { previousData };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['media', page], context?.previousData);
      setSnackbar({ open: true, msg: 'Lỗi khi xóa tệp!', type: 'error' });
    },
    onSuccess: () => {
      setSnackbar({ open: true, msg: 'Đã xóa tệp thành công', type: 'success' });
      setDeleteId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });

  // 4. Các hàm xử lý tiện ích
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

  // --- RENDERING LOGIC ---

  if (isError) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Đã xảy ra lỗi khi tải dữ liệu</Typography>
      <Button onClick={() => refetch()} variant="contained" sx={{ mt: 2 }}>Thử lại</Button>
    </Container>
  );

  if (isLoading) return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton width={250} height={50} sx={{ mb: 4 }} />
      <Masonry columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={1.5}>
        {[300, 200, 400, 250, 350, 280, 180, 320, 240, 310].map((h, i) => (
          <Skeleton key={i} variant="rectangular" height={h} sx={{ borderRadius: 3 }} />
        ))}
      </Masonry>
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
      {/* Header & View Toggle */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>Thư viện Media</Typography>
        <ToggleButtonGroup 
          value={viewMode} 
          exclusive 
          onChange={(_, v) => v && setViewMode(v)} 
          size="small"
        >
          <ToggleButton value="grid"><GridView fontSize="small" /></ToggleButton>
          <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Grid View (Masonry) */}
      {viewMode === 'grid' ? (
        <Masonry columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={1.5}>
          {data.data.map((item) => (
            <Card 
              key={item.id}
              sx={{ 
                borderRadius: 3, 
                position: 'relative',
                border: 'none',
                overflow: 'hidden',
                backgroundColor: 'grey.100',
                '&:hover .overlay-content': { opacity: 1 },
                '&:hover img, &:hover video': { transform: 'scale(1.05)' }
              }}
            >
              {/* Media Container */}
              <Box sx={{ lineHeight: 0, overflow: 'hidden', transition: '0.3s' }}>
                <MediaRenderer 
                  url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} 
                  mimeType={item.mime_type} 
                  preview 
                />
              </Box>

              {/* Floating Metadata & Actions Overlay */}
              <Box 
                className="overlay-content"
                sx={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1.5,
                  opacity: 0, // Seamless Hover: Mặc định ẩn
                  transition: 'opacity 0.3s ease-in-out',
                  zIndex: 2
                }}
              >
                {/* Nút hành động phía trên */}
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <IconButton 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'white', color: 'black' } }}
                    onClick={(e) => { e.preventDefault(); copyToClipboard(item.id); }}
                  >
                    <ContentCopy fontSize="inherit" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: '#ff4444' } }}
                    onClick={(e) => { e.preventDefault(); setDeleteId(item.id); }}
                  >
                    <DeleteOutline fontSize="inherit" />
                  </IconButton>
                </Stack>

                {/* Thông tin tệp phía dưới */}
                <Box>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, display: 'block', mb: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {item.filename}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                      {formatBytes(item.size)}
                    </Typography>
                    <Tooltip title="Tải xuống">
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', p: 0 }}
                        onClick={(e) => { e.preventDefault(); handleDownload(item.id, item.filename); }}
                      >
                        <Download sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            </Card>
          ))}
        </Masonry>
      ) : (
        /* List View */
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
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden' }}>
                      <MediaRenderer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} mimeType={item.mime_type} preview />
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600} noWrap>{item.filename}</Typography></TableCell>
                  <TableCell><Chip label={item.mime_type.split('/')[1]} size="small" variant="outlined" /></TableCell>
                  <TableCell>{formatBytes(item.size)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => copyToClipboard(item.id)}><ContentCopy fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}><DeleteOutline fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Phân trang */}
      <Box display="flex" justifyContent="center" mt={6}>
        <Pagination count={data.pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa tệp?</DialogTitle>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Hủy bỏ</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.type} variant="filled" sx={{ width: '100%' }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
}