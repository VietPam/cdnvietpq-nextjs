"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import { Container, Typography, Grid, Card, CardContent, Stack, Chip, Box, CircularProgress, Pagination, Button, IconButton } from "@mui/material";
import Link from "next/link";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { MediaRenderer } from "@/components/MediaRenderer";

function MediaListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);
  const [data, setData] = useState<any>({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/media?page=${page}&limit=8`);
      setData({ items: res.data, totalPages: res.pagination.totalPages });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa tệp này?")) return;
    try {
      await api.delete(`/media/${id}`);
      fetchMedia(); // Refresh lại danh sách
    } catch (err) { alert("Lỗi khi xóa!"); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={800}>Thư viện Media</Typography>
      <Grid container spacing={3}>
        {data.items.map((item: any) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card variant="outlined" sx={{ height: "100%", borderRadius: 3, "&:hover": { boxShadow: 4 } }}>
              <MediaRenderer url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`} mimeType={item.mime_type} preview />
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} noWrap>{item.filename}</Typography>
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">{formatBytes(item.size)}</Typography>
                  <Chip size="small" label={item.visibility} color={item.visibility === "public" ? "success" : "default"} variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button fullWidth variant="contained" size="small" component={Link} href={`/media/${item.id}`} startIcon={<VisibilityIcon />}>Xem</Button>
                  <IconButton color="error" size="small" onClick={() => handleDelete(item.id)}><DeleteOutlineIcon /></IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination count={data.totalPages} page={page} onChange={(_, v) => router.push(`/media?page=${v}`)} color="primary" />
      </Box>
    </Stack>
  );
}

export default function MediaPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Suspense fallback={<CircularProgress />}><MediaListContent /></Suspense>
    </Container>
  );
}