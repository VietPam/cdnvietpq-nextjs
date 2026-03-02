"use client"
import { Box, Pagination } from "@mui/material"

export default function MediaPagination({ page, totalPages, onChange }: any) {
  return (
    <Box display="flex" justifyContent="center" mt={6}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, v) => onChange(v)}
        color="primary"
        shape="rounded"
      />
    </Box>
  )
}