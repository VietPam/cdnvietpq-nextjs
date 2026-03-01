"use client";

import React, { useState } from "react";
import {
  Button,
  Typography,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // nếu bạn muốn expose ra client

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  console.log("👉 Backend URL:", BACKEND_URL);

  const handleUpload = async () => {
    console.log("👉 Upload clicked");

    if (!file) {
      alert("Select a file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("visibility", visibility);

      console.log("👉 Calling backend:", `${BACKEND_URL}/upload`);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        headers: {
          "x-api-key": API_KEY || "",
        },
        body: formData,
      });

      console.log("👉 Status:", res.status);

      const text = await res.text();
      console.log("👉 Response:", text);

      if (!res.ok) {
        alert("Upload failed");
        return;
      }

      alert("Upload success!");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Upload Media (Direct to Worker)
      </Typography>

      <Stack spacing={2}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <TextField
          select
          label="Visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <MenuItem value="public">Public</MenuItem>
          <MenuItem value="private">Private</MenuItem>
        </TextField>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </Stack>
    </>
  );
}