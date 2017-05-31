const webpackMerge = require('webpack-merge');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { resolve } = require('path');

const webpackCommon = require('./base.conf');

const outputDir = resolve(__dirname, '..', 'app');
const srcDir = resolve(__dirname, '..', 'src');

module.exports = webpackMerge(webpackCommon,
  {
    target: 'electron-main',
    entry: ['babel-polyfill', './src/main/index.js'],
    // entry: {
    //   polyfill: 
    //   main: './src/main/index.js',
    // },
    output: {
      path: outputDir,
      filename: 'main.js',
    },
    module: {
      rules: [
        /*{
          test: /\.js$/,
          include: srcDir,
          use: [{
            loader: 'babel-loader',
            options: {
              babelrc: false, // Tells webpack not to use the .babelrc file.
              presets: [
                'babili',
                'stage-2',
              ],
              plugins: [
                'transform-runtime'
              ]
            },
          }]
        },*/
        {
          test: /\.js$/,
          include: srcDir,
          use: [{
            loader: 'babel-loader',
            options: {
              babelrc: false, // Tells webpack not to use the .babelrc file.
              presets: [
                ['env', { targets: { electron: '1.6.8' }, modules: false }],
                'stage-2',
                'babili'
              ],
              plugins: [
                'transform-runtime',
                // 'syntax-object-rest-spread',
                // 'add-module-exports',
                // 'dynamic-import-webpack',
              ]
            },
          }]
        },
        // {
        //   test: /\.js$/,
        //   include: /node_modules/,
        //   loader: 'octal-number-loader'
        // },
        {
          test: /\.js$/,
          loader: 'shebang-loader'
        }, {
          test: /\.node$/,
          include: /node_modules/,
          loader: 'node-loader'
        }
      ]
    },
    plugins: [
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development')
      }),
     /* new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 8889,
        reportFilename: 'main.html',
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: null,
        logLevel: 'info'
      })*/
    ],
  });

