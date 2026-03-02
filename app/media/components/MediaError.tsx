"use client";
import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  refetch: () => void;
}

export default function MediaError({ refetch }: Props) {
  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <ErrorOutline
        color="error"
        sx={{ fontSize: 60, mb: 2 }}
      />
      <Typography variant="h6">
        Đã xảy ra lỗi khi tải dữ liệu
      </Typography>
      <Button
        onClick={refetch}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Thử lại
      </Button>
    </Container>
  );
}