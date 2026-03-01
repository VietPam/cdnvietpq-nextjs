"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Container,
  Typography,
  Grid, // Trong MUI v6, Grid này mặc định là Grid v2
  Card,
  CardContent,
  Stack,
  Chip,
  Box,
  CircularProgress,
  Pagination,
} from "@mui/material";

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
  data: MediaItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Component hiển thị Preview file ---
const MediaPreview = ({ item }: { item: MediaItem }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const fileUrl = `${backendUrl}/media/${item.id}/file`;

  if (item.mime_type.startsWith("image/")) {
    return (
      <Box sx={{ height: 180, width: "100%", bgcolor: "grey.100", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
          controls
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
    );
  }

  if (item.mime_type.startsWith("audio/")) {
    return (
      <Box sx={{ height: 180, display: "flex", alignItems: "center", p: 2, bgcolor: "grey.50" }}>
        <audio src={fileUrl} controls style={{ width: "100%" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.200",
        gap: 1
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {item.mime_type.split('/')[1]?.toUpperCase() || "FILE"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No Preview
      </Typography>
    </Box>
  );
};

// --- Main Content Component ---
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
        const response = await api.get<MediaResponse>(
          `/media?page=${page}&limit=${limit}`
        );
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

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    router.push(`/media?page=${value}`);
  };

  return (
    <Stack spacing={4}>
      <Typography variant="h4" fontWeight={700}>
        Media Library
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* SỬA LỖI Ở ĐÂY: 
            MUI v6 Grid không cần prop 'item' ở các Grid con.
            Thay xs={12} bằng size={{ xs: 12, ... }}
          */}
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" }
                  }}
                >
                  <MediaPreview item={item} />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={1.5}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{
                          wordBreak: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.2,
                          height: "2.4em"
                        }}
                      >
                        {item.filename}
                      </Typography>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {(item.size / 1024).toFixed(1)} KB
                        </Typography>
                        <Chip
                          size="small"
                          label={item.visibility}
                          color={item.visibility === "public" ? "success" : "default"}
                          sx={{ height: 20, fontSize: "0.65rem", textTransform: "uppercase" }}
                        />
                      </Stack>

                      <Typography variant="caption" color="text.disabled">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {items.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography color="text.secondary">Chưa có tệp tin nào trong thư viện.</Typography>
            </Box>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                shape="rounded"
              />
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
      <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>}>
        <MediaListContent />
      </Suspense>
    </Container>
  );
}