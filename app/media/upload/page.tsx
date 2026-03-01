"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Container, Paper, Stack, Typography, Box, Button, 
  LinearProgress, Alert, IconButton, Fade, TextField, Chip, Divider 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Đồng bộ cấu hình từ Backend
const MAX_IMAGE_SIZE = 500 * 1024; 
const MAX_VIDEO_SIZE = 1 * 1024 * 1024; 
const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];
const ALLOWED_VIDEO_EXT = ["mp4"];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase() || "";
    const isImage = ALLOWED_IMAGE_EXT.includes(ext);
    const isVideo = ALLOWED_VIDEO_EXT.includes(ext);

    if (!isImage && !isVideo) {
      return setMessage({ type: "error", text: `Định dạng .${ext} không được hỗ trợ.` });
    }

    if (isImage && selected.size > MAX_IMAGE_SIZE) {
      return setMessage({ type: "error", text: "Ảnh vượt quá 500KB giới hạn!" });
    }
    if (isVideo && selected.size > MAX_VIDEO_SIZE) {
      return setMessage({ type: "error", text: "Video vượt quá 1MB giới hạn!" });
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
    setFile(selected);
    // Tách tên file và đuôi file để cho phép edit phần tên
    setCustomName(selected.name.replace(/\.[^/.]+$/, "")); 
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    // Lấy đuôi file gốc
    const ext = file.name.split(".").pop();
    const finalFileName = `${customName}.${ext}`;
    
    // Tạo một file mới với tên đã edit (nếu có)
    const renamedFile = new File([file], finalFileName, { type: file.type });

    formData.append("file", renamedFile);
    formData.append("visibility", "public");

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
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>Tải lên Media</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {ALLOWED_IMAGE_EXT.concat(ALLOWED_VIDEO_EXT).map(ext => (
                <Chip key={ext} label={`.${ext}`} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
              ))}
            </Stack>
          </Box>
          
          <Box sx={{ 
            border: "2px dashed", 
            borderColor: file ? "primary.main" : "grey.300", 
            p: file ? 2 : 4, textAlign: 'center', borderRadius: 3,
            bgcolor: file ? 'rgba(25, 118, 210, 0.02)' : 'grey.50',
            transition: 'all 0.3s ease'
          }}>
            {!file ? (
              <Stack spacing={2} alignItems="center">
                <CloudUploadIcon sx={{ fontSize: 48, color: "primary.light", opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">Kéo thả tệp hoặc nhấn để chọn</Typography>
                <Button variant="contained" component="label" sx={{ borderRadius: 2 }}>
                  Chọn tệp
                  <input type="file" hidden onChange={handleFileChange} accept=".jpg,.jpeg,.png,.webp,.mp4" />
                </Button>
              </Stack>
            ) : (
              <Fade in={!!file}>
                <Stack spacing={2}>
                  {/* Preview Container */}
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'common.black', height: 220 }}>
                    {file.type.startsWith("image/") ? (
                      <Image src={previewUrl!} alt="Preview" fill style={{ objectFit: 'contain' }} />
                    ) : (
                      <video src={previewUrl!} controls style={{ width: '100%', height: '100%' }} />
                    )}
                  </Box>

                  {/* Metadata & Edit Form */}
                  <Stack spacing={2} sx={{ textAlign: 'left', p: 1 }}>
                    <TextField
                      label="Tên tệp (Bạn có thể sửa)"
                      fullWidth
                      size="small"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      disabled={loading}
                      InputProps={{ endAdornment: <EditIcon sx={{ fontSize: 18, color: 'action.active' }} /> }}
                    />
                    
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Dung lượng</Typography>
                        <Typography variant="body2" fontWeight={700}>{(file.size / 1024).toFixed(1)} KB</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Định dạng</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'uppercase' }}>{file.name.split('.').pop()}</Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Button 
                    startIcon={<DeleteIcon />} 
                    color="error" 
                    size="small" 
                    onClick={() => {setFile(null); setPreviewUrl(null);}}
                    disabled={loading}
                  >
                    Chọn lại tệp khác
                  </Button>
                </Stack>
              </Fade>
            )}
          </Box>

          {loading && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="primary">Đang tải lên: {progress}%</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
            </Box>
          )}

          {message && <Alert severity={message.type} sx={{ borderRadius: 2 }}>{message.text}</Alert>}

          <Button 
            fullWidth 
            variant="contained" 
            size="large" 
            onClick={handleUpload} 
            disabled={loading || !file} 
            sx={{ py: 1.5, fontWeight: 800, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
          >
            {loading ? "Đang xử lý..." : "Xác nhận và Tải lên"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}