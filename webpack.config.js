const path = require("path");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const webpack = require("webpack");
const InjectShellSymbolPlugin = require("./scripts/inject-shell-symbol-plugin");
const PackageJSONPlugin = require("./scripts/package-json-plugin");

module.exports = {
  entry: {
    create: "./src/bin/create.ts",
  },
  // mode: "none",
  mode: "production",
  module: {
    rules: [
      {
        loader: "ts-loader",
        test: /\.ts?$/,
      },
      {
        test: /\.ts$/,
        use: [{
          loader: path.resolve(__dirname, "scripts/run-context-replacement-loader.js"),
        }],
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "build"),
  },
  plugins: [
    new webpack.IgnorePlugin(/^electron$/),
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
      NODE_GLOBAL_VARIABLE: "{require: require, module: module, process: process, exports: exports, console: console}",
    }),
    new InjectShellSymbolPlugin(),
    new PackageJSONPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  target: "node",
};
