import { join } from 'path';
import { APP_PATH } from '../paths';

// 默认窗口参数
export const browserOptions = {
  width: 922,
  height: 562,
  minWidth: 922,
  minHeight: 562,
 
  // maxWidth: 1190,
  // maxHeight: 727,
  // width: 990,
  // height: 600,
  // minWidth: 990,
  // minHeight: 600,
  show: false,
  frame: false,
  resizable: true,
  fullscreenable: true,
  maximizable: true,
  backgroundColor: '#aaa',
  hasShadow: true,
};

export const devWebUrl = 'http://localhost:9000/index.html';

export const prodStaticUrl = join(APP_PATH, 'renderer', 'index.html');

