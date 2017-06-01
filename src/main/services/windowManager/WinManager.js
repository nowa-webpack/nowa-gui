import { format } from 'url';
import { BrowserWindow, globalShortcut } from 'electron';
import { isDev, isMac } from 'shared-nowa';
import { browserOptions, devWebUrl, prodStaticUrl } from './defaultWinOptions';

class WinManager {
  constructor() {
    this.win = null;
  }

  create (opt) {
    console.log('create window');
    this.options = Object.assign(browserOptions, opt);

    this.win = new BrowserWindow(this.options);
    if (isDev) {
      this.win.loadURL(devWebUrl);
      this.win.webContents.openDevTools();
    } else {
      this.win.loadURL(format({
        pathname: prodStaticUrl,
        protocol: 'file:',
        slashes: true,
      }));
    }

    globalShortcut.register('CmdOrCtrl+Shift+8', () => {
      this.win.webContents.toggleDevTools();
    });

    this.win.once('ready-to-show', () => {
      this.win.show();
    });

    this.win.on('closed', () => {
      console.log('closed window');
      this.win = null;
    });

    this.win.webContents.on('crashed', () => this.win.reload());
  }

  send(symbol, content) {
    this.win.webContents.send(symbol, content);
  }

  getWin() {
    return this.win;
  }
 
  isVisible() {
    this.win.isVisible();
  }

  close() {
    console.log('close window');
    if (isMac) {
      this.win.hide();
    } else {
      this.win.close();
    }
  }

  show() {
    this.win.show();
  }

  minimize() {
    this.win.minimize();
  }

  toggleMaximize() {
    const isMaximized = this.win.isMaximized();

    if (isMaximized) {
      this.win.unmaximize();
    } else {
      this.win.maximize();
    }

    return !isMaximized;
  }

  getSize(){
    return this.win.getSize();
  }
}

export default WinManager;
