export async function downloadMedia(
    id: string,
    filename: string
): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

    if (!baseUrl) {
        throw new Error("Backend URL is not defined")
    }

    const response = await fetch(`${baseUrl}/media/${id}/file`)

    if (!response.ok) {
        throw new Error("Failed to download file")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
}