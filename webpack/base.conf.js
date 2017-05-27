const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const { resolve } = require('path');

module.exports = {
  context: resolve(__dirname, '..'),
  plugins: [
    new NamedModulesPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css', '.node'],
    modules: [
      // 'node_modules',
      resolve(__dirname, '..', 'node_modules'),
      resolve(__dirname, '..', 'app', 'node_modules'),
      resolve(__dirname, '..', 'src'),
    ],
    alias: {
      'shared-nowa': resolve(__dirname, '..', 'src', 'shared'),
      'config-main-nowa': resolve(__dirname, '..', 'src', 'main', 'userConfig'),
      'i18n-renderer-nowa': resolve(__dirname, '..', 'src', 'renderer', 'language'),
      'store-renderer-nowa': resolve(__dirname, '..', 'src', 'renderer', 'localStorage'),
      'util-renderer-nowa': resolve(__dirname, '..', 'src', 'renderer', 'utils'),
      'const-renderer-nowa': resolve(__dirname, '..', 'src', 'renderer', 'constants'),
    }
  },
  module: {
    rules: [
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
          }
        },
      }
    ]
  },
};
