
import menu from './menu';
import tray from './tray';
import nowa from './nowa';
import log from './applog';
import * as paths from './paths';
import mainWin from './windowManager';
import boilerplate from './boilerplate';
import commands from './commands';
import requests from './requests';
import { render } from 'ejs';
// const loadModules = (promptConfigPath) => {
//   try {
//     delete require.cache[require.resolve(promptConfigPath)];
//     const a = require(promptConfigPath);

//     console.log(a);
//     return a;
//     // return require(promptConfigPath);
//   } catch (err) {
//     return {};
//   }
// };

export default {
  menu,
  log,
  tray,
  paths,
  mainWin,
  boilerplate,
  nowa,
  commands,
  requests,
  ejsRender(tpl, data) {
    return render(tpl, data);
  },
  // loadModules,
};
