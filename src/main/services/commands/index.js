import env from './env';
import kill from './kill';
import encode from './encode';
import install from './install';
import { fork, execFile } from 'child_process';
import { APP_PATH } from '../paths';
import { join } from 'path';
import log from '../applog';


// console.log('modules',modules)

const testcmd = () => {
  const term = execFile(join(APP_PATH, 'task', 'test'), {
    silent: true,
  });

  term.stdout.on('data', (data) => {
    log.error(data.toString());
  });
};

export default {
  encode,
  install,
  // modules,
  testcmd,
}
