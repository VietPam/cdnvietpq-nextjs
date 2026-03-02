"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  Grid
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DownloadIcon from "@mui/icons-material/Download"
import { MediaRenderer } from "@/components/MediaRenderer"
import { formatBytes, formatDate } from "@/lib/utils"
import { useMediaDetail } from "@/hooks/useMediaDetail"

export default function MediaDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { item, loading, error, fileUrl } = useMediaDetail(id)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    if (!fileUrl) return
    try {
      await navigator.clipboard.writeText(fileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    )
  }

  if (error || !item) {
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {error || "Tệp tin không tồn tại."}
        </Typography>
        <Button onClick={() => router.back()} variant="outlined" sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        onClick={() => router.back()}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, borderRadius: 2, textTransform: "none" }}
      >
        Quay lại thư viện
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "auto"
            }}
          >
            <MediaRenderer url={fileUrl} mimeType={item.mime_type} preview={false} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ wordBreak: "break-word" }}>
                {item.filename}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                  label={item.mime_type?.split("/")[1]?.toUpperCase()}
                  size="small"
                  color="primary"
                  variant="filled"
                />
                <Chip
                  label={item.visibility === "public" ? "Công khai" : "Riêng tư"}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyLink}
                sx={{ borderRadius: 2, py: 1.2 }}
              >
                {copied ? "Đã sao chép!" : "Sao chép Link CDN"}
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

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                Thông tin tệp tin
              </Typography>

              <DetailItem label="Dung lượng" value={formatBytes(item.size)} />
              <DetailItem label="ID định danh" value={item.id} isCode />
              <DetailItem
                label="Ngày tải lên"
                value={item.created_at ? formatDate(item.created_at) : "-"}
              />
              <DetailItem label="Loại MIME" value={item.mime_type} />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  )
}

function DetailItem({
  label,
  value,
  isCode = false
}: {
  label: string
  value: string
  isCode?: boolean
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={isCode ? 400 : 600}
        sx={{
          wordBreak: "break-all",
          fontFamily: isCode ? "monospace" : "inherit"
        }}
      >
        {value}
      </Typography>
    </Box>
  )
}