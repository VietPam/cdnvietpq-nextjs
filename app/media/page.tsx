"use client"
import {
  Container,
  Box,
  Fade
} from "@mui/material"
import MediaLoading from "./components/MediaLoading"
import MediaEmpty from "./components/MediaEmpty"
import MediaError from "./components/MediaError"
import MediaDeleteDialog from "./components/MediaDeleteDialog"
import MediaHeader from "./components/MediaHeader"
import MediaPagination from "./components/MediaPagination"
import MediaViewRenderer from "./components/MediaViewRenderer"
import { useMediaPageController } from "@/hooks/useMediaPageController"

export default function MediaPage() {
  const controller = useMediaPageController()

  if (controller.isError)
    return <MediaError refetch={controller.refetch} />

  if (controller.isLoading)
    return (
      <MediaLoading
        colCount={controller.colCount}
        skeletonHeights={controller.skeletonHeights}
      />
    )

  if (!controller.data?.data?.length)
    return <MediaEmpty />

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in={!controller.isLoading} timeout={800}>
        <Box>
          <MediaHeader
            viewMode={controller.viewMode}
            onChange={controller.setViewMode}
          />

          <MediaViewRenderer
            viewMode={controller.viewMode}
            items={controller.displayData}
            colCount={controller.colCount}
            visibleRows={controller.visibleRows}
            onCopy={controller.handleCopy}
            onDelete={controller.setDeleteId}
            onDownload={controller.handleDownload}
          />

          <MediaPagination
            page={controller.page}
            totalPages={controller.data.pagination.totalPages}
            onChange={controller.setPage}
          />
        </Box>
      </Fade>

      <MediaDeleteDialog
        open={!!controller.deleteId}
        onClose={() => controller.setDeleteId(null)}
        onConfirm={() => {
          if (controller.deleteId)
            controller.deleteMedia(controller.deleteId)
        }}
      />
    </Container>
  )
}