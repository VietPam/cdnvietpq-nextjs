"use client";

import React, { useState } from "react";
import {
  Button,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Container,
  Paper,
  Box,
  IconButton,
  LinearProgress,
  Alert,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      // Tạo preview nếu là ảnh để giao diện sinh động hơn
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Vui lòng chọn một tệp tin!" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("visibility", visibility);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setMessage({ type: "success", text: "Tải lên thành công! Đang chuyển hướng..." });
      
      // Chuyển hướng sau khi thành công
      setTimeout(() => {
        router.push("/media");
      }, 1500);

    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ type: "error", text: "Lỗi khi tải lên. Vui lòng kiểm tra kết nối." });
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Tải lên Media
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tải tệp tin trực tiếp lên Cloudflare Workers & R2 Storage.
            </Typography>
          </Box>

          {/* Khu vực Dropzone / Chọn file */}
          <Box
            sx={{
              border: "2px dashed",
              borderColor: file ? "primary.main" : "divider",
              borderRadius: 3,
              p: 3,
              textAlign: "center",
              bgcolor: file ? "rgba(25, 118, 210, 0.02)" : "grey.50",
              transition: "0.3s",
              position: "relative"
            }}
          >
            {!file ? (
              <Stack alignItems="center" spacing={2}>
                <CloudUploadIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                <Typography variant="body1" fontWeight={600}>
                  Kéo thả hoặc nhấn để tải lên
                </Typography>
                <Button variant="contained" component="label" size="small">
                  Chọn tệp
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {preview ? (
                  <Box 
                    component="img" 
                    src={preview} 
                    sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }} 
                  />
                ) : (
                  <InsertDriveFileIcon sx={{ fontSize: 40, color: "primary.main" }} />
                )}
                <Box sx={{ textAlign: 'left', flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
                <IconButton onClick={clearFile} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            )}
          </Box>

          {/* Cấu hình Visibility */}
          <TextField
            select
            fullWidth
            label="Chế độ hiển thị"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="public">Công khai (Public)</MenuItem>
            <MenuItem value="private">Riêng tư (Private)</MenuItem>
          </TextField>

          {/* Thanh trạng thái khi đang load */}
          {loading && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="caption" gutterBottom>Đang xử lý...</Typography>
              <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}

          {/* Thông báo */}
          {message && (
            <Alert severity={message.type} sx={{ borderRadius: 2 }}>
              {message.text}
            </Alert>
          )}

          {/* Nút bấm */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={loading || !file}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {loading ? "Đang tải lên..." : "Xác nhận tải lên"}
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Container>
  );
}