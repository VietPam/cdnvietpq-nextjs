"use client"

import { Grid, Paper } from "@mui/material"
import { MediaRenderer } from "@/components/MediaRenderer"
import MediaDetailSidebar from "./MediaDetailSidebar"

export default function MediaDetailView({
  item,
  fileUrl,
  copied,
  onCopy
}: any) {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <MediaRenderer url={fileUrl} mimeType={item.mime_type} preview={false} />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <MediaDetailSidebar
          item={item}
          fileUrl={fileUrl}
          copied={copied}
          onCopy={onCopy}
        />
      </Grid>
    </Grid>
  )
}