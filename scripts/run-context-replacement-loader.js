function runContextReplacementLoader(source) {
  const callback = this.async();
  if (/runInNewContext\(\/\* replace with NODE_GLOBAL_VARIABLE \*\//.test(source)) {
    const source2 = source.replace(
      /runInNewContext\((\/\* replace with NODE_GLOBAL_VARIABLE \*\/(?:.|[\n])+)\);?/g,
      "runInNewContext(NODE_GLOBAL_VARIABLE as any)",
    );
    return callback(null, source2);
  }
  return callback(null, source);
}
module.exports = runContextReplacementLoader;
