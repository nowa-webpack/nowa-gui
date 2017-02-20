const packager = require('electron-packager');
const pkj = require('./app/package.json');
const os = require('os');
const path = require('path');

const options = {
  dir: './app',
  'app-version': pkj.version,
  arch: 'ia32',
  asar: false,
  download: {
    cache: path.join(os.homedir(), 'Electron-cache')
  },
  electronVersion: '1.4.14',
  out: 'release',
  platform: 'win32',
  overwrite: true,
  icon: './static/icon.ico'
};

packager(options, (err, appPaths) => {
  console.log('err', err);
  console.log(appPaths);
});
