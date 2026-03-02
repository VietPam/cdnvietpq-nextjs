"use client";
import React from "react";
import {
  Snackbar,
  Alert
} from "@mui/material";

interface SnackbarState {
  open: boolean;
  msg: string;
  type: "success" | "error";
}

interface Props {
  snackbar: SnackbarState;
  setSnackbar: React.Dispatch<
    React.SetStateAction<SnackbarState>
  >;
}

export default function MediaSnackbar({
  snackbar,
  setSnackbar
}: Props) {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3000}
      onClose={() =>
        setSnackbar((prev) => ({
          ...prev,
          open: false
        }))
      }
    >
      <Alert
        severity={snackbar.type}
        variant="filled"
        sx={{ borderRadius: 2 }}
      >
        {snackbar.msg}
      </Alert>
    </Snackbar>
  );
}