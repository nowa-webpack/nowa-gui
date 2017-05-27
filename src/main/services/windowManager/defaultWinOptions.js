import { join } from 'path';
import { APP_PATH } from '../paths';

export const browserOptions = {
  width: 902,
  height: 552,
  // maxWidth: 1190,
  // maxHeight: 727,
  minWidth: 902,
  minHeight: 552,
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

