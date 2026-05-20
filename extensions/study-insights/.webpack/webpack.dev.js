const { merge } = require('webpack-merge');
const path = require('path');
const webpackCommon = require('./../../../.webpack/webpack.base.js');

const SRC_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');

const ENTRY = {
  app: `${SRC_DIR}/index.tsx`,
};

module.exports = (env, argv) => {
  const commonConfig = webpackCommon(env, argv, { SRC_DIR, DIST_DIR, ENTRY });

  return merge(commonConfig, {
    devtool: 'cheap-module-source-map',
    output: {
      path: DIST_DIR,
      library: 'ohif-extension-study-insights',
      libraryTarget: 'umd',
      libraryExport: 'default',
    },
    externals: [/\b(vtk.js)/, /\b(dcmjs)/, /\b(gl-matrix)/, /^@ohif/, /^@cornerstonejs/],
  });
};
