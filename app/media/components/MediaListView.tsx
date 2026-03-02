"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  IconButton,
  Box,
  Chip
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { MediaRenderer } from "@/components/MediaRenderer";
import { formatBytes } from "@/lib/utils";
import { MediaItem } from "@/types/media";

interface Props {
  items: MediaItem[];
  onDelete: (id: string) => void;
}

export default function MediaListView({
  items,
  onDelete
}: Props) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 3 }}
    >
      <Table>
        <TableHead sx={{ bgcolor: "grey.50" }}>
          <TableRow>
            <TableCell width={70}>Xem</TableCell>
            <TableCell>Tên tệp</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Dung lượng</TableCell>
            <TableCell align="right">Hành động</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    overflow: "hidden"
                  }}
                >
                  <MediaRenderer
                    url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${item.id}/file`}
                    mimeType={item.mime_type}
                    preview
                  />
                </Box>
              </TableCell>

              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                >
                  {item.filename}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={item.mime_type.split("/")[1]}
                  size="small"
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                {formatBytes(item.size)}
              </TableCell>

              <TableCell align="right">
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(item.id)}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}