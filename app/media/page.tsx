"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Container, Grid, Card, CardContent, Typography, Stack, Button, IconButton, Dialog, DialogTitle, DialogActions, Box, Pagination, CircularProgress } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import Link from "next/link";

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch dữ liệu với Cache
  const { data, isLoading } = useQuery({
    queryKey: ['media', page],
    queryFn: () => api.get<any>(`/media?page=${page}&limit=8`),
  });

  // Mutation để xóa tệp
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setDeleteId(null);
    }
  });

  if (isLoading) return <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={4}>Thư viện Media</Typography>

      <Grid container spacing={3}>
        {data?.data.map((item: any) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <MediaRenderer
                url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
                mimeType={item.mime_type}
                preview
              />
              <CardContent>
                <Typography variant="subtitle2" noWrap>
                  {item.filename}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography variant="caption">
                    {formatBytes(item.size)}
                  </Typography>

                  <Stack direction="row">
                    <Button
                      size="small"
                      component={Link}
                      href={`/media/${item.id}`}
                    >
                      Xem
                    </Button>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={6}>
        <Pagination count={data?.pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
      </Box>

      {/* Confirm Dialog Xịn */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Bạn có chắc chắn muốn xóa tệp này?</DialogTitle>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteId(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}