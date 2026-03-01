import { Typography, Stack, Button } from "@mui/material";
import { Media } from "@/lib/types";

async function getMedia(id: string): Promise<Media | null> {
  console.log("👉 [Server] Fetching media with id:", id);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/media/${id}`,
    {
      cache: "no-store",
    }
  );

  console.log("👉 [Server] Response status:", res.status);

  if (!res.ok) return null;

  const data = await res.json();
  console.log("👉 [Server] Media data:", data);

  return data.media;
}

export default async function MediaDetail({
  params,
}: {
  params: { id: string };
}) {
  console.log("👉 [Server] MediaDetail params:", params);

  const media = await getMedia(params.id);

  if (!media) return <div>Media not found</div>;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Media Detail (Server Component)
      </Typography>

      <Stack spacing={1}>
        <Typography>ID: {media.id}</Typography>
        <Typography>Filename: {media.filename}</Typography>
        <Typography>MIME: {media.mime_type}</Typography>
        <Typography>Size: {media.size}</Typography>
        <Typography>Visibility: {media.visibility}</Typography>

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