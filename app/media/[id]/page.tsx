"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Typography
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useMediaDetail } from "@/hooks/useMediaDetail"
import MediaDetailView from "./components/MediaDetailView"

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

      <MediaDetailView
        item={item}
        fileUrl={fileUrl}
        copied={copied}
        onCopy={handleCopyLink}
      />
    </Container>
  )
}