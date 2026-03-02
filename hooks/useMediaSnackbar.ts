"use client"
import { useState } from "react"

export type SnackbarType = "success" | "error"

interface SnackbarState {
  open: boolean
  msg: string
  type: SnackbarType
}

export function useMediaSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    msg: "",
    type: "success"
  })

  const showSuccess = (msg: string) => {
    setSnackbar({
      open: true,
      msg,
      type: "success"
    })
  }

  const showError = (msg: string) => {
    setSnackbar({
      open: true,
      msg,
      type: "error"
    })
  }

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }))
  }

  return {
    snackbar,
    showSuccess,
    showError,
    closeSnackbar
  }
}