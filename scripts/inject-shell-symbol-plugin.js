class InjectShellSymbolPlugin {
  apply(compiler) { /* eslint-disable-line*/
    compiler.hooks.compilation.tap('InjectShellSymbolPlugin', (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap('InjectShellSymbolPlugin', (assets) => {
        const file = 'create.js';
        const content = assets[file]._value; /* eslint-disable-line */
        const newContent = ['#!/usr/bin/env node', content].join('\n');
        assets[file]._value = newContent; /* eslint-disable-line */
      });
    });
  }
}

module.exports = InjectShellSymbolPlugin;
