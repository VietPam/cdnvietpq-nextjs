"use client";
import { Box, Typography } from "@mui/material";

interface Props {
  url: string;
  mimeType: string;
  preview?: boolean;
  priority?: boolean;
}

export const MediaRenderer = ({
  url,
  mimeType,
  preview = false,
  priority = false
}: Props) => {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  const mediaStyle = {
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: preview ? 0 : 2,
    objectFit: "contain" as const,
    maxHeight: preview ? "none" : "80vh"
  };

  if (isImage)
    return (
      <Box
        component="img"
        src={url}
        alt="Media content"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sx={mediaStyle}
      />
    );

  if (isVideo)
    return (
      <Box
        component="video"
        src={url}
        preload={priority ? "auto" : "metadata"}
        controls={!preview}
        muted
        loop={preview}
        sx={{ ...mediaStyle, bgcolor: "black" }}
      />
    );

  if (isAudio)
    return (
      <Box sx={{ p: 2, bgcolor: "grey.100", width: "100%", borderRadius: 2 }}>
        <audio src={url} controls />
      </Box>
    );

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "grey.200",
        textAlign: "center",
        borderRadius: 2
      }}
    >
      <Typography variant="overline" fontWeight={700}>
        {mimeType.split("/")[1]}
      </Typography>
    </Box>
  );
};