const { Tray, Menu } = require('electron');
const { join } = require('path');
const { constants: { APP_PATH }, isWin } = require('../is');

let tray;

const macIconPath = join(APP_PATH, 'assets', 'tray-white.png');
const winIconPath = join(APP_PATH, 'assets', 'trayicon_win.png');
const startIconPath = join(APP_PATH, 'assets', 'dot.png');
const stopIconPath = join(APP_PATH, 'assets', 'dot_gray.png');


const basicTemplateMenu = [
  { label: 'Exit', role: 'quit' },
  { label: 'Show', role: 'unhide' },
];

let projMenu = [];

const init = () => {
  tray = isWin ? new Tray(winIconPath) : new Tray(macIconPath);
  const contextMenu = Menu.buildFromTemplate(basicTemplateMenu);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Nowa');
};

const setInitTrayMenu = (projects) => {
  const menus = projects.map(item => ({
    label: item.name,
    icon: stopIconPath,
    id: item.path,
    sublabel: item.path,
    click: (menuItem) => {
      projMenu.map((mu) => {
        if (mu.id === menuItem.id) {
          if (mu.icon === startIconPath) {
            mu.icon = stopIconPath;
          } else {
            mu.icon = startIconPath;
          }
        }
        return mu;
      });

      tray.setContextMenu(Menu.buildFromTemplate(projMenu));
    }
  }));

  projMenu = [...menus, { type: 'separator' }, ...basicTemplateMenu];
  // projMenu = Menu.buildFromTemplate();
  tray.setContextMenu(Menu.buildFromTemplate(projMenu));
};


module.exports = {
  init,
  setInitTrayMenu,
};
