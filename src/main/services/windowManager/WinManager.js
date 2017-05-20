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
    } else {
      this.win.loadURL(format({
        pathname: prodStaticUrl,
        protocol: 'file:',
        slashes: true,
      }));
    }
    this.win.webContents.openDevTools();

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


  getSize(){
    return this.win.getSize();
  }

  /*download(url, savePath) {
    this.win.webContents.downloadURL(url);
    this.win.webContents.on('will-download', (event, item, webContents) => {
      console.log('sssssss')
      item.setSavePath(savePath);
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed');
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused');
          } else {
            console.log(`Received bytes: ${item.getReceivedBytes()}`);
          }
        }
      });
      item.once('done', (event, state) => {
        if (state === 'completed') {
          console.log('Download successfully');
        } else {
          console.log(`Download failed: ${state}`);
        }
      });
    });
  }*/
}

export default WinManager;
