import { join } from 'path';
import { APP_PATH } from '../paths';

export const browserOptions = {
  width: 902,
  height: 552,
  minWidth: 902,
  minHeight: 552,
  show: false,
  frame: false,
  resizable: false,
  // frame: true,
  resizable: true,
  fullscreenable: false,
  maximizable: false,
  backgroundColor: '#aaa',
  hasShadow: true,
};

export const devWebUrl = 'http://localhost:9000/index.html';

export const prodStaticUrl = join(APP_PATH, 'renderer', 'index.html');

