"use client";

import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Container, CssBaseline, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Button, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Thư viện", href: "/media" },
  { label: "Tải lên", href: "/media/upload" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // Chỉ dùng useEffect để cập nhật UI nút Login/Logout
  useEffect(() => {
    setIsLoggedIn(auth.isLoggedIn());
  }, [pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 800, color: "primary.main" }}>CDNVIETPQ</Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton component={Link} href={item.href} selected={pathname === item.href}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isLoggedIn && (
        <List><ListItem disablePadding><ListItemButton onClick={() => auth.logout()} sx={{ color: "error.main" }}><ListItemText primary="Đăng xuất" /></ListItemButton></ListItem></List>
      )}
    </Box>
  );

  return (
    <html lang="vi">
      <body>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(8px)", color: "text.primary" }}>
              <Container maxWidth="lg">
                <Toolbar disableGutters>
                  <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: "none" } }}><MenuIcon /></IconButton>
                  <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, textDecoration: "none", color: "primary.main", fontWeight: 800 }}>CDNVIETPQ</Typography>
                  <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                    {navItems.map((item) => (
                      <Button key={item.href} component={Link} href={item.href} sx={{ ml: 2, fontWeight: 700, color: pathname === item.href ? "primary.main" : "text.secondary" }}>{item.label}</Button>
                    ))}
                    {isLoggedIn ? (
                      <Button onClick={() => auth.logout()} variant="outlined" color="error" size="small" startIcon={<LogoutIcon />} sx={{ ml: 4 }}>Thoát</Button>
                    ) : (
                      pathname !== "/login" && <Button component={Link} href="/login" variant="contained" sx={{ ml: 4 }}>Đăng nhập</Button>
                    )}
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>
            <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}>{drawer}</Drawer>
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
              {children}
            </Box>
          </Box>
        </QueryClientProvider>
      </body>
    </html>
  );
}