"use client";

import { ReactNode } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
} from "@mui/material";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              CDN Admin
            </Typography>

            <Link href="/media" style={{ color: "white", marginRight: 16 }}>
              Media
            </Link>

            <Link href="/media/upload" style={{ color: "white" }}>
              Upload
            </Link>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          {children}
        </Container>
      </body>
    </html>
  );
}