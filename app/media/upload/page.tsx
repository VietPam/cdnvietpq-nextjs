"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Paper, Stack, Typography, Box, Button, LinearProgress, Alert, IconButton, Fade } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Đồng bộ cấu hình từ Backend
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_VIDEO_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
const ALLOWED_VIDEO_EXT = ["mp4"];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase() || "";
    const isImage = ALLOWED_IMAGE_EXT.includes(ext);
    const isVideo = ALLOWED_VIDEO_EXT.includes(ext);

    // 1. Validate định dạng
    if (!isImage && !isVideo) {
      return setMessage({
        type: "error",
        text: `Định dạng .${ext} không được hỗ trợ. Chỉ nhận: ${[...ALLOWED_IMAGE_EXT, ...ALLOWED_VIDEO_EXT].join(", ")}`
      });
    }

    // 2. Validate dung lượng theo loại tệp
    if (isImage && selected.size > MAX_IMAGE_SIZE) {
      return setMessage({ type: "error", text: "Ảnh không được vượt quá 500KB!" });
    }
    if (isVideo && selected.size > MAX_VIDEO_SIZE) {
      return setMessage({ type: "error", text: "Video không được vượt quá 1MB!" });
    }

    // Nếu pass tất cả validate
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
    setFile(selected);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", "public");

    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, formData, {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
        onUploadProgress: (p) => setProgress(Math.round((p.loaded * 100) / (p.total || 100)))
      });
      setMessage({ type: "success", text: "Tải lên thành công!" });
      setTimeout(() => router.push("/media"), 1000);
    } catch (err) {
      setMessage({ type: "error", text: "Lỗi tải lên tệp!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>Tải lên Media</Typography>
            <Typography variant="body2" color="text.secondary">
              Giới hạn: Ảnh (500KB), Video (1MB)
            </Typography>
          </Box>

          <Box sx={{
            border: "2px dashed",
            borderColor: file ? "primary.main" : "grey.300",
            p: 3, textAlign: 'center', borderRadius: 3,
            bgcolor: file ? 'rgba(25, 118, 210, 0.04)' : 'grey.50'
          }}>
            {!file ? (
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon sx={{ fontSize: 48, color: "grey.400" }} />
                <Button variant="contained" component="label">
                  Chọn tệp
                  <input type="file" hidden onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.webp,.mp4" />
                </Button>
              </Stack>
            ) : (
              <Fade in={!!file}>
                <Stack spacing={2}>
                  {/* Preview Area */}
                  <Box sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                    {file.type.startsWith("image/") ? (
                      <Box sx={{ position: 'relative', height: 200 }}>
                        <Image src={previewUrl!} alt="Preview" fill style={{ objectFit: 'contain' }} />
                      </Box>
                    ) : (
                      <video src={previewUrl!} controls style={{ width: '100%', borderRadius: 8 }} />
                    )}
                  </Box>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ bgcolor: 'white', p: 1.5, borderRadius: 2, border: '1px solid #eee' }}>
                    <Typography variant="caption" noWrap sx={{ maxWidth: '70%' }}>{file.name}</Typography>
                    <IconButton onClick={() => { setFile(null); setPreviewUrl(null); }} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Fade>
            )}
          </Box>

          {loading && (
            <Box>
              <Typography variant="caption">Tiến trình: {progress}%</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          )}

          {message && <Alert severity={message.type}>{message.text}</Alert>}

          <Button fullWidth variant="contained" size="large" onClick={handleUpload}
            disabled={loading || !file} sx={{ py: 1.5, fontWeight: 700 }}>
            {loading ? "Đang xử lý..." : "Xác nhận tải lên"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}