"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Định nghĩa danh sách điều hướng để dùng chung cho cả Desk và Mobile
const navItems = [
  { label: "Thư viện", href: "/media" },
  { label: "Tải lên", href: "/media/upload" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Giao diện của Drawer (Menu bên hông)
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        CDN ADMIN
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <html lang="vi">
      <body>
        <CssBaseline />
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}>
            <Container maxWidth="lg">
              <Toolbar disableGutters>
                {/* Nút Hamburger cho Mobile */}
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: "none" } }}
                >
                  <MenuIcon />
                </IconButton>

                <Typography
                  variant="h6"
                  component={Link}
                  href="/media"
                  sx={{
                    flexGrow: 1,
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  CDNVIETPQ
                </Typography>

                {/* Menu cho Desktop */}
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      sx={{
                        ml: 2,
                        fontWeight: 600,
                        color: pathname === item.href ? "primary.main" : "text.secondary",
                        borderBottom: pathname === item.href ? "2px solid" : "none",
                        borderRadius: 0,
                        "&:hover": { bgcolor: "transparent", color: "primary.main" },
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              </Toolbar>
            </Container>
          </AppBar>

          {/* Thành phần Drawer cho Mobile */}
          <nav>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }} // Tăng hiệu năng trên mobile
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
              }}
            >
              {drawer}
            </Drawer>
          </nav>

          <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
            <Container maxWidth="lg">
              {children}
            </Container>
          </Box>
          
          {/* Footer đơn giản */}
          <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
             <Typography variant="caption" color="text.secondary">
               © 2026 CDNVIETPQ Admin Panel
             </Typography>
          </Box>
        </Box>
      </body>
    </html>
  );
}

// Import bổ sung nếu thiếu
import { Divider } from "@mui/material";