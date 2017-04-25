const { Tray, Menu, shell } = require('electron');
const { join } = require('path');
const { constants: { APP_PATH }, isWin } = require('../is');
const { getWin } = require('../windowManager');

let tray;

const macIconPath = join(APP_PATH, 'assets', 'tray.Template.png');
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
  // tray.setPressedImage(macPressIconPath);
};

const updateTrayMenu = (project, status) => {
  const win = getWin();
  projMenu.map((mu) => {
    if (project.path === mu.id) {
      if (status === 'start') {
        mu.icon = startIconPath;
        mu.submenu[0].enabled = false;
        mu.submenu[1].enabled = true;
       
      } else {
        mu.icon = stopIconPath;
        mu.submenu[0].enabled = true;
        mu.submenu[1].enabled = false;
      }

      win.webContents.send(`task-${status}`, { project });
    }
    return mu;
  });
  tray.setContextMenu(Menu.buildFromTemplate(projMenu));
};


const submenu = project => [{
  label: 'Start',
  enabled: !project.start,
  click: () => {
    updateTrayMenu(project, 'start');
  }
}, {
  label: 'Stop',
  enabled: project.start,
  click: () => {
    updateTrayMenu(project, 'stop');
  }
}, {
  label: 'Reveal in Finder',
  click: () => {
    shell.showItemInFolder(join(project.path, 'package.json'));
  }
}];

const setInitTrayMenu = (projects) => {
  const menus = projects.map(item => ({
    label: item.name,
    icon: stopIconPath,
    id: item.path,
    submenu: submenu(item),
  }));

  projMenu = [...menus, { type: 'separator' }, ...basicTemplateMenu];
  // projMenu = Menu.buildFromTemplate();
  tray.setContextMenu(Menu.buildFromTemplate(projMenu));
};


module.exports = {
  init,
  setInitTrayMenu,
};
