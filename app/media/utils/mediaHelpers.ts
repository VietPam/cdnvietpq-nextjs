import { MediaItem } from "@/types/media";

export const copyToClipboard = (id: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
  return navigator.clipboard.writeText(url);
};

export const downloadFile = async (id: string, filename: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/media/${id}/file`;
  const response = await fetch(url);
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const getMasonryData = (items: MediaItem[], colCount: number) => {
  if (!items) return [];
  const withRatio = items.map((item) => ({
    ...item,
    ratio: item.height && item.width ? item.height / item.width : 1,
  }));
  withRatio.sort((a, b) => b.ratio - a.ratio);

  const result = new Array(withRatio.length);
  for (let i = 0; i < withRatio.length; i++) {
    const row = Math.floor(i / colCount);
    const col = i % colCount;
    const base = row * colCount;
    const itemsInRow = Math.min(colCount, withRatio.length - base);
    const sortedIndex = row % 2 === 0 ? base + col : base + (itemsInRow - 1 - col);
    result[i] = withRatio[sortedIndex];
  }
  return result;
};