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
    height: preview ? 180 : "auto",
    position: "relative" as const,
    overflow: "hidden",
    borderRadius: preview ? 0 : 2,
    display: "block",
  };

  if (isImage) return (
    <Box sx={containerStyle}>
      <Image 
        src={url} 
        alt="Media content" 
        fill={preview}
        width={preview ? undefined : 800}
        height={preview ? undefined : 600}
        style={{ objectFit: preview ? "cover" : "contain" }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </Box>
  );
  
  if (isVideo) return (
    <Box component="video" src={url} controls={!preview} 
      sx={{ ...containerStyle, height: preview ? 180 : "auto", maxHeight: 500, bgcolor: "black" }}>
      {preview && <source src={url} />} 
    </Box>
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