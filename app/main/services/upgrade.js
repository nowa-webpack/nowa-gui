const { exec } = require('child_process');
const semver = require('semver');
const { autoUpdater } = require('electron');
const request = require('./request');
const { getPackgeJson } = require('./application');
const { getWin } = require('./window');

const setUpdateUrl = () => {
  autoUpdater.setFeedURL('http://alipay-rmsdeploy-image.cn-hangzhou.alipay.aliyun-inc.com/nowa-test/nowa-gui.dmg');
  autoUpdater.checkForUpdates();
}

autoUpdater.on('checking-for-update', () => {
  console.log('正在检查更新');
})
.on('update-available', () => {
console.log('update-available');
})
.on('update-not-available', () => {
console.log('update-not-available');

})
.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateURL) => {
    console.log("A new update is ready to install", `Version ${releaseName} is downloaded and will be automatically installed on Quit`);
    console.log("quitAndInstall");
    // updater.autoUpdater.quitAndInstall();
    return true;
})

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
    win.webContents.send('main-err', err.message);
  }
};

const checkLatest = () => {
  const win = getWin();
  request('https://registry.npm.taobao.org/nowa-gui-version/latest')
    .then(({ data }) => {
      const newVersion = data.version;
      // const newVersion = '2.0.1';
      // if (semver.lt(getPackgeJson().version, newVersion)) {
        win.webContents.send('checkLatest', { newVersion, tip: data.readme });
      // }

    }).catch((err) => {
      
      win.webContents.send('main-err', err.message);
    });
};

module.exports = {
  downloadNewRelease,
  checkLatest,
  setUpdateUrl
};


