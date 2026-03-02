"use client"
import React, { createContext, useContext, useState } from "react"
import { Snackbar, Alert } from "@mui/material"

type SnackbarType = "success" | "error" | "info" | "warning"

interface SnackbarState {
  open: boolean
  message: string
  type: SnackbarType
}

interface SnackbarContextProps {
  showSnackbar: (message: string, type?: SnackbarType) => void
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
)

export function GlobalSnackbarProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: "",
    type: "success"
  })

  const showSnackbar = (
    message: string,
    type: SnackbarType = "success"
  ) => {
    setState({
      open: true,
      message,
      type
    })
  }

  const handleClose = () => {
    setState(prev => ({
      ...prev,
      open: false
    }))
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={state.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}

export function useGlobalSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error(
      "useGlobalSnackbar must be used within GlobalSnackbarProvider"
    )
  }
  return context
}