export default class CacheError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.name = "CacheError";
    this.stack = error.stack;
  }
}
