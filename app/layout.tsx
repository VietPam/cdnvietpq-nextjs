"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Thư viện", href: "/media" },
  { label: "Tải lên", href: "/media/upload" },
];

// Danh sách các route không cần đăng nhập
const PUBLIC_ROUTES = ["/login"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = auth.isLoggedIn();
      setIsLoggedIn(loggedIn);

      // 👉 LOGIC CHUYỂN HƯỚNG: 
      // Nếu chưa login và cố tình vào các trang không phải public
      if (!loggedIn && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/login");
      } 
      // Nếu đã login rồi mà vẫn ở trang /login thì đá về Home
      else if (loggedIn && pathname === "/login") {
        router.replace("/");
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    auth.logout();
    setIsLoggedIn(false);
    router.replace("/login");
  };

  // Hiển thị màn hình Loading trắng khi đang check auth để tránh bị "flash" giao diện cũ
  if (checkingAuth) {
    return (
      <html lang="vi">
        <body>
          <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        </body>
      </html>
    );
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 800, color: "primary.main" }}>
        CDNVIETPQ
      </Typography>
      <Divider />
      {isLoggedIn && (
        <>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  sx={{
                    textAlign: "center",
                    "&.Mui-selected": { bgcolor: "primary.light", color: "white" },
                  }}
                >
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ textAlign: "center", color: "error.main" }}>
                <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <html lang="vi">
      <body>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Ẩn AppBar nếu đang ở trang Login để giao diện tập trung hơn */}
            {pathname !== "/login" && (
              <AppBar
                position="sticky"
                elevation={0}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(8px)",
                  color: "text.primary",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
              >
                <Container maxWidth="lg">
                  <Toolbar disableGutters>
                    {isLoggedIn && (
                      <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: "none" } }}
                      >
                        <MenuIcon />
                      </IconButton>
                    )}

                    <Typography
                      variant="h6"
                      component={Link}
                      href="/"
                      sx={{
                        flexGrow: 1,
                        textDecoration: "none",
                        color: "primary.main",
                        fontWeight: 800,
                        letterSpacing: "-1px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      CDNVIETPQ
                    </Typography>

                    {isLoggedIn && (
                      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                        {navItems.map((item) => (
                          <Button
                            key={item.href}
                            component={Link}
                            href={item.href}
                            sx={{
                              ml: 2,
                              fontWeight: 700,
                              textTransform: "none",
                              color: pathname === item.href ? "primary.main" : "text.secondary",
                              position: "relative",
                              "&::after": pathname === item.href ? {
                                content: '""',
                                position: "absolute",
                                bottom: 5,
                                left: "10%",
                                width: "80%",
                                height: "3px",
                                bgcolor: "primary.main",
                                borderRadius: "10px",
                              } : {},
                            }}
                          >
                            {item.label}
                          </Button>
                        ))}
                        <Button
                          onClick={handleLogout}
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<LogoutIcon />}
                          sx={{ ml: 4, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
                        >
                          Thoát
                        </Button>
                      </Box>
                    )}
                  </Toolbar>
                </Container>
              </AppBar>
            )}

            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
              }}
            >
              {drawer}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, py: pathname === "/login" ? 0 : { xs: 2, md: 4 } }}>
              {children}
            </Box>
          </Box>
        </QueryClientProvider>
      </body>
    </html>
  );
}