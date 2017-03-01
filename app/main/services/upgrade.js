const { exec } = require('child_process');
const semver = require('semver');
const request = require('./request');
const { getPackgeJson } = require('./application');
const { getWin } = require('./window');


const downloadNewRelease = (url) => {
  try {
    if (process.platform === 'win32') {
      console.log('[INFO] windows download start');
      exec(`explorer "${url}"`);
    } else {
      console.log('[INFO]mac osx download start');
      exec(`open "${url}"`);
    }
  } catch (err) {
    const win = getWin();
    win.webContents.send('MAIN_ERR', err.message);
  }
};

const checkLatest = () => {
  const win = getWin();
  request('https://registry.npm.taobao.org/nowa-gui-version/latest')
    .then(({ data }) => {
      const newVersion = data.version;
      // const newVersion = '2.0.1';
      if (semver.lt(getPackgeJson().version, newVersion)) {
        win.webContents.send('checkLatest', newVersion);
      }

    }).catch((err) => {
      
      win.webContents.send('MAIN_ERR', err.message);
    });
};

module.exports = {
  downloadNewRelease,
  checkLatest,
};


