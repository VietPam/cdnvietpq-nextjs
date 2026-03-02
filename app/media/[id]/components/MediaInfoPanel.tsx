"use client"

import { Paper, Typography } from "@mui/material"
import { formatBytes, formatDate } from "@/lib/utils"
import DetailItem from "./DetailItem"

export default function MediaInfoPanel({ item }: any) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Thông tin tệp tin
      </Typography>

      <DetailItem label="Dung lượng" value={formatBytes(item.size)} />
      <DetailItem label="ID định danh" value={item.id} isCode />
      <DetailItem
        label="Ngày tải lên"
        value={item.created_at ? formatDate(item.created_at) : "-"}
      />
      <DetailItem label="Loại MIME" value={item.mime_type} />
    </Paper>
  )
}