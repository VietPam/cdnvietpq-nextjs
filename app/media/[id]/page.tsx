"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  Container, Typography, Box, Button, Stack, Paper, 
  Chip, CircularProgress, Grid 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes, formatDate } from "@/lib/utils";

export default function MediaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;

  useEffect(() => {
    let isMounted = true;
    
    api.get<any>(`/media/${id}`)
      .then(res => {
        if (isMounted) {
          if (res.success) {
            setItem(res.media);
          } else {
            setError("Không tìm thấy tệp tin này.");
          }
        }
      })
      .catch(() => {
        if (isMounted) setError("Đã có lỗi xảy ra khi tải dữ liệu.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fileUrl);
    alert("Đã sao chép link CDN!");
  };

  // Trạng thái Loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  // Trạng thái Lỗi hoặc Không tìm thấy
  if (error || !item) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {error || "Tệp tin không tồn tại."}
        </Typography>
        <Button onClick={() => router.back()} variant="outlined" sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Thanh điều hướng nhanh */}
      <Button 
        onClick={() => router.back()} 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 3, borderRadius: 2, textTransform: 'none' }}
      >
        Quay lại thư viện
      </Button>

      <Grid container spacing={4}>
        {/* Cột trái: Khu vực hiển thị Media chính */}
        {/* ĐÃ FIX: Bỏ prop 'item' và dùng 'size' */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper 
            elevation={0}
            variant="outlined" 
            sx={{ 
              borderRadius: 4, 
              overflow: "hidden", 
              bgcolor: "common.black", 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '500px',
              position: 'relative'
            }}
          >
            <MediaRenderer url={fileUrl} mimeType={item.mime_type} preview={false} />
          </Paper>
        </Grid>

        {/* Cột phải: Thông tin chi tiết và hành động */}
        {/* ĐÃ FIX: Bỏ prop 'item' và dùng 'size' */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ wordBreak: 'break-word' }}>
                {item.filename}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip 
                  label={item.mime_type?.split('/')[1]?.toUpperCase()} 
                  size="small" 
                  color="primary" 
                  variant="filled" 
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  label={item.visibility === 'public' ? 'Công khai' : 'Riêng tư'} 
                  size="small" 
                  variant="outlined" 
                />
              </Stack>
            </Box>

            {/* Nhóm nút hành động */}
            <Stack spacing={1.5}>
              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                startIcon={<ContentCopyIcon />} 
                onClick={handleCopyLink}
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                Sao chép Link CDN
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                size="large"
                startIcon={<DownloadIcon />} 
                component="a"
                href={fileUrl} 
                download={item.filename}
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                Tải về máy
              </Button>
            </Stack>

            {/* Bảng thông số kỹ thuật */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                Thông tin tệp tin
              </Typography>
              
              <Grid container spacing={2}>
                {/* ĐÃ FIX: Dùng size thay cho item xs={12} */}
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="Dung lượng" value={formatBytes(item.size)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem 
                    label="ID định danh" 
                    value={item.id} 
                    isCode 
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="Ngày tải lên" value={formatDate(item.created_at)} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <DetailItem label="Loại MIME" value={item.mime_type} />
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

/**
 * Component phụ hiển thị từng dòng thông tin
 */
function DetailItem({ label, value, isCode = false }: { label: string, value: string, isCode?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography 
        variant="body2" 
        fontWeight={isCode ? 400 : 600}
        sx={{ 
          wordBreak: 'break-all', 
          fontFamily: isCode ? 'monospace' : 'inherit',
          bgcolor: isCode ? 'action.hover' : 'transparent',
          p: isCode ? 0.5 : 0,
          borderRadius: 1
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}