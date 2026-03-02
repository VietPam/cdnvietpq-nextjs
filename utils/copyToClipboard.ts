export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator?.clipboard) {
    throw new Error("Clipboard API not supported")
  }

  await navigator.clipboard.writeText(text)
}