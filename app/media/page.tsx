"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Typography,
  Pagination,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { api } from "@/lib/api";
import { Media, Pagination as PaginationType } from "@/lib/types";

export default function MediaPage() {
  const [data, setData] = useState<Media[]>([]);
  const [pagination, setPagination] =
    useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = async (pageNumber: number) => {
    const res = await api.get(`/media?page=${pageNumber}&limit=10`);
    setData(res.data.data);
    setPagination(res.data.pagination);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media?")) return;
    await api.delete(`/media/${id}`);
    fetchData(page);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Media List
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Filename</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Visibility</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.filename}</TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>{item.visibility}</TableCell>
              <TableCell>
                <Link href={`/media/${item.id}`}>
                  <Button size="small">View</Button>
                </Link>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Stack>
      )}
    </>
  );
}