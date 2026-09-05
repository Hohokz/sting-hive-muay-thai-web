/**
 * Triggers a browser download for an axios blob response, using the
 * filename from the server's Content-Disposition header when available
 * (falls back to `fallbackName` otherwise — e.g. if CORS ever blocks it).
 */
export const downloadBlobResponse = (response, fallbackName) => {
  const disposition = response.headers?.['content-disposition']
  const match = disposition && /filename="?([^"]+)"?/.exec(disposition)
  const filename = match?.[1] || fallbackName

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
