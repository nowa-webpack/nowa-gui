const packager = require('electron-packager');
const pkj = require('./app/package.json');
const os = require('os');
const path = require('path');

const options = {
  dir: './app',
  'app-version': pkj.version,
  arch: 'x64',
  asar: true,
  download: {
    cache: path.join(os.homedir(), 'Electron-cache')
  },
  electronVersion: '1.6.2',
  out: 'release',
  platform: 'darwin',
  overwrite: true,
  icon: './static/icon.icns'
};

packager(options, (err, appPaths) => {
  console.log('err', err);
  console.log(appPaths);
});
