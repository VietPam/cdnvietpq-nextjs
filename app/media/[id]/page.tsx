"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { api } from "@/lib/api";
import { Media } from "@/lib/types";

export default function MediaDetail({
  params,
}: any) {
  const [media, setMedia] = useState<Media | null>(
    null
  );

  useEffect(() => {
    api.get(`/media/${params.id}`).then((res) => {
      setMedia(res.data.media);
    });
  }, [params.id]);

  if (!media) return <div>Loading...</div>;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Media Detail
      </Typography>

      <Stack spacing={1}>
        <Typography>ID: {media.id}</Typography>
        <Typography>
          Filename: {media.filename}
        </Typography>
        <Typography>
          MIME: {media.mime_type}
        </Typography>
        <Typography>
          Size: {media.size}
        </Typography>
        <Typography>
          Visibility: {media.visibility}
        </Typography>

        <Button
          variant="outlined"
          href={`/api/proxy/media/${media.id}/file`}
          target="_blank"
        >
          View File
        </Button>
      </Stack>
    </>
  );
}