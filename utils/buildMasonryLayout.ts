import { MediaItem } from "@/types/media"

interface MasonryItem extends MediaItem {
  ratio: number
}

export function buildMasonryLayout(
  items: MediaItem[],
  colCount: number
): MediaItem[] {
  if (!items?.length) return []

  const sorted: MasonryItem[] = items
    .map(item => ({
      ...item,
      ratio:
        item.height && item.width
          ? item.height / item.width
          : 1
    }))
    .sort((a, b) => b.ratio - a.ratio)

  return sorted.map((_, index, arr) => {
    const row = Math.floor(index / colCount)
    const col = index % colCount
    const base = row * colCount
    const countInRow = Math.min(
      colCount,
      arr.length - base
    )

    return arr[
      row % 2 === 0
        ? base + col
        : base + (countInRow - 1 - col)
    ]
  })
}