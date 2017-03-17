const { Menu, app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const upgrade = require('./upgrade');


const getTemplate = () => {

  const item = [
    {
      label: 'NowaIDE',
      submenu: [
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
