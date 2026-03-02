"use client"
import { Stack, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { GridView, ViewList } from "@mui/icons-material"

export default function MediaHeader({ viewMode, onChange }: any) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={4}
    >
      <Typography variant="h4" fontWeight={800}>
        Thư viện Media
      </Typography>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, v) => v && onChange(v)}
        size="small"
      >
        <ToggleButton value="grid">
          <GridView fontSize="small" />
        </ToggleButton>
        <ToggleButton value="list">
          <ViewList fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}