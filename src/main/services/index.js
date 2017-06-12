import { render } from 'ejs';

import menu from './menu';
import tray from './tray';
import nowa from './nowa';
import log from './applog';
import tasklog from './tasklog';
import * as paths from './paths';
import requests from './requests';
import commands from './commands';
import mainWin from './windowManager';
import boilerplate from './boilerplate';
import updator from './updator';


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
  tasklog,
  updator,
  ejsRender(tpl, data) {
    return render(tpl, data);
  },
  // loadModules,
};
