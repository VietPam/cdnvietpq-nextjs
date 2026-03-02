"use client";

import React, { useState, useEffect } from "react";
import { 
  AppBar, Toolbar, Typography, Container, CssBaseline, IconButton, 
  Drawer, List, ListItem, ListItemButton, ListItemText, Box, 
  Button, Divider, Avatar, Menu, MenuItem, ListItemIcon, Tooltip 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { auth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Thư viện", href: "/media" },
  { label: "Tải lên", href: "/media/upload" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const pathname = usePathname();

  useEffect(() => {
    const loggedIn = auth.isLoggedIn();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      setUser(auth.getUser());
    }
  }, [pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  // GIAO DIỆN DRAWER CHO MOBILE
  const drawer = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Phần Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: '-0.5px' }}>
          CDNVIETPQ
        </Typography>
      </Box>

      <Divider />

      {/* 2. Phần User (Nằm GIỮA Logo và Nav Items) */}
      {isLoggedIn ? (
        <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)', textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 60, 
              height: 60, 
              mx: 'auto', 
              mb: 1.5, 
              fontSize: '1.5rem', 
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            {user?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            Administrator
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
            {user?.email}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            fullWidth 
            startIcon={<LogoutIcon />}
            onClick={() => auth.logout()}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Đăng xuất
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Button 
            component={Link} 
            href="/login" 
            variant="contained" 
            fullWidth 
            onClick={handleDrawerToggle}
            sx={{ borderRadius: 2 }}
          >
            Đăng nhập ngay
          </Button>
        </Box>
      )}

      <Divider />

      {/* 3. Phần Navigation Items */}
      <List sx={{ px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              href={item.href} 
              onClick={handleDrawerToggle}
              selected={pathname === item.href}
              sx={{ 
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.light' }
                }
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">v1.0.2 Build 2024</Typography>
      </Box>
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
                  
                  <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1, textDecoration: "none", color: "primary.main", fontWeight: 800 }}>
                    CDNVIETPQ
                  </Typography>

                  <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                    {navItems.map((item) => (
                      <Button 
                        key={item.href} 
                        component={Link} 
                        href={item.href} 
                        sx={{ 
                          ml: 2, 
                          fontWeight: 700, 
                          color: pathname === item.href ? "primary.main" : "text.secondary",
                          borderBottom: pathname === item.href ? '2px solid' : 'none',
                          borderRadius: 0
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}

                    {isLoggedIn ? (
                      <>
                        <Tooltip title="Tài khoản">
                          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 35, height: 35, fontSize: '1rem', fontWeight: 700 }}>
                              {user?.email?.charAt(0).toUpperCase()}
                            </Avatar>
                          </IconButton>
                        </Tooltip>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleCloseUserMenu}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                          PaperProps={{ sx: { mt: 1.5, minWidth: 180, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' } }}
                        >
                          <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>Administrator</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
                          </Box>
                          <Divider />
                          <MenuItem onClick={handleCloseUserMenu} sx={{ fontSize: '0.9rem' }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> Hồ sơ
                          </MenuItem>
                          <MenuItem onClick={handleCloseUserMenu} sx={{ fontSize: '0.9rem' }}>
                            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Cài đặt
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={() => auth.logout()} sx={{ color: 'error.main', fontSize: '0.9rem' }}>
                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Đăng xuất
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      pathname !== "/login" && (
                        <Button component={Link} href="/login" variant="contained" startIcon={<AccountCircleIcon />} sx={{ ml: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                          Đăng nhập
                        </Button>
                      )
                    )}
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>

            <Drawer 
              variant="temporary" 
              open={mobileOpen} 
              onClose={handleDrawerToggle}
              PaperProps={{ sx: { borderTopRightRadius: 16, borderBottomRightRadius: 16 } }}
            >
              {drawer}
            </Drawer>
            
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
              {children}
            </Box>
          </Box>
        </QueryClientProvider>
        <Analytics />
      </body>
    </html>
  );
}