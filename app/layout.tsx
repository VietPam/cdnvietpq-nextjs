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
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Thư viện", href: "/media" },
  { label: "Tải lên", href: "/media/upload" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{ my: 2, fontWeight: 800, color: "primary.main" }}
      >
        CDNVIETPQ
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{
                textAlign: "center",
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "white",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <html lang="vi">
      <body>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                color: "text.primary",
              }}
            >
              <Container maxWidth="lg">
                <Toolbar disableGutters>
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { md: "none" } }}
                  >
                    <MenuIcon />
                  </IconButton>

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

                  <Box sx={{ display: { xs: "none", md: "block" } }}>
                    {navItems.map((item) => (
                      <Button
                        key={item.href}
                        component={Link}
                        href={item.href}
                        sx={{
                          ml: 2,
                          fontWeight: 700,
                          textTransform: "none",
                          color:
                            pathname === item.href
                              ? "primary.main"
                              : "text.secondary",
                          position: "relative",
                          "&::after":
                            pathname === item.href
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  bottom: 5,
                                  left: "10%",
                                  width: "80%",
                                  height: "3px",
                                  bgcolor: "primary.main",
                                  borderRadius: "10px",
                                }
                              : {},
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                </Toolbar>
              </Container>
            </AppBar>

            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: 250,
                },
              }}
            >
              {drawer}
            </Drawer>

            <Box
              component="main"
              sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}
            >
              {children}
            </Box>
          </Box>
        </QueryClientProvider>
      </body>
    </html>
  );
}