"use client";
import { Container, Typography, Grid, Card, CardContent, Box, Button, Avatar, Paper } from "@mui/material";
import Link from "next/link";
import { CloudUpload as CloudUploadIcon, PhotoLibrary as PhotoLibraryIcon, Storage as StorageIcon, Shield as ShieldIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

export default function HomePage() {
  const stats = [
    { label: "Tổng số tệp", value: "1,254", icon: <PhotoLibraryIcon />, color: "#1976d2" },
    { label: "Dung lượng đã dùng", value: "45.8 GB", icon: <StorageIcon />, color: "#2e7d32" },
    { label: "Tệp công khai", value: "850", icon: <ShieldIcon />, color: "#ed6c02" },
  ];

  const commonCardSx = { borderRadius: 6, height: "100%", elevation: 0 };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ mb: 6, textAlign: { xs: "center", md: "left" } }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: "-1px", fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          Chào mừng trở lại, <Box component="span" sx={{ color: "primary.main" }}>Admin</Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8, maxWidth: 600 }}>
          Hệ thống quản trị CDN tối ưu. Theo dõi lưu lượng và quản lý tệp tin của bạn tại đây.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {stats.map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, display: "flex", alignItems: "center", gap: 2, transition: "0.3s", "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)", borderColor: 'primary.light', transform: 'translateY(-5px)' } }}>
              <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 60, height: 60 }}>{stat.icon}</Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>{stat.label}</Typography>
                <Typography variant="h4" fontWeight={800}>{stat.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ ...commonCardSx, background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", color: "white", position: "relative", overflow: "hidden", boxShadow: '0 20px 40px rgba(25, 118, 210, 0.2)' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
              <Typography variant="h3" fontWeight={800} gutterBottom>Thư viện</Typography>
              <Typography sx={{ mb: 4, opacity: 0.9, fontSize: '1.1rem' }}>Khám phá kho lưu trữ dữ liệu tập trung. Quản lý hàng ngàn tệp tin chỉ với vài cú click.</Typography>
              <Button component={Link} href="/media" variant="contained" color="inherit" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: "white", color: "primary.main", fontWeight: 800, px: 4, py: 1.8, borderRadius: 3, textTransform: 'none', fontSize: '1.1rem', "&:hover": { bgcolor: "#f0f0f0" } }}>Mở thư viện ngay</Button>
            </CardContent>
            <PhotoLibraryIcon sx={{ position: "absolute", right: -30, bottom: -30, fontSize: 250, opacity: 0.1, transform: "rotate(-10deg)" }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ ...commonCardSx, display: "flex", flexDirection: "column", justifyContent: "center", p: 4, borderStyle: "dashed", borderWidth: 2, borderColor: "primary.light", textAlign: "center", transition: '0.3s', "&:hover": { bgcolor: 'rgba(25, 118, 210, 0.03)' } }}>
            <CardContent>
              <Avatar sx={{ bgcolor: "primary.main", width: 70, height: 70, mx: "auto", mb: 3 }}><CloudUploadIcon sx={{ fontSize: 35 }} /></Avatar>
              <Typography variant="h4" fontWeight={800} gutterBottom>Tải lên</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Kéo thả hoặc chọn tệp từ máy tính để bắt đầu tối ưu hóa nội dung của bạn.</Typography>
              <Button component={Link} href="/media/upload" variant="contained" fullWidth size="large" sx={{ borderRadius: 3, py: 2, fontWeight: 800, textTransform: 'none' }}>Bắt đầu tải lên</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}