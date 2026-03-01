"use client";

import React, { useState } from "react";
import { 
  Container, Box, Paper, Typography, TextField, 
  Button, Alert, CircularProgress, InputAdornment, IconButton 
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://auth-vietpq.20522153.workers.dev/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        auth.setToken(data.token);
        router.push("/"); // Chuyển về Dashboard
        router.refresh();
      } else {
        setError(data.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ xác thực");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: "90vh", display: "flex", alignItems: "center",
      background: "radial-gradient(circle at top right, #e3f2fd, #ffffff)" 
    }}>
      <Container maxWidth="xs">
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 6, textAlign: "center" }}>
          <Box sx={{ bgcolor: "primary.main", width: 50, height: 50, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <LockOutlined sx={{ color: "white" }} />
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: "-1px" }}>
            Đăng nhập
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Truy cập hệ thống quản trị CDNVIETPQ
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth label="Email" variant="outlined" margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            />
            <TextField
              fullWidth label="Mật khẩu" type={showPassword ? "text" : "password"}
              variant="outlined" margin="normal" value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 }, mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth size="large" type="submit" variant="contained"
              disabled={loading}
              sx={{ borderRadius: 3, py: 1.5, fontWeight: 800, textTransform: "none", fontSize: "1.1rem" }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : "Đăng nhập ngay"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}