"use client";

import { useState } from "react";
import {
  Button,
  Typography,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { api } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", visibility);

    await api.post("/upload", formData);
    alert("Uploaded successfully!");
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Upload Media
      </Typography>

      <Stack spacing={2}>
        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        <TextField
          select
          label="Visibility"
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value)
          }
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Stack>
    </>
  );
}