const REVOKE_DELAY_MS = 2000;

export function downloadBlob(blob: Blob, fileName: string): void {
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout((): void => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
