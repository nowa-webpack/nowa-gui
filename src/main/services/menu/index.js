/*
	工具菜单
	windows下无法显示
*/
import { Menu } from 'electron';
import menuItem from './menuItem';

const init = () => {
  const menu = Menu.buildFromTemplate(menuItem());
  Menu.setApplicationMenu(menu);
};

const reload = () => init();

export default { init, reload };
