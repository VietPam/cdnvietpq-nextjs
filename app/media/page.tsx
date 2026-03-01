"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Box,
  CircularProgress,
  Pagination,
  Button,
} from "@mui/material";
import Link from "next/link";
import VisibilityIcon from '@mui/icons-material/Visibility';

// --- Interfaces ---
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
  success: boolean;
  data: MediaItem[]; // API list trả về .data
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const MediaPreview = ({ item }: { item: MediaItem }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const fileUrl = `${backendUrl}/media/${item.id}/file`;

  if (item.mime_type.startsWith("image/")) {
    return (
      <Box sx={{ height: 180, width: "100%", bgcolor: "grey.100", overflow: "hidden" }}>
        <img
          src={fileUrl}
          alt={item.filename}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      </Box>
    );
  }

  if (item.mime_type.startsWith("video/")) {
    return (
      <Box sx={{ height: 180, width: "100%", bgcolor: "black" }}>
        <video
          src={fileUrl}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 180, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "grey.200" }}>
      <Typography variant="caption" fontWeight={700}>{item.mime_type.split('/')[1]?.toUpperCase()}</Typography>
    </Box>
  );
};

function MediaListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") || 1);
  const limit = 8;

  const [items, setItems] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const response = await api.get<MediaResponse>(`/media?page=${page}&limit=${limit}`);
        setItems(response?.data || []);
        setTotalPages(response?.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [page]);

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>Media Library</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                  <MediaPreview item={item} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>{item.filename}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">{(item.size / 1024).toFixed(1)} KB</Typography>
                        <Chip size="small" label={item.visibility} color={item.visibility === "public" ? "success" : "default"} />
                      </Stack>
                      <Button
                        component={Link}
                        href={`/media/${item.id}`}
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        sx={{ mt: 1, borderRadius: 2 }}
                      >
                        Chi tiết
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => router.push(`/media?page=${v}`)} color="primary" />
            </Box>
          )}
        </>
      )}
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