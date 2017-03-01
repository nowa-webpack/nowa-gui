const { BrowserWindow, globalShortcut, app } = require('electron');
const isDev = require('electron-is-dev');
const url = require('url');
const path = require('path');

let win;


module.exports = {

  create() {
    const options = {
      width: 900,
      height: 550,
      // width: 700,
      // height: 500,
      frame: false,
      show: false,
      resizable: false,
      fullscreenable: false,
      maximizable: false,
      backgroundColor: '#aaa'
    }
    if (isDev) {
      win = new BrowserWindow(options);
      win.loadURL('http://localhost:8080/index.html');
      /*win.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }));*/
      win.webContents.openDevTools();
    } else {
      win = new BrowserWindow(options);
      win.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }));

    }
    globalShortcut.register('CmdOrCtrl+Shift+8', () => {
      // Do stuff when Y and either Command/Control is pressed.
      win.webContents.toggleDevTools();
    });

    // win.webContents.on('did-finish-load', () => {
    win.once('ready-to-show', () => {
        // 支持无界面启动
        //if ( process.platform !== 'win32') {
          win.show();
        //}
    });

    win.on('closed', () => {
      console.log('closed');
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null;

    });

    win.webContents.on('crashed', () => win.reload());
  },

  getWin() {
    return win;
  },

  close() {
    if (process.platform === 'win32') {
      win.close();
    } else {
      win.hide();
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
