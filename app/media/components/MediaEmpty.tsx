"use client";
import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import Link from "next/link";

export default function MediaEmpty() {
  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <CloudUpload sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
      <Typography
        variant="h5"
        color="text.secondary"
        gutterBottom
      >
        Thư viện trống
      </Typography>
      <Button
        component={Link}
        href="/media/upload"
        variant="contained"
      >
        Tải lên file đầu tiên
      </Button>
    </Container>
  );
}