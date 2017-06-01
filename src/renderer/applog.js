import mkdirp from 'mkdirp';
import moment from 'moment';
import { join } from 'path';
import { homedir } from 'os';
import log from 'electron-log';
import { existsSync, readdirSync, removeSync } from 'fs-extra';

const type = 'renderer';
const logFolder = join(homedir(), '.nowa-gui', `${type}logs`);
const current = moment().format('YYYY-MM-DD');

if (!existsSync(logFolder)) {
  mkdirp(logFolder);
}
console.log(log)

log.transports.file.file = `${logFolder}/log-${current}.txt`;

// log.error('clear log renderer');

/*try {
  readdirSync(logFolder)
    .filter(fileName => fileName.includes('.txt'))
    .forEach((fileName) => {
      const date = fileName.slice(4, 14);
      const delFlag = moment().diff(moment(date), 'days') >= 10;
      if (delFlag) {
        removeSync(join(logFolder, fileName));
      }
    });
} catch (e) {
  log.error(e.message);
}*/

export default { error: log.error, info: log.info };
