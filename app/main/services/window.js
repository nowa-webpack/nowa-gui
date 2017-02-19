const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const url = require('url');
const path = require('path');

let win;

module.exports = {

  create() {
    if (isDev) {
      win = new BrowserWindow({
        width: 700,
        minHeight: 700,
        // frame: false,
        // show: true,
        // resizable: false,
        // fullscreenable: false,
        // maximizable: false,
      });
      win.loadURL('http://localhost:8080/index.html');

      win.webContents.openDevTools();
    } else {
      win = new BrowserWindow({
        width: 700,
        minHeight: 700,
        // frame: false,
        // show: true,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
      });
      win.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }));

      win.webContents.openDevTools();
    }

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
  }
};
