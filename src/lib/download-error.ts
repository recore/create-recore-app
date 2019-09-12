export default class DownloadError extends Error {
  constructor(url: string, error: Error) {
    const message = `Download ${url} FAILED: ${error.message}`;
    super(message);
    this.name = "DownloadError";
    this.stack = error.stack;
  }
}
