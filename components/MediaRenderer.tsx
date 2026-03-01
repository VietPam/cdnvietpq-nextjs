"use client";
import { Box, Typography } from "@mui/material";

interface Props {
  url: string;
  mimeType: string;
  preview?: boolean;
}

export const MediaRenderer = ({ url, mimeType, preview = false }: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  const mediaStyle = {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: preview ? 0 : 2,
    objectFit: "contain" as const,
    maxHeight: preview ? "none" : "80vh", // Tránh ảnh quá dài ở trang detail
  };

  if (isImage) return (
    <Box component="img" src={url} alt="Media content" sx={mediaStyle} />
  );
  
  if (isVideo) return (
    <Box 
      component="video" 
      src={url} 
      controls={!preview} // Trang detail hiện nút bấm, trang list thì ẩn
      autoPlay={preview}   // Trang list tự chạy preview
      muted={preview}      // Luôn muted khi tự chạy để tránh phiền
      loop={preview} 
      sx={{ ...mediaStyle, bgcolor: "black" }} 
    />
  );

  if (isAudio) return (
    <Box sx={{ p: 2, bgcolor: "grey.100", width: "100%", borderRadius: 2 }}>
      <audio src={url} controls style={{ width: "100%" }} />
    </Box>
  );

  return (
    <Box sx={{ p: 4, bgcolor: "grey.200", textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="overline" fontWeight={700}>{mimeType.split("/")[1]}</Typography>
    </Box>
  );
};