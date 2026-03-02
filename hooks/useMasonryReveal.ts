"use client"
import { useEffect, useState } from "react"

export function useMasonryReveal(dataLength: any, colCount: any) {
  const [visibleRows, setVisibleRows] = useState(1)

  useEffect(() => {
    setVisibleRows(1)
  }, [dataLength])

  useEffect(() => {
    if (!dataLength) return

    const totalRows = Math.ceil(dataLength / colCount)
    if (visibleRows >= totalRows) return

    const timer = setTimeout(() => {
      setVisibleRows((v: any) => v + 1)
    }, 200)

    return () => clearTimeout(timer)
  }, [visibleRows, dataLength, colCount])

  return visibleRows
}