import { api } from "@/lib/api";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";

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

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);

  const response = await api.get<MediaResponse>(
    `/media?page=${page}&limit=${limit}`
  );

  const items = response.data;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Typography variant="h4" fontWeight={700}>
          Media
        </Typography>

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid
              key={item.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            >
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ wordBreak: "break-word" }}
                    >
                      {item.filename}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {(item.size / 1024).toFixed(1)} KB
                    </Typography>

                    <Chip
                      size="small"
                      label={item.visibility}
                      color={
                        item.visibility === "public"
                          ? "success"
                          : "default"
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}