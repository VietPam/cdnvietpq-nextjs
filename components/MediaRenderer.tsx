"use client";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface Props {
  url: string;
  mimeType: string;
  preview?: boolean;
}

export const MediaRenderer = ({ url, mimeType, preview = false }: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  const containerStyle = {
  width: "100%",
  height: "auto", // Để chiều cao tự động theo file
  position: "relative" as const,
  overflow: "hidden",
  borderRadius: preview ? 0 : 2,
  display: "block",
};

  if (isImage) return (
  <Box sx={containerStyle}>
    <img 
      src={url} 
      alt="Media content" 
      style={{ 
        width: "100%", 
        height: "auto", // Ảnh sẽ cao theo tỷ lệ gốc
        display: "block" 
      }} 
    />
  </Box>
);

if (isVideo) return (
  <Box 
    component="video" 
    src={url} 
    controls={!preview} 
    autoPlay={preview}
    muted={preview}
    loop={preview}
    sx={{ 
      width: "100%", 
      height: "auto", // Video cũng sẽ giữ tỷ lệ 16:9 hoặc 4:3 gốc
      display: "block",
      bgcolor: "black" 
    }} 
  />
);

  if (isAudio) return (
    <Box sx={{ p: 2, bgcolor: "grey.100", ...containerStyle, height: "auto", display: 'flex' }}>
      <audio src={url} controls style={{ width: "100%" }} />
    </Box>
  );

  return (
    <Box sx={{ ...containerStyle, height: 180, bgcolor: "grey.200", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Typography variant="overline" fontWeight={700}>{mimeType.split("/")[1]}</Typography>
    </Box>
  );
};