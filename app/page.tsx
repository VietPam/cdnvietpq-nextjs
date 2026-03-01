"use client";

import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Avatar,
  Paper,
} from "@mui/material";
import Link from "next/link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import StorageIcon from "@mui/icons-material/Storage";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function HomePage() {
  // Dữ liệu mẫu cho các ô thống kê
  const stats = [
    { label: "Tổng số tệp", value: "1,254", icon: <PhotoLibraryIcon />, color: "#1976d2" },
    { label: "Dung lượng đã dùng", value: "45.8 GB", icon: <StorageIcon />, color: "#2e7d32" },
    { label: "Tệp công khai", value: "850", icon: <ShieldIcon />, color: "#ed6c02" },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: { xs: "center", md: "left" } }}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          gutterBottom 
          sx={{ letterSpacing: "-1px", fontSize: { xs: '2rem', md: '3rem' } }}
        >
          Chào mừng trở lại, <Box component="span" sx={{ color: "primary.main" }}>Admin</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
          Quản lý tài nguyên nội dung của bạn một cách tập trung và hiệu quả.
        </Typography>
      </Box>

      {/* Stats Section - SỬA LỖI GRID TẠI ĐÂY */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "0.3s",
                "&:hover": { 
                  boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                  borderColor: 'primary.light' 
                }
              }}
            >
              <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 56, height: 56 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section - SỬA LỖI GRID TẠI ĐÂY */}
      <Grid container spacing={4}>
        {/* Gallery Box */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 5,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Thư viện hình ảnh
              </Typography>
              <Typography sx={{ mb: 4, opacity: 0.9, maxWidth: "90%" }}>
                Xem toàn bộ danh sách tệp tin đã tải lên, quản lý quyền truy cập và lấy đường dẫn CDN ngay lập tức.
              </Typography>
              <Button
                component={Link}
                href="/media"
                variant="contained"
                color="inherit"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1rem',
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                View My Gallery
              </Button>
            </CardContent>
            {/* Background Icon Decoration */}
            <PhotoLibraryIcon
              sx={{
                position: "absolute",
                right: -20,
                bottom: -20,
                fontSize: 200,
                opacity: 0.1,
                transform: "rotate(-15deg)",
              }}
            />
          </Card>
        </Grid>

        {/* Upload Box */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 3,
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "divider",
              textAlign: "center",
              transition: '0.3s',
              "&:hover": { borderColor: 'primary.main', bgcolor: 'rgba(25, 118, 210, 0.02)' }
            }}
          >
            <CardContent>
              <Avatar sx={{ bgcolor: "primary.light", width: 64, height: 64, mx: "auto", mb: 2 }}>
                <CloudUploadIcon sx={{ color: 'white' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Tải lên tệp mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Hỗ trợ hình ảnh, video và tệp âm thanh.<br />Giới hạn dung lượng theo gói của bạn.
              </Typography>
              <Button
                component={Link}
                href="/media/upload"
                variant="outlined"
                fullWidth
                sx={{ borderRadius: 3, py: 1.2, fontWeight: 700, textTransform: 'none' }}
              >
                Upload Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}