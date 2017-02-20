const { Menu, app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const upgrade = require('./upgrade');


const getTemplate = () => {

  const item = [
    {
      label: 'NowaIDE',
      submenu: [
        {
          label: 'Check Latest Version',
          click: () => {
            upgrade.checkLatest();
          },
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
      ],
    },
    {
      role: 'window',
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  if (isDev) {
    item.push({
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    });
  }

  return item;
};

module.exports = {

  init() {
    log.info('(menu) init');

    const menu = Menu.buildFromTemplate(getTemplate());
    Menu.setApplicationMenu(menu);
  },

  reload() {
    log.info('(menu) reload');
    this.init();
  },

  getTemplate,
};

/*module.exports = {
  init () {
    const menu = defaultMenu(app, shell)

    menu.splice(1, 0, {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdorCtrl+N',
          click: (item, focusedWindow) => {
          	focusedWindow.webContents.send('winNewFile')
            // dialog.showOpenDialog({ properties: ['openFile'] }, (files) => {
            	// console.log('file:', files)
              // focusedWindow.webContents.send('open-file', files[0])
            // })
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdorCtrl+O',
          click: (item, focusedWindow) => {
          	return openFile(focusedWindow);
            // dialog.showOpenDialog({ properties: ['openFile'] }, (files) => {
            	// console.log('file:', files)
              // focusedWindow.webContents.send('open-file', files[0])
            // })
          }
        },
        {
          label: 'Add React Project',
          // accelerator: 'CmdorCtrl+O',
          click: (item, focusedWindow) => {
          	return openFolder(focusedWindow);
            // dialog.showOpenDialog({ properties: ['openDirectory'] }, (files) => {
            	// console.log('forlder ' ,files)
              // focusedWindow.webContents.send('open-file', files[0])
            // })
          }
        },
        {
          label: 'Save File',
          accelerator: 'CmdorCtrl+S',
          click: (item, focusedWindow) => {
            focusedWindow.webContents.send('winSaveFile')
          }
        },
        {
          label: 'Close File',
          accelerator: 'CmdorCtrl+W',
          click: (item, focusedWindow) => {
            focusedWindow.webContents.send('winCloseFile')
          }
        }
      ]
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  }
}
*/