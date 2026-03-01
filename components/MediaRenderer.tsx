"use client";
import { Box, Typography } from "@mui/material";

interface Props {
  url: string;
  mimeType: string;
  preview?: boolean; // Nếu là true thì thu nhỏ để hiện trong Card
}

export const MediaRenderer = ({ url, mimeType, preview = false }: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  const commonStyle = {
    width: "100%",
    height: preview ? 180 : "auto",
    maxHeight: preview ? 180 : 500,
    objectFit: preview ? ("cover" as const) : ("contain" as const),
    borderRadius: preview ? 0 : 2,
    display: "block",
  };

  if (isImage) return <Box component="img" src={url} sx={commonStyle} loading="lazy" />;
  
  if (isVideo) return (
    <Box component="video" src={url} controls={!preview} sx={{ ...commonStyle, bgcolor: "black" }}>
      {preview && <source src={url} />} 
    </Box>
  );

  if (isAudio) return (
    <Box sx={{ p: preview ? 4 : 2, bgcolor: "grey.100", ...commonStyle, display: 'flex', alignItems: 'center' }}>
      <audio src={url} controls style={{ width: "100%" }} />
    </Box>
  );

  return (
    <Box sx={{ ...commonStyle, bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="overline" fontWeight={700}>{mimeType.split("/")[1]}</Typography>
    </Box>
  );
};