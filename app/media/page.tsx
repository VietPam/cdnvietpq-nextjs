"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Container, Grid, Card, CardContent, Typography, Stack, Button, IconButton, 
  Dialog, DialogTitle, DialogActions, Box, Pagination, Skeleton, 
  Tooltip, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Alert, Snackbar,
  Chip // <--- Thêm dòng này
} from "@mui/material";
import {
  DeleteOutline, ContentCopy, Download,
  GridView, ViewList, ErrorOutline, CloudUpload
} from '@mui/icons-material';
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";
import { MediaItem, MediaResponse } from "@/types/media";

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, msg: string, type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' });

  const queryClient = useQueryClient();

  // 1. Fetch dữ liệu với Cache & Error Boundary logic
  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ['media', page],
    queryFn: () => api.get(`/media?page=${page}&limit=8`),
    retry: 1,
  });

  // 2. Mutation với Optimistic Updates (Cập nhật giao diện tức thì)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['media', page] });
      const previousData = queryClient.getQueryData<MediaResponse>(['media', page]);

      // Xóa tạm thời trong Cache để UI cập nhật ngay
      if (previousData) {
        queryClient.setQueryData(['media', page], {
          ...previousData,
          data: previousData.data.filter(item => item.id !== deletedId)
        });
      }
      return { previousData };
    },
    onError: (err, newTodo, context) => {
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

  // 3. Helper Functions
  const copyToClipboard = (id: string) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, msg: 'Đã sao chép liên kết!', type: 'success' });
  };

  const handleDownload = (id: string, filename: string) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- TRẠNG THÁI UI ---

  if (isError) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Không thể tải dữ liệu</Typography>
      <Button onClick={() => refetch()} variant="outlined" sx={{ mt: 2 }}>Thử lại</Button>
    </Container>
  );

  if (isLoading) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton width={300} height={60} sx={{ mb: 4 }} />
      <Grid container spacing={3}>
        {[...Array(8)].map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            <Skeleton width="60%" sx={{ mt: 1 }} />
            <Skeleton width="40%" />
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  if (data?.data.length === 0) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <CloudUpload sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
      <Typography variant="h5" color="text.secondary">Thư viện của bạn đang trống</Typography>
      <Button component={Link} href="/media/upload" variant="contained" sx={{ mt: 3 }}>Tải lên ngay</Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={800}>Thư viện Media</Typography>
        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
          <ToggleButton value="grid"><GridView /></ToggleButton>
          <ToggleButton value="list"><ViewList /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {data?.data.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
                {/* Image Aspect Ratio 1:1 */}
                <Box sx={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                  <MediaRenderer
                    url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
                    mimeType={item.mime_type}
                    preview
                  />
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" noWrap title={item.filename}>{item.filename}</Typography>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">{formatBytes(item.size)}</Typography>
                    <Box>
                      <Tooltip title="Copy link"><IconButton size="small" onClick={() => copyToClipboard(item.id)}><ContentCopy fontSize="inherit" /></IconButton></Tooltip>
                      <Tooltip title="Tải về"><IconButton size="small" onClick={() => handleDownload(item.id, item.filename)}><Download fontSize="inherit" /></IconButton></Tooltip>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}><DeleteOutline fontSize="inherit" /></IconButton>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell width={80}>Xem</TableCell>
                <TableCell>Tên tệp</TableCell>
                <TableCell>Định dạng</TableCell>
                <TableCell>Dung lượng</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden' }}>
                      <MediaRenderer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} mimeType={item.mime_type} preview />
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600}>{item.filename}</Typography></TableCell>
                  <TableCell><Chip label={item.mime_type.split('/')[1]} size="small" /></TableCell>
                  <TableCell>{formatBytes(item.size)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => copyToClipboard(item.id)}><ContentCopy fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(item.id)}><DeleteOutline fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box display="flex" justifyContent="center" mt={6}>
        <Pagination count={data?.pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* --- CÁC COMPONENT PHỤ (DIALOG, SNACKBAR) --- */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa tệp?</DialogTitle>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Hủy bỏ</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type} variant="filled">{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
}