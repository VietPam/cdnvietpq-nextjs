"use client"
import MediaGridView from "./MediaGridView"
import MediaListView from "./MediaListView"

export default function MediaViewRenderer({
  viewMode,
  items,
  colCount,
  visibleRows,
  onCopy,
  onDelete,
  onDownload
}: any) {
  if (viewMode === "grid") {
    return (
      <MediaGridView
        items={items.slice(0, visibleRows * colCount)}
        colCount={colCount}
        onCopy={onCopy}
        onDelete={onDelete}
        onDownload={onDownload}
      />
    )
  }

  return (
    <MediaListView
      items={items}
      onDelete={onDelete}
    />
  )
}