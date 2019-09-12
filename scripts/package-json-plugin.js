const fs = require('fs');
const path = require('path');

class PackageJSONPlugin {
  apply(compiler) { /* eslint-disable-line*/
    const { options } = compiler;
    const { output: { path: outputPath }, context } = options;

    compiler.hooks.afterEmit.tapAsync('PackageJSONPlugin', (compilation, callback) => {
      const packageFilePath = path.join(context, 'package.json');

      let pkg;
      try {
        pkg = require(packageFilePath); /* eslint-disable-line */
      } catch (err) {
        callback(err);
        return;
      }

      // 数据处理
      delete pkg.dependencies;
      delete pkg.bin['create-recore-app'];
      delete pkg.scripts;
      pkg.bin.create = 'create.js';

      // 写入文件
      const writer = fs.createWriteStream(path.join(outputPath, 'package.json'));
      try {
        writer.write(JSON.stringify(pkg, null, 2));
      } catch (err) {
        callback(err);
        return;
      }

      callback();
    });
  }
}

module.exports = PackageJSONPlugin;
