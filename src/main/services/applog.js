/*
  nowa-gui 日志服务
*/
import mkdirp from 'mkdirp';
import moment from 'moment';
import { join } from 'path';
import { homedir } from 'os';
import log from 'electron-log';
import { existsSync, readdirSync, removeSync, writeFileSync } from 'fs-extra';

const type = 'main';
const logFolder = join(homedir(), '.nowa-gui', `${type}logs`);
const current = moment().format('YYYY-MM-DD');

if (!existsSync(logFolder)) {
  mkdirp(logFolder);
  writeFileSync(`${logFolder}/log-${current}.txt`, '');
}

log.transports.file.file = `${logFolder}/log-${current}.txt`;

log.error('clear log main');

// 超过10天清理日志
try {
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
}

// 只有log.error, log.info 调用的地方才能写入日志文件
export default { error: log.error, info: log.info };
