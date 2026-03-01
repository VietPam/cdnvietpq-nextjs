"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Container, Card, Typography, Stack, Button, IconButton,
  Dialog, DialogTitle, DialogActions, Box, Pagination, Skeleton,
  Tooltip, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Alert, Snackbar, Chip,
  useTheme, useMediaQuery
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

// 1. Interface definitions
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
  const theme = useTheme();

  // Xác định số cột hiện tại dựa trên kích thước màn hình
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const colCount = isLg ? 5 : isMd ? 4 : isSm ? 3 : 2;

  // 2. Data Fetching
  const { data, isLoading, isError, refetch } = useQuery<MediaResponse>({
    queryKey: ['media', page],
    queryFn: () => api.get(`/media?page=${page}&limit=15`),
  });

  // 3. Xử lý tính toán kích thước ảnh/video ngầm
  const [dimensionsMap, setDimensionsMap] = useState<Record<string, number>>({});
  const dimensionCache = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!data?.data) return;

    let mounted = true;
    const fetchDimensions = async () => {
      const newMap = { ...dimensionCache.current };
      let hasNew = false;

      const promises = data.data.map(async (item) => {
        if (newMap[item.id]) return; // Đã có trong cache thì bỏ qua

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`;
        try {
          const ratio = await new Promise<number>((resolve) => {
            if (item.mime_type.startsWith('video/')) {
              const video = document.createElement('video');
              video.onloadedmetadata = () => resolve(video.videoHeight / (video.videoWidth || 1));
              video.onerror = () => resolve(1);
              video.src = url;
            } else {
              const img = new window.Image();
              img.onload = () => resolve(img.height / (img.width || 1));
              img.onerror = () => resolve(1);
              img.src = url;
            }
          });
          newMap[item.id] = ratio;
          hasNew = true;
        } catch (e) {
          newMap[item.id] = 1; // Fallback nếu lỗi
          hasNew = true;
        }
      });

      await Promise.all(promises);

      if (mounted && hasNew) {
        dimensionCache.current = newMap;
        setDimensionsMap(newMap);
      }
    };

    fetchDimensions();
    return () => { mounted = false; };
  }, [data?.data]);

  // 4. Phân bổ thuật toán Zig-Zag Layout
  const displayData = useMemo(() => {
    if (!data?.data) return [];
    
    // Nếu chưa tính xong tỷ lệ khung hình cho tất cả ảnh hiện tại, trả về mảng rỗng để hiển thị loading
    const allLoaded = data.data.every(item => dimensionsMap[item.id]);
    if (!allLoaded && viewMode === 'grid') return [];

    // Map dữ liệu kèm theo Aspect Ratio
    const withRatio = data.data.map(item => ({
      ...item,
      aspectRatio: dimensionsMap[item.id] || 1
    }));

    // Sắp xếp giảm dần theo tỷ lệ (Ảnh dọc/cao nhất lên đầu)
    withRatio.sort((a, b) => b.aspectRatio - a.aspectRatio);

    // Xếp Zig-Zag vào mảng 1 chiều sao cho khi Masonry cắt bằng % colCount, nó sẽ ra các cột cân bằng
    const result = new Array(withRatio.length);
    for (let i = 0; i < withRatio.length; i++) {
      const row = Math.floor(i / colCount);
      const col = i % colCount;
      const base = row * colCount;
      const itemsInRow = Math.min(colCount, withRatio.length - base);
      
      let sortedIndex;
      if (row % 2 === 0) {
        // Dòng chẵn: rải từ trái sang phải
        sortedIndex = base + col;
      } else {
        // Dòng lẻ: rải ngược từ phải sang trái (bù đắp chiều cao cho cột)
        sortedIndex = base + (itemsInRow - 1 - col);
      }
      result[i] = withRatio[sortedIndex];
    }
    
    return result;
  }, [data?.data, dimensionsMap, colCount, viewMode]);

  // 5. Delete Mutation (Optimistic)
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

  // 6. Utility Functions
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

  // 7. Render Logic
  if (isError) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h6">Đã xảy ra lỗi khi tải dữ liệu</Typography>
      <Button onClick={() => refetch()} variant="contained" sx={{ mt: 2 }}>Thử lại</Button>
    </Container>
  );

  // Hiển thị Skeleton nếu đang load API HOẶC đang chờ tính toán kích thước (để tránh bị giật khung hình)
  const isLayoutCalculating = data?.data?.length && displayData.length === 0 && viewMode === 'grid';
  if (isLoading || isLayoutCalculating) return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Skeleton width={250} height={50} sx={{ mb: 4 }} />
      <Masonry columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={1.5}>
        {[300, 200, 400, 250, 350, 200, 400, 300].map((h, i) => (
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
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>Thư viện Media</Typography>
        <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
          <ToggleButton value="grid"><GridView fontSize="small" /></ToggleButton>
          <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Grid View - Render theo thuật toán Zig-Zag cân bằng */}
      {viewMode === 'grid' ? (
        <Masonry columns={colCount} spacing={1.5}>
          {displayData.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: 3, position: 'relative', border: 'none', overflow: 'hidden',
                bgcolor: 'grey.100',
                '&:hover .overlay-content': { opacity: 1 },
                '&:hover img, &:hover video': { transform: 'scale(1.05)' }
              }}
            >
              <Box sx={{ lineHeight: 0, overflow: 'hidden', transition: '0.4s' }}>
                <MediaRenderer
                  url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
                  mimeType={item.mime_type}
                  preview
                />
              </Box>

              {/* Video Indicator Icon */}
              {item.mime_type.startsWith('video/') && (
                <Box sx={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  color: 'white', opacity: 0.6, pointerEvents: 'none', zIndex: 1
                }}>
                  <PlayCircleOutline sx={{ fontSize: 48 }} />
                </Box>
              )}

              {/* Seamless Hover Overlay */}
              <Box
                className="overlay-content"
                sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  p: 1.5, opacity: 0, transition: 'opacity 0.3s ease-in-out', zIndex: 2
                }}
              >
                {/* Top Actions */}
                <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      component={Link}
                      href={`/media/${item.id}`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
                    >
                      <Visibility fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy link">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.preventDefault(); copyToClipboard(item.id); }}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'white', color: 'black' } }}
                    >
                      <ContentCopy fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.preventDefault(); setDeleteId(item.id); }}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: '#ff4444' } }}
                    >
                      <DeleteOutline fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Bottom Metadata */}
                <Box>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: 'white', fontWeight: 600, display: 'block', mb: 0.5,
                      textShadow: '0 1px 4px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}
                  >
                    {item.filename}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
                      {formatBytes(item.size)}
                    </Typography>
                    <Tooltip title="Tải xuống">
                      <IconButton
                        size="small" sx={{ color: 'white', p: 0 }}
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
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden' }}>
                      <MediaRenderer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} mimeType={item.mime_type} preview />
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600} noWrap>{item.filename}</Typography></TableCell>
                  <TableCell><Chip label={item.mime_type.split('/')[1]} size="small" variant="outlined" sx={{ borderRadius: 1 }} /></TableCell>
                  <TableCell>{formatBytes(item.size)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" component={Link} href={`/media/${item.id}`}><Visibility fontSize="small" /></IconButton>
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

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={6}>
        <Pagination count={data.pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
      </Box>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa tệp?</DialogTitle>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Hủy bỏ</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Xác nhận xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.type} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
}