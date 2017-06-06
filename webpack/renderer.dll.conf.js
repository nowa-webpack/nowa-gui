const webpackMerge = require('webpack-merge');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const DllPlugin = require('webpack/lib/DllPlugin');
const { resolve } = require('path');

const webpackCommon = require('./base.conf');

const outputDir = resolve(__dirname, '..', 'dll');

module.exports = webpackMerge(webpackCommon,
  {
    target: 'electron-renderer',
    // externals: ['fsevents', 'crypto-browserify'],
    // externals: ['crypto-browserify'],
    entry: {
      vendor: [
        'babel-polyfill',
        'react',
        'react-dom',
        'react-redux',
        'react-router',
        'dva',
        'fs-extra',
        'path',
        'ansi-html',
        'i18n-helper',
        'antd',
      ],
    },
    output: {
      library: 'vendor',
      path: outputDir,
      filename: '[name].dll.js',
      libraryTarget: 'var',
    },
    plugins: [
      new DllPlugin({
        path: resolve(outputDir, 'manifest.dll.json'),
        name: '[name]',
      }),
      
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
    ],
});