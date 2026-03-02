"use client"

import { Box, Typography } from "@mui/material"
import React from "react"

interface DetailItemProps {
  label: string
  value?: any
  isCode?: boolean
}

export default function DetailItem({
  label,
  value,
  isCode = false
}: DetailItemProps) {
  const displayValue =
    value === null || value === undefined
      ? "-"
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value)

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={isCode ? 400 : 600}
        sx={{
          wordBreak: "break-all",
          fontFamily: isCode ? "monospace" : "inherit"
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  )
}