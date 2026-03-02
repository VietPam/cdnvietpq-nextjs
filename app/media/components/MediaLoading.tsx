"use client";
import React from "react";
import {
  Container,
  Stack,
  Skeleton,
  Box
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";

interface Props {
  colCount: number;
  skeletonHeights: number[];
}

export default function MediaLoading({
  colCount,
  skeletonHeights
}: Props) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Skeleton
          variant="text"
          width={280}
          height={60}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          width={100}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      </Stack>

      <Masonry columns={colCount} spacing={1.5}>
        {skeletonHeights.map((h, i) => (
          <Box key={i} sx={{ mb: 1.5 }}>
            <Skeleton
              variant="rectangular"
              height={h}
              sx={{
                borderRadius: 3,
                animationDuration: `${1 + i * 0.1}s`
              }}
            />
          </Box>
        ))}
      </Masonry>

      <Box display="flex" justifyContent="center" mt={6}>
        <Skeleton
          variant="rectangular"
          width={300}
          height={40}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Container>
  );
}