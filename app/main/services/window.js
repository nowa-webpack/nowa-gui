const { BrowserWindow, globalShortcut } = require('electron');
const isDev = require('electron-is-dev');
const url = require('url');
const path = require('path');

let win;

module.exports = {

  create() {
    if (isDev) {
      win = new BrowserWindow({
        width: 700,
        height: 500,
        frame: false,
        show: true,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
      });
      win.loadURL('http://localhost:8080/index.html');

      win.webContents.openDevTools();
    } else {
      win = new BrowserWindow({
        width: 700,
        height: 500,
        frame: false,
        show: true,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
      });
      win.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }));

      // win.webContents.openDevTools();
    }
    globalShortcut.register('CmdOrCtrl+Shift+8', () => {
      // Do stuff when Y and either Command/Control is pressed.
      win.webContents.toggleDevTools();
    });

    win.webContents.on('did-finish-load', () => {
        // 支持无界面启动
        //win.show();
    });

    win.on('closed', () => {
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
    win.close();
  },

  minimize(){
    win.minimize();
  }
};
