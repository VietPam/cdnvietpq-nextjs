"use client"

import {
  Box,
  Stack,
  Typography,
  Chip,
  Button
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DownloadIcon from "@mui/icons-material/Download"
import MediaInfoPanel from "./MediaInfoPanel"

export default function MediaDetailSidebar({
  item,
  fileUrl,
  copied,
  onCopy
}: any) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ wordBreak: "break-word" }}>
          {item.filename}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Chip
            label={item.mime_type?.split("/")[1]?.toUpperCase()}
            size="small"
            color="primary"
            variant="filled"
          />
          <Chip
            label={item.visibility === "public" ? "Công khai" : "Riêng tư"}
            size="small"
            variant="outlined"
          />
        </Stack>
      </Box>

      <Stack spacing={1.5}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<ContentCopyIcon />}
          onClick={onCopy}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          {copied ? "Đã sao chép!" : "Sao chép Link CDN"}
        </Button>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<DownloadIcon />}
          component="a"
          href={fileUrl}
          download={item.filename}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          Tải về máy
        </Button>
      </Stack>

      <MediaInfoPanel item={item} />
    </Stack>
  )
}