"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Container, Typography, Box, Button, Stack, Paper, Divider, Chip, CircularProgress, Grid } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MediaRenderer } from "@/components/MediaRenderer";

export default function MediaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;

  useEffect(() => {
    api.get<any>(`/media/${id}`)
      .then(res => res.success && setItem(res.media))
      .finally(() => setLoading(false));
  }, [id]);

  const copyUrl = () => {
    navigator.clipboard.writeText(fileUrl);
    alert("Đã sao chép link CDN!");
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 20 }}><CircularProgress /></Box>;
  if (!item) return <Container sx={{ py: 10, textAlign: 'center' }}><Typography>Không tìm thấy.</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button onClick={() => router.back()} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>Quay lại</Button>

      <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "grey.50", p: 2, display: 'flex', justifyContent: 'center' }}>
          <MediaRenderer url={fileUrl} mimeType={item.mime_type} />
        </Box>

        <Box sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h5" fontWeight={800}>{item.filename}</Typography>
                <Chip label={item.visibility} color="primary" size="small" sx={{ mt: 1 }} />
              </Box>
              <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={copyUrl}>Sao chép Link</Button>
            </Stack>
            
            <Divider />
            
            <Grid container spacing={2}>
              {[
                { label: "Loại tệp", value: item.mime_type },
                { label: "Dung lượng", value: `${(item.size / 1024).toFixed(2)} KB` },
                { label: "Ngày tải", value: new Date(item.created_at).toLocaleDateString("vi-VN") }
              ].map((info, idx) => (
                <Grid key={idx} size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">{info.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{info.value}</Typography>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}