"use client";
import { Box } from "@mui/material";

interface Props {
  url: string;
  mimeType: string;
  preview?: boolean;
}

export const MediaRenderer = ({ url, mimeType, preview = false }: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");

  const mediaStyle = {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 'inherit',
    objectFit: "cover" as const,
  };

  if (isImage) return (
    <Box component="img" src={url} alt="Media" sx={mediaStyle} />
  );
  
  if (isVideo) return (
    <Box component="video" src={url} sx={mediaStyle} muted loop autoPlay={preview} />
  );

  return (
    <Box sx={{ ...mediaStyle, aspectRatio: '1/1', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {mimeType.split('/')[1].toUpperCase()}
    </Box>
  );
};