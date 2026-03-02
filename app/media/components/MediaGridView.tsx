"use client";
import React from "react";
import {
  Card,
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import {
  DeleteOutline,
  ContentCopy,
  Download,
  PlayCircleOutline
} from "@mui/icons-material";
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import { MediaItem } from "../page";

interface Props {
  items: MediaItem[];
  colCount: number;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string) => void;
}

export default function MediaGridView({
  items,
  colCount,
  onCopy,
  onDelete,
  onDownload
}: Props) {
  return (
    <Masonry columns={colCount} spacing={1.5}>
      {items.map((item) => (
        <Card
          key={item.id}
          sx={{
            borderRadius: 3,
            position: "relative",
            border: "none",
            overflow: "hidden",
            bgcolor: "grey.100",
            aspectRatio: `${item.width || 1} / ${item.height || 1}`,
            transition: "transform 0.3s ease",
            "&:hover": { transform: "translateY(-4px)" },
            "&:hover .overlay-content": { opacity: 1 }
          }}
        >
          <Box
            sx={{
              lineHeight: 0,
              height: "100%",
              overflow: "hidden"
            }}
          >
            <MediaRenderer
              url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
              mimeType={item.mime_type}
              preview
            />
          </Box>

          {item.mime_type.startsWith("video/") && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                opacity: 0.6,
                pointerEvents: "none",
                zIndex: 1
              }}
            >
              <PlayCircleOutline sx={{ fontSize: 48 }} />
            </Box>
          )}

          <Box
            className="overlay-content"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 1.5,
              opacity: 0,
              transition: "opacity 0.3s ease-in-out",
              zIndex: 2
            }}
          >
            <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
              <Tooltip title="Copy link">
                <IconButton
                  size="small"
                  onClick={() => onCopy(item.id)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white"
                  }}
                >
                  <ContentCopy fontSize="inherit" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={() => onDelete(item.id)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": { bgcolor: "#ff4444" }
                  }}
                >
                  <DeleteOutline fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Box>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: "white",
                  fontWeight: 600,
                  display: "block",
                  mb: 0.5
                }}
              >
                {item.filename}
              </Typography>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "10px"
                  }}
                >
                  {formatBytes(item.size)}
                </Typography>

                <IconButton
                  size="small"
                  sx={{ color: "white", p: 0 }}
                  onClick={() =>
                    onDownload(item.id, item.filename)
                  }
                >
                  <Download sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Card>
      ))}
    </Masonry>
  );
}