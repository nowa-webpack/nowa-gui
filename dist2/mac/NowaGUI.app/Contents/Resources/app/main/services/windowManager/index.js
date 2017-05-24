const { BrowserWindow, globalShortcut } = require('electron');
const url = require('url');

const { isDev, isWin, isMac } = require('../is');
const { browser, devWebUrl, prodStaticUrl } = require('./defaultWinOptions');

let win;

module.exports = {
  create(opt) {
    const options = Object.assign(browser, opt);
    if (isDev) {
      win = new BrowserWindow(options);
      win.loadURL(devWebUrl);
      /*
        win.loadURL(url.format({
          pathname: prodStaticUrl,
          protocol: 'file:',
          slashes: true,
        }));
      */
      win.webContents.openDevTools();
    } else {
      win = new BrowserWindow(options);
      win.loadURL(url.format({
        pathname: prodStaticUrl,
        protocol: 'file:',
        slashes: true,
      }));
    }
    globalShortcut.register('CmdOrCtrl+Shift+8', () => {
      // Do stuff when Y and either Command/Control is pressed.
      win.webContents.toggleDevTools();
    });

    win.once('ready-to-show', () => {
      win.show();
    });

    win.on('closed', () => {
      console.log('closed window');
      win = null;
    });

    win.webContents.on('crashed', () => win.reload());
  },

  getWin() {
    return win;
  },

  close() {
    if (isMac) {
      win.hide();
    } else {
      win.close();
    }
  },

  show() {
    win.show();
  },

  minimize() {
    win.minimize();
  },

  isVisible() {
    return win.isVisible();
  }
};
