export default class DecompressError extends Error {
  constructor(source: string, error: Error) {
    const message = `Decompress ${source} FAILED: ${error.message}`;
    super(message);
    this.name = "DecompressError";
    this.stack = error.stack;
  }
}
