"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Grid
} from "@mui/material";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

interface MediaItem {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
  r2_key: string;
  visibility: string;
}

// Cấu trúc response khớp với curl của bạn
interface MediaDetailResponse {
  success: boolean;
  media: MediaItem; 
}

export default function MediaDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const fileUrl = `${backendUrl}/media/${id}/file`;

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Fix: Lấy từ response.media thay vì response.data
        const res = await api.get<MediaDetailResponse>(`/media/${id}`);
        if (res.success) {
          setItem(res.media);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>;

  if (!item) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h5">Không tìm thấy tệp tin.</Typography>
      <Button component={Link} href="/media" sx={{ mt: 2 }}>Quay lại thư viện</Button>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button component={Link} href="/media" startIcon={<ArrowBackIcon />} sx={{ mb: 4 }}>
        Quay lại danh sách
      </Button>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'grey.50', display: 'flex', justifyContent: 'center', p: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
          {item.mime_type.startsWith("image/") && (
            <img src={fileUrl} alt={item.filename} style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          )}
          {item.mime_type.startsWith("video/") && (
            <video src={fileUrl} controls autoPlay style={{ width: '100%', maxHeight: '500px' }} />
          )}
          {item.mime_type.startsWith("audio/") && (
            <Box sx={{ width: '100%', py: 8 }}><audio src={fileUrl} controls autoPlay style={{ width: '100%' }} /></Box>
          )}
          {!item.mime_type.startsWith("image/") && !item.mime_type.startsWith("video/") && !item.mime_type.startsWith("audio/") && (
             <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">Định dạng {item.mime_type} không hỗ trợ xem trực tiếp</Typography>
             </Box>
          )}
        </Box>

        <Box sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>{item.filename}</Typography>
                <Chip label={item.visibility} color={item.visibility === 'public' ? 'success' : 'default'} size="small" sx={{ fontWeight: 600 }} />
              </Box>
              <Button variant="contained" startIcon={<DownloadIcon />} href={fileUrl} target="_blank" download>
                Tải xuống
              </Button>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">Loại tệp</Typography>
                <Typography variant="body2" fontWeight={600}>{item.mime_type}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">Dung lượng</Typography>
                <Typography variant="body2" fontWeight={600}>{(item.size / 1024).toFixed(2)} KB</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">Ngày tải lên</Typography>
                <Typography variant="body2" fontWeight={600}>{new Date(item.created_at).toLocaleString('vi-VN')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block">ID Tệp (R2 Key)</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', bgcolor: 'grey.50', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  {item.id}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}