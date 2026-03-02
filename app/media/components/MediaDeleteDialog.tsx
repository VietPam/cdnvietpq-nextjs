"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MediaDeleteDialog({
  open,
  onClose,
  onConfirm
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Xác nhận xóa tệp?
      </DialogTitle>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
        >
          Xác nhận xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}